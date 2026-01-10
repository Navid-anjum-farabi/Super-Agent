# REST API Documentation

## Authentication Endpoints

### Sign Up
- **POST** `/api/auth/signup`
- **Description**: Create a new user account
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
  ```

### Sign In
- **POST** `/api/auth/callback/credentials`
- **Description**: Login with email and password
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Get Session
- **GET** `/api/auth/session`
- **Description**: Get current user session
- **Authentication**: Required
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user-id",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "user"
      }
    }
  }
  ```

### Sign Out
- **POST** `/api/auth/signout`
- **Description**: Logout current user
- **Authentication**: Required

---

## Agent Management Endpoints

### Get All Agents
- **GET** `/api/agents`
- **Description**: Get all agents for current user
- **Authentication**: Required
- **Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "agent-id",
        "userId": "user-id",
        "name": "Scout Agent",
        "type": "scout",
        "description": "Lead qualification agent",
        "status": "active",
        "config": {...},
        "apiKeys": [...],
        "promptTemplates": [...]
      }
    ]
  }
  ```

### Create Agent
- **POST** `/api/agents`
- **Description**: Create a new agent
- **Authentication**: Required
- **Body**:
  ```json
  {
    "name": "Scout Agent",
    "type": "scout",
    "description": "Lead qualification agent",
    "status": "active"
  }
  ```
- **Response** (201): Agent object

### Get Single Agent
- **GET** `/api/agents/{id}`
- **Description**: Get agent by ID
- **Authentication**: Required
- **Response** (200): Agent object

### Update Agent
- **PUT** `/api/agents/{id}`
- **Description**: Update agent details
- **Authentication**: Required
- **Body**:
  ```json
  {
    "name": "Updated Name",
    "description": "Updated description",
    "status": "inactive"
  }
  ```
- **Response** (200): Updated agent object

### Delete Agent
- **DELETE** `/api/agents/{id}`
- **Description**: Delete an agent
- **Authentication**: Required
- **Response** (200): Success message

---

## Agent Configuration Endpoints

### Get Agent Config
- **GET** `/api/agents/{id}/config`
- **Description**: Get agent configuration
- **Authentication**: Required
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "config-id",
      "agentId": "agent-id",
      "temperature": 0.7,
      "maxTokens": 2000,
      "topP": 0.9
    }
  }
  ```

### Update Agent Config
- **PUT** `/api/agents/{id}/config`
- **Description**: Update agent configuration
- **Authentication**: Required
- **Body**:
  ```json
  {
    "temperature": 0.8,
    "maxTokens": 3000,
    "topP": 0.95
  }
  ```
- **Response** (200): Updated config object

---

## API Keys Endpoints

### Get All API Keys
- **GET** `/api/agents/{id}/api-keys`
- **Description**: Get all API keys for an agent
- **Authentication**: Required
- **Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "key-id",
        "service": "openai",
        "status": "active",
        "createdAt": "2024-01-06T10:00:00Z"
      }
    ]
  }
  ```

### Create API Key
- **POST** `/api/agents/{id}/api-keys`
- **Description**: Add new API key
- **Authentication**: Required
- **Body**:
  ```json
  {
    "service": "openai",
    "key": "sk-...",
    "status": "active"
  }
  ```
- **Response** (201): Created API key object (key is encrypted)

### Delete API Key
- **DELETE** `/api/agents/{id}/api-keys/{keyId}`
- **Description**: Delete an API key
- **Authentication**: Required
- **Response** (200): Success message

---

## Prompt Templates Endpoints

### Get All Prompt Templates
- **GET** `/api/agents/{id}/prompts`
- **Description**: Get all prompt templates for an agent
- **Authentication**: Required
- **Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "prompt-id",
        "agentId": "agent-id",
        "name": "Lead Qualification",
        "type": "system",
        "template": "You are a lead qualification specialist...",
        "description": "Template for qualifying leads",
        "createdAt": "2024-01-06T10:00:00Z"
      }
    ]
  }
  ```

### Create Prompt Template
- **POST** `/api/agents/{id}/prompts`
- **Description**: Create new prompt template
- **Authentication**: Required
- **Body**:
  ```json
  {
    "name": "Lead Qualification",
    "type": "system",
    "template": "You are a lead qualification specialist...",
    "description": "Template for qualifying leads"
  }
  ```
- **Response** (201): Created template object

### Update Prompt Template
- **PUT** `/api/agents/{id}/prompts/{promptId}`
- **Description**: Update existing prompt template
- **Authentication**: Required
- **Body**: Same as create
- **Response** (200): Updated template object

### Delete Prompt Template
- **DELETE** `/api/agents/{id}/prompts/{promptId}`
- **Description**: Delete a prompt template
- **Authentication**: Required
- **Response** (200): Success message

---

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "statusCode": 200
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "statusCode": 422,
  "data": {
    "email": "Invalid email address",
    "password": "Password must be at least 8 characters"
  }
}
```

---

## Authentication

Most endpoints require JWT authentication via NextAuth.js session cookies. Include credentials with requests:

```bash
curl -X GET http://localhost:3000/api/agents \
  -H "Cookie: next-auth.session-token=..."
```

---

## Error Codes

- **400**: Bad Request - Invalid input
- **401**: Unauthorized - Not authenticated
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Resource already exists
- **422**: Unprocessable Entity - Validation failed
- **500**: Internal Server Error
