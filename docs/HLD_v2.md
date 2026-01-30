# Online Judge – HLD v2

## Scope Changes from v1

### What v2 Adds Beyond v1

- Multiple language support for submissions: Java, Python, C++, and JavaScript.
- Judge service runs user code inside Docker containers per submission for all supported languages.
- REST APIs and data models extended to support language metadata and richer submission details.
- Frontend Code Arena wired to backend submissions API with real DB-backed Problems and TestCases.

### What is Still Out of Scope in v2

- Virtual contests or live multi-user contest management.
- Advanced sorting/filtering of problems (tags, difficulty ranges, company tags, etc.).
- Custom contests or user-specific playlists (favorites, to-do lists).
- Rich user profiles (avatar, education, rating graphs, badges).
- Asynchronous judging with message queues (v2 uses synchronous HTTP between backend and judge service).

---

## Updated Overview

### Tech Stack (unchanged at core)

- Frontend: React, Tailwind CSS, Fetch-based API calls.
- Backend API: Node.js + Express.
- Database: MongoDB (Mongoose ODM).
- Judge Service: Node.js + Express, Docker CLI / Docker Engine API.
- Other tools: Docker for sandboxed execution, nodemon for dev.

### User Flow (v2)

- User registration, login, profile view, and password reset as in v1.
- Homepage links to available problems.
- Problem detail (Code Arena) page for a specific problem:
  - Loads problem metadata from backend (`/api/problems/:code`).
  - Shows title, number, statement, difficulty, and sample testcases (future extension).
  - Presents a code editor (simple textarea) for writing solutions.
  - Language selector conceptually supports Java, Python, C++, JavaScript (v2 backend aware; frontend presently fixed to Java but schema and judge are multi-language ready).
  - **Run/Submit** triggers a call to backend submissions API (`POST /api/submissions`).
  - Displays verdict and basic execution info (time, memory, stdout/stderr).
  - Shows a "My recent submissions" panel for the logged-in user and that problem.

---

## Architecture (v2)

### High-Level Component Diagram

- **Web Client (React)**
  - Login/Signup pages.
  - Profile page (basic info + password change).
  - Problem page wired to backend problem & submission APIs.

