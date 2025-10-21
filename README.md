# VideoBoard

A full-stack video sharing platform built with React, Express, Node.js, TypeScript, and Redux Toolkit. Backend microservices deployed as Docker containers to AWS Lambda via API Gateway. Frontend hosted on S3 with CloudFront CDN. Jenkins CI/CD infrastructure provisioned using Terraform (Infrastructure as Code).

---

## Summary

**Microservices Backend**
- Three independent services (auth, user, video) built with Node.js, Express, and TypeScript
- Each service containerized with Docker using multi-stage builds for minimal image size
- Images stored in Amazon ECR and deployed as AWS Lambda functions
- API Gateway routes HTTP requests to Lambda functions with automatic scaling
- JWT authentication with bcrypt hashing and email-based password reset
- MongoDB Atlas for data persistence with Mongoose ODM

**React Frontend**
- Single-page application built with TypeScript and Vite
- Redux Toolkit for global state management (authentication, user data, video catalog)
- TailwindCSS for responsive UI design
- Mux Player for adaptive video streaming
- Lexical rich text editor for video descriptions
- Protected routes with automatic JWT token refresh

**AWS Cloud Infrastructure**
- Frontend production build deployed to Amazon S3 and distributed via CloudFront CDN
- Video files and thumbnails stored in private S3 bucket with presigned URL uploads
- CloudFront provides global edge caching for low-latency content delivery
- Three Lambda functions handle backend microservices with independent scaling
- API Gateway exposes Lambda functions as RESTful HTTP endpoints
- ECR stores versioned Docker images for all microservices

**CI/CD Automation with Jenkins**
- Jenkins server infrastructure provisioned using Terraform (Infrastructure as Code)
- Custom VPC with public subnet and Internet Gateway
- EC2 t3.small instance running Jenkins in Docker with Docker-in-Docker capability
- IAM roles with permissions for ECR, S3, Lambda, and CloudFront
- S3 backend for Terraform remote state management
- GitHub webhook triggers automated deployment pipeline on code push
- Pipeline builds Docker images, pushes to ECR, updates Lambda functions, builds React app, syncs to S3, and invalidates CloudFront cache
- Complete deployment from commit to production in 5-7 minutes

**Database**
- MongoDB Atlas for user accounts, video metadata, and session storage
- Mongoose ODM for schema validation and complex queries

---

## Tech Stack

### Frontend
- React with TypeScript
- Redux Toolkit for state management
- Vite for build tooling
- TailwindCSS for styling
- Axios for API requests with interceptors
- React Router for navigation
- Mux Player for video playback
- Lexical rich text editor

### Backend
- Node.js with Express
- TypeScript for type safety
- MongoDB with Mongoose ODM
- Passport.js for authentication
- JWT for token-based auth
- bcrypt for password hashing
- Nodemailer for email
- Multer for file uploads
- AWS SDK for S3 operations
- @vendia/serverless-express for Lambda integration

### DevOps & Cloud
- **Jenkins** - CI/CD automation server
- **Terraform** - Infrastructure as Code for Jenkins deployment
- **Docker** - Containerization with multi-stage builds
- **Docker Buildx** - Multi-platform image builds
- **AWS Lambda** - Serverless compute for backend microservices
- **Amazon API Gateway** - HTTP routing to Lambda functions
- **Amazon ECR** - Docker container registry
- **Amazon S3** - Object storage for videos, thumbnails, and frontend assets
- **Amazon CloudFront** - CDN for global content delivery
- **AWS IAM** - Role-based access control
- **Amazon EC2** - Jenkins server hosting
- **GitHub** - Version control with webhook integration

---

## Architecture Overview

### Backend Microservices

Three independent services deployed as containerized Lambda functions:

**Auth Service**
- User registration with validation
- Login with JWT token generation
- Password reset flow with email verification
- Token validation middleware
- Session management

**User Service**
- User profile retrieval and updates
- Account settings management
- Profile picture handling
- User data queries

**Video Service**
- Video upload using S3 presigned URLs
- Thumbnail generation and storage
- Video metadata CRUD operations
- Video listing with search and filters
- View count tracking and analytics
- Download functionality with access control

