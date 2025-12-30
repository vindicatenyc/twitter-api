# IMPLEMENTATION TASK LIST

## Phase 1: Project Setup (1 hour) - ✅ 90% COMPLETE

### Task 1.1: Initialize Node.js Project - ✅ COMPLETE
- [x] Create directory `/Users/davidr/dev/personal/biz/eliza-twitter-api`
- [x] Run `npm init -y`
- [x] Update package.json with project metadata
  - name: "twitter-api"
  - version: "1.0.0"
  - description: "Standalone REST API for posting tweets to Twitter"
  - author: Your name
  - license: "MIT"

### Task 1.2: Install Dependencies - ⚠️ PARTIAL (missing winston, twitter-api-v2, zod)
- [ ] Install production dependencies:
  ```bash
  npm install express cors helmet dotenv winston twitter-api-v2 zod
  ```
  - [x] express, cors, helmet, dotenv installed
  - [ ] winston, twitter-api-v2, zod still needed
- [x] Install dev dependencies:
  ```bash
  npm install -D typescript @types/node @types/express @types/cors ts-node nodemon
  ```
  - Note: Using ts-node-dev instead of ts-node + nodemon (better hot-reload)

### Task 1.3: Configure TypeScript - ✅ COMPLETE
- [x] Create `tsconfig.json`:
  - target: ES2020 (slightly different but valid)
  - module: commonjs
  - outDir: ./dist
  - rootDir: ./src
  - strict: true
  - esModuleInterop: true

### Task 1.4: Create Project Structure - ✅ COMPLETE
- [x] Create `src/` directory
- [x] Create `src/services/` directory
- [x] Create `src/routes/` directory
- [x] Create `src/middleware/` directory
- [x] Create `src/types/` directory
- [x] Create `src/utils/` directory

### Task 1.5: Create Configuration Files - ✅ COMPLETE
- [x] Create `.env.example` with template variables
- [x] Create `.env` (add to .gitignore)
- [x] Create `.gitignore`:
  - node_modules/
  - dist/
  - .env
  - *.log
  - firebase-debug.log
  - *.code-workspace

### Task 1.6: Add NPM Scripts - ✅ COMPLETE
- [x] Add script: `"dev": "ts-node-dev --respawn src/index.ts"` (better than nodemon)
- [x] Add script: `"build": "tsc"`
- [x] Add script: `"start": "node dist/index.js"`
- [x] Add script: `"typecheck": "tsc --noEmit"`

## Phase 2: Twitter Service Implementation (2-3 hours)

### Task 2.1: Define TypeScript Types
**File:** `src/types/index.ts`
- [ ] Define `TweetResult` interface
  - tweetId: string
  - url: string
- [ ] Define `ThreadResult` interface
  - threadId: string
  - threadUrl: string
  - tweets: TweetInThread[]
  - tweetCount: number
- [ ] Define `TweetInThread` interface
  - tweetId, tweetUrl, text, position, replyToId?

### Task 2.2: Implement Twitter Service Core
**File:** `src/services/twitter.service.ts`
- [ ] Import TwitterApi from twitter-api-v2
- [ ] Create TwitterService class
- [ ] Add private fields: client, isAuthenticated, username
- [ ] Implement constructor (initialize Twitter client from env vars)

### Task 2.3: Implement Authentication
**File:** `src/services/twitter.service.ts`
- [ ] Implement `initialize()` method
  - Call `client.v2.me()` to get user info
  - Set `isAuthenticated = true`
  - Set `username` from response
  - Handle errors gracefully
- [ ] Implement `isConnected()` getter
  - Return `isAuthenticated` value
- [ ] Implement `getUsername()` getter
  - Return `username` value

### Task 2.4: Implement Character Validation
**File:** `src/services/twitter.service.ts`
- [ ] Implement `validateTweetLength(text, maxLength)` method
  - Check if `text.length > maxLength`
  - Throw error with helpful message if too long
  - Mention Twitter Blue override in error message

