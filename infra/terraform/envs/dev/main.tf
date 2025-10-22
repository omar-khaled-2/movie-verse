
module "vpc" {
  source = "../../modules/vpc"
}

module "eks" {
  source = "../../modules/eks"
  private_subnet_ids = module.vpc.private_subnet_ids
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
