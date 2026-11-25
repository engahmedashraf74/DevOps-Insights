
# Docker Images – ApniDukaan

## Application Images

| Service | Image | Tag | Port |
|---|---|---|---|
| API Gateway | apnidukaan-api-gateway | v1 | 4000 |
| Cart Service | devops-insights-cart-service | latest | 4005 |
| Catalog Service | apnidukaan-catalog-service | v1 | 4001 |
| User Service | apnidukaan-user-service | v4 | 4002 |
| Order Service | apnidukaan-order-service | v1 | 4003 |
| Payment Service | apnidukaan-payment-service | v1 | 4004 |
| Search Service | apnidukaan-search-service | v1 | 4006 |
| Notification Service | apnidukaan-notification-service | v1 | 4007 |
| Order Management | apnidukaan-order-management-service | v1 | 3002 |
| Frontend | apnidukaan-frontend | v1 | 3000 |

## Supporting Images

| Service | Image | Tag |
|---|---|---|
| MongoDB | mongo | 7 |
| Redis | redis | 7-alpine |
| Kafka | apache/kafka | 4.1.1 |

## Registry Status

- Application images built locally.
- Docker Hub publishing is pending.
