# Developer Checklist

Use this checklist for common development tasks to ensure nothing is missed.

---

## 🆕 Starting a New Feature

- [ ] Review [NEXT_STEPS.md](./NEXT_STEPS.md) to understand where this fits
- [ ] Create GitHub issue using feature template
- [ ] Create feature branch: `git checkout -b feature/feature-name`
- [ ] Update [ROADMAP_TASKS.md](./ROADMAP_TASKS.md) to mark task as "In Progress"

---

## ✍️ While Coding

### Code Quality
- [ ] Follow TypeScript best practices (explicit types, no `any`)
- [ ] Use existing patterns and conventions
- [ ] Keep functions small and focused
- [ ] Add JSDoc comments for complex logic only
- [ ] Use meaningful variable and function names
- [ ] Extract magic numbers/strings to constants

### Component Development
- [ ] Create TypeScript interface for component props
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Add loading skeletons where appropriate
- [ ] Ensure responsive design (mobile, tablet, desktop)
- [ ] Add proper ARIA labels for accessibility
- [ ] Test keyboard navigation

### API Development
- [ ] Use proper HTTP methods (GET, POST, PUT, DELETE)
- [ ] Validate input with Zod schemas (from `lib/validation.ts`)
- [ ] Use database utilities from `lib/db.ts`
- [ ] Return consistent response format
- [ ] Add proper error handling
- [ ] Add request/response logging
- [ ] Consider rate limiting
- [ ] Test with invalid data

### Database Changes
- [ ] Update Prisma schema (`prisma/schema.prisma`)
- [ ] Create migration: `npx prisma migrate dev --name descriptive_name`
- [ ] Update database utilities in `lib/db.ts`
- [ ] Update seed script if needed (`prisma/seed.ts`)
- [ ] Test migration rollback capability
- [ ] Add appropriate indexes

---

## 🧪 Testing

- [ ] Write unit tests for new components
- [ ] Write unit tests for new utility functions
- [ ] Write integration tests for API routes
- [ ] Write E2E tests for critical user flows
- [ ] Run tests locally: `npm test`
- [ ] Check test coverage
- [ ] Test error scenarios
- [ ] Test edge cases (empty states, large data, etc.)

### Test Checklist per Component
- [ ] Renders without crashing
- [ ] Renders with different prop combinations
- [ ] Handles user interactions correctly
- [ ] Shows loading states
- [ ] Shows error states
- [ ] Accessible (screen reader friendly)

---

## 📝 Documentation

- [ ] Update README.md if adding major feature
- [ ] Add JSDoc comments for public API functions
- [ ] Update [ROADMAP_TASKS.md](./ROADMAP_TASKS.md) when task complete
- [ ] Document breaking changes clearly
- [ ] Add code examples for complex features
- [ ] Update .env.example if adding environment variables

---

## 🔍 Before Committing

- [ ] Run type check: `npm run type-check`
- [ ] Run linter: `npm run lint`
- [ ] Run all tests: `npm test`
- [ ] Run format (if using Prettier): `npm run format`
- [ ] Remove console.logs and debugger statements
- [ ] Remove commented-out code
- [ ] Check for sensitive data (API keys, passwords)
- [ ] Review your changes: `git diff`

---

## 💬 Committing

- [ ] Stage only related changes
- [ ] Write descriptive commit message using conventional commits:
  - `feat(scope): add new feature`
  - `fix(scope): fix bug`
  - `docs(scope): update documentation`
  - `test(scope): add tests`
  - `refactor(scope): refactor code`
  - `style(scope): format code`
  - `chore(scope): update dependencies`
- [ ] Keep commits atomic (one logical change per commit)
- [ ] Reference issue number if applicable: `feat(auth): add 2FA (#123)`

---

## 🚀 Creating a Pull Request

### Before Creating PR
- [ ] Ensure branch is up to date with main: `git pull origin main`
- [ ] Resolve any merge conflicts
- [ ] All tests pass locally
- [ ] No TypeScript errors
- [ ] No linting errors

### PR Description
- [ ] Use PR template
- [ ] Write clear description of changes
- [ ] Link related issues
- [ ] Add screenshots for UI changes
- [ ] List breaking changes (if any)
- [ ] Describe testing performed

### PR Checklist
- [ ] Title follows conventional commit format
- [ ] Appropriate labels added
- [ ] Reviewers assigned
- [ ] CI checks passing
- [ ] No merge conflicts
- [ ] Documentation updated
- [ ] Tests added/updated

---

## 🐛 Bug Fix Checklist

