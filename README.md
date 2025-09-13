# ALX Polly - Secure Polling Application

## 📖 Project Overview

ALX Polly is a production-ready polling application that prioritizes security and user experience. Built as part of the ALX Software Engineering program, it demonstrates modern web development practices with comprehensive security measures.

**Key Highlights:**
- 🔒 **Security-First Design**: Input validation, authorization, and XSS prevention
- 🚀 **Modern Stack**: Next.js 15, TypeScript, Supabase, Tailwind CSS
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time**: Live poll updates and results
- 🛡️ **Production-Ready**: Comprehensive error handling and monitoring

## 🚀 Features

### Core Functionality
- **Poll Creation**: Create polls with multiple options
- **User Authentication**: Secure login/registration system
- **Poll Management**: Edit, delete, and view your polls
- **Real-time Updates**: Live poll results and updates
- **Responsive Design**: Works on desktop and mobile devices

### Security Features ✅
- **Input Validation**: Comprehensive server-side validation
- **Authorization**: User ownership verification for all operations
- **Sanitization**: XSS and injection attack prevention
- **Environment Validation**: Secure configuration management
- **Error Handling**: Graceful error handling without information disclosure

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: React 18 with Server Components
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Server Actions

### Backend
- **API**: Next.js Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Row Level Security
- **Validation**: Custom input validation + sanitization
- **Security**: CSRF protection, XSS prevention, input validation

### Development & Deployment
- **Package Manager**: npm
- **Deployment**: Vercel (recommended)
- **Environment**: Node.js 18+
- **Version Control**: Git

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/OmondiHillaryA/AI_FOR_DEVS.git
cd AI_FOR_DEVS/alx-polly
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Getting Supabase Credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### 4. Database Setup
Run the following SQL in your Supabase SQL Editor:

```sql
-- Create polls table
CREATE TABLE polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can view all polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Users can create their own polls" ON polls FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own polls" ON polls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own polls" ON polls FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Users can create votes" ON votes FOR INSERT WITH CHECK (true);
```

### 5. Configure Supabase Authentication
In your Supabase Dashboard:
1. Go to Authentication > Settings
2. Configure your site URL: `http://localhost:3000`
3. Add redirect URLs for production
4. Enable email signup (or configure OAuth providers)

### 6. Run the Application
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🎯 Usage Examples

### Creating Your First Poll

1. **Register an Account**
   ```
   Navigate to: http://localhost:3000/register
   Fill in: Name, Email, Password (min 6 characters)
   ```

2. **Create a Poll**
   ```
   Navigate to: http://localhost:3000/polls/create
   Enter question: "What's your favorite programming language?"
   Add options: "JavaScript", "Python", "TypeScript", "Go"
   Click: "Create Poll"
   ```

3. **Share Your Poll**
   ```
   Copy the poll URL: http://localhost:3000/polls/[poll-id]
   Share with others to collect votes
   ```

### Voting on Polls

1. **Find a Poll**
   ```
   Browse: http://localhost:3000/polls
   Or visit a direct poll link
   ```

2. **Cast Your Vote**
   ```
   Select your preferred option
   Click "Submit Vote"
   View real-time results
   ```

### Managing Your Polls

1. **View Your Polls**
   ```
   Navigate to: http://localhost:3000/polls
   See all polls you've created
   ```

2. **Edit a Poll**
   ```
   Click "Edit" on your poll
   Modify question or options
   Save changes
   ```

3. **Delete a Poll**
   ```
   Click "Delete" on your poll
   Confirm deletion
   Poll is permanently removed
   ```

## 🧪 Running and Testing Locally

### Development Server
```bash
# Start development server
npm run dev

# Server will start at http://localhost:3000
# Hot reload enabled for development
```

### Build and Production Test
```bash
# Build for production
npm run build

# Start production server
npm start

# Test production build locally
```

### Testing Checklist

#### ✅ Authentication Testing
```bash
# Test user registration
1. Go to /register
2. Try invalid email formats (should fail)
3. Try weak passwords (should fail)
4. Register with valid credentials (should succeed)

# Test user login
1. Go to /login
2. Try wrong credentials (should fail)
3. Login with correct credentials (should succeed)
```

#### ✅ Poll Creation Testing
```bash
# Test poll creation
1. Go to /polls/create (must be logged in)
2. Try empty question (should fail)
3. Try single option (should fail)
4. Create poll with 2+ options (should succeed)
```

#### ✅ Security Testing
```bash
# Test authorization
1. Create poll with User A
2. Login as User B
3. Try to delete User A's poll (should fail)
4. Try to edit User A's poll (should fail)

# Test input validation
1. Try XSS payloads in poll questions
2. Submit forms with empty/invalid data
3. Test with extremely long inputs
```

#### ✅ Voting Testing
```bash
# Test voting functionality
1. Create a poll
2. Vote on the poll
3. Check results are updated
4. Try voting multiple times (behavior depends on settings)
```

