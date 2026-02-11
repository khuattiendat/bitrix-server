# 🚀 NestJS Base Project

A modern, production-ready base project built with **NestJS** framework, featuring **TypeORM** for robust database
management and **JWT** authentication for secure user sessions.

## 📋 Table of Contents

- [📋 Table of Contents](#-table-of-contents)
- [✅ Prerequisites](#-prerequisites)
- [⚡ Installation](#-installation)
- [🏃‍♂️ Running the App](#️-running-the-app)
- [🗃️ Database Migrations](#️-database-migrations)
- [🧪 Testing](#-testing)
- [📜 Available Scripts](#-available-scripts)
- [🔧 Key Dependencies](#-key-dependencies)

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** `v20+` - JavaScript runtime environment
- **Yarn** - Package manager (this project uses `yarn`)
- **MySQL** - Database server instance

## Installation

1. Clone this repository.
2. Install the dependencies using `yarn`:

```bash
yarn install
```

3. Create a `.env` file in the project root and configure your environment variables:

```env
# Database Configuration
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=your_database_name
NODE_ENV=development
# JWT Configuration
JWT_SECRET=your_super_secret_key
```

## 🏃‍♂️ Running the App

### 🔥 Development Mode

Start the application with hot-reload for development:

```bash
yarn dev
```

The server will start on `http://localhost:3000` (or your configured PORT)

### 🚀 Production Mode

Build and run the optimized application:

```bash
# Build the application
yarn build

# Start in production mode
yarn start:prod
```

## 🗃️ Database Migrations

This project uses **TypeORM** for seamless database schema management.

### Creating Migrations

**Generate empty migration file:**

**Auto-generate migration from entity changes:**

```bash
yarn typeorm -- migration:generate src/database/migrations/[name]
```

> This compares your entities with the current database schema and creates the necessary changes.

### Running Migrations

**Execute all pending migrations:**

```bash
yarn migration:run
```

**seed data**

```bashyarn seed
yarn seed
```

> ⚠️ **Warning**: Always backup your database before running migrations in production!

## 🧪 Testing

Comprehensive testing suite powered by Jest:

```bash
# Run all tests
yarn test

# Run tests with file watching
yarn test:watch

# Generate coverage report
yarn test:cov

# Run end-to-end tests
yarn test:e2e
```

> 📊 **Coverage reports** are generated in the `coverage/` directory

## Scripts

This project provides several convenient scripts:

| Command            | Description                                                                    |
| ------------------ | ------------------------------------------------------------------------------ |
| `yarn build`       | Compiles TypeScript code into JavaScript.                                      |
| `yarn format`      | Formats the source code with Prettier.                                         |
| `yarn start:dev`   | Runs the application in development mode with file watching.                   |
| `yarn start:prod`  | Runs the compiled application in production mode.                              |
| `yarn migration:*` | Commands for creating, generating, running, and reverting database migrations. |
| `yarn lint`        | Lints the source code and automatically fixes issues.                          |
| `yarn test:*`      | Commands for running various types of tests.                                   |

## 🔧 Key Dependencies

### Core Framework

- **NestJS** (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) - Progressive Node.js framework
- **TypeScript** - Strongly typed JavaScript

### Database & ORM

- **TypeORM** (`@nestjs/typeorm`, `typeorm`) - Object-Relational Mapping for TypeScript
- **MySQL** - Relational database system

### Authentication & Security

- **JWT** (`@nestjs/jwt`, `passport-jwt`) - JSON Web Token implementation
- **bcrypt** - Password hashing library
- **Passport** - Authentication middleware

### Validation & Transformation

- **class-validator** - Decorator-based validation
- **class-transformer** - Object transformation utilities

### Development Tools

- **Jest** - Testing framework
- **Prettier** - Code formatting
- **ESLint** - Code linting

---

---

⭐ **Star this repository if you found it helpful!**
⭐ **Star this repository if you found it helpful!**
