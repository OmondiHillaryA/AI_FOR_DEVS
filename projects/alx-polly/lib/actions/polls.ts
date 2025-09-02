'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'

export interface CreatePollFormData {
  title: string
  description?: string
  options: string[]
  isPublic: boolean
  allowMultipleVotes: boolean
  allowAnonymousVotes: boolean
}

export interface CreatePollResult {
  success: boolean
  pollId?: string
  error?: string
}

export async function createPoll(formData: CreatePollFormData): Promise<CreatePollResult> {
  try {
    // Validate input
    if (!formData.title.trim()) {
      return { success: false, error: 'Title is required' }
    }

    if (formData.options.length < 2) {
      return { success: false, error: 'At least 2 options are required' }
    }

    if (formData.options.length > 10) {
      return { success: false, error: 'Maximum 10 options allowed' }
    }

    // Check for empty options
    const validOptions = formData.options.filter(option => option.trim())
    if (validOptions.length < 2) {
      return { success: false, error: 'All options must have text' }
    }

    // Get current user (for now, we'll create a mock user since auth isn't set up)
    // In a real app, this would come from Supabase auth
    const mockUser = { id: 'mock-user-id' }

    const supabase = createServerSupabaseClient()

    // Create poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        creator_id: mockUser.id,
        is_public: formData.isPublic,
        allow_multiple_votes: formData.allowMultipleVotes,
        allow_anonymous_votes: formData.allowAnonymousVotes,
        settings: {}
      })
      .select()
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      return { success: false, error: 'Failed to create poll' }
    }

    if (!poll) {
      return { success: false, error: 'Failed to create poll' }
    }

    // Create poll options
    const optionsData = validOptions.map((text, index) => ({
      poll_id: poll.id,
      text: text.trim(),
      order_index: index
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsData)

    if (optionsError) {
      console.error('Error creating poll options:', optionsError)
      return { success: false, error: 'Failed to create poll options' }
    }

    // Revalidate polls page
    revalidatePath('/polls')
    
    return { success: true, pollId: poll.id }
  } catch (error) {
    console.error('Error in createPoll:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}