### Task 2.5: Implement Single Tweet Posting
**File:** `src/services/twitter.service.ts`
- [ ] Implement `postTweet(text, maxLength)` method
  - Call `validateTweetLength()`
  - Post tweet using `client.v2.tweet(text)`
  - Return `{ tweetId, url }` object
  - Handle Twitter API errors

### Task 2.6: Implement Thread Breaking Algorithm
**File:** `src/services/twitter.service.ts`
- [ ] Implement `breakIntoChunks(text, maxLength, includeThreadIcon)` private method
  - Calculate first tweet length (reserve 3 chars for 🧵 if enabled)
  - If text fits in one tweet, return single chunk with optional icon
  - Otherwise, split at word boundaries:
    - Find last space before maxLength
    - If no space, hard-break at maxLength
  - For subsequent chunks, reserve 8 chars for "(cont.) " prefix
  - Return array of chunks

### Task 2.7: Implement Thread Posting
**File:** `src/services/twitter.service.ts`
- [ ] Implement `postThread(text, maxLength, includeThreadIcon)` method
  - Call `breakIntoChunks()` to split text
  - Loop through chunks:
    - Post first tweet normally (with optional 🧵)
    - Post subsequent tweets as replies to previous
    - Track replyToId for threading
  - Return `ThreadResult` with all tweet info

## Phase 3: Express Routes (1-2 hours)

### Task 3.1: Create Response Utilities
**File:** `src/utils/response.ts`
- [ ] Implement `sendSuccess(res, data, statusCode?)` helper
  - Return `{ success: true, data }`
  - Default statusCode: 200
- [ ] Implement `sendError(res, code, message, statusCode?)` helper
  - Return `{ success: false, error: { code, message } }`
  - Default statusCode: 500

### Task 3.2: Create Tweet Routes
**File:** `src/routes/tweets.ts`
- [ ] Import Router from express
- [ ] Import TwitterService
- [ ] Import Zod for validation
- [ ] Create router instance
- [ ] Create singleton TwitterService instance

### Task 3.3: Implement POST /api/tweets/post
**File:** `src/routes/tweets.ts`
- [ ] Define Zod schema `PostTweetSchema`
  - tweetText: string, min 1
  - maxLength: number, min 1, max 25000, optional, default 280
- [ ] Implement route handler:
  - Validate request body with Zod
  - Call `twitterService.postTweet()`
  - Return success response with 201 status
  - Handle validation errors (400)
  - Handle tweet-too-long errors (400)
  - Handle other errors (500)

### Task 3.4: Implement POST /api/tweets/thread
**File:** `src/routes/tweets.ts`
- [ ] Define Zod schema `PostThreadSchema`
  - tweetText: string, min 1
  - maxLength: number, min 1, max 25000, optional, default 280
  - includeThreadIcon: boolean, optional, default true
- [ ] Implement route handler:
  - Validate request body with Zod
  - Call `twitterService.postThread()`
  - Return success response with 201 status
  - Handle validation errors (400)
  - Handle other errors (500)

### Task 3.5: Create Status Routes
**File:** `src/routes/status.ts`
- [ ] Import Router from express
- [ ] Import TwitterService
- [ ] Create router instance
- [ ] Create singleton TwitterService instance

### Task 3.6: Implement GET /api/status/twitter
**File:** `src/routes/status.ts`
- [ ] Implement route handler:
  - Call `twitterService.isConnected()`
  - Call `twitterService.getUsername()`
  - Return `{ connected, authenticated, username }`
  - Use `sendSuccess()` helper

## Phase 4: Express Server Setup (1 hour)

### Task 4.1: Create Authentication Middleware
**File:** `src/middleware/auth.ts`
- [ ] Import express types
- [ ] Implement `authMiddleware` function:
  - Get API key from environment
  - Check `X-API-Key` header
  - Return 401 if missing or invalid
  - Call next() if valid

