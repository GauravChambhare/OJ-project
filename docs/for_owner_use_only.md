#### make file executable
`chmod +x configs/setup.sh`

##### to run from root setup.sh file
`./configs/setup.sh`

##### Alternative 1
`cd OJ-project/configs`

`chmod +x setup.sh`

`./setup.sh`

##### Alternative 2

`chmod +x configs/setup.sh`

`./configs/setup.sh`

### NOTE: for running setup.sh

```text
Start from project root, not relative ...

Ensure we’re in server/.

Install all backend deps in one go.
```
commands for running express server

```bash npx nodemon server.js```

or

```bash npm run server.js```
or
```bash npm run dev```

for react code run below in `client`
```bash npm run dev```

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

#### Below are some different but important methods on how to build Docker images.

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


---
#### We need to run below command for running the images

```bash: docker run --rm -v </path/to/tempdir:/runner/work> <image name>:<tag> \ /runner/run.sh <language> <code file> <testcase file>```
