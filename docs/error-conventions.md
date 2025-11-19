# Error Handling Conventions

Comprehensive error handling strategy for predictable, reliable error management across all layers of the application.

## 🎯 Error Handling Philosophy

### Core Principles

1. **Never Lose Error Context**: Always wrap errors, don't replace them
2. **Structured Error Format**: Consistent error structure across all layers
3. **Layered Responsibility**: Each layer handles specific error types
4. **User-Friendly Messages**: Technical errors get translated to user-friendly messages
5. **Recovery Information**: Mark retryable vs non-retryable operations
6. **Debugging Support**: Request IDs, timestamps, and stack traces for development

## 🏗️ Error Architecture Layers

```
┌─────────────────────────────────────┐
│ React Components (UI Layer)         │ ← User-facing error display
├─────────────────────────────────────┤
│ React Query Hooks (Data Layer)      │ ← Data fetching errors
├─────────────────────────────────────┤
│ Server Actions (Business Layer)     │ ← Business logic errors
├─────────────────────────────────────┤
│ Database/API (Infrastructure)       │ ← Raw system errors
└─────────────────────────────────────┘
```

## 📋 Error Types & Classification

### Error Categories

```typescript
// Standardized error types
- NetworkError: API failures, connection issues, timeouts
- ValidationError: Form validation, schema mismatches, constraint violations
- AuthorizationError: Permission denied, auth failures, session expired
- BusinessLogicError: Domain-specific violations (insufficient funds, duplicate resources)
- DatabaseError: Constraint violations, query failures, connection issues
- SystemError: Unexpected server errors, infrastructure issues
- ExternalServiceError: Third-party API failures (Stripe, SendGrid, etc.)
```

### Error Severity Levels

- **Critical**: System-wide failures, auth failures, payment failures
- **High**: Database errors, external service failures
- **Medium**: Validation errors, network timeouts
- **Low**: UI-only errors, non-blocking issues

## 🔧 Error Structure Standards

### Base Error Format

```typescript
{
  code: 'ERROR_TYPE',           // Machine-readable code
  message: 'Human readable',    // User-friendly message
  details: {},                  // Additional context for debugging
  timestamp: 'ISO string',      // When error occurred
  requestId: 'uuid',           // For tracing
  retryable: boolean,          // Can user retry this operation?
  severity: 'critical|high|medium|low'
}
```

### Error Classes

```typescript
// Base error class
export abstract class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public details: any = {},
    public timestamp: string = new Date().toISOString(),
    public requestId: string = generateRequestId(),
    public retryable: boolean = false,
    public severity: 'critical' | 'high' | 'medium' | 'low' = 'medium'
  ) {
    super(message)
    this.name = this.constructor.name
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
  
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      requestId: this.requestId,
      retryable: this.retryable,
      severity: this.severity,
      stack: this.stack
    }
  }
}

// Specific error implementations
export class DatabaseError extends AppError {
  constructor(code: string, details: any) {
    super(`DB_${code}`, `Database operation failed: ${code}`, details, undefined, undefined, false, 'high')
  }
}

export class ValidationError extends AppError {
  constructor(field: string, value: any, constraint: string) {
    super('VALIDATION_ERROR', `${field} is invalid`, {
      field,
      value,
      constraint
    }, undefined, undefined, false, 'medium')
  }
}

export class NetworkError extends AppError {
  constructor(message: string, statusCode?: number, retryable: boolean = true) {
    super('NETWORK_ERROR', message, { statusCode }, undefined, undefined, retryable, 'medium')
  }
}

export class AuthorizationError extends AppError {
  constructor(code: string, message: string = 'Access denied') {
    super(`AUTH_${code}`, message, undefined, undefined, undefined, false, 'critical')
  }
}

export class BusinessLogicError extends AppError {
  constructor(code: string, message: string, details: any = {}) {
    super(`BIZ_${code}`, message, details, undefined, undefined, false, 'high')
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, code: string, message: string, retryable: boolean = true) {
    super(`EXTERNAL_${service}_${code}`, `${service} error: ${message}`, {
      service,
      originalCode: code
    }, undefined, undefined, retryable, 'high')
  }

export class SystemError extends AppError {
  constructor(code: string, message: string, details: any = {}) {
    super(`SYS_${code}`, message, details, undefined, undefined, false, 'critical')
  }
}
```

