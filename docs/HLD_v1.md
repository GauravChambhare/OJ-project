# Online Judge

## Problem Statement

An online judge is a platform where users can solve coding questions, submit their solutions, and receive verdicts based on automated evaluation of their code. It typically provides practice problems for improving problem‑solving skills and time‑bound contests where multiple users attempt a fixed set of problems under constraints. Based on the results, participants receive scores and ranks. The online judge provides all necessary infrastructure to support problem listing, code execution, evaluation, and scoring (for example, AtCoder, Codeforces, etc.).

---

## v1 Scope

### What it can do

- A profile page showing username and account email.
- Practice problems with support for a single language (Java).
- Secure user authentication and user data storage.
- A compiler/execution environment to run submitted code.
- Submission history for a problem (previous attempts, verdicts, timestamps).
- A backend service to perform authentication, data management, and verdict generation.

### What it can’t do

- Support multiple programming languages.
- Virtual contests or live multi‑user contest management.
- Advanced sorting and filtering for practice problems like on large platforms.
- Custom contests or user‑specific notes/annotations on problems.
- Personal custom problem lists (favorites, “to‑do” lists, curated sets, etc.).
- Detailed profile attributes such as avatar, education, contact details, rating graphs, or rich statistics as seen on LeetCode/NeetCode.

---

## Overview

### Tech Stack

MERN is chosen for this project because it is widely used, has an active community, and abundant free educational resources.

- Frontend: HTML, CSS, JavaScript, Tailwind CSS, React.
- Backend: Node.js runtime with Express.js for REST APIs.
- Database: MongoDB for flexible document‑based storage of problems, users, and submissions.
- Other tools: Docker for sandboxed code execution.

### User Flow (v1)

- A user can log in with a username and password.
- If the user is new, they can create an account by providing:
  - A valid username.
  - A valid email ID.
  - A valid password.
- Once logged in, the user lands on the homepage.
- The homepage shows a list of practice problems; clicking a problem opens a **Code Arena** page.
- The Code Arena will contain:
  - Problem statement and sample test cases.
  - Coding window (Java), language selector pre‑set to Java.
  - **Run** button for running code against sample tests.
  - **Submit** button for running against full hidden test cases.
  - Output / Work Box to display run/submit results and logs.
- The user can view a profile page showing:
  - Username.
  - Email.
  - Actions to reset password.
  - Logout option.

### Key Features

- User registration and login.
- Practice problem listing and viewing.
- Solution submission (Java only in v1).
- Profile management (basic info and password reset).
- Solution evaluation and scoring (verdicts like Accepted / Wrong Answer / Runtime Error).

### Key Challenges

- Protecting the system against malicious code submissions (for example, infinite loops, resource abuse).
- Ensuring user data security (credentials, profile data).
- Handling bursts of traffic when many users submit within a short time window (thundering herd).
- Preventing unauthorized access to backend servers and manipulation of verdicts or other users’ code.
- Designing a robust interaction between:
  - Web client ↔ API/backend service ↔ database ↔ judge service (Docker + queue).

---

## High Level Design

### Core Components

#### Web Client (React App)

- Renders pages for login/signup, problem list, problem detail/Code Arena, and profile.
- Communicates with backend via REST APIs over HTTPS.

#### Backend API Service (Node.js + Express)

- Handles user authentication (signup, login, sessions/tokens).
- Exposes endpoints for:
  - Listing problems.
  - Fetching problem details and sample tests.
  - Submitting code.
  - Fetching submission history.
  - Fetching basic profile data and password update.
- Optionally publishes code execution jobs to a message queue for asynchronous judging.

#### Database (MongoDB)

- Stores:
  - Users (credentials, profile info).
  - Problems (statement, difficulty, metadata).
  - Test cases (inputs/expected outputs per problem).
  - Submissions (user, problem, code, verdict, timestamps).

#### Judge Service (Docker‑based Code Runner)

- Consumes submissions from a queue or from the backend.
- Runs each submission inside a Docker container with:
  - Java runtime.
  - Resource limits (time, memory, CPU).
- Executes the user’s code against test cases and generates verdicts.
- Reports verdicts and execution metadata back to the backend, which stores them in the database.

#### Message Queue (optional in v1)

- Sits between backend and judge workers.
- Smooths out spikes when many submissions arrive at the same time.
- Ensures submissions are processed asynchronously without blocking HTTP requests.

---

## Data Model (MongoDB, v1)

### users

- `_id`
- `username` (unique)
- `email` (unique)
- `password_hash`
- `created_at`

### problems

- `_id`
- `title`
- `code`/`Tags` (short identifier like `TWO_SUM`)
- `statement` (description)
- `difficulty` (for example, `Easy` / `Medium` / `Hard`)
- `created_at`

### test_cases

- `_id`
- `problem_id` (reference to `problems._id`)
- `input` (string)
- `expected_output` (string)
- `is_sample` (boolean flag for sample vs hidden testcases)

### submissions

- `_id`
- `user_id` (reference to `users._id`)
- `problem_id` (reference to `problems._id`)
- `language` (fixed for now, `Java` in v1)
- `source_code`
- `verdict` (for example, `Accepted`, `Wrong Answer`, `Runtime Error`, `Time Limit Exceeded`)
- `execution_time_ms` (optional)
- `memory_used_kb` (optional)
- `submitted_at` (timestamp)

---

## Evaluation Flow (v1)

1. User writes Java code in Code Arena and clicks **Submit**.
2. Frontend sends a `POST` request to backend with problem ID, source code, and language.
3. Backend:
   - Validates user session.
   - Stores a submission record with status like `Pending`.
   - Enqueues the submission in the message queue (or directly calls the judge service in a simpler v1).
4. Judge service:
   - Picks the submission, starts a Docker container with Java runtime.
   - Compiles and runs code against all relevant test cases.
   - Applies time/memory limits and captures output.
   - Compares outputs against expected outputs and derives final verdict and resource usage.
5. Backend updates the submission document with final verdict and metrics.
6. Frontend either polls an endpoint or refreshes submission history to show the verdict.

---

## Non‑Functional Requirements (v1)

### Scalability

- Use a message queue and multiple judge workers to handle spikes in submission volume as the system grows.

### Security

- Hash and salt passwords; never store plain text credentials.
- Use JWT or secure session cookies for authentication.
- Run user code inside Docker containers with strict resource limits and restricted privileges to prevent host access.

### Reliability and Observability

- Basic logging of submission events and errors in backend and judge service.
- Simple health checks for API and judge workers.

### Performance

- Aim for reasonable latency: verdicts typically within a few seconds for typical problems (not strict real‑time).
```
