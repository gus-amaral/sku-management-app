# Deploying SKU Management App to AWS

This Next.js 14 app can be deployed to AWS in two main ways. **Option A (Amplify)** is the fastest if your code is in Git. **Option B (Docker)** works for ECS, App Runner, or Elastic Beanstalk.

---

## Prerequisites

- **AWS account** with console access
- **Node.js 18+** (already used for local dev)
- **Git** (for Option A), or **Docker** (for Option B)

---

## Option A: AWS Amplify (recommended for Git-based deploy)

Amplify builds and hosts your Next.js app (including API routes) and gives you a URL. Each push to your branch can trigger a new deploy.

### 1. Push your app to a Git repository

If it’s not already in Git:

```bash
cd C:\Users\gcast\sku-management-app
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on **GitHub**, **GitLab**, **Bitbucket**, or **AWS CodeCommit**, then:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

### 2. Connect Amplify to your repo

1. Open [AWS Amplify Console](https://console.aws.amazon.com/amplify/).
2. Click **Create new app** → **Host web app**.
3. Choose your Git provider (GitHub, GitLab, Bitbucket, or CodeCommit) and **Authorize** if asked.
4. Select the **sku-management-app** repository and the branch (e.g. `main`).
5. Amplify will detect Next.js. The repo already has an `amplify.yml` for the build.
6. (Optional) Add environment variables in **Advanced settings** if you add any later (e.g. `NODE_ENV=production`).
7. Click **Next**, then **Save and deploy**.

### 3. Wait for the first build

Amplify will run `npm ci` and `npm run build`. When the build succeeds, you’ll get a URL like:

`https://main.xxxxxxxx.amplifyapp.com`

Use this URL to open your app. Future pushes to the connected branch will trigger new builds and deploys.

---

## Option B: Deploy with Docker (ECS, App Runner, or Elastic Beanstalk)

The project includes a `Dockerfile` and `next.config.js` is set to `output: 'standalone'` so the image runs correctly.

### Build and run the image locally (optional)

```bash
cd C:\Users\gcast\sku-management-app
docker build -t sku-management-app .
docker run -p 3000:3000 sku-management-app
```

Open http://localhost:3000 to confirm it works.

### Deploy to AWS

**1. Build and push the image to Amazon ECR**

```bash
# Replace REGION and ACCOUNT_ID with your AWS region and account ID
aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com
aws ecr create-repository --repository-name sku-management-app --region REGION
docker build -t sku-management-app .
docker tag sku-management-app:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/sku-management-app:latest
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/sku-management-app:latest
```

**2. Run the app on AWS**

- **App Runner** (simplest): In [App Runner console](https://console.aws.amazon.com/apprunner/), create a new service from the ECR image above. Use the default port **3000**.
- **ECS Fargate**: Create a task definition that uses the same ECR image, port 3000, and a load balancer if you need one.
- **Elastic Beanstalk**: Create a **Docker** environment and use the same image (e.g. via a `Dockerrun.aws.json` or by building from the Dockerfile in the repo).

After the service is running, use the URL provided (App Runner/ALB/Beanstalk) to access the app.

---

## Data persistence note

The app currently uses an **in-memory store** (`src/lib/store.ts`). Data is lost when the process restarts (e.g. new deploy or scale-down). For production:

- Add a database (e.g. **Amazon DynamoDB**, **RDS**, or **Aurora**) and replace the in-memory store with DB calls.
- Keep using Amplify or Docker; only the data layer needs to change.

---

## Summary

| Method        | Best for                          | URL after deploy                          |
|---------------|-----------------------------------|-------------------------------------------|
| **Amplify**   | Git-based workflow, minimal setup | `https://<branch>.<app-id>.amplifyapp.com` |
| **Docker**    | ECR/ECS/App Runner/Beanstalk      | Depends on service you create             |

For the quickest path: push the app to Git and use **Option A (Amplify)**.
