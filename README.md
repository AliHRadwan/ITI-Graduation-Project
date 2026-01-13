# 🏨 Hotel AI Concierge System

> An intelligent hotel service management system with AI-powered guest assistance, real-time ticketing, and comprehensive staff management.

---

## ITI - ITP Full-stack PHP 2025/2026 R1 New Capital

### ITI Graduation Project - Group 2

| # | Team Member |
|---|------------|
| 1 | Youssef Hany Abdelaaty Abbas |
| 2 | Ali Hamed Elsayed Radwan |
| 3 | Ali Gamal Abdullah |
| 4 | Muhammed Ali Muhammed Ibrahim |
| 5 | Mohamed Aboelkhair |

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [RAG Service Setup](#rag-service-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## 🎯 Overview

The **Hotel AI Concierge System** is a comprehensive hotel service management platform that combines AI-powered guest assistance with efficient staff workflow management. The system enables guests to interact via messaging channels (Telegram, WhatsApp, Web) while providing hotel staff with powerful tools to manage requests, track SLAs, and deliver exceptional service.

### Key Highlights

- 🤖 **AI-Powered Concierge**: Intelligent chatbot with RAG (Retrieval-Augmented Generation) for accurate hotel information
- 📱 **Multi-Channel Support**: Seamless guest communication via Telegram, WhatsApp, and Web
- 🎫 **Smart Ticketing**: Automated ticket creation, routing, and assignment
- 📊 **Real-time Analytics**: Comprehensive dashboards for monitoring performance
- ⏱️ **SLA Management**: Track and enforce service level agreements
- 🔐 **Role-Based Access**: Granular permissions for Admin, Manager, and Staff roles

---

## ✨ Features

### Guest-Facing Features
- **QR Code Room Linking**: Guests scan QR codes to link conversations to their room
- **Multi-language Support**: Communicate in preferred languages
- **Real-time Messaging**: Instant responses via AI or human agents
- **Service Requests**: Request housekeeping, maintenance, room service, etc.
- **Emergency Escalation**: Priority handling for urgent situations

### Staff Features
- **Ticket Queue**: Personal queue with priority sorting
- **Action Center**: Quick access to assigned tasks
- **Conversation Handoff**: Seamless transfer from AI to human agents
- **Performance Metrics**: Track personal KPIs

### Admin/Manager Features
- **Analytics Dashboard**: Real-time metrics and trends
- **Staff Management**: User accounts, roles, and departments
- **Room Management**: Room status and QR token generation
- **SLA Policies**: Configure response and resolution times
- **Routing Rules**: Automatic ticket assignment based on category
- **Knowledge Base**: Upload documents for AI training
- **Proactive Messaging**: Scheduled guest communications

### Integration Features
- **n8n Workflow Automation**: External automation support
- **Webhook Callbacks**: Real-time event notifications
- **RESTful API**: Complete API for external integrations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
├─────────────────┬─────────────────┬─────────────────┬───────────────────┤
│    Telegram     │    WhatsApp     │   Web Widget    │   Admin Panel     │
└────────┬────────┴────────┬────────┴────────┬────────┴─────────┬─────────┘
         │                 │                 │                   │
         ▼                 ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           n8n AUTOMATION                                 │
│                    (Message Routing & Workflow)                          │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         LARAVEL BACKEND                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │     Auth     │  │   Tickets    │  │ Conversations│  │   Routing    │ │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤ │
│  │    Staff     │  │     SLA      │  │   Messages   │  │   Channels   │ │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤ │
│  │    Rooms     │  │ Departments  │  │    Guests    │  │  QR Tokens   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌─────────────────────────┐                 ┌─────────────────────────────┐
│      MySQL Database     │                 │     RAG Service (Python)    │
│   (Primary Data Store)  │                 │  ┌───────────────────────┐  │
└─────────────────────────┘                 │  │   FastAPI Backend     │  │
                                            │  ├───────────────────────┤  │
                                            │  │   LangChain + OpenAI  │  │
                                            │  ├───────────────────────┤  │
                                            │  │   PostgreSQL + pgvector│ │
                                            │  └───────────────────────┘  │
                                            └─────────────────────────────┘
```

---

## 📁 Project Structure

```
ITI-Graduation-Project/
├── backend/                    # Laravel PHP Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # API Controllers
│   │   │   ├── Requests/      # Form Request Validation
│   │   │   └── Resources/     # API Resources
│   │   ├── Models/            # Eloquent Models
│   │   ├── Services/          # Business Logic Services
│   │   └── Mail/              # Email Templates
│   ├── config/                # Configuration Files
│   ├── database/
│   │   ├── factories/         # Model Factories
│   │   ├── migrations/        # Database Migrations
│   │   └── seeders/           # Database Seeders
│   ├── routes/
│   │   ├── api.php            # Main API Routes
│   │   └── api/               # Modular Route Files
│   ├── swagger.yaml           # OpenAPI Documentation
│   └── tests/                 # PHPUnit Tests
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── api/               # API Client Modules
│   │   ├── components/
│   │   │   ├── ui/            # Reusable UI Components
│   │   │   ├── layout/        # Layout Components
│   │   │   └── animations/    # Animation Components
│   │   ├── features/          # Feature Modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── analytics/     # Dashboard & Charts
│   │   │   ├── tickets/       # Ticket Management
│   │   │   ├── conversations/ # Chat Interface
│   │   │   ├── rooms/         # Room Management
│   │   │   ├── staff/         # Staff Management
│   │   │   ├── knowledge/     # Knowledge Base
│   │   │   ├── docs/          # API Documentation
│   │   │   └── settings/      # Settings Pages
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── store/             # Zustand State Management
│   │   ├── routes/            # Route Definitions
│   │   └── utils/             # Utility Functions
│   └── public/                # Static Assets
│
├── Hotel_Service_Project/      # RAG AI Service
│   ├── hotel-rag-backend/     # Python FastAPI Backend
│   │   ├── app/
│   │   │   ├── main.py        # FastAPI Application
│   │   │   ├── rag.py         # RAG Implementation
│   │   │   ├── ingest.py      # Document Ingestion
│   │   │   └── config.py      # Configuration
│   │   ├── hotel_knowledge/   # Knowledge Base Documents
│   │   └── requirements.txt   # Python Dependencies
│   └── hotel-rag-frontend/    # RAG Test Interface (React + TS)
│
└── README.md                   # This File
```

---

## 🛠️ Tech Stack

### Backend (Laravel)
| Technology | Purpose |
|------------|---------|
| PHP 8.2+ | Programming Language |
| Laravel 11 | Web Framework |
| Laravel Sanctum | API Authentication |
| MySQL 8 | Primary Database |
| Eloquent ORM | Database Abstraction |

### Frontend (React)
| Technology | Purpose |
|------------|---------|
| React 19 | UI Library |
| React Router v7 | Client-side Routing |
| TanStack Query | Server State Management |
| Zustand | Client State Management |
| Tailwind CSS | Styling |
| Headless UI | Accessible Components |
| Recharts | Charts & Analytics |
| Framer Motion | Animations |
| Swagger UI React | API Documentation |

### RAG Service (Python)
| Technology | Purpose |
|------------|---------|
| Python 3.11+ | Programming Language |
| FastAPI | Web Framework |
| LangChain | LLM Orchestration |
| OpenAI GPT-4 | Language Model |
| PostgreSQL + pgvector | Vector Database |

### DevOps & Tools
| Technology | Purpose |
|------------|---------|
| n8n | Workflow Automation |
| Vite | Frontend Build Tool |
| Composer | PHP Dependency Manager |
| npm | Node.js Package Manager |

---

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **PHP** 8.2 or higher
- **Composer** 2.x
- **Node.js** 18+ and npm
- **MySQL** 8.0+
- **Python** 3.11+ (for RAG service)
- **Git**

Optional:
- **Docker** (for containerized setup)
- **n8n** (for workflow automation)

---

## 🚀 Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/your-repo/ITI-Graduation-Project.git
cd ITI-Graduation-Project
```

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   Edit `.env` and set:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=hotel_service
   DB_USERNAME=your_username
   DB_PASSWORD=your_password

   # RAG Service Configuration
   RAG_API_URL=http://localhost:8000
   RAG_KNOWLEDGE_PATH=/path/to/Hotel_Service_Project/hotel-rag-backend/hotel_knowledge
   ```

5. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

6. **Create database:**
   ```bash
   mysql -u root -p -e "CREATE DATABASE hotel_service;"
   ```

7. **Run migrations:**
   ```bash
   php artisan migrate
   ```

8. **Seed the database (optional):**
   ```bash
   php artisan db:seed
   ```

9. **Create storage link:**
   ```bash
   php artisan storage:link
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

### RAG Service Setup

1. **Navigate to RAG backend directory:**
   ```bash
   cd Hotel_Service_Project/hotel-rag-backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   Create `.env` file:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   DATABASE_URL=postgresql://user:password@localhost:5432/hotel_rag
   ```

5. **Initialize the database:**
   ```bash
   python -c "from app.db import init_db; init_db()"
   ```

6. **Ingest knowledge documents:**
   ```bash
   python -m app.ingest
   ```

---

## ▶️ Running the Application

### Start All Services

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve --port=8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - RAG Service (if using):**
```bash
cd Hotel_Service_Project/hotel-rag-backend
source venv/bin/activate
uvicorn app.main:app --reload --port=8001
```

### Access the Application

| Service | URL |
|---------|-----|
| Frontend (Admin/Staff Panel) | http://localhost:5173 |
| Backend API | http://localhost:8000/api |
| API Documentation | http://localhost:5173/docs |
| RAG Service | http://localhost:8001 |

### Default Login Credentials

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hotel.com | password |
| Manager | manager@hotel.com | password |
| Staff | staff@hotel.com | password |

---

## 📚 API Documentation

The API is fully documented using OpenAPI 3.0 (Swagger) specification.

### Viewing Documentation

1. **Via Frontend**: Navigate to http://localhost:5173/docs
2. **Raw YAML**: Access http://localhost:8000/api/docs (local environment only)
3. **File**: See `backend/swagger.yaml`

### API Endpoints Overview

| Category | Endpoints |
|----------|-----------|
| Authentication | Login, Logout, Password Reset, Invite |
| Staff Users | CRUD, Activate/Deactivate, Roles |
| Guests | List, Details |
| Conversations | CRUD, Status, Handoff, Close |
| Messages | List, Send |
| Tickets | CRUD, Status, Assign, Escalate, Rate |
| Rooms | CRUD |
| Departments | CRUD, Deactivate |
| Channels | CRUD (Telegram, WhatsApp, Web) |
| QR Tokens | Issue, Revoke, Resolve |
| SLA Policies | CRUD, Breach Detection |
| Routing Rules | CRUD |
| Dashboard | Metrics, Reports |
| Knowledge Base | Upload, Process, Delete |
| Integrations | n8n Endpoints |

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage
```

### Frontend Tests

```bash
cd frontend

# Run linting
npm run lint

# Build for production (validates build)
npm run build
```

### API Testing with Postman

1. Import the Postman collection: `backend/postman_collection.json`
2. Set up environment variables for `base_url` and `token`
3. Run the collection

### Manual Testing Checklist

- [ ] Login with different roles (Admin, Manager, Staff)
- [ ] Create and manage tickets
- [ ] Test conversation handoff
- [ ] Generate and scan QR codes
- [ ] Upload knowledge documents
- [ ] Verify SLA breach detection
- [ ] Test real-time updates on dashboard

---

## 🔧 Environment Variables

### Backend (.env)

```env
# Application
APP_NAME="Hotel Service"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hotel_service
DB_USERNAME=root
DB_PASSWORD=

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:5173

# Mail (for password reset, invitations)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=

# RAG Service
RAG_API_URL=http://localhost:8001
RAG_KNOWLEDGE_PATH=/path/to/hotel_knowledge

# Telegram (for proactive messaging)
TELEGRAM_BOT_TOKEN=your_bot_token
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

### RAG Service (.env)

```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/hotel_rag
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4-turbo-preview
```

---

## 🔒 Security Considerations

- All API endpoints use Laravel Sanctum for authentication
- Passwords are hashed using bcrypt
- CORS is configured for allowed origins
- Rate limiting is applied to authentication endpoints
- Input validation on all requests
- Role-based access control (RBAC)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is developed as part of the ITI Graduation Project and is for educational purposes.

---

## 🙏 Acknowledgments

- Information Technology Institute (ITI)
- Laravel Community
- React Community
- OpenAI for GPT models
- All open-source contributors

---

<p align="center">
  Made with ❤️ by ITI Graduation Project Group 2
</p>
