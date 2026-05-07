# MeowMeal Backend

A production-ready, scalable REST API for MeowMeal food delivery platform built with Node.js, Express, TypeScript, and PostgreSQL.

---

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: Better Auth
- **Real-time**: Socket.io
- **AI**: Google Gemini API
- **Logging**: Winston
- **Caching**: Node Cache (In-memory)
- **Validation**: Zod
- **File Upload**: Cloudinary

---

## AI Features

### 1. AI Meal Recommender
- Route: GET /api/ai/recommendations
- Analyzes customer order history and suggests 4 personalized meals using Gemini AI

### 2. AI Food Chatbot
- Route: POST /api/ai/chat
- Context-aware food assistant that maintains conversation history

### 3. AI Menu Description Generator
- Route: POST /api/ai/generate-description
- Generates appetizing meal descriptions and tags for providers

### 4. AI Review Sentiment Analyzer
- Route: POST /api/ai/analyze-reviews
- Analyzes customer reviews and provides actionable insights for providers

---

## Project Structure

    src/
    ├── config/          # Database, Auth, Socket, Gemini config
    ├── errors/          # Global error handling
    ├── lib/             # Cache utility
    ├── middlewares/     # Auth, Role, Rate limiter
    ├── modules/         # Feature modules
    │   ├── auth/
    │   ├── meals/
    │   ├── orders/
    │   ├── reviews/
    │   ├── cart/
    │   ├── categories/
    │   ├── providers/
    │   ├── admin/
    │   └── ai/
    ├── routes/          # Route aggregator
    ├── types/           # TypeScript types
    └── utils/           # Logger, Response, Async handler

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Google Gemini API key
- Cloudinary account

### 1. Clone the repository

    git clone https://github.com/your-username/MeowMeal-Backend.git
    cd MeowMeal-Backend

### 2. Install dependencies

    npm install

### 3. Setup environment variables

    cp .env.example .env

Fill in your .env file:

    PORT=5000
    NODE_ENV=development
    DATABASE_URL=your_neon_postgresql_url
    BETTER_AUTH_SECRET=your_secret_min_32_chars
    BETTER_AUTH_URL=http://localhost:5000
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GEMINI_API_KEY=your_gemini_api_key
    CLOUDINARY_CLOUD_NAME=your_cloudinary_name
    CLOUDINARY_API_KEY=your_cloudinary_key
    CLOUDINARY_API_SECRET=your_cloudinary_secret
    CLIENT_URL=http://localhost:3000

### 4. Setup database

    npx prisma generate
    npx prisma migrate dev
    npx prisma db seed

### 5. Start development server

    npm run dev

Server runs on http://localhost:5000

---

## Demo Credentials

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@meowmeal.com     | password123 |
| Customer | rahim@gmail.com        | password123 |
| Provider | salamsbistro@gmail.com | password123 |

---

## API Endpoints

### Auth

| Method | Endpoint                   | Description        | Access |
|--------|----------------------------|--------------------|--------|
| POST   | /api/auth/sign-up/email    | Register           | Public |
| POST   | /api/auth/sign-in/email    | Login              | Public |
| POST   | /api/auth/sign-out         | Logout             | Auth   |
| GET    | /api/auth/me               | Get profile        | Auth   |
| PATCH  | /api/auth/me               | Update profile     | Auth   |
| GET    | /api/auth/users            | Get all users      | Admin  |
| PATCH  | /api/auth/users/:id/status | Toggle user status | Admin  |

### Categories

| Method | Endpoint            | Description        | Access |
|--------|---------------------|--------------------|--------|
| GET    | /api/categories     | Get all categories | Public |
| GET    | /api/categories/:id | Get category by id | Public |
| POST   | /api/categories     | Create category    | Admin  |
| PATCH  | /api/categories/:id | Update category    | Admin  |
| DELETE | /api/categories/:id | Delete category    | Admin  |

### Meals

| Method | Endpoint                        | Description         | Access   |
|--------|---------------------------------|---------------------|----------|
| GET    | /api/meals                      | Get all meals       | Public   |
| GET    | /api/meals/:id                  | Get meal by id      | Public   |
| GET    | /api/meals/provider/:providerId | Get provider meals  | Public   |
| POST   | /api/meals                      | Create meal         | Provider |
| PATCH  | /api/meals/:id                  | Update meal         | Provider |
| DELETE | /api/meals/:id                  | Delete meal         | Provider |
| PATCH  | /api/meals/:id/toggle           | Toggle availability | Provider |

### Orders

| Method | Endpoint                    | Description         | Access   |
|--------|-----------------------------|---------------------|----------|
| POST   | /api/orders                 | Create order        | Customer |
| GET    | /api/orders/my-orders       | Get my orders       | Customer |
| PATCH  | /api/orders/:id/cancel      | Cancel order        | Customer |
| GET    | /api/orders/provider-orders | Get provider orders | Provider |
| PATCH  | /api/orders/:id/status      | Update order status | Provider |
| GET    | /api/orders/:id             | Get order by id     | Auth     |
| GET    | /api/orders                 | Get all orders      | Admin    |

### Cart

| Method | Endpoint          | Description      | Access   |
|--------|-------------------|------------------|----------|
| GET    | /api/cart         | Get cart         | Customer |
| POST   | /api/cart         | Add to cart      | Customer |
| PATCH  | /api/cart/:itemId | Update cart item | Customer |
| DELETE | /api/cart/:itemId | Remove from cart | Customer |
| DELETE | /api/cart         | Clear cart       | Customer |

### Reviews

| Method | Endpoint               | Description     | Access   |
|--------|------------------------|-----------------|----------|
| GET    | /api/reviews           | Get reviews     | Public   |
| POST   | /api/reviews           | Create review   | Customer |
| GET    | /api/reviews/my-reviews| Get my reviews  | Customer |
| DELETE | /api/reviews/:id       | Delete review   | Admin    |

### Providers

| Method | Endpoint                        | Description        | Access   |
|--------|---------------------------------|--------------------|----------|
| GET    | /api/providers                  | Get all providers  | Public   |
| GET    | /api/providers/:id              | Get provider by id | Public   |
| GET    | /api/providers/me/profile       | Get my profile     | Provider |
| POST   | /api/providers/me/profile       | Create profile     | Provider |
| PATCH  | /api/providers/me/profile       | Update profile     | Provider |
| PATCH  | /api/providers/me/toggle-status | Toggle open status | Provider |
| GET    | /api/providers/me/dashboard     | Dashboard stats    | Provider |
| PATCH  | /api/providers/:id/verify       | Verify provider    | Admin    |

### AI

| Method | Endpoint                     | Description               | Access          |
|--------|------------------------------|---------------------------|-----------------|
| GET    | /api/ai/recommendations      | Get meal recommendations  | Customer        |
| POST   | /api/ai/chat                 | Food chatbot              | Auth            |
| POST   | /api/ai/generate-description | Generate meal description | Provider        |
| POST   | /api/ai/analyze-reviews      | Analyze review sentiment  | Provider, Admin |

### Admin

| Method | Endpoint             | Description     | Access |
|--------|----------------------|-----------------|--------|
| GET    | /api/admin/dashboard | Dashboard stats | Admin  |

---

## Advanced Features

- Real-time notifications via Socket.io
- In-memory caching for categories and dashboard stats
- Rate limiting on all API routes
- Winston logging with file and console transports
- Role-based access control (Customer, Provider, Admin)
- Modular architecture following service-controller pattern
- Global error handling with custom AppError class
- Input validation with Zod on all endpoints

---

## License

MIT
