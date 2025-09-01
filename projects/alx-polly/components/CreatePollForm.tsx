'''"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CreatePollForm() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (question.trim() === "" || options.some((opt) => opt.trim() === "")) {
      alert("Please fill out the question and all options.");
      setIsLoading(false);
      return;
    }

    const { data: poll, error } = await supabase
      .from("polls")
      .insert([{ question, options }])
      .select();

    if (error) {
      alert(error.message);
    } else if (poll) {
      router.push(`/poll/${poll[0].id}`);
    }

    setIsLoading(false);
  };

  const isFormValid = question.trim() !== "" && options.every((opt) => opt.trim() !== "");

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Create a New Poll</CardTitle>
        <CardDescription>Fill out the details below to create your poll.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="question">Poll Question</Label>
              <Input
                id="question"
                placeholder="What is your favorite color?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                {options.length > 2 && (
                  <Button variant="outline" onClick={() => removeOption(index)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOption}>
              Add Option
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={() => document.querySelector("form")?.requestSubmit()}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? "Creating..." : "Create Poll"}
        </Button>
      </CardFooter>
    </Card>
  );
}
'''