terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "jenkins-videoboard-bucket"
    key    = "terraform/state.tfstate"
    region = "us-east-2"
  }
}

provider "aws" {
  region = var.aws_region
}

# SSH Key Pair
resource "aws_key_pair" "jenkins_key" {
  key_name   = "jenkins-videoboard-key"
  public_key = file("${path.module}/jenkins-key.pub")

  tags = {
    Name = "jenkins-videoboard-key"
  }
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "jenkins-videoboard-vpc"
  }
}

# Public Subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "jenkins-public-subnet"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "jenkins-igw"
  }
}

# Route Table
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "jenkins-public-rt"
  }
}

# Route Table Association
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# Security Group
resource "aws_security_group" "jenkins_sg" {
  name        = "jenkins-videoboard-sg"
  description = "Security group for Jenkins server"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Jenkins Web UI"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
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

  tags = {
    Name = "jenkins-videoboard-sg"
  }
}

# AMI Lookup - Amazon Linux 2023
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

# EC2 Instance
resource "aws_instance" "jenkins_server" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public_subnet.id
  vpc_security_group_ids      = [aws_security_group.jenkins_sg.id]
  iam_instance_profile        = aws_iam_instance_profile.jenkins_profile.name
  associate_public_ip_address = true
  key_name                    = aws_key_pair.jenkins_key.key_name

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  tags = {
    Name = "jenkins-server"
  }

  user_data = <<-EOF
    #!/bin/bash
    set -e
    
    yum update -y
    
    # Install Docker
    yum install -y docker
    systemctl enable --now docker
    
    # Install SSM Agent
    yum install -y amazon-ssm-agent
    systemctl enable --now amazon-ssm-agent
    
    usermod -aG docker ec2-user
    
    # Create Jenkins home directory
    mkdir -p /home/ec2-user/jenkins_home
    chown -R ec2-user:ec2-user /home/ec2-user/jenkins_home
    
    # Run Jenkins with Docker-in-Docker support
    docker run -d --name jenkins \
      -p 8080:8080 -p 50000:50000 \
      -v /home/ec2-user/jenkins_home:/var/jenkins_home \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v $(which docker):/usr/bin/docker \
      --group-add $(getent group docker | cut -d: -f3) \
      --user root \
      jenkins/jenkins:lts
    
    # Install Docker CLI inside Jenkins container
    docker exec -u root jenkins sh -c "apt-get update && apt-get install -y docker.io"
    
    # Save initial admin password to ec2
    sleep 30
    docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword > /home/ec2-user/jenkins_initial_password.txt 2>/dev/null || true
    chown ec2-user:ec2-user /home/ec2-user/jenkins_initial_password.txt 2>/dev/null || true
  EOF

  depends_on = [aws_internet_gateway.gw]
}