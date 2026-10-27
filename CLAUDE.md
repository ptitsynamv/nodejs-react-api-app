# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is a plain JavaScript Node/Express + React (class components) project — the global Angular/NgRx rules in `~/.claude` do not apply here.

## Commands

Target Node v20.11.0 / npm v10.2.4. Three independent packages, each with its own `package.json` — run `npm i` and `npm start` inside each directory. All three must be running for the app to work.

| Dir | `npm start` | Port |
|---|---|---|
| `server/` | `json-server db.json` (the "database") | 3001 |
| `backend/` | `nodemon app.js` (REST API + socket.io) | 8080 |
| `frontend/` | CRA dev server (`--openssl-legacy-provider`, needed for react-scripts 2 on Node 20) | 3000 |

- Frontend build: `cd frontend && npm run build`
- There are no tests in `backend/` or `server/`; `frontend` has the CRA `npm test` runner but no test files. No lint script beyond CRA's built-in `react-app` ESLint config; formatting is Prettier (VS Code format-on-save).

## Architecture

Three-tier chain: **React (3000) → Express API (8080) → json-server (3001) → `server/db.json`**.

- **No real database.** `backend/models/post.js` and `backend/models/user.js` are classes whose `save`/`update`/`findById`/`fetchAll`/`delete` methods call json-server over HTTP using Node's global `fetch` (hardcoded `http://localhost:3001`). `server/db.json` holds `posts` and `users` and is mutated at runtime by json-server — it's the persisted data, so expect it to change when exercising the app.
- Relationships are maintained by hand: a post's `creator` is a user id, and `user.posts` is an array of post ids. Create/delete handlers in `backend/controllers/feed.js` update both sides. `getPosts` joins posts with users in memory, sorts by `createdAt` desc, and paginates in memory (`ITEMS_PER_PAGE = 10`).
- **Auth:** `PUT /auth/signup` (express-validator + bcryptjs), `POST /auth/login` returns a JWT (secret hardcoded as `'secret'`, 1h expiry). `backend/middleware/is-auth.js` reads `Authorization: Bearer <token>` and sets `req.userId`; all `/feed` routes use it. Update/delete check `post.creator === req.userId` (403 otherwise). The frontend stores `token`, `userId`, `expiryDate` in `localStorage` (`frontend/src/App.js`).
- **Uploads:** multer is applied globally in `backend/app.js` (`.single('image')`, png/jpg/jpeg only) and writes to `backend/images/` (directory must exist). Images are served statically at `/images`; the stored `imageUrl` is the relative path (e.g. `images/foo-123.png`), and the frontend prefixes it with `http://localhost:8080/`. Replaced/deleted posts' files are removed via `clearImage`.
- **Errors:** controllers throw (sync) or `next(err)` (async) an `Error` with `statusCode` and optional `data`; the final error middleware in `app.js` responds `{ message, data }`. Follow this pattern — validation failures use 422.
- **Realtime:** `backend/socket.js` is a singleton (`init(server)` in `app.js`, `getIO()` elsewhere). Feed controllers emit on the `posts` channel with `{ action: 'create' | 'update' | 'delete', post }`; `frontend/src/pages/Feed/Feed.js` subscribes via `socket.io-client` and patches its state.
- **Frontend:** React 16 class components with react-router-dom v4. `App.js` owns auth state and login/signup requests; `pages/Feed/Feed.js` owns post list/CRUD; presentational pieces live in `src/components/`. All API URLs are hardcoded to `http://localhost:8080` (no env config). The user-status calls in `Feed.js` still use a placeholder `fetch('URL')` — there is no status endpoint on the backend yet.
- Backend code mixes promise chains and `async/await` (recent commits are migrating toward `async/await`).
