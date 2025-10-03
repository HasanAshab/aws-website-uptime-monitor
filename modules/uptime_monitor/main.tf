### DynamoDB ###
# Store uptime metrics
data "aws_dynamodb_table" "this" {
  name = var.dynamodb_table_name
}


### Lambda ###
# Ping the website and collect metrics
module "lambda_function" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "8.1.0"

  function_name = "${var.name_prefix}-fn-${var.environment}"
  source_path = [
    "${path.module}/lambda/function.mjs",
    { npm_requirements = "${path.module}/lambda/package.json" }
  ]
  handler = "function.handler"
  runtime = "nodejs22.x"

  attach_policy_json = true
  policy_json = templatefile("${path.module}/templates/lambda_policy.json", {
    dynamodb_table_arn = data.aws_dynamodb_table.this.arn,
    sns_topic_arn      = module.sns_topic.topic_arn
  })

  create_current_version_allowed_triggers = false
  allowed_triggers = {
    eventbridge = {
      service    = "events"
      source_arn = module.eventbridge.eventbridge_rule_arns["crons"]
    }
  }

  artifacts_dir = "${path.root}/.terraform/lambda-builds/"
  environment_variables = {
    ENVIRONMENT          = var.environment
    DYNAMODB_TABLE       = data.aws_dynamodb_table.this.name
    SNS_TOPIC_ARN        = module.sns_topic.topic_arn
    WEBSITE_URL          = var.website_url
    EXPECTED_STATUS_CODE = var.assertions.status_code
    EXPECTED_KEYWORD     = var.assertions.body_includes
    MAX_RESPONSE_TIME_MS = var.assertions.max_response_time_ms
  }
}


### SNS ###
# Send email alert (if any checks fail)
module "sns_topic" {
  source  = "terraform-aws-modules/sns/aws"
  version = "6.2.0"

  name = "${var.name_prefix}-sns-${var.environment}"

  subscriptions = {
    email = {
      protocol = "email"
      endpoint = var.subscriber_email
    }
  }
}


### EventBridge ###
# Trigger lambda on a schedule
module "eventbridge" {
  source  = "terraform-aws-modules/eventbridge/aws"
  version = "4.1.0"

  create_bus = false
  rules = {
    crons = {
      description         = "Website uptime check schedule"
      schedule_expression = var.ping_schedule
    }
  }
  targets = {
    crons = [
      {
        name = "ping-lambda"
        arn  = module.lambda_function.lambda_function_arn
      }
    ]
  }
}