### Task 4.2: Create Error Middleware
**File:** `src/middleware/error.ts`
- [ ] Implement `errorHandler` middleware:
  - Log error with winston
  - Return standardized error response
  - Include stack trace only in development

### Task 4.3: Create Logger Utility
**File:** `src/utils/logger.ts`
- [ ] Configure winston logger:
  - Console transport for development
  - File transport for production
  - Log level from environment (default: info)

### Task 4.4: Create Express Server
**File:** `src/index.ts`
- [ ] Import express, cors, helmet, dotenv
- [ ] Import routes and middleware
- [ ] Call `dotenv.config()`
- [ ] Create Express app
- [ ] Apply middleware stack:
  - helmet() for security headers
  - cors() for CORS
  - express.json() for JSON parsing

### Task 4.5: Register Routes
**File:** `src/index.ts`
- [ ] Register public routes:
  - GET /health (no auth)
- [ ] Apply auth middleware to `/api`
- [ ] Register protected routes:
  - /api/tweets (tweets router)
  - /api/status (status router)
- [ ] Apply error handler middleware

### Task 4.6: Implement Health Endpoint
**File:** `src/index.ts`
- [ ] Create GET /health handler:
  - Return `{ status: "healthy", uptime: process.uptime(), timestamp }`
  - Use `sendSuccess()` helper

### Task 4.7: Start Server
**File:** `src/index.ts`
- [ ] Get PORT from environment (default: 3001)
- [ ] Call `app.listen(PORT)`
- [ ] Log startup message with port

## Phase 5: Auto-Claude Integration (2 hours)

### Task 5.1: Update CodeJourneyService
**File:** `/Auto-Claude/apps/frontend/src/main/code-journey-service.ts`
- [ ] Remove IPC-related imports and code
- [ ] Import axios
- [ ] Create axios client in constructor:
  - baseURL from environment
  - timeout: 30000
  - headers: X-API-Key

### Task 5.2: Implement HTTP Client Methods
**File:** `/Auto-Claude/apps/frontend/src/main/code-journey-service.ts`
- [ ] Implement `initialize()`:
  - Call GET /health to verify service is up
  - Log success message
- [ ] Implement `postTweet(tweetId, maxLength)`:
  - Get tweet from local store
  - Call POST /api/tweets/post
  - Return tweet ID and URL from response
- [ ] Implement `postTweetThread(tweetId, maxLength, includeThreadIcon)`:
  - Get tweet from local store
  - Call POST /api/tweets/thread
  - Return thread ID, URL, and count from response
- [ ] Implement `checkTwitterConnection()`:
  - Call GET /api/status/twitter
  - Return connection status and username

### Task 5.3: Remove IPC Code
**File:** `/Auto-Claude/apps/frontend/src/main/code-journey-service.ts`
- [ ] Delete `startAgentProcess()` method
- [ ] Delete `sendIPCRequest()` method
- [ ] Delete `handleIPCMessage()` method
- [ ] Delete all IPC-related fields (agentProcess, pendingRequests, etc.)

### Task 5.4: Update Main Process
**File:** `/Auto-Claude/apps/frontend/src/main/index.ts`
- [ ] Remove ElizaOS agent process spawning code
- [ ] Remove IPC setup code
- [ ] Keep CodeJourneyService initialization (now uses HTTP)

### Task 5.5: Add Environment Variables
**File:** `/Auto-Claude/apps/frontend/.env`
- [ ] Add `TWITTER_API_URL=http://localhost:3001`
- [ ] Add `TWITTER_API_KEY=<generate-same-key-as-service>`

## Phase 6: Configuration & Documentation (30 minutes)

### Task 6.1: Create Environment Template
**File:** `/Users/davidr/dev/personal/biz/eliza-twitter-api/.env.example`
- [ ] Add all required environment variables with placeholders
- [ ] Add comments explaining each variable

