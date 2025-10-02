### Lambda ###
# Ping the website and collect metrics
module "lambda_function" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "8.1.0"

  function_name = "${local.project_name}-fn-${var.environment}"
  source_path   = [
    "${path.module}/lambda/lambda_function.mjs",
    { npm_requirements = "${path.module}/lambda/package.json" }
  ]
  handler       = "lambda_function.handler"
  runtime       = "nodejs22.x"

  attach_policy_json = true
  policy_json = templatefile("${path.module}/templates/lambda_policy.json", {
    dynamodb_table_arn = module.dynamodb_table.dynamodb_table_arn,
    sns_topic_arn = module.sns_topic.topic_arn
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
    ENVIRONMENT = var.environment
    DYNAMODB_TABLE = module.dynamodb_table.dynamodb_table_id
    SNS_TOPIC_ARN = module.sns_topic.topic_arn
    WEBSITE_URL = var.website_url
    EXPECTED_KEYWORD = var.expected_keyword
  }
}

### DynamoDB ###
# Store backup metrics
module "dynamodb_table" {
  source  = "terraform-aws-modules/dynamodb-table/aws"
  version = "5.1.0"

  name         = "${local.project_name}-dynamodb-${var.environment}"
  hash_key     = "id"
  billing_mode = var.db_billing_mode

  attributes = [
    {
      name = "id"
      type = "S"
    }
  ]
}

### SNS ###
# Send alerts (email) when checks fail
module "sns_topic" {
  source  = "terraform-aws-modules/sns/aws"
  version = "6.2.0"

  name  = "${local.project_name}-sns-${var.environment}"

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
      description         = "Daily EC2 backup"
      schedule_expression = var.ping_schedule
    }
  }
  targets = {
    crons = [
      {
        name = "ec2-backup-lambda"
        arn  = module.lambda_function.lambda_function_arn
      }
    ]
  }
}


### Log bucket ###
# S3 bucket for storing backup logs
# module "log_bucket" {
#   source  = "terraform-aws-modules/s3-bucket/aws"
#   version = "5.5.0"

#   bucket        = "${local.project_name}-log-${var.environment}"
#   force_destroy = true
# }
