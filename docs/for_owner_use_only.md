#### make file executable
`chmod +x configs/setup.sh`

##### to run from root setup.sh file
`./configs/setup.sh`

##### Alternative 1
```bash
cd OJ-project/configs

chmod +x setup.sh

./setup.sh
```
##### Alternative 2
```bash
chmod +x configs/setup.sh

./configs/setup.sh
```
### NOTE: for running setup.sh

```text
Start from project root, not relative ...

Ensure we’re in server/.

Install all backend deps in one go.
```
commands for running express server

```bash 
npx nodemon server.js
```

or

```bash
 npm run server.js
 ```
or
```bash
 npm run dev
 ```

for react code run below in `vite` project (`client`)
```bash
 npm run dev
 ```

##### node_modules folder
---

#### Install tree [optional]
`brew install tree`

`tree`
For excluding some directories or files containing some text use below
`tree -I 'node_modules|.git|dist`
/ for client folder
`tree -L 3 -I "node_modules|dist|.git|.vite"`
For checking my system's current public ip run below
`curl ipinfo.io/ip'

```text

gauravchambhare@Gauravs-MacBook-Air OJ-project % tree
.
├── client
├── configs
│   └── setup.sh
├── docs
│   ├── HLD_v1.md
│   └── for_owner_use_only.md
└── server

5 directories, 3 files
```

##### I had gotten below issue when I tried to connect to service running on 5000 port[actually my webserver were not running on 5000 as it was occupied by control center]
https://stackoverflow.com/questions/69868760/m1-mac-process-keeps-autogenerating-and-locks-my-port

#### Use below command to check who is using specific port
`lsof -i :<port no.>`

#### Command for checking all installed npm packages in a dir
`npm ls --depth=0`
for finding transitive dependencies also we can run below command
`npm ls`

---

Ye wala samazhlo regarding ORM use case
```js
const existingUser = await User.findOne({
    $or: [
        { username: username },
        { email: email }
    ]
});
```
- `User.findOne()` searches for one document
- `$or` means "match if ANY of these conditions are true"
- `{ username: username }` matches if username matches
- `{ email: email }` matches if email matches
- `await` waits for the database query to complete
- `409` = Conflict (resource already exists)

### Notes:
- `await` can only be used inside an `async` function.
- Adding `async` before `(req, res)` makes the function `async` and allows `await`.
- ```const decoded = jwt.verify(token, process.env.JWT_SECRET); ``` what happens here is,
    - Verifies the token using the secret
    - Throws an error if invalid/expired
    - Returns the decoded payload if valid
- If your Node is not using ES modules by default, add `"type": "module"` in `package.json` or convert the imports to require.
---

### Remember
Middleware functions:
- Receive req, res, and next
- Can read/modify req and res
- Call next() to pass control to the next handler
- Can send a response and stop the chain
---

To create a new Vite React project,
How to run below commands
```shell
npm create vite@latest client
```
then enter --> react --> js

---

#### Below are some different but important methods on how to work Docker images.

1. `docker build --no-cache -t my-image:nocache .` 
It's especially useful if we want to create new image from scratch because normally if an image has been build next time when Docker tries to build same image from same Docker file it will use the earlier cached downloaded data and files.
2. `docker build -t my-image:latest .` here 
    
    a. *latest* is the tag associcated with this build. 
    
    b. *my-image* is name for this particular image
    
    c. `.` is the context path i,e to tell docker where to consider root for taking objects from while we are building the image. In this case `.` tell docker to use current directory as context path.
3. `docker tag my-image:latest myuser/my-image:v1
docker push myuser/my-image:v1
`
After building image, we can re‑tag and push  it to dockerhub.
    d. 'docker ps'
4. `docker images` shows all images currently stored on local system
5. `docker login` logs to dockerhub account, it will ask for username and password if it is not stored in cache memory.
6. `docker tag <original image>:<its tag> <username>/<new name>:<new tag>` this will retag the exisiting image on local as new name and new tag [we can keep their original values if needed] to prepare it to be pushed to remote.
7. `docker push <username>/<new image>:<new tag>` will push the image to remote.
8. `docker pull <username>/<new image>:<new tag>` to later pull an image from remote we can run this command.
9.  -  Remove by image ID `docker rmi <image id>`.
    - Remove by repository:tag `docker rmi <repository>:<tag>`.

10. Entering container in interactive mode `docker run --rm -it --entrypoint /bin/sh oj-runner:1-feb`.

[More details on removing, prunning docker images from local](https://www.datacamp.com/tutorial/docker-remove-image)

---
#### We need to run below command for running the images

```bash
 docker run --rm -v </path/to/tempdir:/runner/work> <image name>:<tag> \ /runner/run.sh <language> <code file> <testcase file>
 ```

---
#### To kill all processes relevant to our project we need to run either of these below commands

```bash

