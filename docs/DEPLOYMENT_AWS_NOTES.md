Here’s a concise “spec” you can paste into your OJ project repo (e.g., in a `DEPLOYMENT_AWS_NOTES.md` or at the top of a config file). If you keep this intact, I’ll know exactly what flow to follow when you say “deploy to AWS like in the video.”

```md
# OJ Deployment – AWS (Bhavesh Garg Flow)

We want to deploy this OJ / online-compiler project using the same flow as:
[05 Apr 2025][L2024B5] Dev Season IX: Deploying in AWS | Bhavesh Garg [page:1, {ts:639}]

## High-level architecture

- Backend is containerized with Docker (we already have a `Dockerfile` in the backend).  
- Docker image is pushed to **Amazon ECR** (Elastic Container Registry).  
- An **EC2** instance (Amazon Linux, free tier eligible) pulls that image and runs a Docker container.  
- EC2’s **public IPv4 + port** is used as the backend base URL.  
- Frontend is deployed on **Vercel** and points to the EC2 backend URL.  
- For now, backend runs on **HTTP** and frontend on **HTTPS**, causing **mixed-content** warning; temporarily fixed via “allow insecure content” in the browser. [page:1, {ts:1620}][page:1, {ts:4213}]

## Exact AWS backend flow we want

1. **Local verification and dockerization**  
   - Backend runs locally (e.g., `nodemon index.js` or similar) and is tested before deployment.  
   - We build the Docker image locally:  
     - Example image name used in the video: `cpp-compiler` / `cpp-online-compiler`. [page:1, {ts:2205}][page:1, {ts:2214}]

2. **AWS account and IAM setup**  
   - Use a personal AWS account with free credits (AWS may give ~$100 free credits initially).  
   - Create an **IAM user** with **AdministratorAccess** policy for this demo.  
   - Generate **Access key** and **Secret access key** for that user.  
   - Configure AWS CLI locally with: `aws configure` (access key, secret key, region `ap-south-1`, output `json`). [page:1, {ts:2421}][page:1, {ts:2723}][page:1, {ts:2826}][page:1, {ts:2844}]

3. **ECR repository and image push (local → ECR)**  
   - Create an **ECR repository** named **exactly or very close** to the local image name, e.g. `cpp-online-compiler`.  
   - Use the “View push commands” button in ECR and run those commands locally:
     - Authenticate Docker to ECR with `aws ecr get-login-password | docker login ...`.  
     - Build/tag image if needed (e.g., `docker build -t cpp-online-compiler .`).  
     - Tag with the full ECR URI.  
     - Push image: `docker push <account-id>.dkr.ecr.ap-south-1.amazonaws.com/cpp-online-compiler`. [page:1, {ts:2480}][page:1, {ts:2564}][page:1, {ts:2577}][page:1, {ts:3028}][page:1, {ts:3113}][page:1, {ts:3232}]

4. **EC2 instance creation**

   - Launch **one** EC2 instance (Amazon Linux, free-tier-eligible `t2.micro` or similar).  
   - Create/download a **.pem key pair**, store it in a `keys/` folder locally, and never commit it to Git.  
   - Configure **Security Group**:
     - Allow **SSH (22)** from your IP.  
     - Add **Custom TCP** rule for the backend port (e.g. **30000** or **8000**, depending on container) from `0.0.0.0/0` (anywhere). [page:1, {ts:3404}][page:1, {ts:3439}][page:1, {ts:3456}][page:1, {ts:3481}][page:1, {ts:3491}]

5. **SSH into EC2 and install Docker**

   - SSH from local machine (being in `keys/` folder) using the copied **SSH client** command from EC2 console.  
   - If permission error occurs for `.pem`, fix with `chmod 400 <key>.pem`. [page:1, {ts:3573}][page:1, {ts:3595}][page:1, {ts:3621}][page:1, {ts:3633}]  
   - On EC2:
     - Run `aws configure` again with the same IAM keys and region (`ap-south-1`). [page:1, {ts:3718}]  
     - Install Docker on **Amazon Linux** with the commands from the cheat-sheet (e.g. `sudo yum install docker`, start service, add current user to `docker` group, reboot).  
     - Verify Docker with `docker info`. [page:1, {ts:3785}][page:1, {ts:3806}][page:1, {ts:3811}][page:1, {ts:3894}]

6. **Pull image from ECR (ECR → EC2) and run container**

   - On EC2, pull the image using its **image URI** from ECR (e.g. `docker pull <account-id>.dkr.ecr.ap-south-1.amazonaws.com/cpp-online-compiler`).  
   - Verify image with `docker images`.  
   - Run the container:
     - `docker run -d -p <host_port>:<container_port> --name <container_name> <image_id_or_uri>`  
     - In the video, examples:  
       - Backend built originally with `30000` host/container port.  
       - Later uses a pre-built image that listens on `8000` inside the container, so they ran `-p 8000:8000`. [page:1, {ts:3977}][page:1, {ts:3986}][page:1, {ts:4154}][page:1, {ts:4175}]  
   - After start, `docker ps` should show the container as “Up”.  
   - Verifies that submissions create files under a `submissions` / `codes` directory inside the container using `docker exec -it <container> sh`. [page:1, {ts:2356}][page:1, {ts:2365}][page:1, {ts:4392}][page:1, {ts:4409}][page:1, {ts:4417}]

7. **Backend URL and HTTP vs HTTPS**

   - Use **EC2 public IPv4 address + port** as backend base URL, e.g. `http://<EC2_PUBLIC_IP>:8000`.  
   - This is HTTP, not HTTPS; that’s why browsers show **mixed-content** warnings when called from a HTTPS frontend. [page:1, {ts:4213}][page:1, {ts:4301}]  
   - Long-term fix (not implemented in this session, but desired eventually):
     - Buy a cheap domain (₹100–₹200) and set up SSL (certificate) so backend also serves over HTTPS. [page:1, {ts:5069}][page:1, {ts:5120}]

