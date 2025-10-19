# VideoBoard

**VideoBoard** is a full-stack video sharing platform built with the **MERN stack, TypeScript, and AWS cloud services**.  
The backend is deployed as **three containerized microservices (auth, user, video) running on AWS Lambda**, each packaged with **multi-stage Docker builds** and managed via **Amazon API Gateway**.  

Videos and static assets are stored in **Amazon S3** and distributed globally through **Amazon CloudFront** for low-latency playback. Continuous integration and deployment are handled with **Jenkins on an EC2 instance**, ensuring automated build, test, and deployment pipelines.  

---

## Features

- **Authentication & Security**
  - JWT-based authentication (sign-up, sign-in, logout, password reset via email).
  - Passwords hashed with bcrypt.
  - Protected routes for user profile and video management.

- **Video Upload, Streaming & Management**
  - Uploads stored in **Amazon S3** via presigned URLs.
  - Playback powered by **Mux Player**.
  - CRUD operations for videos (upload, update, delete, fetch by ID, list all).
  - Lexical-based rich text editor for video descriptions.

- **Sharing & Downloads**
  - Copy-to-clipboard to share links.
  - Secure video downloads with view/download tracking.

- **Responsive Frontend**
  - Built with React + Vite + TailwindCSS.
  - State management with Redux Toolkit.
  - Fully responsive design.

---

## Cloud Architecture

- **Backend**
  - Split into 3 microservices: **auth-service**, **user-service**, **video-service**.
  - Each packaged as a **Docker container** and deployed to **AWS Lambda** (serverless).
  - API endpoints exposed through **Amazon API Gateway**.

- **Storage & Delivery**
  - Videos and thumbnails stored in **Amazon S3**.
  - Distribution and caching handled by **Amazon CloudFront**.

- **CI/CD**
  - **Jenkins pipeline** used for automated builds, tests, and deployments.
  - Hosted on an **Amazon EC2 instance** for orchestration.

- **Observability**
  - **Amazon CloudWatch** for logs and metrics.

---

## Tech Stack

### Frontend
- React 19 + TypeScript
- Redux Toolkit
- TailwindCSS
- Axios
- React Router
- Mux Player
- Lexical Editor

### Backend
- Node.js + Express + TypeScript
- MongoDB Atlas with Mongoose
- Passport + JWT for authentication
- bcrypt for password hashing
- Nodemailer for email flows
- Multer + AWS SDK for S3 uploads
- @vendia/serverless-express for Lambda integration

### Infrastructure
- AWS Lambda (serverless compute)
- Amazon API Gateway (API management)
- Amazon S3 (object storage for media and frontend build)
- Amazon CloudFront (global CDN distribution)
- Amazon ECR (container registry)
- Amazon EC2 (Jenkins server for CI/CD)
- Docker & Docker Buildx for image builds
- CloudWatch for monitoring and logs

---

## Installation & Setup

### Prerequisites
- Node.js >= 18
- Docker + Docker Buildx
- AWS CLI configured with credentials

---

### Local Development

1. Clone the repo:
   ```bash
   git clone <your_repo_url>
   cd videoboard
   ```

2. Install dependencies:

   **Frontend**
   ```bash
   cd frontend
   npm install
   ```

   **Backend**
   ```bash
   cd ../backend
   npm install
   ```

3. Configure environment variables.  
   - Copy `.env.example` to `.env` and fill in required values.
   - For local dev, uncomment the localhost-related config.

4. Run locally:

   **Backend**
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

   App runs at: `http://localhost:5173`

---

## Quickstart: TypeScript + Express (Local Dev)

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

1. Push images to **ECR**.
2. Create **AWS Lambda functions** with container images.
3. Configure **API Gateway** routes to map to each service.
4. Upload frontend build to **S3**.
5. Attach **CloudFront** distribution for global delivery.
6. Verify in **CloudWatch** logs and test endpoints.

---

## License

MIT License. Free to use for learning and portfolio projects.