# stop all docker containers
docker stop $(docker ps -aq)

# kill all node processes
pkill -f node

# Kill judge service
pkill -f "judge/server.js"

# Kill main backend
pkill -f "server/server.js"

# Kill Vite dev server (frontend)
pkill -f "vite"

# all in one command
docker stop $(docker ps -aq) && pkill -f node
```

#### AWS CLI instalaltion
##### Install AWS CLI
`brew install awscli`

##### Verify installation
`aws --version`

STEPS IMP for aws deployment
- 
- create an aws account
- create an user account in it
- assign *AdministratorAccess* policy to it.
- create an access key for that user
- store the creds somewhere safe
- run below command and input correct details

#### AWS CLI commands
```bash
gauravchambhare@Gauravs-MacBook-Air server % aws configure
AWS Access Key ID [None]: ***********:
AWS Secret Access Key [None]: ***********:
Default region name [None]: ap-south-1
Default output format [None]: json
gauravchambhare@Gauravs-MacBook-Air server % aws sts get-caller-identity

{
    "UserId": "AIDA************",
    "Account": "**********",
    "Arn": "arn:aws:iam::***********:user/[user name]"
}
gauravchambhare@Gauravs-MacBook-Air server % aws --version
aws-cli/2.33.15 Python/3.13.12 Darwin/25.2.0 source/arm64
gauravchambhare@Gauravs-MacBook-Air server % 
```
#### Next steps

a. Create an ECR repo 

```bash
aws ecr create-repository \
  --repository-name oj-server \
  --region ap-south-1
  ```
you will see something like this
```bash
{
    "repository": {
        "repositoryArn": "arn:aws:ecr:ap-south-1:341083261875:repository/oj-server",
        "registryId": "341083261875",
        "repositoryName": "oj-server",
        "repositoryUri": "341083261875.dkr.ecr.ap-south-1.amazonaws.com/oj-server",
        "createdAt": "2026-02-05T19:17:01.004000+05:30",
        "imageTagMutability": "MUTABLE",
        "imageScanningConfiguration": {
            "scanOnPush": false
        },
        "encryptionConfiguration": {
            "encryptionType": "AES256"
        }
    }
}
```
 b. Next authenticate docker to ECR
 ```bash
gauravchambhare@Gauravs-MacBook-Air server % aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  341083261875.dkr.ecr.ap-south-1.amazonaws.com

Login Succeeded
 ```
 c. Tag your docker image
 ```bash
cd server

docker tag oj-server:latest \
  341083261875.dkr.ecr.ap-south-1.amazonaws.com/oj-server:latest
 ```

 d. Push Image to ECR

 ```bash
docker push 341083261875.dkr.ecr.ap-south-1.amazonaws.com/oj-server:latest
 ```

 e. Verify the image in ECR

 ```bash
 aws ecr describe-images \
  --repository-name oj-server \
  --region ap-south-1