## 🎯 Try/Catch Patterns by Layer

### Server Actions Layer

```typescript
export const complexAction = authAction(schema, async (data, ctx) => {
  try {
    // Step 1: Database operation
    const { data: result, error } = await supabase
      .from('users')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      throw new DatabaseError('USER_CREATION_FAILED', {
        operation: 'insert',
        table: 'users',
        originalError: error
      })
    }

    // Step 2: External API call
    const payment = await stripe.paymentIntents.create({
      amount: data.amount * 100,
      currency: 'usd',
      customer: data.customerId
    })

    if (payment.error) {
      throw new ExternalServiceError(
        'STRIPE',
        payment.error.code,
        payment.error.message,
        payment.error.code === 'rate_limit_exceeded'
      )
    }

    return { success: true, paymentId: payment.id }

  } catch (error) {
    // Preserve and enhance error information
    if (error instanceof AppError) {
      // Already structured error, just add more context
      error.details.actionContext = {
        action: 'complexAction',
        userId: ctx.authUser?.id,
        timestamp: new Date().toISOString()
      }
      throw error
    } else if (error instanceof stripe.errors.StripeError) {
      // Convert external service error
      throw new ExternalServiceError(
        'STRIPE',
        error.code,
        error.message,
        error.code === 'rate_limit_exceeded'
      )
    } else if (error instanceof Error) {
      // Convert plain Error to SystemError
      throw new SystemError('UNEXPECTED_ERROR', error.message, {
        originalError: error,
        context: { action: 'complexAction', data }
      })
    } else {
      // Unknown error type
      throw new SystemError('UNKNOWN_ERROR', 'An unexpected error occurred', {
        originalError: error,
        context: { action: 'complexAction', data }
      })
    }
  }
})
```

### React Query Layer

```typescript
export function useComplexAction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: complexAction,
    onError: (error) => {
      // Route to global error handler
      errorHandler.handleError(error)
      
      // Log for debugging
      console.error('Action failed:', error)
    },
    onSuccess: () => {
      // Clear related errors on success
      errorHandler.clearErrors(['USER_CREATION_FAILED', 'EXTERNAL_STRIPE_*'])
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}
```

### Component Layer

```typescript
export function ActionComponent() {
  const action = useComplexAction()
  
  const handleSubmit = async (data) => {
    try {
      await action.mutateAsync(data)
      toast.success('Operation completed successfully')
    } catch (error) {
      // This catch is for UI-specific fallbacks only
      // Error is already handled by onError in mutation
      
      if (shouldShowCustomFallback(error)) {
        showCustomFallback()
      }
    }
  }
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Form fields */}
      {action.error && (
        // Inline error display for validation errors
        <ErrorMessage error={action.error} />
      )}
    </form>
  )
}
```

## 🌐 Global Error Manager

### Error Handler Implementation

