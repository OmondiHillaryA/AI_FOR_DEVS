import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PollCardProps {
  poll: {
    id: string;
    question: string;
    description?: string;
    options: any[];
    votes?: number;
    created_at: string | Date;
    expires_at?: string | Date | null;
  };
}

export function PollCard({ poll }: PollCardProps) {
  const totalVotes = poll.votes || poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);
  const formattedDate = new Date(poll.created_at).toLocaleDateString();
  const expirationDate = poll.expires_at ? new Date(poll.expires_at).toLocaleDateString() : null;
  const isExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false;

  return (
    <Link href={`/polls/${poll.id}`} className="group block h-full">
      <Card className={`h-full transition-all hover:shadow-md ${isExpired ? 'bg-slate-50' : ''}`}>
        <CardHeader>
          <CardTitle className="group-hover:text-blue-600 transition-colors">{poll.question}</CardTitle>
          {poll.description && <CardDescription>{poll.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500">
            <p>{poll.options.length} options</p>
            <p>{totalVotes} total votes</p>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-slate-400 flex justify-between">
          <span>Created on {formattedDate}</span>
          {isExpired && <span className="font-bold text-red-500">Expired</span>}
          {!isExpired && expirationDate && <span>Expires on {expirationDate}</span>}
        </CardFooter>
      </Card>
    </Link>
  );
}