### Frontend Application

React SPA with the following structure:
- Authentication flows (register, login, password reset)
- Video upload with progress indication
- Video feed with search and filtering
- Individual video pages with streaming playback
- User profile management
- Protected routes requiring authentication
- Redux store managing auth state, user data, and video catalog
- Axios interceptors for automatic token refresh

### AWS Infrastructure

**Compute**
- Three Lambda functions (one per microservice)
- EC2 t3.small instance for Jenkins server

**Storage**
- S3 bucket for frontend static files (HTML, CSS, JS)
- Private S3 bucket for video files and thumbnails
- ECR repositories for Docker images (auth, user, video)

**Networking & Delivery**
- API Gateway with three routes pointing to Lambda functions
- CloudFront distribution serving S3 bucket with edge caching
- VPC with public subnet for Jenkins EC2 instance
- Internet Gateway for outbound connectivity
- Security groups allowing ports 22 (SSH) and 8080 (Jenkins)

**IAM**
- Lambda execution roles with S3 and CloudWatch permissions
- EC2 instance role with ECR, S3, Lambda, and CloudFront permissions
- Least-privilege access policies

### Jenkins CI/CD Infrastructure (Terraform)

Jenkins infrastructure provisioned entirely with Terraform:
- VPC with CIDR 10.0.0.0/16
- Public subnet with CIDR 10.0.1.0/24
- Internet Gateway and route table
- Security group allowing SSH (port 22) and Jenkins web access (port 8080)
- IAM role with policies for ECR, S3, Lambda, and CloudFront operations
- EC2 t3.small instance with Amazon Linux 2023
- User data script installs Docker and starts Jenkins container
- Docker-in-Docker configuration for building images within Jenkins
- S3 bucket for Terraform remote state storage with versioning and encryption

---

## CI/CD Pipeline

The deployment process is fully automated using Jenkins:

1. Developer pushes code to GitHub main branch
2. GitHub webhook triggers Jenkins pipeline
3. Jenkins pulls latest code from repository
4. Install dependencies for backend and frontend (parallel execution)
5. Run test suites (if configured)
6. Build three Docker images for microservices using buildx
7. Push images to Amazon ECR with version tags
8. Update Lambda functions with new container images
9. Wait for Lambda functions to become active
10. Build React frontend production bundle
11. Sync build artifacts to S3 bucket
12. Invalidate CloudFront cache to serve fresh content
13. Run health checks on deployed services
14. Pipeline completes in approximately 5-7 minutes

---

## Installation and Setup

### Prerequisites
- Node.js version 18 or higher
- Docker and Docker Buildx
- AWS CLI configured with valid credentials
- Terraform version 1.0 or higher

### Quickstart: TypeScript + Express (Local Dev)

Minimal setup for an Express server with TypeScript:

```bash
npm init -y
npm i -D typescript ts-node-dev @types/node
npx tsc --init

npm i express
npm i -D @types/express

npm i -D @types/bcrypt
```

**package.json scripts**
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpileOnly src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

Run:
```bash
npm run dev
```

### Local Development

1. Clone the repository
```bash
git https://github.com/anexinwilson/video-board.git
cd videoboard
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Configure environment variables
   - Copy `.env.example` to `.env`
   - Fill in MongoDB connection string
   - Add JWT secret key
   - Configure AWS credentials
   - Set email service credentials

5. Start backend server
```bash
cd backend
npm run dev
```

6. Start frontend development server
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

---

## Docker → Amazon ECR (Buildx, Push, and Lambda)

**Login and Repo Creation**
```bash
docker buildx create --use

aws ecr get-login-password --region <AWS_REGION> | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com

aws ecr create-repository --repository-name auth-service   --region <AWS_REGION>
aws ecr create-repository --repository-name user-service   --region <AWS_REGION>
aws ecr create-repository --repository-name video-service  --region <AWS_REGION>
```

**Build & Push**
```bash
docker buildx build --platform linux/amd64 -f src/lambda/auth/Dockerfile   -t <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/auth-service:latest   . --push --provenance=false --sbom=false

docker buildx build --platform linux/amd64 -f src/lambda/user/Dockerfile   -t <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/user-service:latest   . --push --provenance=false --sbom=false

