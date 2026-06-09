# GitPulse Development Setup

## Environment Configuration

### Backend
- **Port**: 5001 (Updated from 5000 to avoid conflicts)
- **Database**: MongoDB (Local or Atlas)
- **CORS**: Allowed origins `http://localhost:5173`, `http://localhost:5174`

### Frontend
- **Port**: 5174 (Auto-selected if 5173 is busy)
- **Proxy**: All `/api` requests are proxied to `http://localhost:5001`

## Running the Project

1. **Install Dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Start Backend**:
   ```bash
   cd backend && npm run dev
   ```

3. **Start Frontend**:
   ```bash
   cd frontend && npm run dev
   ```

## Design System
- **Theme**: Pinterest-inspired warm palette.
- **Components**: 8px-16px rounded corners, layered shadows.
- **Performance**: GPU-accelerated animations (transform/opacity).
