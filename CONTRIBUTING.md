# Contributing to Enhanced Next.js Application

Thank you for your interest in contributing! This guide will help you get started.

## 📋 Table of Contents
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm, yarn, or pnpm
- PostgreSQL (local or cloud)
- Git

### Initial Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/repository-name.git
   cd repository-name
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Database**
   ```bash
   npm run db:setup
   ```
   
   Or manually:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   npx prisma migrate dev
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Verify Setup**
   - Open http://localhost:3000
   - Run tests: `npm test`
   - Run type check: `npm run type-check`

---

## 🔄 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, self-documenting code
- Follow existing patterns and conventions
- Add comments for complex logic only
- Keep functions small and focused
- Update types as needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

### 4. Commit Your Changes

See [Commit Guidelines](#commit-guidelines) below.

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## 📝 Code Standards

### TypeScript

- **Always use TypeScript** - No JavaScript files
- **Explicit types** for function parameters and returns
- **Interfaces over types** for object shapes
- **Avoid `any`** - Use `unknown` if type is truly unknown

Example:
```typescript
// ✅ Good
interface UserData {
  id: string;
  email: string;
  name?: string;
}

async function getUser(id: string): Promise<UserData> {
  // ...
}

// ❌ Bad
function getUser(id: any): any {
  // ...
}
```

### React Components

- **Functional components only** - No class components
- **TypeScript for props** - Always type component props
- **Named exports** for components
- **Composition over complexity**

Example:
```typescript
// ✅ Good
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ children, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

### File Organization

```
component/
├── ComponentName.tsx       # Component implementation
├── ComponentName.test.tsx  # Tests
└── index.ts               # Re-export

lib/
├── utility.ts
├── utility.test.ts
└── index.ts
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: camelCase for utilities (`apiClient.ts`), PascalCase for components
- **Variables/Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces/Types**: PascalCase (`UserData`, `ApiResponse`)
- **CSS Classes**: kebab-case (`user-profile-card`)

### API Routes

- Follow RESTful conventions
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return consistent response format:

```typescript
// Success response
{
  success: true,
  data: { /* response data */ },
  message?: "Optional success message"
}

// Error response
{
  success: false,
  error: "Error message",
  details?: { /* optional error details */ }
}
```

### Database Operations

- **Always use Prisma Client** - No raw SQL unless absolutely necessary
- **Use transactions** for operations that modify multiple tables
- **Implement proper error handling**
- **Use database utilities** from `lib/db.ts`

Example:
```typescript
// ✅ Good
import { userDb } from '@/lib/db';

const user = await userDb.create({
  email: 'user@example.com',
  password: 'hashedPassword123',
  name: 'John Doe'
});

// ❌ Bad - bypassing utilities
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: 'plainPassword', // Not hashed!
  }
});
```

---

## 🧪 Testing Guidelines

### Test Coverage Goals
- **Minimum**: 70% overall coverage
- **Target**: 80%+ overall coverage
- **Critical paths**: 100% coverage (auth, payments, etc.)

### What to Test

1. **Components**
   - Rendering with different props
   - User interactions
   - Edge cases and error states
   - Accessibility

2. **API Routes**
   - Success cases
   - Error cases
   - Validation
   - Authentication/Authorization

3. **Utilities/Hooks**
   - All exported functions
   - Edge cases
   - Error handling

### Test Structure

```typescript
describe('ComponentName', () => {
  describe('when condition', () => {
    it('should do expected behavior', () => {
      // Arrange
      const props = { /* ... */ };
      
      // Act
      render(<Component {...props} />);
      
      // Assert
      expect(screen.getByText('Expected text')).toBeInTheDocument();
    });
  });
});
```

### Testing Best Practices

- Test behavior, not implementation
- Use descriptive test names
- Keep tests isolated and independent
- Mock external dependencies
- Use data-testid for stable selectors

---

## 💬 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
# Feature
feat(auth): add password reset functionality

# Bug fix
fix(tasks): resolve task deletion error

# Documentation
docs(readme): update setup instructions

# Breaking change
feat(api)!: change user endpoint response format

BREAKING CHANGE: The /api/users endpoint now returns data in a different format
```

### Commit Best Practices

- Write in imperative mood ("add feature" not "added feature")
- Keep subject line under 72 characters
- Capitalize first letter of subject
- No period at end of subject
- Separate subject from body with blank line
- Wrap body at 72 characters
- Use body to explain what and why, not how

---

## 🔍 Pull Request Process

### Before Submitting

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code follows project conventions
- [ ] Added tests for new features
- [ ] Updated documentation as needed
- [ ] Branch is up to date with main

### PR Title

Follow commit message conventions:
```
feat(scope): description
fix(scope): description
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Test coverage maintained/improved

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and checks
2. **Code Review**: Maintainer reviews code
3. **Feedback**: Address review comments
4. **Approval**: Once approved, PR will be merged
5. **Merge**: Squash and merge or merge commit (maintainer decides)

### Review Criteria

- Code quality and maintainability
- Test coverage
- Documentation
- Performance impact
- Security considerations
- Breaking changes clearly documented

---

## 🐛 Reporting Bugs

Use the bug report template in GitHub Issues:

1. Clear description of the bug
2. Steps to reproduce
3. Expected vs actual behavior
4. Environment details
5. Screenshots/logs if applicable

---

## 💡 Suggesting Features

Use the feature request template in GitHub Issues:

1. Problem statement
2. Proposed solution
3. Alternative solutions considered
4. Additional context

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ❓ Questions?

- Check existing issues and discussions
- Read the documentation (README.md, NEXT_STEPS.md, IMPLEMENTATION_GUIDE.md)
- Ask in GitHub Discussions
- Contact maintainers

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing! 🎉
