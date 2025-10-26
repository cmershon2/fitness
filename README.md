# Fitness Tracker App 🏋️

A self-hosted Progressive Web Application (PWA) for comprehensive fitness tracking, including workouts, nutrition, hydration, and weight management.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Docker Deployment](#docker-deployment)
- [Database Management](#database-management)
- [PWA Installation](#pwa-installation)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [License](#license)

## ✨ Features

### Core Tracking

- **Weight Tracking**: Log and visualize weight progress over time
- **Exercise Management**: Create and manage custom exercises with muscle group categorization
- **Workout Templates**: Build reusable workout routines
- **Workout Execution**: Schedule workouts and log sets with actual performance data
- **Food Database**: Manual food entry and barcode scanning integration with Open Food Facts API
- **Diet Tracking**: Log meals by category (breakfast, lunch, snack, dinner) with calorie tracking
- **Water Intake**: Track daily hydration with customizable goals and progress indicators
- **Daily Reports**: Generate markdown reports with all tracked data for any date

### User Experience

- **Progressive Web App**: Install on mobile devices for native app-like experience
- **Offline Functionality**: Continue tracking even without internet connection
- **Google OAuth**: Quick sign-in with Google account
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark Mode Support**: Comfortable viewing in any lighting condition
- **Data Export**: Export all your data in JSON format

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19
- **UI**: ShadCN UI, Tailwind CSS, Lucide Icons
- **Authentication**: Better Auth (Credentials + Google OAuth)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Barcode Scanning**: barcode-detector library
- **Charts**: Recharts
- **Deployment**: Docker + Docker Compose

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20.x or higher
- npm or bun package manager
- PostgreSQL 16.x (or use Docker)
- Docker and Docker Compose (for containerized deployment)
- Git

## 🚀 Installation

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fitness-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your configuration (see [Configuration](#configuration))

4. **Set up the database**

   ```bash
   # Run Prisma migrations
   bunx prisma migrate deploy

   # Generate Prisma Client
   bunx prisma generate
   ```

5. **Start the development server**

   ```bash
   npm run dev
   # or
   bun dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fitness_tracker?schema=public"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here-minimum-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env` file

### Generating BETTER_AUTH_SECRET

```bash
# Generate a secure random secret
openssl rand -base64 32
```

## 💾 Database Management

### Manual Database Operations

```bash
# Access database container
docker exec -it fitness-tracker-db psql -U fitnessuser -d fitness_tracker

# Run migrations manually
docker exec -it fitness-tracker-app npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
docker exec -it fitness-tracker-app npx prisma migrate reset
```

### Migrations

```bash
# Create a new migration
bunx prisma migrate dev --name description_of_changes

# Apply migrations in production
bunx prisma migrate deploy

# View migration status
bunx prisma migrate status
```

## 📱 PWA Installation

### Android (Chrome)

1. Open the app in Chrome
2. Tap the menu (three dots) → "Install app" or "Add to Home Screen"
3. Follow the prompts

### iOS (Safari)

1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Name the app and tap "Add"

### Desktop (Chrome/Edge)

1. Look for the install icon in the address bar
2. Click "Install"
3. The app will open in a standalone window

## 📖 Usage Guide

### Getting Started

1. **Create an account** or sign in with Google
2. **Set up your profile** in Settings
3. **Add exercises** to your library
4. **Create workout templates** for your routine
5. **Start tracking** your fitness journey!

### Weight Tracking

- Log your weight from the Weight page
- View progress on the chart
- Edit or delete entries as needed

### Workout Management

1. **Create Exercises**:
   - Navigate to Exercises
   - Add custom exercises with muscle group tags
2. **Build Templates**:
   - Go to Workouts → Templates
   - Create reusable workout routines
   - Add exercises and set target sets/reps
3. **Schedule & Execute**:
   - Schedule templates for specific dates
   - During workout, log actual performance
   - Mark workouts as complete

### Diet Tracking

1. **Add Foods**:
   - Manual entry: Add name and nutritional info
   - Barcode scan: Use camera to scan product barcodes
2. **Log Meals**:
   - Select meal category
   - Choose foods and servings
   - Track daily calorie intake

### Water Tracking

- Set daily water goal
- Log water intake throughout the day
- Monitor progress with visual indicators

### Reports

Generate daily markdown reports containing:

- Weight entry
- Completed workouts with sets
- Diet breakdown by meal
- Water intake progress

Reports can be downloaded and shared.

## 📡 API Documentation

### Health Check

```
GET /api/health
```

Returns server health status and database connectivity.

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/callback/google` - Google OAuth callback
- `POST /api/auth/logout` - Logout current user

### Weight

- `GET /api/weight` - Get all weight entries
- `POST /api/weight` - Create weight entry
- `PUT /api/weight/:id` - Update weight entry
- `DELETE /api/weight/:id` - Delete weight entry

### Exercises

- `GET /api/exercises` - Get all exercises
- `POST /api/exercises` - Create exercise
- `PUT /api/exercises/:id` - Update exercise
- `DELETE /api/exercises/:id` - Delete exercise

### Workouts

- `GET /api/workouts/templates` - Get workout templates
- `POST /api/workouts/templates` - Create template
- `GET /api/workouts/instances` - Get scheduled workouts
- `POST /api/workouts/instances` - Schedule workout
- `POST /api/workouts/sets` - Log exercise set

### Diet

- `GET /api/foods` - Get food library
- `POST /api/foods` - Create food entry
- `GET /api/diet` - Get diet entries
- `POST /api/diet` - Log meal

### Water

- `GET /api/water` - Get water entries
- `POST /api/water` - Log water intake
- `GET /api/water/goal` - Get water goal
- `PUT /api/water/goal` - Update water goal

### Reports

- `POST /api/reports/generate` - Generate daily report

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check if database container is running
docker ps | grep fitness-tracker-db

# Check database logs
docker logs fitness-tracker-db

# Verify DATABASE_URL in .env
```

#### Application Won't Start

```bash
# Check application logs
docker logs fitness-tracker-app

# Verify all environment variables are set
cat .env

# Rebuild the container
docker-compose up -d --build
```

#### Barcode Scanner Not Working

- Ensure HTTPS is enabled (required for camera access)
- Grant camera permissions in browser
- Test on a different device
- Use manual entry as fallback

#### PWA Won't Install

- Clear browser cache
- Verify manifest.json is accessible: `/manifest.json`
- Check for service worker errors in browser console
- Ensure app is served over HTTPS (except localhost)

#### Migrations Fail

```bash
# Reset database (WARNING: deletes all data)
bunx prisma migrate reset

# If in Docker:
docker exec -it fitness-tracker-app bunx prisma migrate reset
```

### Logs

View application logs:

```bash
# Docker
docker-compose logs -f app

# Docker (database)
docker-compose logs -f db

# Local development
# Check terminal where npm run dev is running
```

### Performance Issues

- Check database query performance
- Verify proper indexes are in place
- Monitor Docker container resources: `docker stats`
- Consider increasing Docker memory limit

## 💻 Development

### Project Structure

```
fitness-tracker/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   └── ...               # Feature components
├── lib/                   # Utility functions
│   ├── auth.ts           # Better Auth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   └── migrations/       # Migration files
├── public/               # Static assets
│   ├── icons/           # PWA icons
│   └── manifest.json    # PWA manifest
├── scripts/              # Utility scripts
│   ├── backup-db.sh     # Database backup
│   └── restore-db.sh    # Database restore
├── docker-compose.yml    # Docker orchestration
├── Dockerfile           # Application container
└── next.config.js       # Next.js configuration
```

### Running Tests

```bash
# Run linting
bun lint

# Type checking
bunx tsc --noEmit
```

### Code Style

This project uses:

- ESLint for code linting
- Prettier for code formatting (if configured)
- TypeScript for type safety

### Adding New Features

1. Create database models in `prisma/schema.prisma`
2. Run migrations: `npx prisma migrate dev`
3. Create API routes in `app/api/`
4. Build UI components in `components/`
5. Create pages in `app/(dashboard)/`
6. Test thoroughly before deploying

## 🔒 Security Considerations

- All passwords are hashed using Better Auth
- HTTPS is required for production deployment
- Environment variables contain sensitive data - never commit `.env`
- Database backups should be encrypted and stored securely
- Regular security updates recommended
- Implement rate limiting on API endpoints for production

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Better Auth for authentication solution
- ShadCN for beautiful UI components
- Open Food Facts for nutrition data
- All open-source contributors

## 📞 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check the [Troubleshooting](#troubleshooting) section
- Review existing issues for solutions
