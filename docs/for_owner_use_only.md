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