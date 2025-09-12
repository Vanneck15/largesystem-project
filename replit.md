# ERP System

## Overview

This is a comprehensive Enterprise Resource Planning (ERP) system built with React, TypeScript, and Node.js. The application provides a full-stack solution for managing academic institutions, including modules for academics (courses, exams, transcripts), finance (invoices, payments, expenses), and human resources (employees, payroll, performance tracking). The system features role-based authentication, data visualization capabilities, and a modern shadcn/ui component library for the frontend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state and caching
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Middleware**: Custom authentication, logging, and error handling middleware
- **API Design**: RESTful API endpoints with role-based access control

### Data Storage
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive ERP schema covering users, academics, finance, and HR modules
- **Migrations**: Drizzle Kit for schema migrations and database management

### Authentication & Authorization
- **Strategy**: JWT tokens with role-based access control (admin, staff, student)
- **Security**: Bcrypt password hashing with salt rounds
- **Session Management**: Token-based authentication with localStorage persistence
- **Route Protection**: Middleware-based authentication for protected endpoints

### Component Architecture
- **Design System**: shadcn/ui with consistent styling and behavior
- **Form Handling**: React Hook Form with Zod validation
- **Data Visualization**: Recharts for charts and graphs
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA compliance through Radix UI primitives

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection and querying
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **bcryptjs**: Password hashing and comparison
- **jsonwebtoken**: JWT token generation and verification

### UI & Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utilities
- **recharts**: Data visualization and charting library

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **drizzle-kit**: Database schema management and migrations
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

### Form & Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation and type inference

The system is designed for scalability and maintainability, with clear separation of concerns between frontend and backend, comprehensive type safety, and modern development practices.