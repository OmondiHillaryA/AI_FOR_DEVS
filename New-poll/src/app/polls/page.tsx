import Link from 'next/link'

export default function PollsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Polls</h1>
          <Link 
            href="/polls/create"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create Poll
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No polls created yet.</p>
          <div className="space-y-2">
            <Link 
              href="/polls/create"
              className="text-blue-500 hover:text-blue-600 block"
            >
              Create your first poll →
            </Link>
            <Link 
              href="/polls/demo"
              className="text-gray-500 hover:text-gray-600 block text-sm"
            >
              View demo poll
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}