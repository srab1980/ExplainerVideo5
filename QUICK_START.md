# Quick Start Guide

Get up and running in 5 minutes! 🚀

## Prerequisites Checklist

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] PostgreSQL installed or cloud database account ([Railway](https://railway.app/), [Supabase](https://supabase.com/), or [Neon](https://neon.tech/))
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## 1️⃣ Clone & Install (2 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Install dependencies
npm install
```

## 2️⃣ Database Setup (2 minutes)

### Option A: Automated Setup (Recommended)
```bash
npm run db:setup
```

Follow the prompts to configure your database.

### Option B: Manual Setup
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your database URL
# nano .env  # or use your preferred editor

# Run migrations
npx prisma migrate dev

# Seed database with demo data
npm run db:seed
```

## 3️⃣ Start Development Server (30 seconds)

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 4️⃣ Test Login (30 seconds)

Use these demo credentials:
- **Email**: `admin@example.com`
- **Password**: `password123`

Alternative accounts:
- `user@example.com` / `password123`
- `test@example.com` / `password123`

---

## 🎉 You're Ready!

### What's Next?

1. **Explore the app**
   - Dashboard
   - Task management
   - User management
   - Settings

2. **View the database**
   ```bash
   npm run db:studio
   ```
   Opens Prisma Studio at http://localhost:5555

3. **Run tests**
   ```bash
   npm test
   ```

4. **Read the documentation**
   - [README.md](./README.md) - Full feature list
   - [NEXT_STEPS.md](./NEXT_STEPS.md) - Development roadmap
   - [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Implementation details
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute

---

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Database connection error
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify database credentials

### Migration errors
```bash
# Reset database (development only!)
npm run db:reset
```

### Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:studio        # Open database GUI
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:reset         # Reset database

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run type-check       # Check TypeScript types
npm run lint             # Run linter
```

---

## 🆘 Need Help?

- Check the [README.md](./README.md)
- Read [CONTRIBUTING.md](./CONTRIBUTING.md)
- Open an issue on GitHub
- Check existing issues and discussions

---

**Happy coding! 🎉**
