variable "environment" {
  description = "Environment name"
  type        = string
}

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "website_url" {
  description = "URL of the target Website"
  type        = string
}

variable "assertions" {
  description = "Uptime assertions"
  type = object({
    status_code          = number
    body_includes        = string
    max_response_time_ms = number
  })
}

variable "ping_schedule" {
  description = "EventBridge cron expression"
  type        = string
}

variable "subscriber_email" {
  description = "Email address to receive notifications"
  type        = string
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table to store uptime metrics"
  type        = string
}
