---
name: inter-service-communication
description: Standards for service-to-service authentication and API calls. Use when creating new services, adding API routes, implementing auth middleware, or calling other microservices.
---

# Inter-Service Communication Standards

## Authentication Header

All services use the `X-API-Key` header for authentication.

```typescript
// Correct
headers: { 'X-API-Key': process.env.TARGET_SERVICE_API_KEY }

// DEPRECATED - Do NOT use
headers: { 'X-Service-Secret': ... }  // Old pattern, not supported
```

## Environment Variable Naming

API keys follow the pattern `{SERVICE_NAME}_API_KEY`:

| Service | Env Variable |
|---------|-------------|
| brand-service | `BRAND_SERVICE_API_KEY` |
| campaign-service | `CAMPAIGN_SERVICE_API_KEY` |
| api-service | `API_SERVICE_API_KEY` |
| emailgeneration-service | `EMAILGENERATION_SERVICE_API_KEY` |
| keys-service | `KEYS_SERVICE_API_KEY` |
| scraping-service | `SCRAPING_SERVICE_API_KEY` |
| postmark-service | `POSTMARK_SERVICE_API_KEY` |

Legacy: `API_KEY` may still work for backward compatibility but prefer the explicit naming.

## Auth Middleware Pattern

Every service should have a single `combinedAuth` middleware:

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';

export function combinedAuth(req: Request, res: Response, next: NextFunction) {
  // Skip health checks
  if (req.path === '/health' || req.path === '/') {
    return next();
  }

  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.MY_SERVICE_API_KEY;  // Replace with your service name
  const legacyApiKey = process.env.API_KEY;  // Optional legacy support

  if (!apiKey) {
    return res.status(401).json({ 
      error: 'Missing authentication',
      message: 'Please provide X-API-Key header' 
    });
  }

  if (validApiKey && apiKey === validApiKey) {
    return next();
  }

  if (legacyApiKey && apiKey === legacyApiKey) {
    return next();
  }

  return res.status(403).json({ error: 'Invalid credentials' });
}
```

Apply globally in `index.ts`:

```typescript
import { combinedAuth } from './middleware/auth';

app.use(combinedAuth);
```

## Service Client Pattern

When calling another service:

```typescript
// src/lib/service-client.ts
async function callService<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = process.env.TARGET_SERVICE_API_KEY;
  
  if (!apiKey) {
    throw new Error('TARGET_SERVICE_API_KEY not configured');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Service call failed: ${response.status} - ${error}`);
  }

  return response.json();
}
```

## CORS Configuration

Allow the `X-API-Key` header in CORS:

```typescript
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));
```

## Checklist for New Services

- [ ] Create `src/middleware/auth.ts` with `combinedAuth`
- [ ] Apply middleware globally: `app.use(combinedAuth)`
- [ ] Skip auth for `/health` and `/` endpoints
- [ ] Add `{SERVICE_NAME}_API_KEY` to `.env.example`
- [ ] Configure the API key in Railway environment variables
- [ ] Update calling services with the new `{SERVICE_NAME}_API_KEY`
