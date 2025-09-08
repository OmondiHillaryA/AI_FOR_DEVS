'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface ResultsPageProps {
  params: {
    id: string
  }
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const { id } = params
  const searchParams = useSearchParams()
  const userVote = searchParams.get('vote')

  // Mock poll data
  const mockPoll = {
    id,
    question: "What's your favorite programming language?",
    options: ["JavaScript", "Python", "TypeScript", "Java", "Go"]
  }

  // Mock results data
  const mockResults = {
    "JavaScript": 45,
    "Python": 32,
    "TypeScript": 28,
    "Java": 15,
    "Go": 12
  }
  const totalVotes = Object.values(mockResults).reduce((sum, votes) => sum + votes, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2 text-green-600">Thank you for voting!</h1>
              {userVote && (
                <p className="text-gray-600">Your vote for "{userVote}" has been recorded.</p>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Poll Results</h2>
              <h3 className="text-lg mb-4">{mockPoll.question}</h3>
              <div className="space-y-3">
                {mockPoll.options.map((option) => {
                  const votes = mockResults[option as keyof typeof mockResults] || 0
                  const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
                  
                  return (
                    <div key={option} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <span className={option === userVote ? 'font-semibold text-green-600' : ''}>
                        {option} {option === userVote && '✓'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {votes} ({percentage}%)
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">Total votes: {totalVotes}</p>
            </div>

            <div className="text-center space-x-4">
              <Link 
                href={`/polls/${id}`}
                className="text-blue-500 hover:text-blue-600"
              >
                Vote again
              </Link>
              <Link 
                href="/polls"
                className="text-gray-500 hover:text-gray-600"
              >
                View all polls
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}