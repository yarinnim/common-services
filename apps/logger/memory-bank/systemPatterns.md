# System Patterns: Logger Service

## Architecture Overview

### Microservice Architecture
The Logger Service follows a microservice pattern with clear boundaries:
- **Single Responsibility**: Dedicated to log collection and storage
- **Loose Coupling**: Communicates via message queue, not direct API calls
- **Independent Deployment**: Can be deployed and scaled independently
- **Technology Isolation**: Uses MongoDB and RabbitMQ specific to logging needs

### Event-Driven Architecture
```
[Services] --> [RabbitMQ Exchange] --> [Logger Service] --> [MongoDB Collections]
```

## Key Technical Decisions

### Message Queue Pattern
- **RabbitMQ**: Chosen for reliability and message persistence
- **Direct Exchange**: Used for routing logs by severity level
- **Exclusive Queues**: Each service instance gets unique queue for load distribution
- **No Acknowledgment**: Using `noAck: true` for high-throughput processing

### Database Pattern
- **MongoDB**: Flexible schema for varying log structures
- **Collection Strategy**: Separate collections for different log types
- **Connection Pooling**: Optimized connection management for high throughput
- **Encryption**: Sensitive data encrypted before storage

### Log Processing Pattern
- **Asynchronous Processing**: Non-blocking log processing
- **Level-based Routing**: Different handling for different log levels
- **Request Log Specialization**: Special handling for HTTP request logs
- **Console Output**: Real-time visibility during processing

## Design Patterns

### Factory Pattern
```typescript
// Database connection factory
const pool = (collectionName: string) => createConnection(collectionName);
const requestLogPool = (collectionName: string) => createRequestLogConnection(collectionName);
```

### Strategy Pattern
```typescript
// Different processing strategies for different log types
const logLevels = ['debug', 'info', 'warn', 'error', 'fatal', 'request-log'];
// Each level can have different processing logic
```

### Observer Pattern
```typescript
// Message queue consumer observes and processes incoming messages
channel.consume(queue.queue, onConsume, { noAck: true });
```

### Pipeline Pattern
```typescript
// Log processing pipeline
Message Reception → Log Classification → Data Processing → Encryption → Storage
```

## Component Relationships

### Core Components
1. **API Server** (`src/index.ts`)
   - Provides health check endpoint
   - Integrates with @core/api package
   - Starts message queue consumer

2. **Message Consumer** (`src/consume.ts`)
   - Connects to RabbitMQ
   - Processes incoming log messages
   - Routes to appropriate storage

3. **Database Layer** (`src/pool.ts`, `src/db.ts`)
   - MongoDB connection management
   - Collection creation and access
   - Connection pooling

4. **Encryption Layer** (`src/crypto.ts`)
   - Encrypts sensitive request data
   - Provides encryption/decryption utilities

5. **Configuration** (`src/constants.ts`)
   - Environment-based configuration
   - Centralized constant management

### Data Flow
```
Environment Variables → Constants → Configuration
                                    ↓
Message Queue → Consumer → Processor → Database
                                    ↓
                              Console Output
```

## Critical Implementation Paths

### Message Queue Connection
1. Connect to RabbitMQ with credentials
2. Create channel and assert exchange
3. Create exclusive queue
4. Bind queue to exchange with routing keys
5. Start consuming messages

### Log Processing
1. Parse incoming message content
2. Extract log level from routing key
3. Format log message for console output
4. Determine collection name based on log type
5. Process and store in appropriate collection

### Request Log Handling
1. Extract HTTP method and metadata
2. Encrypt request body for sensitive data
3. Store in request log collection
4. Maintain audit trail

### Database Operations
1. Get appropriate collection connection
2. Insert log document
3. Handle connection errors gracefully
4. Maintain connection pool efficiency

## Error Handling Patterns

### Graceful Degradation
- Service continues running even if database connection fails
- Console output still works for immediate debugging
- Message queue ensures no log loss during temporary failures

### Error Logging
- All errors are logged to console for immediate visibility
- Database errors don't crash the service
- Connection retries handled automatically

### Data Validation
- Validate message format before processing
- Handle malformed JSON gracefully
- Provide meaningful error messages

## Performance Patterns

### Connection Pooling
- Reuse database connections for efficiency
- Configure appropriate pool sizes
- Monitor connection usage

### Asynchronous Processing
- Non-blocking message consumption
- Parallel processing of multiple messages
- Efficient memory usage

### Batch Processing Considerations
- Process messages individually for immediate feedback
- Consider batching for high-volume scenarios
- Balance latency vs throughput requirements 