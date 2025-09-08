import { CreatePollForm } from '@/components/CreatePollForm'

export default function CreatePollPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-100 to-blue-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Poll</h1>
          <p className="text-gray-600">Create a new poll for others to vote on</p>
        </div>
        <CreatePollForm />
      </div>
    </div>
  )
}