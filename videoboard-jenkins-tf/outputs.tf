output "jenkins_url" {
  description = "Public URL of Jenkins controller"
  value       = "http://${aws_instance.controller.public_dns}:8080"
}

output "controller_ssh" {
  description = "SSH command to connect"
  value       = "ssh ec2-user@${aws_instance.controller.public_dns}"
}
