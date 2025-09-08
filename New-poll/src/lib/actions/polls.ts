'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/client'

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
    if (!formData.title.trim()) {
      return { success: false, error: 'Title is required' }
    }

    const validOptions = formData.options.filter(option => option.trim())
    if (validOptions.length < 2) {
      return { success: false, error: 'At least 2 options are required' }
    }

    // Skip authentication for demo purposes
    const user = { id: 'demo-user' }

    const supabase = createServerSupabaseClient()

    const { data: pollId, error } = await supabase.rpc('create_poll_with_options', {
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      creator_id: user.id,
      is_public: formData.isPublic,
      allow_multiple_votes: formData.allowMultipleVotes,
      allow_anonymous_votes: formData.allowAnonymousVotes,
      options: validOptions.map(o => o.trim())
    })

    if (error) {
      return { success: false, error: 'Failed to create poll' }
    }

    revalidatePath('/polls')
    return { success: true, pollId }
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' }
  }
}