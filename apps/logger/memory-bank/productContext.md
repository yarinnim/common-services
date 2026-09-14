# Product Context: Logger Service

## Why This Service Exists

### Problem Statement
In a distributed dating platform like Vibe, multiple microservices generate logs across different environments. Without centralized logging:
- **Log Fragmentation**: Logs scattered across multiple services and servers
- **Debugging Difficulty**: Hard to trace user journeys across service boundaries
- **Security Gaps**: Sensitive request data may be logged insecurely
- **Monitoring Challenges**: No unified view of system health and performance
- **Compliance Issues**: Difficulty in audit trails and data governance

### Solution Value
The Logger Service provides:
- **Unified Logging**: Single point of collection for all application logs
- **Request Tracing**: Complete visibility into user interactions
- **Secure Storage**: Encrypted handling of sensitive request data
- **Real-time Monitoring**: Immediate visibility into system behavior
- **Audit Compliance**: Centralized audit trail for security and compliance

## How It Should Work

### User Experience (Developer Perspective)
1. **Simple Integration**: Services publish logs to message queue with minimal configuration
2. **Automatic Processing**: Logs are processed and stored without manual intervention
3. **Flexible Querying**: Stored logs can be queried for debugging and analysis
4. **Health Monitoring**: Service health is easily monitored via health check endpoint

### Service Interaction Flow
```
[Service A] --log event--> [RabbitMQ] --> [Logger Service] --> [MongoDB]
[Service B] --log event--> [RabbitMQ] --> [Logger Service] --> [MongoDB]
[Service C] --request log--> [RabbitMQ] --> [Logger Service] --> [MongoDB (encrypted)]
```

### Log Processing Pipeline
1. **Message Reception**: Receive log messages from RabbitMQ exchange
2. **Log Classification**: Route based on log level (debug, info, warn, error, fatal, request-log)
3. **Data Processing**: Extract relevant information and format for storage
4. **Encryption**: Encrypt sensitive request body data
5. **Storage**: Store in appropriate MongoDB collections
6. **Console Output**: Display formatted log messages for real-time monitoring

## User Experience Goals

### For Developers
- **Zero Configuration**: Minimal setup required to start logging
- **Immediate Feedback**: Real-time console output for development debugging
- **Reliable Delivery**: No log loss through message queue reliability
- **Flexible Storage**: MongoDB provides flexible querying and storage

### For Operations
- **Health Monitoring**: Simple health check endpoint for service monitoring
- **Scalable Architecture**: Can handle increased log volume through scaling
- **Containerized Deployment**: Easy deployment in containerized environments
- **Environment Flexibility**: Works across development, staging, and production

### For Security & Compliance
- **Data Protection**: Sensitive request data is encrypted before storage
- **Audit Trail**: Complete record of all system interactions
- **Access Control**: Centralized log storage with proper access controls
- **Compliance Ready**: Supports audit and compliance requirements

## Success Metrics
- **Log Delivery Rate**: 99.9%+ successful log delivery and storage
- **Processing Latency**: Sub-second log processing and storage
- **Data Integrity**: Zero data loss with proper encryption
- **Service Uptime**: 99.9%+ service availability
- **Developer Adoption**: All services successfully integrated with logger 