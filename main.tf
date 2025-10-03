### DynamoDB ###
# Store uptime metrics
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

module "uptime_monitor" {
  source = "./modules/uptime_monitor"

  environment = var.environment
  name_prefix = local.project_name

  website_url         = var.target_website_url
  ping_schedule       = var.uptime_ping_schedule
  assertions          = var.uptime_assertions
  subscriber_email    = var.uptime_alert_subscriber_email
  dynamodb_table_name = module.dynamodb_table.dynamodb_table_id
}
