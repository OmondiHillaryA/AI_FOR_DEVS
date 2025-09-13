# Development Guide - ALX Polly

## 🏗️ Architecture Overview

### Security-First Design
ALX Polly is built with security as the primary concern, implementing defense-in-depth strategies:

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Input Validation    │ Type checking, sanitization       │
│ 2. Authentication      │ Supabase Auth, session management │
│ 3. Authorization       │ Ownership verification, RLS       │
│ 4. Data Protection     │ Environment validation, logging   │
│ 5. Error Handling      │ Graceful failures, no disclosure  │
└─────────────────────────────────────────────────────────────┘
```

### Application Flow
```
User Input → Validation → Authentication → Authorization → Database → Response
     ↓           ↓             ↓              ↓            ↓         ↓
  Sanitize   Type Check   Session Check   Ownership    RLS      Sanitized
   & Trim    & Validate   & Verify User   Verification Policies   Response
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm/yarn
- Supabase CLI (optional)
- Git

### Environment Variables
```bash
# Required for development
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional for development
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For admin operations
```

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check

# Security audit
npm audit
```

## 📁 Code Organization

### Directory Structure Explained
```
app/
├── (auth)/              # Authentication routes (login, register)
├── (dashboard)/         # Protected routes requiring authentication
├── lib/
│   ├── actions/         # Server actions (business logic)
│   ├── context/         # React contexts (auth state)
│   └── types/           # TypeScript definitions
└── globals.css          # Global styles

components/
└── ui/                  # Reusable UI components (shadcn/ui)

lib/
└── supabase/           # Database client configuration
```

### Naming Conventions
- **Files**: kebab-case (`poll-actions.ts`)
- **Components**: PascalCase (`PollActions.tsx`)
- **Functions**: camelCase (`createPoll`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_POLL_OPTIONS`)
- **Types**: PascalCase (`LoginFormData`)

## 🔒 Security Implementation

### Input Validation Pattern
```typescript
// 1. Type checking
if (typeof input !== 'string') {
  return { error: 'Invalid input format' };
}

// 2. Sanitization
const sanitized = input.trim();

// 3. Validation
if (!sanitized || sanitized.length < MIN_LENGTH) {
  return { error: 'Input too short' };
}

// 4. Additional checks (email format, etc.)
if (!EMAIL_REGEX.test(sanitized)) {
  return { error: 'Invalid format' };
}
```

### Authorization Pattern
```typescript
// 1. Authentication check
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  return { error: 'Authentication required' };
}

// 2. Ownership verification
const { error: dbError } = await supabase
  .from('table')
  .operation()
  .eq('id', resourceId)
  .eq('user_id', user.id);  // Critical: ownership check
```

### Error Handling Pattern
```typescript
try {
  // Operation
  const result = await riskyOperation();
  return { data: result, error: null };
} catch (error) {
  // Log error (sanitized)
  console.error('Operation failed:', error instanceof Error ? error.message : 'Unknown error');
  
  // Return user-friendly error
  return { data: null, error: 'Operation failed. Please try again.' };
}
```

## 🧪 Testing Strategy

### Security Testing Checklist
- [ ] Input validation with malformed data
- [ ] Authentication bypass attempts
- [ ] Authorization escalation tests
- [ ] XSS prevention verification
- [ ] SQL injection prevention
- [ ] Environment variable validation

### Manual Testing Scenarios
```bash
# Authentication Tests
1. Register with invalid email formats
2. Login with empty credentials
3. Access protected routes without auth

# Authorization Tests
1. Try to delete another user's poll
2. Access polls without ownership
3. Modify other users' data

# Input Validation Tests
1. Submit forms with XSS payloads
2. Send malformed JSON data
3. Test with extremely long inputs
```

## 🚀 Deployment

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Database policies tested
- [ ] Security headers configured
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Accessibility verified

### Production Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Policies (RLS)
```sql
-- Polls table policies
CREATE POLICY "Users can view all polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Users can create their own polls" ON polls FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own polls" ON polls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own polls" ON polls FOR DELETE USING (auth.uid() = user_id);
```

## 🔍 Code Review Guidelines

### Security Review Points
1. **Input Validation**: All user inputs validated and sanitized
2. **Authentication**: Proper session verification
3. **Authorization**: Ownership checks for all operations
4. **Error Handling**: No sensitive information disclosure
5. **Logging**: Sanitized logs without user data

### Code Quality Standards
- TypeScript strict mode enabled
- All functions documented with JSDoc
- Error handling for all async operations
- Consistent naming conventions
- Security comments for critical sections

## 🐛 Debugging

### Common Issues
```bash
# Environment variable errors
Error: Missing Supabase environment variables
→ Check .env.local file and restart server

# Authentication issues
Error: User not authenticated
→ Check Supabase auth configuration and session state

# Database connection issues
Error: relation "polls" does not exist
→ Run database migrations and check RLS policies
```

### Debug Tools
- Browser DevTools Network tab
- Supabase Dashboard logs
- Next.js development console
- React Developer Tools

## 📚 Learning Resources

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

### Development Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement feature with security considerations
3. Add comprehensive tests
4. Update documentation
5. Submit pull request with security review

### Security Contribution Guidelines
- Always implement input validation
- Add authorization checks for new endpoints
- Document security considerations
- Test for common vulnerabilities
- Follow secure coding practices

---

**Security First, Always** 🔒