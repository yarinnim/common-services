# Technical Context: Logger Service

## Technology Stack

### Core Technologies
- **Runtime**: Node.js (version specified in .node-version)
- **Language**: TypeScript (strict mode with comprehensive type checking)
- **Framework**: Custom API framework (@core/api package)
- **Message Queue**: RabbitMQ (via @core/message-queue package)
- **Database**: MongoDB (native driver)
- **Containerization**: Docker with docker-compose

### Development Tools
- **Build Tool**: TypeScript compiler (tsc)
- **Linting**: ESLint with custom configuration
- **Testing**: Jest framework
- **Documentation**: JSDoc for API documentation
- **Process Management**: Nodemon for development

## Development Setup

### Prerequisites
- Node.js (version specified in .node-version)
- Docker and docker-compose
- MongoDB instance
- RabbitMQ instance

### Environment Configuration
Required environment variables (see `env.example`):
```bash
# Application
APP_ENV=development
APP_NAME=@common-services/logger
APP_PORT=3000
APP_VERSION=1.0.0
APP_BUILD_NUMBER=202506160958

# Database (MongoDB)
DB_HOST=common_mongo
DB_PORT=27017
DB_USERNAME=admin
DB_PASSWORD=admin@IFNT1
DB_DATABASE=logger_local
DB_MAX_POOL_SIZE=20
DB_REQUEST_LOG_DB=request_log_local

# Message Queue (RabbitMQ)
MQ_HOST=common_rabbitmq
MQ_PORT=5672
MQ_USER=rabbitmq
MQ_PASSWORD=rabbitmq

# Logging
LOG_EXCHANGE=logger-service
```

### Build and Run Commands
```bash
# Development
npm run dev              # Build with watch mode
npm run start:dev        # Build and start with nodemon

# Production
npm run build           # TypeScript compilation
npm start              # Run compiled JavaScript

# Testing
npm test               # Run Jest tests
npm run test:dev       # Run tests in watch mode

# Code Quality
npm run eslint         # Lint TypeScript files
npm run jsdoc          # Generate documentation
```

## Technical Constraints

### Code Style Constraints
- **TypeScript Strict Mode**: All code must be fully typed
- **ESLint Compliance**: Must pass all linting rules
- **Promise/Then Pattern**: Use promise chains instead of async/await
- **Function Naming**: PascalCase for all functions
- **Variable Naming**: camelCase for variables, PascalCase for constants
- **Line Length**: Maximum 100 characters per line
- **No Loops**: Use recursive functions instead of for/while loops
- **No Promise.all**: Use promise.then chains only

### Architecture Constraints
- **Microservice Pattern**: Must remain independent and focused
- **Message Queue Only**: No direct API calls between services
- **MongoDB Only**: No other database systems
- **Containerized**: Must run in Docker containers
- **Environment Based**: All configuration via environment variables

### Performance Constraints
- **High Throughput**: Must handle high-volume log processing
- **Low Latency**: Sub-second log processing and storage
- **Connection Pooling**: Efficient database connection management
- **Memory Efficient**: Minimal memory footprint
- **Non-blocking**: Asynchronous processing throughout

### Security Constraints
- **Data Encryption**: Sensitive request data must be encrypted
- **No Hardcoded Secrets**: All secrets via environment variables
- **Input Validation**: Validate all incoming message data
- **Error Sanitization**: Don't expose internal errors to external systems

## Dependencies

### Core Dependencies
```json
{
  "@core/api": "^1.0.0",           // API framework
  "@core/message-queue": "^1.0.0", // Message queue abstraction
  "mongodb": "^6.17.0"             // MongoDB driver
}
```

### Development Dependencies
- TypeScript compiler and configuration
- ESLint with custom rules
- Jest testing framework
- Nodemon for development
- Babel for build process

### Peer Dependencies
```json
{
  "dotenv": ">=16.0.1"  // Environment variable management
}
```

## Tool Usage Patterns

### TypeScript Configuration
- Strict mode enabled
- ES2020 target
- Module resolution via Node.js
- Declaration file generation
- Source map generation for debugging

### ESLint Configuration
- Custom rules for project standards
- TypeScript-aware linting
- Import/export validation
- Code style enforcement
- No console.log warnings (allowed for logging service)

### Jest Configuration
- TypeScript support
- Force exit for CI/CD
- Watch mode for development
- Coverage reporting
- Test file pattern: `**/*.test.ts`

### Docker Configuration
- Multi-stage build for optimization
- Environment variable injection
- Health check configuration
- Port mapping for development
- Volume mounting for logs

## Integration Points

### Message Queue Integration
- **Exchange**: Direct exchange for log level routing
- **Queues**: Exclusive queues for load distribution
- **Routing Keys**: Log levels as routing keys
- **Message Format**: JSON with standardized structure
- **Acknowledgment**: No acknowledgment for high throughput

### Database Integration
- **Connection Pooling**: Optimized for high throughput
- **Collection Strategy**: Dynamic collection naming
- **Indexing**: Automatic indexing for query performance
- **Error Handling**: Graceful connection failure handling
- **Transaction Support**: Not used (logging doesn't require transactions)

### API Integration
- **Health Check**: Simple GET endpoint for monitoring
- **No Authentication**: Internal service, no external access
- **CORS**: Not applicable (internal service)
- **Rate Limiting**: Not applicable (message queue handles flow control)

## Deployment Considerations

### Container Deployment
- **Docker Image**: Optimized Node.js base image
- **Environment Variables**: All configuration externalized
- **Health Checks**: Built-in health check endpoint
- **Logging**: Console output for container logs
- **Resource Limits**: Configurable memory and CPU limits

### Service Discovery
- **Internal Service**: No external service discovery needed
- **Message Queue Discovery**: Via environment variables
- **Database Discovery**: Via environment variables
- **Load Balancing**: Handled by message queue

### Monitoring and Observability
- **Health Endpoint**: `/` endpoint for basic health check
- **Log Output**: Structured console logging
- **Metrics**: Consider adding metrics collection
- **Tracing**: Consider adding distributed tracing
- **Alerting**: Monitor service availability and error rates 