- [ ] Reproduce the bug
- [ ] Write a failing test that demonstrates the bug
- [ ] Fix the bug
- [ ] Verify the test now passes
- [ ] Check for similar bugs elsewhere
- [ ] Update documentation if behavior changed
- [ ] Add regression test

---

## 🔄 Code Review Checklist (Reviewer)

### Code Quality
- [ ] Code follows project conventions
- [ ] No unnecessary complexity
- [ ] No code duplication
- [ ] Proper error handling
- [ ] No security vulnerabilities
- [ ] No performance issues

### Testing
- [ ] Tests are comprehensive
- [ ] Tests are meaningful (not just for coverage)
- [ ] Edge cases covered
- [ ] Error scenarios tested

### Documentation
- [ ] Code is self-documenting or has comments
- [ ] API changes documented
- [ ] Breaking changes clearly marked
- [ ] README updated if needed

### Functionality
- [ ] Feature works as described
- [ ] No regressions introduced
- [ ] UI/UX is intuitive
- [ ] Responsive on different screen sizes
- [ ] Accessible

---

## 🎉 After PR Merge

- [ ] Delete feature branch: `git branch -d feature/feature-name`
- [ ] Update [ROADMAP_TASKS.md](./ROADMAP_TASKS.md) to mark task as complete
- [ ] Close related issues
- [ ] Update project board (if using)
- [ ] Announce feature in team chat/changelog
- [ ] Monitor production for issues

---

## 🔄 Refactoring Checklist

- [ ] Understand existing code thoroughly
- [ ] Write tests for current behavior (if missing)
- [ ] Make incremental changes
- [ ] Run tests after each change
- [ ] Keep commits small and focused
- [ ] Document why refactoring was needed
- [ ] No functional changes mixed with refactoring

---

## 🚢 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Backup database
- [ ] Review deployment plan
- [ ] Notify team of deployment

### Deployment
- [ ] Run database migrations
- [ ] Deploy application
- [ ] Verify deployment successful
- [ ] Test critical paths in production
- [ ] Monitor error rates
- [ ] Monitor performance metrics

### Post-Deployment
- [ ] Verify all features working
- [ ] Check error logs
- [ ] Monitor user feedback
- [ ] Be ready to rollback if needed
- [ ] Update documentation with deployment date
- [ ] Create release notes

---

## 🔒 Security Checklist

- [ ] No hardcoded secrets
- [ ] Input validation on all user inputs
- [ ] Output sanitization to prevent XSS
- [ ] SQL injection prevention (use Prisma parameterized queries)
- [ ] CSRF protection enabled
- [ ] Secure authentication (hashed passwords, JWT)
- [ ] Rate limiting on sensitive endpoints
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Dependencies up to date (no critical vulnerabilities)

---

## 🎯 Performance Checklist

- [ ] Images optimized (use Next.js Image component)
- [ ] Lazy load components when appropriate
- [ ] Implement code splitting
- [ ] Database queries optimized (proper indexes)
- [ ] No N+1 query problems
- [ ] API responses cached when appropriate
- [ ] Bundle size acceptable
- [ ] Lighthouse score > 90

---

## ♿ Accessibility Checklist

- [ ] All images have alt text
- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels on interactive elements
- [ ] Form inputs have labels
- [ ] Error messages are clear and associated with fields
- [ ] No flashing content

---

## 📱 Responsive Design Checklist

- [ ] Test on mobile (320px - 767px)
- [ ] Test on tablet (768px - 1023px)
- [ ] Test on desktop (1024px+)
- [ ] Touch targets large enough (min 44x44px)
- [ ] Text readable on all devices
- [ ] No horizontal scrolling
- [ ] Navigation works on mobile
- [ ] Forms are mobile-friendly

---

## 🎨 UI/UX Checklist

- [ ] Consistent spacing and alignment
- [ ] Loading states for async operations
- [ ] Empty states designed and implemented
- [ ] Error states helpful and actionable
- [ ] Success feedback provided
- [ ] Intuitive navigation
- [ ] Consistent button styles
- [ ] Hover/active states on interactive elements
- [ ] Tooltips for complex features
- [ ] Confirmation for destructive actions

---

## 📊 Monitoring Checklist

- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring enabled
- [ ] User analytics tracking important events
- [ ] Logging structured and searchable
- [ ] Alerts configured for critical errors
- [ ] Dashboard for key metrics

---

## 🔧 Maintenance Checklist (Monthly)

- [ ] Review and update dependencies
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Review and close stale issues
- [ ] Review and update documentation
- [ ] Clean up old branches
- [ ] Review error logs
- [ ] Optimize database (vacuum, reindex)
- [ ] Review performance metrics
- [ ] Update roadmap based on feedback

---

**Remember**: Quality over speed. It's better to do it right than to do it fast!