### Performance Testing
```bash
# Check bundle size
npm run build
# Look for bundle analysis in output

# Test loading times
# Use browser DevTools Network tab
# Check Core Web Vitals
```

### Security Audit
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Manual security testing
# Try SQL injection in forms
# Test XSS prevention
# Verify CSRF protection
```

## 📁 Project Structure

```
alx-polly/
├── app/                          # Next.js 13+ App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/page.tsx        # Login page
│   │   └── register/page.tsx     # Registration page
│   ├── (dashboard)/              # Protected dashboard pages
│   │   ├── polls/                # Poll management
│   │   │   ├── [id]/            # Individual poll pages
│   │   │   ├── create/          # Poll creation
│   │   │   └── page.tsx         # Polls list
│   │   └── admin/               # Admin panel
│   ├── lib/                     # Core application logic
│   │   ├── actions/             # Server actions
│   │   │   ├── auth-actions.ts  # Authentication logic
│   │   │   └── poll-actions.ts  # Poll CRUD operations
│   │   ├── context/             # React contexts
│   │   │   └── auth-context.tsx # Authentication context
│   │   └── types.ts             # TypeScript definitions
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable UI components
│   └── ui/                      # shadcn/ui components
├── lib/                         # Utility libraries
│   └── supabase/               # Supabase configuration
│       ├── client.ts           # Browser client
│       ├── server.ts           # Server client
│       └── middleware.ts       # Auth middleware
├── middleware.ts                # Next.js middleware
├── SECURITY-README.md          # Security documentation
└── README.md                   # This file
```

## 🔐 Security Features

### Authentication & Authorization
- **User Authentication**: Secure login/registration with Supabase Auth
- **Session Management**: Automatic session handling and refresh
- **Ownership Verification**: Users can only modify their own polls
- **Row Level Security**: Database-level access control

### Input Validation & Sanitization
- **Type Checking**: Strict TypeScript types and runtime validation
- **Input Sanitization**: XSS prevention through input cleaning
- **Email Validation**: Regex-based email format verification
- **Form Validation**: Comprehensive client and server-side validation

### Error Handling
- **Graceful Degradation**: User-friendly error messages
- **Information Disclosure Prevention**: No sensitive data in error responses
- **Logging Security**: Sanitized logs without user data

### Environment Security
- **Configuration Validation**: Environment variables checked at startup
- **Secure Defaults**: Fail-safe configuration patterns

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript compiler

# Security
npm audit           # Check for vulnerabilities
npm audit fix       # Fix vulnerabilities
```

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
```

### Post-Deployment Checklist
- [ ] Update Supabase site URL to production domain
- [ ] Configure redirect URLs
- [ ] Test authentication flow
- [ ] Verify database policies
- [ ] Test poll creation/deletion
- [ ] Monitor error logs

## 🔧 Development

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Tailwind CSS**: Utility-first styling

### Key Development Principles
- **Security First**: All features designed with security in mind
- **Type Safety**: Comprehensive TypeScript usage
- **Error Handling**: Graceful error management
- **User Experience**: Intuitive and responsive design

## 📚 API Documentation

### Authentication Actions
```typescript
// Login user
await login({ email: string, password: string })

// Register user  
await register({ name: string, email: string, password: string })

// Logout user
await logout()
```

### Poll Actions
```typescript
// Create poll
await createPoll(formData: FormData)

// Get user's polls
await getUserPolls()

// Get poll by ID
await getPollById(id: string)

// Update poll (owner only)
await updatePoll(pollId: string, formData: FormData)

// Delete poll (owner only)
await deletePoll(id: string)

// Submit vote
await submitVote(pollId: string, optionIndex: number)
```

## 🐛 Troubleshooting

### Common Issues

**Environment Variables Not Found**
```bash
Error: Missing Supabase environment variables
```
- Check `.env.local` file exists
- Verify variable names match exactly
- Restart development server

**Authentication Issues**
- Check Supabase project settings
- Verify site URL configuration
- Enable email signup in Supabase dashboard

**Database Connection Issues**
- Verify Supabase credentials
- Check database policies
- Ensure RLS is properly configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Add security considerations to all new features
- Include comprehensive error handling
- Write clear documentation
- Test all authentication and authorization flows

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- ALX Software Engineering Program

## 📞 Support

- **Documentation**: Check this README and SECURITY-README.md
- **Issues**: Create a GitHub issue
- **Security**: Report security issues privately

---

**Built with ❤️ by Hillary Omondi for ALX Software Engineering Program**

*Last Updated: January 2025*it -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Security Contributions
- Report security issues privately
- Follow responsible disclosure
- Include reproduction steps
- Suggest fixes when possible

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- ALX Software Engineering Program

## 📞 Support

- **Documentation**: Check this README and SECURITY-README.md
- **Issues**: Create a GitHub issue
- **Security**: Report security issues privately

---

**Built with ❤️ by Hillary Omondi for ALX Software Engineering Program**

*Last Updated: January 2025*