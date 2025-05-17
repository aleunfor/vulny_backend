# 🛠️ Vulny | Node.js API with Clerk, Express, Mongoose

A modern Node.js backend for Midudev's hackaton, using:

- 🌐 [Express](https://expressjs.com/) — for building APIs
- 🔐 [Clerk](https://clerk.com/) — for user authentication
- 🧵 [Mongoose](https://mongoosejs.com/) — for MongoDB ODM
- 🌍 [CORS](https://www.npmjs.com/package/cors) — to handle cross-origin requests
- 🔐 [dotenv](https://www.npmjs.com/package/dotenv) — to manage environment variables

---

## 📦 Commands

All commands on root of project:

| Command         | Action                        |
| :-------------- | :---------------------------- |
| `npm install`   | Install Dependencies          |
| `npm run dev`   | Inits server `localhost:3000` |
| `npm run build` | Builds app on `./dist/`       |

## 🌲 .env

- MONGO_URI_LOCAL=mongodb://user:pass@localhost:27017/vulnydb?authSource=admin
- MONGO_URI_PROD=mongodb://user:pass@localhost:27017/vulnydb?authSource=admin
- CLERK_PUBLISHABLE_KEY=pk_test_12345 (Local/Dev purposes)
- CLERK_SECRET_KEY=sk_test_12345

## 🎬 Functions

- **Executes DAST Scan**
- **Save and Get Vulnerabilities**
- **Save and Get Scans**

## 👱 Team

Vulny it's being developed only by @unforale.
