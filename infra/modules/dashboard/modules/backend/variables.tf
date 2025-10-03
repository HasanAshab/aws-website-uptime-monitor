variable "name_prefix" {
  type = string
}

variable "environment" {
  type = string
}

variable "requirements_path" {
  type = string
}

variable "handlers_dir" {
  type = string
}

variable "handler_extension" {
  type    = string
  default = "js"
}

variable "handler_suffix" {
  type    = string
  default = "handler"
}

variable "routes" {
  type        = map(string)
  description = <<EOT
Map of routes to handler file prefix.
Example:
{
  "GET /todos"      = "list"
  "POST /todos"     = "create"
  "GET /todos/{id}" = "get"
}
EOT
}

variable "runtime" {
  type    = string
  default = "nodejs18.x"
}

variable "dynamodb_table_name" {
  type = string
}

variable "enable_deletion_protection" {
  type    = bool
  default = false
}
