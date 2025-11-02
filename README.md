# Nexify

**AI-Powered Campaign Management Platform**

A full-stack application for tracking and analyzing advertising campaign performance with interactive dashboards and AI-powered insights.

[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Symfony](https://img.shields.io/badge/Symfony-7.3-000000?style=flat-square&logo=symfony)](https://symfony.com/)

---

## 📸 Screenshots

### 📊 Dashboard Overview
![Dashboard Overview](./screenshots/Screenshot%202025-10-18%20175653.png)

The main dashboard provides a comprehensive view of your campaigns performance with key metrics including total revenue, active campaigns, affiliate count, conversions, and conversion rates. Interactive charts display revenue trends and performance data over time, helping you monitor campaign effectiveness and identify opportunities for optimization.

---

### 📋 Campaign Management
![Campaign List](./screenshots/Screenshot%202025-10-18%20175713.png)

View campaign performance metrics directly from the dashboard. Track budget allocation, revenue generation, and ROI percentages for each campaign. Filter campaigns by date range and search by campaign name to focus on specific performance data.

---

### 🤖 AI Assistant
![AI Chatbot](./screenshots/Screenshot%202025-10-18%20180909.png)

Ask questions about your campaigns in natural language and receive AI-powered responses. The assistant analyzes your campaign data and provides insights, recommendations, and answers to specific queries about performance and optimization.

---

### 🎯 Campaign Details
![Campaign Detail](./screenshots/Screenshot%202025-10-18%20181143.png)

Access detailed campaign analytics including budget usage, revenue generation, ROI percentages, and associated affiliates. Each campaign's data is aggregated and visualized to provide clear insights into performance metrics.

---

### 👥 Affiliate Overview
![Affiliates List](./screenshots/Screenshot%202025-10-18%20181246.png)

Track affiliate partnerships and their campaign associations. View affiliate information and monitor overall affiliate engagement across your campaigns.

---

## ✨ Features

- **Campaign Analytics** - Track revenue, ROI, and performance metrics
- **Real-Time Dashboard** - Monitor campaign performance with interactive charts
- **AI Assistant** - Get insights and recommendations through natural language queries
- **Affiliate Tracking** - Monitor affiliate partnerships and associations
- **Performance Visualization** - View trends and analytics with charts and graphs

## 🛠 Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Recharts

**Backend:**
- Symfony 7.3
- API Platform 4.2
- Doctrine ORM 3.5
- PostgreSQL 16
- Redis 7
- PHP 8.2

**Infrastructure:**
- Docker & Docker Compose

## 🚀 Getting Started

### Prerequisites
- Docker Desktop
- Git
- 8GB RAM minimum

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ouchajaaamine/Nexify.git
cd Nexify
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your OpenRouter API token (optional, for AI features):
```env
OPENROUTER_TOKEN=your_token_here
```

3. Start the application:
```bash
docker compose up --build
```

The startup process will initialize the database, run migrations, and load sample data.

## 🌐 Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| SWAGGER Documentation | http://localhost:8000/api/docs |
| Dashboard | http://localhost:3000/dashboard |
| Database | localhost:5432 (user: `app`, password: `app`) |

## 💻 Development

### Basic Commands
```bash
# Stop services
docker compose down

# Rebuild and restart
docker compose up --build

# Start in background
docker compose up -d

# View logs
docker compose logs -f app
docker compose logs -f frontend

# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up --build
```

### Container Access
```bash
# Backend shell
docker compose exec app sh

# Frontend shell
docker compose exec frontend sh
```

## ✅ Testing & Code quality

We keep things simple: small PHPDoc comments were added in the backend to explain purpose and types, PHPStan is set up for lightweight static checks, and PHPUnit runs the unit tests.

Quick commands (run from the `backend` folder):
```powershell
# static analysis
vendor\bin\phpstan analyse

# run tests
vendor\bin\phpunit
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📁 Project Structure

```
Nexify/
├── backend/                 # Symfony API application
│   ├── src/                # PHP source code
│   ├── config/             # Symfony configuration
│   ├── migrations/         # Database migrations
│   ├── public/             # Web assets
│   └── composer.json       # PHP dependencies
├── frontend/               # Next.js application
│   ├── app/                # Next.js app router
│   ├── components/         # React components
│   ├── lib/                # Utilities and API client
│   └── package.json        # Node dependencies
├── screenshots/            # Application screenshots
├── docker-compose.yml      # Docker orchestration
└── .env                    # Environment variables
```

---

## 📝 Disclaimer

This project was developed as part of my learning journey, with AI tools used only to help me understand concepts, debug issues, and improve my development approach.