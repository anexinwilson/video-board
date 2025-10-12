#!/bin/bash
set -e
dnf update -y
dnf install -y docker unzip
systemctl enable --now docker

mkdir -p /var/jenkins_home
chown -R 1000:1000 /var/jenkins_home

docker run -d --restart=always \
  -p 8080:8080 -p 50000:50000 \
  -v /var/jenkins_home:/var/jenkins_home \
  --name jenkins \
  jenkins/jenkins:lts-jdk17
