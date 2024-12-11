provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "capybara_vpc" {
  cidr_block = var.vpc_cidr_block
  enable_dns_support = true
  enable_dns_hostnames = true
  tags = {
    Name = "capybara_vpc"
  }
}

# Subnet Configuration
resource "aws_subnet" "capybara_subnet_public_a" {
  vpc_id                  = aws_vpc.capybara_vpc.id
  cidr_block              = var.public_subnet_a_cidr
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = {
    Name = "capybara_public_subnet_a"
  }
}

resource "aws_subnet" "capybara_subnet_public_b" {
  vpc_id                  = aws_vpc.capybara_vpc.id
  cidr_block              = var.public_subnet_b_cidr
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true
  tags = {
    Name = "capybara_public_subnet_b"
  }
}

resource "aws_subnet" "capybara_subnet_private_a" {
  vpc_id                  = aws_vpc.capybara_vpc.id
  cidr_block              = var.private_subnet_a_cidr
  availability_zone       = "${var.aws_region}a"
  tags = {
    Name = "capybara_private_subnet_a"
  }
}

resource "aws_subnet" "capybara_subnet_private_b" {
  vpc_id                  = aws_vpc.capybara_vpc.id
  cidr_block              = var.private_subnet_b_cidr
  availability_zone       = "${var.aws_region}b"
  tags = {
    Name = "capybara_private_subnet_b"
  }
}

# Internet Gateway Configuration
resource "aws_internet_gateway" "capybara_igw" {
  vpc_id = aws_vpc.capybara_vpc.id
  tags = {
    Name = "capybara_igw"
  }
}

# NAT Gateway for Private Subnets
resource "aws_eip" "capybara_nat_eip" {
  vpc = true
}

resource "aws_nat_gateway" "capybara_nat_gateway" {
  allocation_id = aws_eip.capybara_nat_eip.id
  subnet_id     = aws_subnet.capybara_subnet_public_a.id
  depends_on    = [aws_internet_gateway.capybara_igw]
}

# Security Group for ECS Cluster
resource "aws_security_group" "capybara_sg" {
  name        = "capybara_sg"
  description = "Allow inbound HTTP/HTTPS and SSH"
  vpc_id      = aws_vpc.capybara_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "capybara_cluster" {
  name = "capybara"
}

# ECS Instance Role
resource "aws_iam_role" "ecs_instance_role" {
  name = "ecsInstanceRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Effect    = "Allow"
        Sid       = ""
      },
    ]
  })
}

# Attach Instance Role Policy to ECS Instance Role
resource "aws_iam_role_policy_attachment" "ecs_instance_role_policy_attachment" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

