# aiSaleChat

# AI Sales Chat Platform

A comprehensive AI-driven sales conversation platform that enables customizable chat agents for sales training and evaluation.

## Project Overview

This platform provides an intelligent solution for sales training and evaluation through AI-powered conversational agents. It supports multiple platforms including H5 and mini-programs (WeChat, Alipay).

### Key Features

- User Management System
- Customizable AI Sales Agents
- Training Record Management
- Multi-platform Support (H5, WeChat Mini Program, Alipay Mini Program)
- Scoring and Evaluation System
- File Attachment Support

## Technical Stack

### Backend
- Node.js with TypeScript
- Hono Framework
- PostgreSQL Database
- Drizzle ORM
- Zod Validation

### Frontend
- Vue.js
- uni-app Framework
- TypeScript
- Vite Build System

## Project Structure

```
aiSaleChat/
├── server/           # Backend server implementation
│   ├── src/
│   │   ├── routes/  # API route handlers
│   │   ├── db/      # Database schemas and configurations
│   │   └── index.ts # Server entry point
│   └── package.json
└── static/          # Frontend implementation
    ├── src/
    └── package.json
```

## API Endpoints

### User Management
- POST /api/user/register - User registration
- POST /api/user/login - User authentication
- GET /api/user/profile - Get user profile
- PUT /api/user/profile - Update user profile

### Agent Management
- POST /api/agent/create - Create new AI agent
- GET /api/agent/list - List available agents
- PUT /api/agent/update - Update agent configuration
- DELETE /api/agent/delete - Remove agent

## Development

### Prerequisites
- Node.js 16+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/DennisYang0611/aiSaleChat.git
cd aiSaleChat
```

2. Install dependencies:
```bash
# Backend
cd server
pnpm install

# Frontend
cd ../static
pnpm install
```

3. Configure environment variables:
```bash
# Server configuration
cp .env.example .env
```

4. Start development servers:
```bash
# Backend
cd server
pnpm dev

# Frontend
cd ../static
pnpm dev
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
