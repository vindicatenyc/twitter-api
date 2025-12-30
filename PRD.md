# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Product Overview

### Purpose
A lightweight, standalone REST API service for posting tweets and tweet threads to Twitter. Designed to be simple, reusable, and independent of any specific client application.

### Goals
1. Provide a clean HTTP API for Twitter posting operations
2. Support both single tweets and automatic thread creation
3. Enable character limit flexibility for Twitter Blue users
4. Maintain zero dependencies on ElizaOS or other frameworks
5. Be deployable as a standalone service to any Node.js hosting platform

### Non-Goals
- AI-powered tweet generation (handled by clients)
- Tweet scheduling or queuing
- Analytics or engagement tracking
- Multi-account management
- Twitter reading operations (timeline, mentions, DMs)

## Target Users

**Primary:** Developers building applications that need to post to Twitter
- Auto-Claude (CodeJourney feature)
- CLI tools
- Automation scripts
- Webhooks and integrations

**Secondary:** Individual users with Twitter API credentials who want a simple posting interface

## Functional Requirements

### FR-1: Single Tweet Posting
**Priority:** P0 (Must Have)

**Description:** Post a single tweet to Twitter with character validation

**Acceptance Criteria:**
- Accepts tweet text as input
- Validates length against configurable character limit (default: 280)
- Returns tweet ID and URL upon success
- Throws clear error if tweet exceeds limit without override
- Allows override for Twitter Blue users (up to 25,000 characters)

**API Endpoint:**
```
POST /api/tweets/post
Body: { tweetText: string, maxLength?: number }
Response: { tweetId, tweetUrl, postedAt }
```

### FR-2: Tweet Thread Posting
**Priority:** P0 (Must Have)

**Description:** Automatically break long text into a tweet thread

**Acceptance Criteria:**
- Splits text at word boundaries (no mid-word breaks)
- Posts first tweet with optional thread icon (🧵)
- Posts subsequent tweets as replies with "(cont.) " prefix
- Maintains thread structure (each tweet replies to previous)
- Returns array of all tweets with IDs and URLs
- Respects character limit per tweet

**API Endpoint:**
```
POST /api/tweets/thread
Body: { tweetText: string, maxLength?: number, includeThreadIcon?: boolean }
Response: { threadId, threadUrl, tweets[], tweetCount, postedAt }
```

**Algorithm Details:**
- First tweet: Reserve 3 characters for "🧵 " if `includeThreadIcon: true`
- Subsequent tweets: Reserve 8 characters for "(cont.) "
- Split at last space before character limit
- If no space found, hard-break at limit

### FR-3: Twitter Connection Status
**Priority:** P0 (Must Have)

**Description:** Check if Twitter API credentials are valid and service is authenticated

**Acceptance Criteria:**
- Verifies Twitter API credentials on service startup
- Returns connection status and authenticated username
- Provides endpoint for clients to check status
- Updates status if credentials change or authentication fails

**API Endpoint:**
```
GET /api/status/twitter
Response: { connected: boolean, authenticated: boolean, username?: string, userId?: string }
```

### FR-4: Health Check
**Priority:** P0 (Must Have)

**Description:** Public endpoint for monitoring service health

**Acceptance Criteria:**
- Returns 200 OK when service is running
- Does not require authentication
- Includes uptime and timestamp
- Includes Twitter connection status

**API Endpoint:**
```
GET /health
Response: { status: "healthy", uptime: number, timestamp: string, twitter: { connected: boolean } }
```

### FR-5: API Key Authentication
**Priority:** P1 (Should Have)

**Description:** Protect API endpoints with API key authentication

**Acceptance Criteria:**
- All `/api/*` endpoints require `X-API-Key` header
- Returns 401 if API key missing or invalid
- API key configurable via environment variable
- `/health` endpoint remains public (no auth required)

## Non-Functional Requirements

### NFR-1: Performance
- Single tweet post: < 2 seconds (p95)
- Thread post: < 5 seconds for 10-tweet thread (p95)
- Connection check: < 500ms (p95)

### NFR-2: Reliability
- 99% uptime for API endpoints
- Graceful error handling for Twitter API failures
- Clear error messages with error codes

### NFR-3: Security
- API key authentication for all protected endpoints
- Helmet.js security headers
- Input validation with Zod schemas
- No logging of sensitive credentials