```
  we should see op like below

  ```bash
  {
    "imageDetails": [
        {
            "registryId": "341083261875",
            "repositoryName": "oj-server",
            "imageDigest": "sha256:0efe334edc7e5540fe2ae626cd2a1c399886c70e3f4dc436f82d6935a68dfd7b",
            "imageSizeInBytes": 1347,
            "imagePushedAt": "2026-02-05T19:23:36.811000+05:30",
            "imageManifestMediaType": "application/vnd.oci.image.manifest.v1+json",
            "artifactMediaType": "application/vnd.oci.image.config.v1+json",
            "imageStatus": "ACTIVE"
        },
        {
            "registryId": "341083261875",
            "repositoryName": "oj-server",
            "imageDigest": "sha256:58408c328bad0b32724dacbe48b351b6a6978397f4efd37ef06c23a43e55323c",
            "imageSizeInBytes": 64963677,
            "imagePushedAt": "2026-02-05T19:23:36.827000+05:30",
   ```
#### Launching aws EC2 instance

1. go to console
2. give name, use everything else in default settings
3. create a RSA key, download it and then move it to `~/keys` on mac. then do `chmod 400 ~/keys/oj-key.pem`.
4. for network settings, click edit
 - b. Add group name as `oj-backend-sg`
5. Add rules below

| Type       | Protocol | Port | Source    | Description |
| ---------- | -------- | ---- | --------- | ----------- |
| SSH        | TCP      | 22   | My IP     | SSH access  |
| Custom TCP | TCP      | 3000 | 0.0.0.0/0 | Server API  |
| Custom TCP | TCP      | 4000 | 0.0.0.0/0 | Judge API   |

6. configure storage
- Size: 20 GiB (default 8 is too small)
- Volume type: gp3

7. Launch instance and note down public ip.

#### SSH into instance
`ssh -i ~/keys/oj-key.pem ec2-user@54.252.166.140`

If you get a warning about permissions, first run:
`chmod 400 ~/keys/oj-key.pem`.

### Once inside terminal run below commands one by one

```bash
# Update system packages
sudo yum update -y

# Install Docker and Git
sudo yum install docker git -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add ec2-user to docker group (so you can run docker without sudo)
sudo usermod -a -G docker ec2-user
```
Install node js 18
```bash
# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load NVM
source ~/.bashrc

# Install Node.js 18
nvm install 18

# Verify
node --version
# Should show: v18.x.x
```
Install process manager(pm2) we will use this to run judge service.
```bash
npm install -g pm2
```
Reboot ec2
```bash
sudo reboot
```
SSH back in after about 30 secs
```bash
ssh -i ~/keys/oj-key.pem ec2-user@54.252.166.140
```
Verify docker works
```bash
docker --version
docker ps
```
### Deploy services on EC2

1. Configure aws cli on ec2
```bash
aws configure
```
2. Login to ecr and pull server image 
```bash
# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  341083261875.dkr.ecr.ap-south-1.amazonaws.com

# Pull server image
docker pull 341083261875.dkr.ecr.ap-south-1.amazonaws.com/oj-server:latest
```
### *Note: if docker pull return somthing like below*
`[ec2-user@ip-172-31-23-117 ~]$ docker pull 341083261875.dkr.ecr.ap-south-1.amazonaws.com/oj-server:latest
latest: Pulling from oj-server
no matching manifest for linux/amd64 in the manifest list entries`
then that means the image was created on different os and now docker is not able to find the image for linux/amd64 system which is what our instance is using[Amazon linux]
 So we will need to re create image with linux/amd64 platform parameter

 `docker buildx build --platform linux/amd64 -t oj-server:latest .`

- retag the image

`docker tag oj-server:latest \
  341083261875.dkr.ecr.ap-south-1.amazonaws.com/oj-server:latest`

- push to ecr

`docker push 341083261875.dkr.ecr.ap-south-1.amazonaws.com/oj-server:latest`

3. run server container

```bash
docker run -d \
  --name oj-server \
  -p 3000:3000 \
  -e PORT=3000 \
  -e MONGODB_URI="mongodb+srv://leonexfrost1_db_user:IWillNeverGiveUp@oj-cluster-1.4h8fwtt.mongodb.net/?appName=oj-cluster-1" \
  -e JWT_SECRET="dekh-dekh-dekh-tu-yaha-waha-na-fekh-failegi-bimari-hoga-sabka-bura-hal-801219739901" \
  -e GEMINI_API_KEY="AIzaSyA9DpMi_wvmdoE4JUhRyxofm1YWFTmsq8g" \
  --restart unless-stopped \
  --memory="512m" \
  --cpus="0.5" \
  341083261875.dkr.ecr.ap-south-1.amazonaws.com/oj-server:latest

```
Check if running
```bash
docker ps
docker logs oj-server
```

4. Clone Your Repo & Setup Judge
```bash
# Clone your repo (replace with your actual GitHub repo URL)
git clone https://github.com/YOUR_USERNAME/OJ-project.git

# Go to judge directory
cd OJ-project/judge

# Install dependencies
npm install

# Build oj-runner image
docker build -t oj-runner1-feb .

# Verify image built
docker images | grep oj-runner
```
5. Run Judge Service with PM2
```bash
# Start judge service
PORT=4000 pm2 start server.js --name oj-judge

# Make it auto-start on reboot
pm2 save
pm2 startup
# Copy and run the command it outputs (starts with sudo)

# Check status
pm2 status
pm2 logs oj-judge
```

---
## Local development with docker

```bash
# 1. Create .env file from template
cp .env.example .env
# Edit .env with your actual values

# 2. Build and start all services
docker-compose up -d --build

# 3. View logs
docker-compose logs -f

# 4. Stop services
docker-compose down

# 5. Stop and remove volumes (clean slate)
docker-compose down -v
```

### AWS Deployment Commands:

```bash
# 1. SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# 2. Install Docker and Docker Compose
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Clone your repository
git clone your-repo-url
cd your-repo

# 4. Create .env file with production values
nano .env

# 5. Build and start
docker-compose up -d --build

# 6. Check status
docker-compose ps
```