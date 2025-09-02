'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createPoll } from '@/lib/actions/polls'
import { Plus, X } from 'lucide-react'

export function CreatePollForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [options, setOptions] = useState(['', ''])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ''])
    }
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSuccess(false)
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    // Validate options
    const validOptions = options.filter(option => option.trim())
    if (validOptions.length < 2) {
      setError('At least 2 options are required')
      return
    }

    const pollData = {
      title,
      description,
      options: validOptions,
      isPublic: true,
      allowMultipleVotes: false,
      allowAnonymousVotes: true
    }

    startTransition(() => {
      (async () => {
        try {
          const result = await createPoll(pollData)
          if (result.success) {
            setSuccess(true)
            // Show success message for 2 seconds, then redirect
            setTimeout(() => {
              router.push('/polls')
            }, 2000)
          } else {
            setError(result.error || 'Failed to create poll')
          }
        } catch (err) {
          setError('An unexpected error occurred')
          console.error('Error creating poll:', err)
        }
      })()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Poll Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter your poll question"
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Add more context about your poll"
          className="w-full"
          rows={3}
        />
      </div>

      <div className="space-y-3">
        <Label>Poll Options *</Label>
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              required
              className="flex-1"
            />
            {options.length > 2 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemoveOption(index)}
                className="px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        {options.length < 10 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddOption}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">Poll created successfully! Redirecting...</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? 'Creating Poll...' : 'Create Poll'}
      </Button>
    </form>
  )
}