### NFR-4: Scalability
- Stateless service (can run multiple instances)
- No in-memory state between requests
- Thread-safe operations

### NFR-5: Maintainability
- TypeScript with strict mode
- < 500 lines per file
- 100% typed (no `any` types)
- Comprehensive JSDoc comments

### NFR-6: Deployability
- Works with any Node.js hosting (Vercel, Railway, Docker, VPS)
- Single environment variable configuration
- < 50MB bundle size
- < 5 second cold start

## API Specification

### Authentication
All `/api/*` endpoints require API key authentication:

**Header:**
```
X-API-Key: <your-api-key>
```

**Responses:**
- 401 Unauthorized: Missing or invalid API key
- 403 Forbidden: Valid key but insufficient permissions (future)

### Response Format
All responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Endpoint-specific data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Optional additional information"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body or parameters |
| `TWEET_TOO_LONG` | 400 | Tweet exceeds character limit without override |
| `TWITTER_AUTH_FAILED` | 401 | Twitter API credentials invalid |
| `API_KEY_REQUIRED` | 401 | Missing X-API-Key header |
| `API_KEY_INVALID` | 401 | Invalid X-API-Key value |
| `POST_FAILED` | 500 | Failed to post single tweet |
| `THREAD_POST_FAILED` | 500 | Failed to post tweet thread |
| `TWITTER_API_ERROR` | 502 | Twitter API returned an error |
| `SERVICE_UNAVAILABLE` | 503 | Service not ready or shutting down |

## Technical Architecture

### Tech Stack
- **Runtime:** Node.js 18+ (Bun for development)
- **Language:** TypeScript 5.3+
- **Framework:** Express.js 4.19+
- **Twitter Client:** twitter-api-v2 1.17+
- **Validation:** Zod 3.22+
- **Security:** helmet 7.1+, cors 2.8+
- **Logging:** winston 3.11+

### Dependencies
**Production:**
- express
- cors
- helmet
- dotenv
- winston
- twitter-api-v2
- zod

**Development:**
- typescript
- @types/node
- @types/express
- @types/cors
- ts-node
- nodemon

### Project Structure
```
/Users/davidr/dev/personal/biz/eliza-twitter-api/
├── src/
│   ├── index.ts              # Express server entry
│   ├── services/
│   │   └── twitter.service.ts
│   ├── routes/
│   │   ├── tweets.ts
│   │   └── status.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── error.ts
│   │   └── validation.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── logger.ts
│       └── response.ts
├── dist/                     # Compiled output
├── .env.example
├── .env                      # Gitignored
├── package.json
├── tsconfig.json
├── .gitignore
├── PRD.md                    # This document
├── TASKS.md                  # Implementation task list
└── README.md                 # Usage documentation
```

### Environment Variables
```bash
# Server
PORT=3001
NODE_ENV=development
API_KEY=<generate-secure-random-key>

# Twitter API
TWITTER_API_KEY=<from-developer-portal>
TWITTER_API_SECRET=<from-developer-portal>
TWITTER_ACCESS_TOKEN=<from-developer-portal>
TWITTER_ACCESS_TOKEN_SECRET=<from-developer-portal>
```

## Success Metrics

### Launch Criteria
- [ ] All P0 functional requirements implemented
- [ ] All API endpoints returning 2xx for valid requests
- [ ] Character limit validation working correctly
- [ ] Thread breaking algorithm splits at word boundaries
- [ ] Thread icon appears on first tweet when enabled
- [ ] API key authentication protecting all `/api/*` endpoints
- [ ] Health endpoint accessible without authentication
- [ ] TypeScript compilation with no errors
- [ ] Can deploy to Vercel/Railway successfully
- [ ] README documentation complete

### Performance Benchmarks
- Single tweet post < 2s (p95)
- 10-tweet thread < 5s (p95)
- Connection check < 500ms (p95)
- Cold start < 5s

## Future Enhancements (Out of Scope for V1)

### V2 Potential Features
- Tweet scheduling (queue system)
- Multi-account support
- Tweet deletion endpoint
- Media upload support (images, videos)
- Poll creation
- Quote tweets and retweets
- Analytics integration

### V3 Potential Features
- Rate limiting per API key
- Webhook notifications for posted tweets
- Twitter Spaces integration
- Advanced thread formatting (numbered tweets, custom prefixes)
