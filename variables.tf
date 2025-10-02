variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "db_billing_mode" {
  description = "DynamoDB billing mode"
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "website_url" {
  description = "URL of the target Website"
  type        = string
  default     = "https://example.com/"
}

variable "expected_keyword" {
  description = "Expected keyword in the response"
  type        = string
  default = "Example Domain"
}

variable "ping_schedule" {
  description = "EventBridge cron expression"
  type        = string
  default     = "cron(0 0 * * ? *)"
}

variable "subscriber_email" {
  description = "Email address to receive notifications"
  type        = string
  default     = "hasanashab.18205@gmail.com"
}
