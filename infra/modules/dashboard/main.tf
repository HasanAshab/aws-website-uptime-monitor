module "backend" {
  source = "./modules/backend"

  name_prefix         = "${var.name_prefix}-dash"
  environment         = var.environment
  requirements_path   = "${var.backend_src_root}/package.json"
  handlers_dir        = "${var.backend_src_root}/functions"
  handler_extension   = "mjs"
  dynamodb_table_name = var.dynamodb_table_name

  routes = {
    "GET /uptime-data"  = "list"
    "GET /recent-pings" = "create"
    "GET /metrics"      = "get"
  }

  enable_deletion_protection = var.enable_deletion_protection
}


module "frontend" {
  source = "./modules/frontend"

  name_prefix                = "${var.name_prefix}-dash"
  environment                = var.environment
  cdn_price_class            = var.frontend_cdn_price_class
  enable_deletion_protection = var.enable_deletion_protection
}
