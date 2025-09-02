import { createServerSupabaseClient } from './client'

export async function getCurrentUser() {
  try {
    const supabase = createServerSupabaseClient()
    
    // For now, return a mock user since we don't have full auth setup
    // In a real app, this would check the user's session from cookies
    return { id: 'mock-user-id', email: 'user@example.com' }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}