docker buildx build --platform linux/amd64 -f src/lambda/video/Dockerfile   -t <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/video-service:latest   . --push --provenance=false --sbom=false
```

---

## Deployment

1. Push images to **ECR**
2. Create **AWS Lambda functions** with container images
3. Configure **API Gateway** routes to map to each service
4. Upload frontend build to **S3**
5. Attach **CloudFront** distribution for global delivery
6. Verify in **CloudWatch** logs and test endpoints

---

## Infrastructure Deployment

### Setting Up Jenkins with Terraform

1. Navigate to Terraform directory
```bash
cd videoboard-jenkins-tf
```

2. Create S3 bucket for Terraform state
```bash
cd backend/
terraform init
terraform apply -auto-approve
cd ..
```

3. Generate SSH key pair
```bash
ssh-keygen -t rsa -b 4096 -f jenkins-key -N ""
```

4. Deploy Jenkins infrastructure
```bash
terraform init
terraform plan
terraform apply -auto-approve
```

This creates:
- VPC with public subnet and Internet Gateway
- Security group allowing ports 22 and 8080
- IAM role with ECR, S3, Lambda, and CloudFront permissions
- EC2 t3.small instance with Docker
- Jenkins container with Docker-in-Docker capability

5. Access Jenkins
```bash
# Get Jenkins URL
terraform output jenkins_url

# SSH to get initial password
ssh -i jenkins-key ec2-user@<instance-ip>
cat jenkins_initial_password.txt
```

### Configuring Jenkins Pipeline

1. Open Jenkins in browser and complete initial setup
2. Install required plugins:
   - Docker Pipeline
   - AWS Steps
   - GitHub Integration
   - Pipeline
   - Credentials Binding Plugin

3. Add AWS credentials in Jenkins
   - Go to Manage Jenkins → Credentials → Global → Add Credentials
   - Add three Secret Text credentials:
     - ID: `aws-account-id` (your 12-digit AWS account ID)
     - ID: `s3-bucket-name` (your S3 bucket name)
     - ID: `cloudfront-distribution-id` (your CloudFront distribution ID)

4. Create new Jenkins pipeline
   - Click "New Item"
   - Enter name: `VideoBoard-AutoDeploy`
   - Select "Pipeline"
   - Click OK

5. Configure pipeline
   - Check "GitHub hook trigger for GITScm polling"
   - Under Pipeline section:
     - Definition: "Pipeline script from SCM"
     - SCM: Git
     - Repository URL: your GitHub repo URL
     - Branch: `*/main`
     - Script Path: `Jenkinsfile`
   - Save

6. Setup GitHub webhook
   - Go to GitHub repository Settings → Webhooks → Add webhook
   - Payload URL: `http://your-jenkins-ip:8080/github-webhook/`
   - Content type: `application/json`
   - Select "Just the push event"
   - Save

Now every push to main branch automatically triggers deployment.

---

## Manual Deployment (Without Jenkins)

### Build and Push Docker Images

1. Login to ECR
```bash
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-2.amazonaws.com
```

2. Build and push auth service
```bash
docker buildx build --platform linux/amd64 \
  -f backend/src/lambda/auth/Dockerfile \
  -t <account-id>.dkr.ecr.us-east-2.amazonaws.com/videoboard-auth:latest \
  backend --push --provenance=false --sbom=false
```

3. Build and push user service
```bash
docker buildx build --platform linux/amd64 \
  -f backend/src/lambda/user/Dockerfile \
  -t <account-id>.dkr.ecr.us-east-2.amazonaws.com/videoboard-user:latest \
  backend --push --provenance=false --sbom=false
```

4. Build and push video service
```bash
docker buildx build --platform linux/amd64 \
  -f backend/src/lambda/video/Dockerfile \
  -t <account-id>.dkr.ecr.us-east-2.amazonaws.com/videoboard-video:latest \
  backend --push --provenance=false --sbom=false
```

### Update Lambda Functions

