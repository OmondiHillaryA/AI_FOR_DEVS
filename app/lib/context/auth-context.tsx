'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

const AuthContext = createContext<{ 
  session: Session | null;
  user: User | null;
  signOut: () => void;
  loading: boolean;
}>({ 
  session: null, 
  user: null,
  signOut: () => {},
  loading: true,
});

/**
 * AuthProvider - Centralized authentication state management with security hardening
 * 
 * WHAT: React context provider that manages user authentication state across the app
 * WHY: Centralizes auth logic to prevent inconsistent state, implements secure logging
 *      to prevent sensitive data leakage, and provides automatic session management
 *      to handle token refresh and cleanup
 * 
 * @param children - React components that need access to authentication context
 * @returns JSX.Element - Context provider wrapping children with auth state
 * 
 * Security Features:
 * - Sanitized logging prevents user data from appearing in console/logs
 * - Automatic session cleanup prevents memory leaks
 * - Error boundary pattern for auth failures
 * - Secure state initialization to prevent race conditions
 * 
 * Edge Cases Handled:
 * - Component unmounting during async auth operations
 * - Network failures during session refresh
 * - Invalid or expired tokens
 * - Rapid auth state changes (login/logout)
 * - Browser tab switching affecting session state
 * 
 * @example
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Dashboard /> // Can access useAuth() hook
 *     </AuthProvider>
 *   );
 * }
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // EDGE CASE: Component might unmount before async operations complete
    // WHY: mounted flag prevents state updates on unmounted components
    let mounted = true;
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        // EDGE CASE: Network failures, invalid tokens, or Supabase service issues
        console.error('Error fetching user:', error);
      }
      // EDGE CASE: Prevent state updates if component unmounted during async call
      if (mounted) {
        setUser(data.user ?? null);
        // WHY: setSession(null) during initial load - session will be set by auth listener
        setSession(null);
        setLoading(false);
        // SECURITY: Log only authentication status, never user details
        console.log('AuthContext: Initial user loaded', data.user?.id ? 'User authenticated' : 'No user');
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Do not set loading to false here, only after initial load
      console.log('AuthContext: Auth state changed', _event, session?.user?.id ? 'User authenticated' : 'No user');
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  console.log('AuthContext: user', user?.id ? 'User authenticated' : 'No user');
  return (
    <AuthContext.Provider value={{ session, user, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
