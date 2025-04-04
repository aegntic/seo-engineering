# API Rate Limiting & Webhook System

## Rate Limiting Framework

The SEOAutomate API implements a flexible, configurable rate limiting framework to ensure system stability, prevent abuse, and provide fair resource allocation across clients.

### Architecture Overview

Our rate limiting system follows a modular design pattern with three key components:

1. **Core Rate Limiter**: Central middleware that intercepts requests and applies limiting logic
2. **Storage Strategies**: Pluggable storage backends (Memory, Redis) for rate limit counters
3. **Limiting Algorithms**: Interchangeable rate limiting strategies for different use cases

This design allows for maximum flexibility while maintaining consistent API behavior.

### Rate Limiting Strategies

The system implements three distinct rate limiting algorithms:

#### 1. Fixed Window

The simplest approach, dividing time into fixed windows (e.g., 1 minute) and allowing X requests per window.

**Characteristics:**
- Simple implementation and low resource overhead
- Resets counters at fixed intervals
- May allow traffic spikes at window boundaries

**Example configuration:**
```javascript
const limiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 100,              // 100 requests per minute
  strategy: 'fixed'
});
```

#### 2. Sliding Window

A more sophisticated algorithm that considers both the current and previous time windows with weighted calculations.

**Characteristics:**
- Smoother rate limiting behavior
- Prevents traffic spikes at window boundaries
- Slightly higher computational complexity

**Example configuration:**
```javascript
const limiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 100,              // 100 requests per minute
  strategy: 'sliding'
});
```

#### 3. Token Bucket

A token bucket algorithm that allows for traffic bursts while maintaining a consistent average rate.

**Characteristics:**
- Permits temporary traffic bursts
- Tokens replenish at a constant rate
- Ideal for API clients needing occasional burst capacity

**Example configuration:**
```javascript
const limiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 100,              // 100 tokens (bucket capacity)
  refillRate: 100/60000, // Refill rate (tokens per ms)
  strategy: 'token'
});
```

### Storage Backends

The rate limiting system supports two storage backends:

#### 1. Memory Store

A simple in-memory storage for single-instance deployments.

**Characteristics:**
- Fastest performance with lowest latency
- No external dependencies
- Not suitable for distributed environments
- Data is lost on service restart

#### 2. Redis Store

Redis-based storage for distributed deployments.

**Characteristics:**
- Consistent rate limiting across multiple API instances
- Persistence options for limit data
- Atomic operations using Lua scripts
- Suitable for production environments

### Configuration Options

The rate limiter is highly configurable with options for:

- Request identification (IP, user ID, custom functions)
- Response handling and headers
- Skip conditions for certain requests
- Prefix customization for multi-tenant deployments

### Implementation Guidelines

Rate limits are applied at different granularity levels:

1. **Global limits**: Applied to all API requests
2. **Endpoint-specific limits**: Different limits for various API endpoints
3. **User-specific limits**: Limits based on authentication tier or subscription level

Proper response headers are included to help clients understand limits:

- `X-RateLimit-Limit`: Maximum number of requests allowed
- `X-RateLimit-Remaining`: Number of requests remaining in current window
- `X-RateLimit-Reset`: Time when the current limit window resets (Unix timestamp)

## Webhook System

The SEOAutomate API includes a comprehensive webhook system to deliver real-time event notifications to external systems.

### Architecture Overview

The webhook system consists of these primary components:

1. **WebhookManager**: Central service for managing subscriptions and delivery
2. **Event Definitions**: Registry of supported event types
3. **Subscription Management**: CRUD operations for webhook subscriptions
4. **Delivery System**: Reliable event delivery with retries and logging
5. **Security**: Signature verification to authenticate webhook payloads

### Supported Events

The system supports a wide range of business events:

- **Client Events**: `client.created`, `client.updated`, `client.deleted`
- **Scan Events**: `scan.started`, `scan.completed`, `scan.failed`
- **Issue Events**: `issue.detected`, `issue.fixed`
- **Report Events**: `report.generated`
- **User Events**: `user.invited`, `user.created`, `user.updated`

### Webhook Payload Structure

All webhook payloads follow a consistent structure:

```json
{
  "id": "evt_123456789",
  "type": "client.created",
  "createdAt": "2025-04-09T10:15:30Z",
  "agency": "agc_987654321",
  "data": {
    // Event-specific payload data
  }
}
```

### Security Features

Webhook payloads are secured using:

1. **HMAC Signatures**: Each payload is signed using the subscription's secret key
2. **Timing-Safe Comparison**: Signature verification uses constant-time algorithms
3. **HTTPS-Only Delivery**: All webhooks must use secure HTTPS endpoints

Signatures are included in the `X-SEOAutomate-Signature` header, allowing recipients to verify payload authenticity.

### Delivery Reliability

The system ensures reliable webhook delivery through:

1. **Automatic Retries**: Failed deliveries are retried with exponential backoff
2. **Delivery Logging**: Comprehensive logs of delivery attempts and responses
3. **Monitoring**: Success and failure metrics for each subscription

### Subscription Management

Webhooks can be managed through the API with endpoints for:

- Creating new webhook subscriptions
- Updating existing subscriptions
- Deleting subscriptions
- Viewing delivery history and statistics

### Implementation Best Practices

When implementing webhook receivers:

1. **Verify Signatures**: Always verify webhook signatures before processing
2. **Respond Quickly**: Return 2xx response immediately, then process asynchronously
3. **Handle Duplicates**: Design for idempotent processing of potentially duplicate events
4. **Monitor Failures**: Track webhook delivery failures and address issues promptly

## Integration Scenarios

### Multi-Client Management

The rate limiting and webhook systems are designed specifically for agency scenarios managing multiple clients:

- Rate limits can be applied at agency level or individual client level
- Webhook events include agency and client context for proper routing
- White label capabilities extend to webhook configurations

### Scalable Implementation

Both systems are designed for scalability:

- Rate limiting scales horizontally with Redis backend
- Webhook delivery uses asynchronous processing to handle high volumes
- Performance optimizations reduce system overhead

### Third-Party Integration

The systems enable seamless third-party integration:

- Webhooks allow real-time data synchronization with CRMs, reporting tools, etc.
- Rate limiting ensures fair API usage for all integration partners
- Comprehensive documentation supports developer experience
