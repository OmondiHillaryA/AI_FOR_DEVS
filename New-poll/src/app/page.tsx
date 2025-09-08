import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Poll Creator</h1>
        <p className="text-gray-600 mb-8">Create and share polls easily</p>
        <div className="space-x-4">
          <Link 
            href="/polls/create"
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
          >
            Create New Poll
          </Link>
          <Link 
            href="/polls"
            className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600"
          >
            View Polls
          </Link>
        </div>
      </div>
    </div>
  )
}