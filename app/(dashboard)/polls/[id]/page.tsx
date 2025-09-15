'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPollById, submitVote, getPollAnalytics } from '@/app/lib/actions/poll-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Poll } from '@/app/lib/types';

// Share component
function SharePoll({ pollId, pollTitle }: { pollId: string; pollTitle: string }) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input 
          type="text" 
          value={shareUrl} 
          readOnly 
          className="flex-1 p-2 border rounded text-sm"
        />
        <Button onClick={copyToClipboard} size="sm">
          Copy
        </Button>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(pollTitle)}&url=${encodeURIComponent(shareUrl)}`)}
        >
          Twitter
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}
        >
          Facebook
        </Button>
      </div>
    </div>
  );
}

interface AnalyticsData {
  voteCounts: { option: string; count: number }[];
  totalVotes: number;
}

export default function PollDetailPage({ params }: { params: { id: string } }) {
  const [poll, setPoll] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      const { poll: data, error } = await getPollById(params.id);
      if (error) {
        setError(error);
      } else {
        setPoll(data);
      }
    };
    fetchPoll();
  }, [params.id]);

  const fetchAnalytics = async () => {
    const { analytics: data, error } = await getPollAnalytics(params.id);
    if (error) {
      setError(error);
    } else {
      setAnalytics(data);
    }
  };

  const handleVote = async () => {
    if (selectedOption === null) return;

    setIsSubmitting(true);
    setError(null);

    const res = await submitVote(params.id, selectedOption);
    if (res.error) {
      setError(res.error);
    } else {
      setHasVoted(true);
      fetchAnalytics();
    }
    setIsSubmitting(false);
  };

  const getPercentage = (count: number) => {
    if (!analytics || analytics.totalVotes === 0) return 0;
    return Math.round((count / analytics.totalVotes) * 100);
  };

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  if (!poll) {
    return <div className="text-center">Loading poll...</div>;
  }

  const isExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false;
  const expirationDate = poll.expires_at ? new Date(poll.expires_at).toLocaleString() : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/polls" className="text-blue-600 hover:underline">
          &larr; Back to Polls
        </Link>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Share</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Poll</DialogTitle>
              </DialogHeader>
              <SharePoll pollId={params.id} pollTitle={poll.question} />
            </DialogContent>
          </Dialog>
          <Button variant="outline" asChild>
            <Link href={`/polls/${params.id}/edit`}>Edit Poll</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.question}</CardTitle>
          {poll.description && <CardDescription>{poll.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasVoted ? (
            <div className="space-y-3">
              {poll.options.map((option: string, index: number) => (
                <div 
                  key={index} 
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedOption === index ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'
                  } ${isExpired ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''}`}
                  onClick={() => !isExpired && setSelectedOption(index)}
                >
                  {option}
                </div>
              ))}
              <Button 
                onClick={handleVote} 
                disabled={selectedOption === null || isSubmitting || isExpired}
                className="mt-4"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </Button>
              {isExpired && <p className="text-red-500 text-sm mt-2">This poll has expired.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Results:</h3>
              {analytics && analytics.voteCounts.map((result, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{result.option}</span>
                    <span>{getPercentage(result.count)}% ({result.count} votes)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${getPercentage(result.count)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {analytics && (
                <div className="text-sm text-slate-500 pt-2">
                  Total votes: {analytics.totalVotes}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-slate-500 flex justify-between">
          <span>Created on {new Date(poll.created_at).toLocaleDateString()}</span>
          {expirationDate && <span>Expires on {expirationDate}</span>}
        </CardFooter>
      </Card>
    </div>
  );
}