```bash
aws lambda update-function-code \
  --function-name videoboard-auth \
  --image-uri <account-id>.dkr.ecr.us-east-2.amazonaws.com/videoboard-auth:latest \
  --region us-east-2

aws lambda update-function-code \
  --function-name videoboard-user \
  --image-uri <account-id>.dkr.ecr.us-east-2.amazonaws.com/videoboard-user:latest \
  --region us-east-2

aws lambda update-function-code \
  --function-name videoboard-video \
  --image-uri <account-id>.dkr.ecr.us-east-2.amazonaws.com/videoboard-video:latest \
  --region us-east-2
```

### Deploy Frontend

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://your-bucket-name/ --delete
aws cloudfront create-invalidation --distribution-id your-dist-id --paths "/*"
```

---

## Infrastructure Teardown

### Destroy Jenkins Infrastructure

1. Destroy main infrastructure
```bash
cd videoboard-jenkins-tf
terraform destroy -auto-approve
```

2. Destroy backend S3 bucket
```bash
cd backend/
aws s3 rm s3://jenkins-videoboard-bucket --recursive
terraform destroy -auto-approve
```

3. Clean local files
```bash
rm -rf .terraform/ backend/.terraform/
rm .terraform.lock.hcl backend/.terraform.lock.hcl
rm jenkins-key jenkins-key.pub
```

---

## Project Structure

```
videoboard/
├── backend/
│   ├── src/
│   │   ├── lambda/
│   │   │   ├── auth/
│   │   │   │   └── Dockerfile
│   │   │   ├── user/
│   │   │   │   └── Dockerfile
│   │   │   └── video/
│   │   │       └── Dockerfile
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
│
├── videoboard-jenkins-tf/
│   ├── backend/
│   │   └── main.tf
│   ├── main.tf
│   ├── iam.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── README.md
│
├── Jenkinsfile
└── README.md
```

---

## Key Features

**Authentication & Security**
- JWT-based authentication (sign-up, sign-in, logout, password reset via email)
- Passwords hashed with bcrypt
- Protected routes for user profile and video management
- Session management with automatic token refresh
- CORS configuration and input validation

**Video Upload, Streaming & Management**
- Uploads stored in Amazon S3 via presigned URLs
- Playback powered by Mux Player with adaptive streaming
- CRUD operations for videos (upload, update, delete, fetch by ID, list all)
- Lexical-based rich text editor for video descriptions
- Thumbnail generation and storage
- View count tracking and analytics

**Sharing & Downloads**
- Copy-to-clipboard to share video links
- Secure video downloads with view/download tracking
- Access control for protected content

**Responsive Frontend**
- Built with React, Vite, and TailwindCSS
- State management with Redux Toolkit
- Fully responsive design for mobile, tablet, and desktop
- Real-time upload progress indication
- Video search and filtering
- Protected client-side routes

---

## Environment Variables

### Backend
```
MONGO_URI=mongodb+srv://...
JWT_SECRET_KEY=your-secret-key
AWS_REGION=us-east-2
AWS_BUCKET_NAME=your-bucket-name
EMAIL=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://your-cloudfront-url
```

### Frontend
```
VITE_API_URL=https://your-api-gateway-url
```

---

## What I Learned

**Backend Development**
- Designing and implementing microservices architecture
- Serverless application development with AWS Lambda
- Docker containerization and multi-stage builds
- RESTful API design and implementation
- Database modeling with MongoDB
- Authentication and authorization patterns
- Email integration for user workflows

**Frontend Development**
- State management with Redux Toolkit
- TypeScript for type-safe development
- Modern React patterns and hooks
- Responsive design with TailwindCSS
- API integration and error handling
- File upload handling
- Rich text editing integration

**DevOps and Infrastructure**
- Infrastructure as Code with Terraform
- CI/CD pipeline design and implementation
- Docker-in-Docker configurations
- AWS services integration (Lambda, S3, CloudFront, ECR, API Gateway)
- IAM roles and security policies
- GitHub webhook integration
- Jenkins pipeline configuration
- Multi-stage deployment strategies

**Cloud Architecture**
- Serverless computing patterns
- CDN configuration and cache management
- VPC networking and security groups
- Container orchestration on Lambda
- Remote state management

---

## License

This project is created for educational and portfolio purposes.