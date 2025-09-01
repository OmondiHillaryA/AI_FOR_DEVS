'''"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthProvider";

type PollData = {
  id: string;
  question: string;
  options: string[];
};

export function Poll({ pollId }: { pollId: string }) {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const supabase = createClient();
  const { session } = useAuth();

  useEffect(() => {
    const fetchPoll = async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("id, question, options")
        .eq("id", pollId)
        .single();

      if (error) {
        console.error("Error fetching poll:", error);
      } else {
        setPoll(data);
      }
      setIsLoading(false);
    };

    const fetchResults = async () => {
      const { data, error } = await supabase
        .from("votes")
        .select("option, count")
        .eq("poll_id", pollId);

      if (error) {
        console.error("Error fetching results:", error);
      } else {
        const resultsData = data.reduce((acc, vote) => {
          acc[vote.option] = vote.count;
          return acc;
        }, {} as Record<string, number>);
        setResults(resultsData);
      }
    };

    fetchPoll();
    fetchResults();
  }, [pollId, supabase]);

  const handleVote = async () => {
    if (!selectedOption) {
      alert("Please select an option to vote.");
      return;
    }

    if (!session) {
      alert("Please log in to vote.");
      return;
    }

    const { error } = await supabase.rpc('vote', {
      poll_id: pollId,
      option: selectedOption,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Vote submitted successfully!");
      // Refresh results
      const { data, error } = await supabase
        .from("votes")
        .select("option, count")
        .eq("poll_id", pollId);

      if (error) {
        console.error("Error fetching results:", error);
      } else {
        const resultsData = data.reduce((acc, vote) => {
          acc[vote.option] = vote.count;
          return acc;
        }, {} as Record<string, number>);
        setResults(resultsData);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!poll) {
    return <div>Poll not found.</div>;
  }

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>{poll.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          {poll.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedOption === option ? "default" : "outline"}
              onClick={() => setSelectedOption(option)}
            >
              {option}
            </Button>
          ))}
        </div>
        {results && (
          <div className="mt-4">
            <h3 className="font-bold">Results:</h3>
            <ul>
              {Object.entries(results).map(([option, count]) => (
                <li key={option}>
                  {option}: {count}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleVote} disabled={!selectedOption || !session}>
          Vote
        </Button>
      </CardFooter>
    </Card>
  );
}
'''