- **Backend API Service (Node.js + Express)**
  - Auth routes: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/profile`, `POST /api/auth/reset-password`.
  - Problem routes: `GET /api/problems`, `GET /api/problems/:code`.
  - Submission routes:
    - `POST /api/submissions` – create submission, call judge, store verdict.
    - `GET /api/submissions` – list current user submissions (optionally filtered by problemCode).
    - (Future) `GET /api/submissions/:id` – fetch full details for one submission.
  - Integrates with Judge service over HTTP.

- **Judge Service (Node.js + Express)**
  - Exposes `POST /judge/run`.
  - Accepts body:
    ```json
    {
      "code": "...source code...",
      "language": "java" | "python" | "cpp" | "javascript",
      "problemId": "...",
      "testCases": [
        { "input": "...", "expectedOutput": "..." },
        ...
      ]
    }
    ```
  - For v2 design, the judge service is responsible for:
    - Preparing per-run working directories.
    - Writing source code and input files.
    - Spawning Docker containers with language-specific runtime images.
    - Executing code within resource limits.
    - Comparing outputs with expected outputs.
    - Returning aggregated verdict and metrics.

- **MongoDB (via Mongoose)**
  - Stores users, problems, testcases, submissions.

- **Docker Engine**
  - Runs per-submission containers for Java, Python, C++, JavaScript.

---

## Data Model v2

### users (unchanged from v1 in concept)

- `_id`: ObjectId
- `username`: String, unique
- `email`: String, unique
- `passwordHash`: String (bcrypt hashed)
- `createdAt`: Date

### problems (extended)

- `_id`: ObjectId
- `number`: Number, unique (LeetCode-style problem number)
- `title`: String
- `code`: String, unique short identifier (e.g. `SUM2`)
- `statement`: String (markdown or plain text)
- `difficulty`: String enum: `['Easy','Medium','Hard']`
- `createdAt`: Date

### test_cases (same structure, implemented as TestCase model)

- `_id`: ObjectId
- `problemId`: ObjectId, ref `Problem`
- `input`: String
- `expectedOutput`: String
- `isSample`: Boolean (sample vs hidden)

### submissions (extended for multi-language)

- `_id`: ObjectId
- `userId`: ObjectId, ref `User`
- `problemId`: ObjectId, ref `Problem`
- `language`: String (supported: `java`, `python`, `cpp`, `javascript`)
- `sourceCode`: String
- `verdict`: String (e.g. `Pending`, `Accepted`, `Wrong Answer`, `Runtime Error`, `Time Limit Exceeded`, `Compilation Error`, `Judge Error`)
- `executionTimeMs`: Number (optional)
- `memoryUsedKb`: Number (optional)
- `stdout`: String (optional, often last test-case output or truncated)
- `stderr`: String (optional, compiler/runtime errors)
- `submittedAt`: Date

> Note: In v2 implementation, some fields (stdout, stderr) may be partially used; the schema is future-proof for richer UI.

---

## Backend API Design (v2)

### Auth APIs

- `POST /api/auth/signup`
  - Request: `{ username, email, password }`
  - Response: 201 on success; error JSON otherwise.

- `POST /api/auth/login`
  - Request: `{ email, password }`
  - Response: `{ token, user: { id, username, email } }`.

- `GET /api/auth/profile`
  - Auth: Bearer JWT.
  - Response: `{ username, email }` for current user.

- `POST /api/auth/reset-password`
  - Auth: Bearer JWT.
  - Request: `{ oldPassword, newPassword }`.
  - Behavior: verify old password, update hashed password, force re-login.

### Problems APIs

- `GET /api/problems`
  - Public.
  - Returns list of problems:
    ```json
    [
      {
        "id": "...",
        "number": 1,
        "title": "Sum Two Numbers",
        "code": "SUM2",
        "difficulty": "Easy",
        "createdAt": "..."
      },
      ...
    ]
    ```

- `GET /api/problems/:code`
  - Public.
  - Returns a single problem (no hidden testcases):
    ```json
    {
      "id": "...",
      "number": 1,
      "title": "Sum Two Numbers",
      "code": "SUM2",
      "statement": "Given two integers, output their sum...",
      "difficulty": "Easy",
      "createdAt": "..."
    }
    ```

### Submissions APIs

- `POST /api/submissions`
  - Auth: Bearer JWT.
  - Request body:
    ```json
    {
      "problemCode": "SUM2",
      "language": "java",  // later: "python" | "cpp" | "javascript"
      "code": "public class Main { ... }"
    }
    ```
  - Flow:
    1. Validate JWT, resolve user.
    2. Find `Problem` by `code` (`SUM2` → problem `_id`).
    3. Create `Submission` with `verdict = 'Pending'`.
    4. Load `TestCase` documents for `problemId`.
    5. Call Judge service `POST /judge/run` with `{ code, language, problemId, testCases }`.
    6. Receive judge result (verdict, stdout, stderr, time, memory).
    7. Update `Submission` document and return a compact view:
       ```json
       {
         "id": "...",
         "problemId": "...",
         "language": "java",
         "verdict": "Accepted",
         "timeMs": 123,
         "memoryKb": 456,
         "createdAt": "..."
       }
       ```

- `GET /api/submissions?problemCode=SUM2`
  - Auth: Bearer JWT.
  - Resolves `problemCode` → `problemId` and fetches submissions for current user & problem.
  - Response: list of recent submissions sorted by `submittedAt` desc.

> Future: `GET /api/submissions/:id` may return full source code and all judge outputs.

---

## Judge Service Design (v2, multi-language)

### Endpoint

- `POST /judge/run`
  - Request body:
    ```json
    {
      "code": "...source code...",
      "language": "java" | "python" | "cpp" | "javascript",
      "problemId": "...",
      "testCases": [
        { "input": "...", "expectedOutput": "..." },
        ...
      ]
    }
    ```

  - Response (success):
    ```json
    {
      "verdict": "Accepted" | "Wrong Answer" | "Compilation Error" | "Runtime Error" | "Time Limit Exceeded" | "Judge Error",
      "stdout": "...",   // typically last test output or concatenated
      "stderr": "...",   // compiler/runtime errors
      "timeMs": 123,
      "memoryKb": 456
    }
    ```

### Language-Specific Execution Strategy

For each submission, the judge service:

1. Creates a temporary working directory for that run.
2. Writes the source code to a file, depending on language:
   - Java → `Main.java`
   - Python → `main.py`
   - C++ → `main.cpp`
   - JavaScript → `main.js`
3. Uses a **single shared Docker image** (based on a small Linux or Node image) which has all required runtimes installed:
   - OpenJDK for Java
   - Python 3 for Python
   - g++ for C++
   - Node.js for JavaScript

   Inside the container, a small runner script dispatches based on `language`:

   - **Java**
     - `javac Main.java`
     - `java Main < input.txt`

   - **Python**
     - `python3 main.py < input.txt`

   - **C++**
     - `g++ main.cpp -O2 -o main`
     - `./main < input.txt`

   - **JavaScript**
     - `node main.js < input.txt`

4. For each test case, the judge:
   - Writes input to `input.txt`
   - Runs the appropriate command via Docker
   - Captures stdout/stderr and exit code
   - Enforces a timeout (kill container if it exceeds the limit)
   - Compares stdout (trimmed) with `expectedOutput`

5. Aggregates across all test cases to compute:
   - `Accepted`, `Wrong Answer`, `Compilation Error`, `Runtime Error`, `Time Limit Exceeded`, or `Judge Error`
   - Approximate `timeMs` and `memoryKb`.

> In v2, the focus is correctness and isolation, not perfect performance metrics; memory/time can initially be approximated.[this may be made better in future]

---

## Docker & Isolation Considerations


- Run containers with:
  - Non-root user. [extra layer to prever root access to container via malicious code execution]
  - Limited CPU and memory (via Docker `--cpus`, `--memory`).
  - No network access (e.g. using Docker flags or custom network).
  - Read-only filesystem except for working directory.
- Ensure containers are cleaned up after each run (`--rm` or explicit cleanup).
- Avoid mounting sensitive host directories; only mount the per-run temp directory with code and input.

---

## Frontend Integration Summary (v2)

- Login/Signup/Profile pages connected to auth APIs.
- ProblemPage:
  - Fetches problem info from `/api/problems/:code` using the `code` from URL (`/problems/SUM2`).
  - Stores user code in a textarea (`codeText` state).
  - On Run/Submit:
    - Reads JWT from `localStorage`.
    - Sends `POST /api/submissions` with `{ problemCode: code, language, code: codeText }`.
    - Shows verdict and updates recent submissions list using `GET /api/submissions?problemCode=code`.