### Task 6.2: Create README
**File:** `/Users/davidr/dev/personal/biz/eliza-twitter-api/README.md`
- [ ] Add project description
- [ ] Add installation instructions
- [ ] Add configuration instructions
- [ ] Add usage examples with curl commands
- [ ] Add API endpoint documentation
- [ ] Add deployment instructions

### Task 6.3: Create PRD
**File:** `/Users/davidr/dev/personal/biz/eliza-twitter-api/PRD.md`
- [x] Copy this PRD section from plan

### Task 6.4: Create Task List
**File:** `/Users/davidr/dev/personal/biz/eliza-twitter-api/TASKS.md`
- [x] Copy this task list from plan

## Phase 7: Testing (1-2 hours)

### Task 7.1: Manual Testing - Twitter Service
- [ ] Start service with `npm run dev`
- [ ] Verify service starts on port 3001
- [ ] Check console for startup logs

### Task 7.2: Manual Testing - Health Endpoint
- [ ] `curl http://localhost:3001/health`
- [ ] Verify returns 200 OK
- [ ] Verify response has status, uptime, timestamp

### Task 7.3: Manual Testing - Authentication
- [ ] `curl http://localhost:3001/api/status/twitter` (no API key)
- [ ] Verify returns 401 Unauthorized
- [ ] Repeat with X-API-Key header
- [ ] Verify returns 200 OK with connection status

### Task 7.4: Manual Testing - Single Tweet
- [ ] `curl -X POST http://localhost:3001/api/tweets/post` with valid tweet
- [ ] Verify returns 201 Created
- [ ] Verify tweet appears on Twitter
- [ ] Test with tweet > 280 chars (no override)
- [ ] Verify returns 400 with TWEET_TOO_LONG error
- [ ] Test with tweet > 280 chars + maxLength override
- [ ] Verify returns 201 and posts successfully

### Task 7.5: Manual Testing - Tweet Thread
- [ ] `curl -X POST http://localhost:3001/api/tweets/thread` with long text
- [ ] Verify returns 201 Created
- [ ] Verify thread appears on Twitter with 🧵 icon
- [ ] Verify subsequent tweets have "(cont.) " prefix
- [ ] Verify tweets are threaded correctly
- [ ] Test with `includeThreadIcon: false`
- [ ] Verify first tweet has no 🧵

### Task 7.6: Manual Testing - Auto-Claude Integration
- [ ] Start Twitter API service
- [ ] Start Auto-Claude
- [ ] Navigate to CodeJourney tab
- [ ] Verify connection status shows connected
- [ ] Create a draft tweet in Auto-Claude
- [ ] Click "Post Tweet"
- [ ] Verify tweet posts to Twitter
- [ ] Create a long draft tweet
- [ ] Click "Post Thread"
- [ ] Verify thread posts correctly

### Task 7.7: Error Testing
- [ ] Test with invalid Twitter credentials
- [ ] Test with missing API key
- [ ] Test with invalid API key
- [ ] Test with malformed JSON
- [ ] Test with empty tweet text
- [ ] Verify all errors return proper error codes and messages

## Completion Checklist

### Code Quality
- [ ] All TypeScript files compile without errors
- [ ] No `any` types used
- [ ] All functions have JSDoc comments
- [ ] No linter warnings

### Documentation
- [ ] README.md complete with examples
- [x] PRD.md created and reviewed
- [x] TASKS.md created (this file)
- [ ] .env.example has all required variables

### Testing
- [ ] All manual test cases passing
- [ ] Can post single tweet successfully
- [ ] Can post tweet thread successfully
- [ ] Thread breaking works at word boundaries
- [ ] Thread icon appears correctly
- [ ] Character limit validation works
- [ ] API key authentication works
- [ ] Health endpoint accessible
- [ ] Auto-Claude integration works

### Deployment
- [ ] Can build with `npm run build`
- [ ] Can start production server with `npm start`
- [ ] All environment variables documented
- [ ] Service works independently (no Auto-Claude required)
