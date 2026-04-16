# Error Handling System Documentation

## Overview

The Gele Trekking project now includes a comprehensive error handling system for both client-side and server-side errors. This system provides consistent error UI, proper error logging, and user-friendly error messages.

## Error Pages

### 1. **Root Level Error Pages** (`/frontend/app/`)

#### `error.tsx` - Application Error Boundary
- **Purpose**: Catches unhandled errors throughout the application
- **Features**:
  - Generic error UI with retry button
  - User-friendly error messages
  - Development mode error details display
  - Error ID tracking for debugging

#### `global-error.tsx` - Critical System Errors
- **Purpose**: Catches critical errors at the root level that crash the application
- **Features**:
  - Minimal HTML structure (doesn't use App Layout)
  - Emergency fallback UI
  - Direct error logging
  - Contact support link

#### `not-found.tsx` - 404 Page Not Found
- **Purpose**: Handles requests to non-existent pages
- **Features**:
  - Friendly 404 display
  - Quick navigation links
  - Suggestions for user actions
  - Links to popular pages (About, Blog, FAQ, Guides)

### 2. **Route-Specific Error Pages**

#### `/destinations/error.tsx`
- Handles errors when loading trek destinations
- Specific message about unable to load destinations

#### `/blog/error.tsx`
- Handles errors when loading blog posts
- Contextual error messaging for blog section

#### `/guides/error.tsx`
- Handles errors when loading trekking guides
- Links back to planning section

#### `/trek/error.tsx`
- Handles errors when loading individual trek details
- Lets users know if trek was removed or ID is incorrect

#### `/admin/error.tsx`
- Handles errors in the admin panel
- Includes permission-related error messaging
- Suggests contacting administrator for permission issues

## Error Handling Utility

### Location
`frontend/lib/error-handler.ts`

### Key Functions

#### `parseApiError(error)`
Converts various error formats into a standardized `ApiError` object.

```typescript
const error = parseApiError(response.error)
// Returns: { status: 400, message: "...", code: "VALIDATION_ERROR", details: {...} }
```

#### `isAuthError(error)` | `isPermissionError(error)` | `isValidationError(error)` | `isNotFoundError(error)` | `isServerError(error)`
Check error type.

```typescript
if (isAuthError(error)) {
  // Handle auth error
}
```

#### `getUserFriendlyErrorMessage(error)`
Get a user-safe error message (no technical details).

```typescript
const message = getUserFriendlyErrorMessage(error)
// Returns appropriate message for user display
```

#### `fetchWithErrorHandling<T>(url, options)`
Drop-in replacement for `fetch()` with built-in error handling.

```typescript
const result = await fetchWithErrorHandling('/api/treks')
if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error.message)
}
```

#### `retryWithBackoff<T>(fn, maxRetries, initialDelayMs)`
Automatically retry failed requests with exponential backoff.

```typescript
const data = await retryWithBackoff(
  () => fetch('/api/treks').then(r => r.json()),
  3, // max retries
  1000 // initial delay in ms
)
```

#### `logError(error, context)`
Log errors for monitoring (prepared for integration with error tracking services).

```typescript
logError(apiError, { userId: 123, page: '/trek/ebc' })
```

## Usage Examples

### Example 1: Using in a Component

```typescript
'use client'

import { useState, useEffect } from 'react'
import { fetchWithErrorHandling, getUserFriendlyErrorMessage } from '@/lib/error-handler'

export function TrekList() {
  const [treks, setTreks] = useState([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTreks = async () => {
      const result = await fetchWithErrorHandling('/api/treks')
      
      if (result.success) {
        setTreks(result.data)
      } else {
        setError(getUserFriendlyErrorMessage(result.error))
      }
      
      setLoading(false)
    }

    loadTreks()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div>
      {treks.map(trek => (
        <div key={trek.id}>{trek.name}</div>
      ))}
    </div>
  )
}
```

### Example 2: Custom Error Boundary

```typescript
'use client'

import { PropsWithChildren, useEffect } from 'react'
import { logError, parseApiError } from '@/lib/error-handler'

export function ErrorBoundary({ children }: PropsWithChildren) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = parseApiError(event.error)
      logError(error, { type: 'uncaught' })
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return <>{children}</>
}
```

### Example 3: API Route with Error Handling

For backend routes that need consistent error responses:

```typescript
// app/api/treks/route.ts
import { parseApiError } from '@/lib/error-handler'

export async function GET() {
  try {
    const treks = await fetchTreks()
    return Response.json({ success: true, data: treks })
  } catch (error) {
    const apiError = parseApiError(error)
    return Response.json(
      { success: false, error: apiError },
      { status: apiError.status }
    )
  }
}
```

## Error Types & Status Codes

| Status | Type | Example | User Message |
|--------|------|---------|--------------|
| 400 | Validation | Invalid form input | "Please check your input and try again." |
| 401 | Authentication | Expired session | "Your session has expired. Please log in again." |
| 403 | Permission | Insufficient privileges | "You do not have permission to perform this action." |
| 404 | Not Found | Trek doesn't exist | "The requested resource could not be found." |
| 500+ | Server | Database error | "A server error occurred. Please try again later." |
| 0 | Network | No internet | "Network error. Please check your connection." |

## Development vs Production

### Development Mode
- Full error messages displayed in UI
- Error stack traces visible
- Console error logging enabled
- Error details in error boundaries

### Production Mode
- User-friendly messages only
- No technical details exposed
- Errors sent to monitoring service
- Minimal error information display

## Integration with Error Tracking Services

The `logError()` function is prepared for integration with services like Sentry or LogRocket:

```typescript
// In error-handler.ts, uncomment when ready:
// if (typeof window !== 'undefined' && window.errorTracker) {
//   window.errorTracker.captureException(error, { extra: context })
// }
```

To enable:
1. Install your error tracking service (e.g., `npm install @sentry/nextjs`)
2. Initialize it in your app
3. Uncomment the code above

## Best Practices

1. **Always use `getUserFriendlyErrorMessage()`** for displaying errors to users
2. **Use `fetchWithErrorHandling()`** instead of plain `fetch()` for API calls
3. **Log errors with context** - include relevant information like user ID, page, etc.
4. **Don't expose sensitive data** in error messages
5. **Test error scenarios** during development
6. **Monitor error trends** using your error tracking service
7. **Provide recovery options** (retry, go back, contact support) in error UI

## Adding New Error Pages

To add error handling for a new section:

1. Create `/app/[section]/error.tsx`
2. Import the error interface
3. Copy the pattern from existing error pages
4. Customize the message and links for your section

```typescript
// Example: /app/activities/error.tsx
'use client'

import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ActivitiesError({ error, reset }: ErrorProps) {
  return (
    // Your error UI here
  )
}
```

## Common Issues & Solutions

### Issue: Error page not showing
- **Solution**: Verify the error.tsx file is in the correct directory
- **Solution**: Check that it's a Client Component (`'use client'`)

### Issue: Error boundary not catching errors
- **Solution**: Error boundaries only catch rendering errors, not event handlers
- **Solution**: Use try-catch for event handlers and API calls

### Issue: Infinite error loops
- **Solution**: Don't throw errors in error.tsx
- **Solution**: Make sure reset() can actually fix the issue

## Files Created/Modified

- ✅ `/app/error.tsx` - Root error boundary
- ✅ `/app/global-error.tsx` - Critical error handler
- ✅ `/app/not-found.tsx` - 404 page
- ✅ `/app/destinations/error.tsx` - Destinations error
- ✅ `/app/blog/error.tsx` - Blog error
- ✅ `/app/guides/error.tsx` - Guides error
- ✅ `/app/trek/error.tsx` - Trek error
- ✅ `/app/admin/error.tsx` - Admin error
- ✅ `/lib/error-handler.ts` - Error utility functions
- ✅ `/lib/plan-your-trip-data.ts` - Removed TIMS Card guide
