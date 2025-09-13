'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData } from '../types';

export async function login(data: LoginFormData) {
  const supabase = await createClient();
  
  // Validate input
  if (!data.email || !data.password) {
    return { error: 'Email and password are required' };
  }
  
  if (typeof data.email !== 'string' || typeof data.password !== 'string') {
    return { error: 'Invalid input format' };
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { error: 'Invalid email format' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email.trim().toLowerCase(),
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Success: no error
  return { error: null };
}

export async function register(data: RegisterFormData) {
  const supabase = await createClient();
  
  // Validate input
  if (!data.email || !data.password || !data.name) {
    return { error: 'All fields are required' };
  }
  
  if (typeof data.email !== 'string' || typeof data.password !== 'string' || typeof data.name !== 'string') {
    return { error: 'Invalid input format' };
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { error: 'Invalid email format' };
  }
  
  // Password strength validation
  if (data.password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  const { error } = await supabase.auth.signUp({
    email: data.email.trim().toLowerCase(),
    password: data.password,
    options: {
      data: {
        name: data.name.trim(),
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Success: no error
  return { error: null };
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
