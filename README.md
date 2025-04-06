# Warehouse Management System

This project consists of a React frontend and Node.js backend.

## Running with Docker

### Prerequisites
- Docker and Docker Compose installed on your server

### Steps to run

1. Clone the repository
```bash
git clone https://github.com/Avazbek-02/Warehouse-Front.git
cd Warehouse-Front
```

2. Build and start the containers
```bash
docker-compose up -d --build
```

3. Access the application
- Frontend: http://your-server-ip
- Backend API: http://your-server-ip/api

### Stopping the application
```bash
docker-compose down
```

### Viewing logs
```bash
# View all logs
docker-compose logs

# View only backend logs
docker-compose logs backend

# View only frontend logs
docker-compose logs frontend
```

## Development

For local development without Docker:

### Backend
```bash
cd warehouse-backend
npm install
npm run dev
```

### Frontend
```bash
cd warehouse-frontend
npm install
npm start
``` 