```typescript
export class GlobalErrorHandler {
  private errors: Map<string, AppError> = new Map()
  private listeners: Set<(error: AppError) => void> = new Set()
  
  handleError(error: unknown, context?: any): AppError {
    let appError: AppError
    
    // Convert to AppError if needed
    if (error instanceof AppError) {
      appError = error
    } else if (error instanceof Error) {
      appError = new SystemError('UNEXPECTED_ERROR', error.message, {
        originalError: error,
        context
      })
    } else {
      appError = new SystemError('UNKNOWN_ERROR', 'An unexpected error occurred', {
        originalError: error,
        context
      })
    }
    
    // Add context if missing
    if (!appError.details.actionContext) {
      appError.details.actionContext = context || {}
    }
    
    // Store for debugging/recovery
    this.errors.set(appError.requestId, appError)
    
    // Route to appropriate display
    this.routeToDisplay(appError)
    
    // Log for monitoring
    this.logError(appError)
    
    // Notify listeners
    this.notifyListeners(appError)
    
    return appError
  }
  
  private routeToDisplay(error: AppError) {
    switch (error.constructor.name) {
      case 'ValidationError':
        this.displayInline(error)
        break
      case 'AuthorizationError':
        this.displayModal(error)
        if (error.code === 'AUTH_SESSION_EXPIRED') {
          router.push(paths.auth.login)
        }
        break
      case 'NetworkError':
        this.displayToast(error)
        if (error.retryable) {
          this.scheduleRetry(error)
        }
        break
      case 'ExternalServiceError':
        this.displayModal(error)
        if (error.retryable) {
          this.displayRetryOption(error)
        }
        break
      case 'BusinessLogicError':
      case 'DatabaseError':
        this.displayModal(error)
        break
      default:
        this.displayModal(error)
    }
  }
  
  // Error display methods
  private displayInline(error: AppError) {
    // Dispatch to error display context
    window.dispatchEvent(new CustomEvent('error:inline', { 
      detail: error 
    }))
  }
  
  private displayToast(error: AppError) {
    window.dispatchEvent(new CustomEvent('error:toast', { 
      detail: error 
    }))
  }
  
  private displayModal(error: AppError) {
    window.dispatchEvent(new CustomEvent('error:modal', { 
      detail: error 
    }))
  }
  
  // Recovery methods
  private scheduleRetry(error: AppError) {
    const retryFn = () => {
      window.dispatchEvent(new CustomEvent('error:retry', { 
        detail: error 
      }))
    }
    
    setTimeout(retryFn, 3000) // 3 second delay
  }
  
  // Error management
  clearError(requestId: string) {
    this.errors.delete(requestId)
  }
  
  clearErrors(pattern?: string) {
    if (pattern) {
      for (const [key, error] of this.errors) {
        if (error.code.match(pattern)) {
          this.errors.delete(key)
        }
      }
    } else {
      this.errors.clear()
    }
  }
  
  getError(requestId: string): AppError | undefined {
    return this.errors.get(requestId)
  }
  
  getAllErrors(): AppError[] {
    return Array.from(this.errors.values())
  }
}
```

### Error Display Context

```typescript
// React Context for error display
const ErrorDisplayContext = createContext({
  inlineErrors: new Map(),
  toastErrors: [],
  modalError: null,
  clearInlineError: (field: string) => {},
  clearToastError: (requestId: string) => {},
  clearModalError: () => {}
})

export function ErrorDisplayProvider({ children }) {
  const [inlineErrors, setInlineErrors] = useState(new Map())
  const [toastErrors, setToastErrors] = useState([])
  const [modalError, setModalError] = useState(null)
  
  useEffect(() => {
    // Listen for error events
    const handleInline = (event) => {
      const error = event.detail
      setInlineErrors(prev => new Map(prev).set(error.details.field, error))
    }
    
    const handleToast = (event) => {
      setToastErrors(prev => [...prev, event.detail])
    }
    
    const handleModal = (event) => {
      setModalError(event.detail)
    }
    
    window.addEventListener('error:inline', handleInline)
    window.addEventListener('error:toast', handleToast)
    window.addEventListener('error:modal', handleModal)
    
    return () => {
      window.removeEventListener('error:inline', handleInline)
      window.removeEventListener('error:toast', handleToast)
      window.removeEventListener('error:modal', handleModal)
    }
  }, [])
  
  return (
    <ErrorDisplayContext.Provider value={{
      inlineErrors,
      toastErrors,
      modalError,
      clearInlineError: (field) => {
        setInlineErrors(prev => {
          const next = new Map(prev)
          next.delete(field)
          return next
        })
      },
      clearToastError: (requestId) => {
        setToastErrors(prev => prev.filter(e => e.requestId !== requestId))
      },
      clearModalError: () => setModalError(null)
    }}>
      {children}
      
      {/* Error components */}
      <ErrorToastList errors={toastErrors} />
      <ErrorModal error={modalError} />
    </ErrorDisplayContext.Provider>
  )
}
```

