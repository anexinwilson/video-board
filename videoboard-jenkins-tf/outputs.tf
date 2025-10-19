output "instance_id" {
  value       = aws_instance.jenkins_server.id
  description = "EC2 instance ID"
}

output "instance_public_ip" {
  value       = aws_instance.jenkins_server.public_ip
  description = "Public IP address"
}

output "jenkins_url" {
  value       = "http://${aws_instance.jenkins_server.public_ip}:8080"
  description = "Jenkins web interface URL"
}

output "ssh_command" {
  value       = "ssh -i jenkins-key ec2-user@${aws_instance.jenkins_server.public_ip}"
  description = "SSH connection command"
}