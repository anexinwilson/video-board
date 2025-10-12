#!/bin/bash
set -e
dnf update -y
dnf install -y java-17-amazon-corretto-headless docker git
systemctl enable --now docker
