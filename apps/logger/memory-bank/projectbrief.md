# Project Brief: Logger Service

## Overview
The Logger Service is a centralized logging microservice within the Vibe dating platform ecosystem. It acts as a central hub that receives and processes all log events from connected services through a publish/subscribe event-driven architecture.

## Core Purpose
- **Centralized Logging**: Collect and store all application logs from distributed services
- **Request Logging**: Specifically capture and store HTTP request/response data
- **Event-Driven Architecture**: Use message queue (RabbitMQ) for asynchronous log processing
- **Data Persistence**: Store logs in MongoDB with encryption for sensitive data

## Key Requirements

### Functional Requirements
1. **Log Collection**: Receive logs from multiple services via message queue
2. **Log Levels**: Support standard log levels (debug, info, warn, error, fatal, request-log)
3. **Request Logging**: Special handling for HTTP request logs with method, body, and metadata
4. **Data Encryption**: Encrypt sensitive request body data before storage
5. **Real-time Processing**: Process incoming logs immediately without blocking
6. **Health Check**: Provide basic health check endpoint

### Technical Requirements
1. **Microservice Architecture**: Standalone service with clear boundaries
2. **Message Queue Integration**: RabbitMQ for reliable log delivery
3. **Database Storage**: MongoDB for flexible log storage
4. **TypeScript**: Full type safety and modern development practices
5. **Docker Support**: Containerized deployment
6. **Environment Configuration**: Flexible configuration via environment variables

### Non-Functional Requirements
1. **Performance**: Handle high-volume log processing without degradation
2. **Reliability**: Ensure no log loss through message queue acknowledgment
3. **Scalability**: Support horizontal scaling for increased log volume
4. **Security**: Encrypt sensitive data in request logs
5. **Monitoring**: Provide health check endpoints for service monitoring

## Success Criteria
- Successfully receive and store logs from all connected services
- Maintain data integrity with encrypted sensitive information
- Provide reliable health check functionality
- Support high-throughput log processing
- Enable easy deployment and scaling

## Constraints
- Must integrate with existing @core/api and @core/message-queue packages
- Must follow established coding standards and patterns
- Must support the dating platform's security requirements
- Must be deployable in containerized environments 