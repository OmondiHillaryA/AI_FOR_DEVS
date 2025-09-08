'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PollDetailPageProps {
  params: {
    id: string
  }
}

export default function PollDetailPage({ params }: PollDetailPageProps) {
  const { id } = params
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock poll data
  const mockPoll = {
    id,
    question: "What's your favorite programming language?",
    description: "Help us understand the community's preferences for programming languages in 2024.",
    options: [
      "JavaScript",
      "Python",
      "TypeScript",
      "Java",
      "Go"
    ]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOption) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Navigate to results page with vote data
      router.push(`/polls/${id}/results?vote=${encodeURIComponent(selectedOption)}`)
    } catch (err) {
      setError('Failed to submit vote. Please try again.')
      setIsSubmitting(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-red-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{mockPoll.question}</h1>
              <p className="text-gray-600">{mockPoll.description}</p>
              <p className="text-sm text-gray-500 mt-2">Poll ID: {mockPoll.id}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-3 mb-6">
                <h3 className="font-medium text-lg">Choose an option:</h3>
                <div className="space-y-2">
                  {mockPoll.options.map((option, index) => (
                    <label 
                      key={index}
                      className="flex items-center p-4 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="pollOption"
                        value={option}
                        checked={selectedOption === option}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="mr-3"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={!selectedOption || isSubmitting}
                className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}