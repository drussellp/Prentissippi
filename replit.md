# Prentissippi - Golf Tournament Scoring System

## Overview

This is a comprehensive golf tournament management platform built with React and Express.js. The application provides real-time tournament management with live scoring, leaderboards, player management, and extensive statistical tracking capabilities. It features a responsive design optimized for both mobile and desktop use, making it ideal for on-course scoring, spectator viewing, and long-term performance analysis. The system supports multiple courses, tournament formats, and maintains detailed historical data for players and courses.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom golf-themed design system
- **State Management**: React Query for server state management
- **Routing**: Wouter for client-side routing
- **Real-time Updates**: WebSocket connection for live score updates

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Real-time Communication**: WebSocket Server for live updates
- **API Design**: RESTful API with real-time WebSocket enhancements

### Database Design
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Tables**: tournaments, players, rounds, scores
- **Relationships**: Foreign key relationships between entities
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Core Entities
1. **Tournament**: Main tournament with metadata (name, dates, course, par, location, type)
2. **Player**: Tournament participants with handicap information
3. **Round**: Individual rounds played by players
4. **Score**: Hole-by-hole scores for each round
5. **Player Statistics**: Detailed round-level performance metrics
6. **Career Statistics**: Lifetime aggregated player performance data
7. **Course Statistics**: Course difficulty and performance analytics
8. **Tournament History**: Historical tournament performance tracking

### User Interface Components
- **Leaderboard**: Real-time tournament standings with gross/net scoring
- **Score Entry**: Mobile-optimized score input interface with GPS integration
- **Player Management**: Add and manage tournament participants
- **Results**: Tournament results and comprehensive statistics
- **Player Statistics**: Detailed performance analytics with charts and trends
- **Tournament Setup**: Multi-course tournament creation and management
- **Navigation**: Tab-based navigation with mobile bottom bar

### Real-time Features
- **Live Updates**: WebSocket-based real-time score updates
- **Automatic Refresh**: Query invalidation on score changes
- **Connection Management**: Auto-reconnection with error handling

## Data Flow

1. **Tournament Creation**: Admin creates tournament with basic parameters
2. **Player Registration**: Players are added to the tournament with handicaps
3. **Round Management**: System tracks current round and player progress
4. **Score Entry**: Scores are entered hole-by-hole via mobile interface
5. **Live Updates**: WebSocket broadcasts score changes to all connected clients
6. **Leaderboard Calculation**: Real-time calculation of standings with gross/net scores

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography
- **Styling**: Tailwind CSS with custom golf theme

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: Drizzle ORM for type-safe database operations
- **WebSocket**: ws library for real-time communication
- **Session Management**: connect-pg-simple for session storage

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Neon serverless PostgreSQL
- **Real-time**: WebSocket server integrated with Express

### Production Build
- **Frontend**: Vite build to static assets
- **Backend**: esbuild compilation to optimized bundle
- **Database**: PostgreSQL migrations via Drizzle Kit
- **Deployment**: Single server deployment with static file serving

### Environment Configuration
- **Database**: DATABASE_URL environment variable
- **Development**: NODE_ENV-based configuration
- **Replit Integration**: Special handling for Replit environment

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
- July 04, 2025. Updated to Dancing Rabbit Golf Club with Azaleas and Oaks courses
- July 04, 2025. Added scorecard interface with start round functionality
- July 04, 2025. Implemented hole-by-hole score entry system
- July 04, 2025. Added skins game calculation with gross and net scoring
- July 04, 2025. Added Stableford and Modified Stableford point systems
- July 04, 2025. Implemented GPS distance tracking for course navigation
- July 04, 2025. Added comprehensive statistics tracking system for players and courses
- July 04, 2025. Created tournament management system for multi-course support
- July 04, 2025. Implemented career statistics, performance analytics, and historical tracking
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```