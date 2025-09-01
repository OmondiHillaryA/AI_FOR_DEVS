'''"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

type Poll = {
  id: string;
  question: string;
};

export function PollsList() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPolls = async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("id, question");

      if (error) {
        console.error("Error fetching polls:", error);
      } else {
        setPolls(data);
      }
      setIsLoading(false);
    };

    fetchPolls();
  }, [supabase]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Polls</h1>
      <div className="grid gap-4">
        {polls.map((poll) => (
          <Link key={poll.id} href={`/poll/${poll.id}`}>
            <a>
              <Card>
                <CardHeader>
                  <CardTitle>{poll.question}</CardTitle>
                </CardHeader>
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
'''