## Frontend deployment (Vercel) flow we want

1. **Repo structure assumption**

   - Mono-repo with at least two folders:  
     - `backend/` (Dockerized service)  
     - `frontend/` (Vite React or similar). [page:1, {ts:1924}][page:1, {ts:1932}][page:1, {ts:4591}]

2. **Set backend URL in frontend**

   - Frontend has an env variable for backend, something like:  
     - `VITE_BACKEND_URL=http://<EC2_PUBLIC_IP>:8000`  
   - This is used in API calls (e.g., Axios) instead of hardcoding local `http://localhost:3000`. [page:1, {ts:4345}][page:1, {ts:4352}][page:1, {ts:4465}]

3. **Vercel deployment**

   - Connect GitHub repo to Vercel.  
   - When importing project in Vercel, select **only the `frontend/` subdirectory** as the project root; then Vercel detects **Vite** automatically instead of “Other”. [page:1, {ts:4512}][page:1, {ts:4553}][page:1, {ts:4586}]  
   - Add environment variable (same name as in `.env`):  
     - Key: e.g. `VITE_BACKEND_URL`  
     - Value: `http://<EC2_PUBLIC_IP>:8000` (with `/run` path appended if required by backend). [page:1, {ts:4605}][page:1, {ts:4614}]  
   - Deploy; Vercel provides a **HTTPS** URL like `https://<project>.vercel.app`. [page:1, {ts:4742}][page:1, {ts:4761}]

4. **Temporary mixed-content workaround**

   - In Chrome, for testing, enable “allow insecure content” for the Vercel domain in Site Settings so HTTPS frontend can call HTTP backend.  
   - This is only acceptable for MVP/testing, not for final resume-ready version. [page:1, {ts:4789}][page:1, {ts:4845}][page:1, {ts:4862}][page:1, {ts:5042}]

## What to do when I ask the AI “deploy to AWS”

When I say: **“Deploy this OJ project to AWS like in Bhavesh’s video”**, I expect the AI to:

- Use **this file and flow** as the source of truth.  
- Assume: Dockerized backend, AWS account + IAM user with admin access, region `ap-south-1`, ECR + EC2 + Docker setup, and Vercel-based frontend.  
- Guide step-by-step:
  - Fix Dockerfile/backend issues if any.  
  - Push image to ECR.  
  - Launch/secure EC2, install Docker, pull image, run container on chosen port.  
  - Update frontend env and redeploy to Vercel.  
  - Optionally, advise how to add a low-cost domain + SSL later to remove mixed-content. [page:1, {ts:1620}][page:1, {ts:1689}][page:1, {ts:1768}][page:1, {ts:3127}][page:1, {ts:5035}]
```

---


| Rule | Port | Source                 | Purpose      |
| ---- | ---- | ---------------------- | ------------ |
| SSH  | 22   | My IP[range of ip's]   | Admin access |
| HTTP | 3000 | 0.0.0.0/0              | Server API   |
| HTTP | 4000 | 0.0.0.0/0              | Judge API    |