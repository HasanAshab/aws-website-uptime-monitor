locals {
  # Normalize routes => method, path, handler file, handler string
  normalized_routes = {
    for route, file_prefix in var.routes :
    route => {
      name         = "${var.name_prefix}-${var.environment}-${file_prefix}"
      method       = upper(split(" ", route)[0])
      path         = join(" ", slice(split(" ", route), 1, length(split(" ", route))))
      handler_file = "${file_prefix}.${var.handler_extension}"
      handler      = "${file_prefix}.${var.handler_suffix}"
    }
  }
}

data "aws_dynamodb_table" "this" {
  name = var.dynamodb_table_name
}

module "lambda_functions" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "8.1.0"

  for_each = local.normalized_routes

  function_name = each.value.name
  source_path = [
    "${var.handlers_dir}/${each.value.handler_file}",

    # add dependencies (shared layer style)
    { npm_requirements = var.requirements_path }
  ]
  handler = each.value.handler
  runtime = var.runtime


  attach_policy_json = true
  policy_json = templatefile("${path.module}/templates/lambda_policy.json", {
    dynamodb_arn = data.aws_dynamodb_table.this.arn
  })
  allowed_triggers = {
    apigw = {
      service    = "apigateway"
      source_arn = "${module.api_gateway.api_execution_arn}/*/*"
    }
  }

  artifacts_dir = "${path.root}/.terraform/lambda-builds/"
  publish       = true
  environment_variables = {
    ENVIRONMENT    = var.environment
    DYNAMODB_TABLE = data.aws_dynamodb_table.this.name
  }
}

module "api_gateway" {
  source  = "terraform-aws-modules/apigateway-v2/aws"
  version = "5.3.1"

  name               = "${var.name_prefix}-${var.environment}-http"
  description        = "Backend API"
  protocol_type      = "HTTP"
  create_domain_name = false

  cors_configuration = {
    allow_headers = ["content-type", "x-amz-date", "authorization", "x-api-key", "x-amz-security-token", "x-amz-user-agent"]
    allow_methods = ["*"]
    allow_origins = ["*"]
  }

  # Build routes from normalized routes
  routes = {
    for route, cfg in local.normalized_routes :
    "${cfg.method} ${cfg.path}" => {
      integration = {
        uri                    = module.lambda_functions[route].lambda_function_invoke_arn
        payload_format_version = "2.0"
      }
    }
  }
}
