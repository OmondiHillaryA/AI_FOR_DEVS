'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createPoll } from '@/lib/actions/polls'

export function CreatePollForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAddOption = useCallback(() => {
    if (options.length < 10) {
      setOptions(prev => [...prev, ''])
    }
  }, [options.length])

  const handleRemoveOption = useCallback((index: number) => {
    if (options.length > 2) {
      setOptions(prev => prev.filter((_, i) => i !== index))
    }
  }, [options.length])

  const handleOptionChange = useCallback((index: number, value: string) => {
    setOptions(prev => {
      const newOptions = [...prev]
      newOptions[index] = value
      return newOptions
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validOptions = options.filter(option => option.trim())
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (validOptions.length < 2) {
      setError('At least 2 options are required')
      return
    }

    startTransition(async () => {
      try {
        const result = await createPoll({
          title,
          description,
          options: validOptions,
          isPublic: true,
          allowMultipleVotes: false,
          allowAnonymousVotes: true
        })
        
        if (result.success) {
          setSuccess(true)
          setTitle('')
          setDescription('')
          setOptions(['', ''])
        } else {
          setError(result.error || 'Failed to create poll')
        }
      } catch (error) {
        setError('Network error occurred')
      }
    })
  }

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">Poll Title *</label>
          <input
            id="title"
            type="text"
            placeholder="Enter your poll question"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
          <textarea
            id="description"
            placeholder="Add more context about your poll"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Poll Options *</label>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
                className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          {options.length < 10 && (
            <button 
              type="button" 
              onClick={handleAddOption}
              className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-500"
            >
              + Add Option
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
            Poll created successfully!
          </div>
        )}

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creating Poll...' : 'Create Poll'}
        </button>
      </form>
    </div>
  )
}