## 🧪 Error Testing Patterns

### Testing Error Flows

```typescript
describe('Error Handling', () => {
  describe('Error Information Preservation', () => {
    it('should preserve original error context through all layers', async () => {
      const originalError = new Error('Database connection failed')
      const action = async () => {
        throw new DatabaseError('CONNECTION_FAILED', {
          database: 'users',
          originalError,
          connectionId: 'conn_123'
        })
      }
      
      const error = await action().catch(e => errorHandler.handleError(e))
      
      expect(error).toBeInstanceOf(DatabaseError)
      expect(error.details.originalError).toBe(originalError)
      expect(error.details.database).toBe('users')
      expect(error.requestId).toBeDefined()
      expect(error.timestamp).toBeDefined()
      expect(error.severity).toBe('high')
    })
    
    it('should convert external service errors appropriately', async () => {
      const stripeError = new stripe.errors.StripeError('card_declined')
      stripeError.code = 'card_declined'
      stripeError.message = 'Your card was declined'
      
      const error = errorHandler.handleError(stripeError)
      
      expect(error).toBeInstanceOf(ExternalServiceError)
      expect(error.code).toBe('EXTERNAL_STRIPE_card_declined')
      expect(error.details.service).toBe('stripe')
      expect(error.details.originalCode).toBe('card_declined')
      expect(error.retryable).toBe(false)
    })
  })
  
  describe('Error Display Routing', () => {
    it('should route validation errors to inline display', () => {
      const error = new ValidationError('email', 'invalid-email', 'Invalid format')
      
      const spy = jest.spyOn(window, 'dispatchEvent')
      errorHandler.handleError(error)
      
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error:inline',
          detail: error
        })
      )
    })
    
    it('should route authorization errors to modal and redirect', () => {
      const error = new AuthorizationError('SESSION_EXPIRED')
      const pushMock = jest.fn()
      
      // Mock router
      jest.doMock('next/navigation', () => ({
        useRouter: () => ({ push: pushMock })
      }))
      
      errorHandler.handleError(error)
      
      expect(pushMock).toHaveBeenCalledWith(paths.auth.login)
    })
  })
})
```

## 🎛️ Error Recovery Strategies

### Retry Mechanisms

```typescript
export class ErrorRecovery {
  async retryWithBackoff<T>(
    operation: () => Promise<T>, 
    error: AppError,
    maxAttempts: number = 3
  ): Promise<T> {
    if (!error.retryable) {
      throw error
    }
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (retryError) {
        if (attempt === maxAttempts) {
          // Final attempt failed, enhance error with retry context
          throw new AppError(
            error.code,
            `${error.message} (Retry attempts exhausted)`,
            {
              ...error.details,
              retryAttempts: attempt,
              originalError: error
            }
          )
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw error
  }
}
```

### User-Initiated Recovery

```typescript
export function ErrorModal({ error }) {
  const { clearModalError } = useContext(ErrorDisplayContext)
  const [isRetrying, setIsRetrying] = useState(false)
  
  const handleRetry = async () => {
    if (!error.retryable || isRetrying) return
    
    setIsRetrying(true)
    
    // Dispatch retry event
    window.dispatchEvent(new CustomEvent('error:retry', { 
      detail: error 
    }))
    
    clearModalError()
  }
  
  const getErrorActions = () => {
    if (error.retryable) {
      return (
        <button onClick={handleRetry} disabled={isRetrying}>
          {isRetrying ? 'Retrying...' : 'Retry'}
        </button>
      )
    }
    
    if (error.code === 'AUTH_SESSION_EXPIRED') {
      return (
        <Link href={paths.auth.login}>
          Sign In Again
        </Link>
      )
    }
    
    return (
      <button onClick={clearModalError}>
        Close
      </button>
    )
  }
  
  return (
    <Modal>
      <h2>Error</h2>
      <p>{error.message}</p>
      {error.details && (
        <details>
          <summary>Error Details</summary>
          <pre>{JSON.stringify(error.details, null, 2)}</pre>
        </details>
      )}
      <div className="modal-actions">
        {getErrorActions()}
      </div>
    </Modal>
  )
}
```

