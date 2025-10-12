terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    http = {
      source  = "hashicorp/http"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

# --- Providers ---
provider "aws" {
  region = var.region
}

provider "http" {}

# --- Use default VPC and subnets ---
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# --- Get your public IP (for SSH/Jenkins access lockdown) ---
data "http" "my_ip" {
  url = "https://checkip.amazonaws.com/"
}

# --- Security Group for Jenkins ---
resource "aws_security_group" "jenkins_sg" {
  name        = "jenkins-sg"
  description = "Allow Jenkins UI (8080), SSH (22) from my IP, and agent port 50000"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "Jenkins UI"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["${trimspace(data.http.my_ip.response_body)}/32"]
  }

  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${trimspace(data.http.my_ip.response_body)}/32"]
  }

  ingress {
    description = "JNLP agents inside VPC"
    from_port   = 50000
    to_port     = 50000
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.default.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "jenkins-sg"
  }
}

# --- IAM Role trust (EC2) ---
data "aws_iam_policy_document" "controller_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

# --- IAM Role for Jenkins controller ---
resource "aws_iam_role" "controller_role" {
  name               = "jenkins-controller-role"
  assume_role_policy = data.aws_iam_policy_document.controller_trust.json
}

# --- IAM Policy allowing EC2 management (for Spot agents later) ---
data "aws_iam_policy_document" "controller_policy" {
  statement {
    actions = [
      "ec2:Describe*",
      "ec2:RunInstances",
      "ec2:TerminateInstances",
      "ec2:CreateTags",
      "ec2:RequestSpotInstances",
      "ec2:CancelSpotInstanceRequests",
      "ec2:CreateFleet",
      "ec2:DeleteFleet"
    ]
    resources = ["*"]
  }

  statement {
    actions   = ["iam:PassRole"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "controller_policy_resource" {
  name   = "jenkins-controller-ec2"
  policy = data.aws_iam_policy_document.controller_policy.json
}

resource "aws_iam_role_policy_attachment" "attach_controller_policy" {
  role       = aws_iam_role.controller_role.name
  policy_arn = aws_iam_policy.controller_policy_resource.arn
}

# --- Instance profile for EC2 ---
resource "aws_iam_instance_profile" "controller_profile" {
  name = "jenkins-controller-instance-profile"
  role = aws_iam_role.controller_role.name
}

# --- Get the latest Amazon Linux 2023 AMI (x86_64) ---
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["137112412989"] # Amazon official
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# --- Random index to avoid subnets in unsupported AZs ---
resource "random_integer" "az_index" {
  min = 0
  max = length(data.aws_subnets.default.ids) - 1
}

# --- EC2 instance (Jenkins controller) ---
resource "aws_instance" "controller" {
  ami                         = data.aws_ami.al2023.id
  instance_type               = var.controller_instance_type
  iam_instance_profile        = aws_iam_instance_profile.controller_profile.name
  vpc_security_group_ids      = [aws_security_group.jenkins_sg.id]
  associate_public_ip_address = true

  # Pick a random default subnet to avoid an AZ that doesn't support this instance type
  subnet_id = element(data.aws_subnets.default.ids, random_integer.az_index.result)

  user_data = file("${path.module}/user_data_controller.sh")

  root_block_device {
    volume_type = "gp3"
    volume_size = 30
    iops        = 3000
    throughput  = 125
  }

  tags = {
    Name = "jenkins-controller"
    Role = "jenkins-controller"
  }
}
