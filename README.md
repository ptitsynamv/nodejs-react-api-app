# Node.js React API App

![Node.js](https://img.shields.io/badge/Node.js-20.11.0-339933?logo=nodedotjs&logoColor=white)
![npm](https://img.shields.io/badge/npm-10.2.4-CB3837?logo=npm&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-16-61DAFB?logo=react&logoColor=black)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![json-server](https://img.shields.io/badge/DB-json--server-4B32C3)
![License](https://img.shields.io/badge/license-ISC-blue)
![Build](https://img.shields.io/badge/build-no%20CI%20configured-lightgrey)

A full-stack social feed. Users sign up, log in, and publish posts with images. A **React** frontend talks to a **Node.js/Express REST API**, and a **json-server** instance stores the data in a plain JSON file. Changes to posts reach every connected client in real time through **Socket.io**.

## Key features

- **JWT authentication:** sign up and log in, with passwords hashed using bcrypt. Tokens expire after 1 hour, and the API checks them on every feed route.
- **Post CRUD:** create, view, edit, and delete posts. Only a post's author can edit or delete it.
- **Image uploads:** multer accepts PNG and JPEG uploads. The image file is deleted when its post is deleted or when the post gets a new image.
- **Real-time feed:** Socket.io sends `create`, `update` and `delete` events, so open feeds update without a page refresh.
- **Pagination:** the feed is sorted newest first and shows 10 posts per page.
- **Request validation:** express-validator checks input and returns 422 errors with details.
- **No database to install:** json-server provides a REST API over `server/db.json`.

## Architecture

```text
┌──────────────────┐   REST + JWT    ┌──────────────────┐   REST (fetch)   ┌──────────────────┐
│ React frontend   │ ──────────────▶ │ Express API      │ ───────────────▶ │ json-server      │
│ localhost:3000   │ ◀────────────── │ localhost:8080   │                  │ localhost:3001   │
└──────────────────┘   Socket.io     └──────────────────┘                  └────────┬─────────┘
                                       │ images/ (uploads)                          │
                                                                              server/db.json
```

The three apps are separate npm packages, and **all three must be running** for the app to work.

## Prerequisites

| Tool    | Version                         |
| ------- | ------------------------------- |
| Node.js | **20.11.0** (version this project was developed with) |
| npm     | **10.2.4**                      |
| Git     | any recent version              |

The backend uses the global `fetch` API, so it needs **Node 18 or later**.

### Using NVM

To install and switch to the matching Node version, use [nvm](https://github.com/nvm-sh/nvm) on macOS/Linux or [nvm-windows](https://github.com/coreybutler/nvm-windows) on Windows:

```bash
nvm install 20.11.0
nvm use 20.11.0
node -v   # v20.11.0
```

### Legacy frontend toolchain (important)

The frontend uses **Create React App 2 (`react-scripts` 2.0.4)**, which runs on webpack 4. Webpack 4 uses a hashing algorithm that OpenSSL 3 no longer allows by default, and Node 17+ ships with OpenSSL 3.

- `npm start` already passes `--openssl-legacy-provider`, so the dev server works on Node 20 without extra steps.
- `npm run build` does **not** pass that flag. On Node 17+, set the flag yourself before building:

  ```bash
  # macOS / Linux / Git Bash
  NODE_OPTIONS=--openssl-legacy-provider npm run build

  # Windows PowerShell
  $env:NODE_OPTIONS="--openssl-legacy-provider"; npm run build
  ```

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/ptitsynamv/nodejs-react-api-app.git
cd nodejs-react-api-app
```

### 2. Install dependencies

```bash
cd server   && npm install && cd ..
cd backend  && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Start the three services

Open three terminals and start the services **in this order**:

```bash
# Terminal 1 – data store (json-server)
cd server
npm start          # http://localhost:3001

# Terminal 2 – REST API + Socket.io (nodemon, auto-reload)
cd backend
npm start          # http://localhost:8080

# Terminal 3 – React app
cd frontend
npm start          # http://localhost:3000
```

### 4. Use the app

Open <http://localhost:3000>, create an account on the **Signup** page, then log in and start posting.

> **Notes**
>
> - Uploaded images are written to `backend/images/`. Create that directory before you upload anything: `mkdir backend/images`.
> - `server/db.json` is the live database, and json-server rewrites it as you use the app. Any sample users in it have hashed passwords, so sign up with a new account.
> - The frontend has the URLs `http://localhost:8080` (API) and `http://localhost:3001` (data store) written directly into its code. Keep the default ports, or update the URLs in `frontend/src` and `backend/models` to match.

## API reference

All `/feed` routes need the header `Authorization: Bearer <token>`.

| Method   | Endpoint               | Description                                             |
| -------- | ---------------------- | ------------------------------------------------------- |
| `PUT`    | `/auth/signup`         | Register (`email`, `name`, `password`)                  |
| `POST`   | `/auth/login`          | Log in and receive `{ token, userId }`                  |
| `GET`    | `/feed/posts?page=N`   | Paginated posts with creator info                       |
| `POST`   | `/feed/post`           | Create a post (`multipart/form-data`: `title`, `content`, `image`) |
| `GET`    | `/feed/post/:postId`   | Get one post                                            |
| `PUT`    | `/feed/post/:postId`   | Update a post (author only)                             |
| `DELETE` | `/feed/post/:postId`   | Delete a post (author only)                             |
| `GET`    | `/images/:file`        | Uploaded images                                         |

**Socket.io:** the server emits on the `posts` channel with `{ action: 'create' | 'update' | 'delete', post }`.

Errors come back as `{ message, data }` with a matching HTTP status: `401`, `403`, `404`, `422` or `500`.

## Project structure

```text
nodejs-react-api-app/
├── backend/                 # Express REST API + Socket.io (port 8080)
│   ├── app.js               # App setup: body parsing, multer, CORS, routes, error handler
│   ├── socket.js            # Socket.io singleton (init / getIO)
│   ├── controllers/         # Request handlers (auth, feed)
│   ├── middleware/
│   │   └── is-auth.js       # JWT verification → req.userId
│   ├── models/              # Post / User classes backed by json-server via fetch
│   ├── routes/              # /auth and /feed routers with validation
│   └── images/              # Uploaded images (runtime, served at /images)
├── frontend/                # React 16 SPA, Create React App 2 (port 3000)
│   ├── public/
│   └── src/
│       ├── App.js           # Routing + auth state (login, signup, logout)
│       ├── pages/
│       │   ├── Auth/        # Login & Signup pages
│       │   └── Feed/        # Feed page (list, CRUD, sockets) + SinglePost
│       ├── components/      # UI components (Layout, Modal, Paginator, Form, ...)
│       └── util/            # Validators, image helpers
├── server/                  # json-server data store (port 3001)
│   └── db.json              # Persisted "users" and "posts" collections
└── README.md
```

## Available scripts

| Location    | Command          | What it does                                  |
| ----------- | ---------------- | --------------------------------------------- |
| `server/`   | `npm start`      | Runs json-server on `db.json` (port 3001)     |
| `backend/`  | `npm start`      | Runs `app.js` with nodemon (port 8080)        |
| `frontend/` | `npm start`      | Starts the CRA dev server (port 3000)         |
| `frontend/` | `npm run build`  | Production build to `frontend/build` (see [legacy toolchain](#legacy-frontend-toolchain-important)) |
| `frontend/` | `npm test`       | CRA test runner (the project has no tests yet) |

## Tech stack

- **Frontend:** React 16, React Router 4, socket.io-client, Create React App 2
- **Backend:** Node.js, Express 4, express-validator, multer, bcryptjs, jsonwebtoken, Socket.io 4, nodemon
- **Data:** json-server

## Known limitations

This is a learning project and is **not ready for production**:

- The JWT signing secret is written into the code as `'secret'`.
- CORS allows any origin.
- Service URLs are written into the code. Nothing reads them from environment variables.
- The user-status feature in the Feed page calls a placeholder URL, and the backend has no endpoint for it yet.

## License

Licensed under the **ISC** license, as declared in the backend's `package.json`.
