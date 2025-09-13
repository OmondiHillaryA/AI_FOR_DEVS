"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { deletePoll } from "@/app/lib/actions/poll-actions";

interface Poll {
  id: string;
  question: string;
  options: any[];
  user_id: string;
}

interface PollActionsProps {
  poll: Poll;
}

/**
 * PollActions - Secure poll management component
 * 
 * Provides poll management actions with security features:
 * - User ownership verification before showing edit/delete options
 * - Error handling for failed operations
 * - Confirmation dialogs for destructive actions
 * 
 * @param poll - Poll object with id, question, options, and user_id
 * @returns JSX.Element - Poll card with management actions
 */
export default function PollActions({ poll }: PollActionsProps) {
  const { user } = useAuth();
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this poll?")) {
      try {
        const result = await deletePoll(poll.id);
        if (result.error) {
          alert(`Error deleting poll: ${result.error}`);
        } else {
          window.location.reload();
        }
      } catch (error) {
        alert('Failed to delete poll. Please try again.');
        console.error('Delete poll error:', error);
      }
    }
  };

  return (
    <div className="border rounded-md shadow-md hover:shadow-lg transition-shadow bg-white">
      <Link href={`/polls/${poll.id}`}>
        <div className="group p-4">
          <div className="h-full">
            <div>
              <h2 className="group-hover:text-blue-600 transition-colors font-bold text-lg">
                {poll.question}
              </h2>
              <p className="text-slate-500">{poll.options.length} options</p>
            </div>
          </div>
        </div>
      </Link>
      {user && user.id === poll.user_id && (
        <div className="flex gap-2 p-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/polls/${poll.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