## 📊 Error Monitoring & Analytics

### Error Logging

```typescript
export class ErrorLogger {
  log(error: AppError) {
    // Development: console logging
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${error.code}`)
      console.error('Message:', error.message)
      console.error('Details:', error.details)
      console.error('Request ID:', error.requestId)
      console.error('Stack:', error.stack)
      console.groupEnd()
      return
    }
    
    // Production: Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error)
    }
  }
  
  private async sendToMonitoring(error: AppError) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      })
    } catch (logError) {
      // Fallback: console log if logging fails
      console.error('Failed to log error:', error, 'Log error:', logError)
    }
  }
}
```

### Error Analytics

```typescript
export interface ErrorMetrics {
  totalErrors: number
  errorsByCode: Record<string, number>
  errorsBySeverity: Record<string, number>
  retryableErrors: number
  retrySuccessRate: number
  averageResolutionTime: number
}

export function getErrorMetrics(errors: AppError[]): ErrorMetrics {
  const errorsByCode: Record<string, number> = {}
  const errorsBySeverity: Record<string, number> = {}
  let retryableErrors = 0
  let retrySuccesses = 0
  const resolutionTimes: number[] = []
  
  errors.forEach(error => {
    errorsByCode[error.code] = (errorsByCode[error.code] || 0) + 1
    errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1
    
    if (error.retryable) {
      retryableErrors++
      // Track retry success if available
      if (error.details.retrySuccess) {
        retrySuccesses++
      }
    }
    
    // Calculate resolution time if available
    if (error.details.resolvedAt) {
      const resolutionTime = new Date(error.details.resolvedAt).getTime() - new Date(error.timestamp).getTime()
      resolutionTimes.push(resolutionTime)
    }
  })
  
  return {
    totalErrors: errors.length,
    errorsByCode,
    errorsBySeverity,
    retryableErrors,
    retrySuccessRate: retryableErrors > 0 ? retrySuccesses / retryableErrors : 0,
    averageResolutionTime: resolutionTimes.length > 0 
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length 
      : 0
  }
}
```

## 🔧 Integration with Existing Architecture

### Paths Integration

```typescript
// Error-specific routing
export const errorPaths = {
  authExpired: paths.auth.login,
  forbidden: paths.dashboard.settings, // Go to settings for permissions
  rateLimit: paths.dashboard.root,     // Go to dashboard to retry later
  maintenance: '/maintenance',          // Temporary maintenance page
} as const

// Enhanced error handler with path routing
if (error.code === 'AUTH_SESSION_EXPIRED') {
  router.push(errorPaths.authExpired + '?reason=session_expired')
}
```

### Feature-Specific Error Handling

```typescript
// app/billing/actions/payment.ts
export const processPayment = authAction(paymentSchema, async (data, ctx) => {
  try {
    // Payment processing logic
  } catch (error) {
    // Add billing-specific context
    if (error instanceof AppError) {
      error.details.billingContext = {
        amount: data.amount,
        currency: data.currency,
        customerId: ctx.authUser.id
      }
    }
    throw error
  }
})

// app/billing/hooks/use-payment.ts
export function usePayment() {
  return useMutation({
    mutationFn: processPayment,
    onError: (error) => {
      // Add billing-specific error display
      if (error.code === 'BIZ_INSUFFICIENT_FUNDS') {
        // Show top-up modal
        showTopUpModal(error.details.requiredAmount)
      } else {
        // Use global error handler
        errorHandler.handleError(error)
      }
    }
  })
}
```

This comprehensive error handling strategy ensures that:
1. No error information is lost through the call stack
2. Users get appropriate error messages and recovery options
3. Developers get detailed debugging information
4. The system maintains reliability and recoverability
5. AI agents have clear patterns to follow when implementing error handling