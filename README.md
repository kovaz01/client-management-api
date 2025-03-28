# Client Management API

A Next.js API for managing clients with MongoDB integration.

## Features

- CRUD operations for clients
- MongoDB integration
- Input validation using Zod
- Pagination and sorting support
- TypeScript support

## Prerequisites

- Node.js 18.x or later
- MongoDB instance
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/client-management-api.git
cd client-management-api
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## API Endpoints

### Clients

- `GET /api/clients` - List all clients (with pagination and sorting)
- `GET /api/clients?id=YOUR_CLIENT_ID` - Get a single client
- `POST /api/clients` - Create a new client
- `DELETE /api/clients?id=YOUR_CLIENT_ID` - Delete a client

## Query Parameters

### List Clients
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Field to sort by (default: createdAt)
- `sortOrder` - Sort order (asc/desc, default: desc)

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

MIT 