variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2" # Ohio (you said you're using us-east-2)
}

variable "controller_instance_type" {
  description = "EC2 instance type for Jenkins controller"
  type        = string
  default     = "t3.micro" # If this errors, switch to t2.micro or t4g.micro (ARM)
}
