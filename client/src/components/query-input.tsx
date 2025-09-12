import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueryInputProps {
  onQueryGenerated: (data: { naturalLanguage: string; sql: string; title: string }) => void;
}

export default function QueryInput({ onQueryGenerated }: QueryInputProps) {
  const [queryText, setQueryText] = useState("");
  const { toast } = useToast();

  const generateSqlMutation = useMutation({
    mutationFn: async (naturalLanguageQuery: string) => {
      const response = await fetch("/api/queries/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naturalLanguageQuery }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate SQL query");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      onQueryGenerated({
        naturalLanguage: queryText,
        sql: data.sqlQuery,
        title: data.suggestedTitle,
      });
      toast({
        title: "SQL Generated",
        description: `Query generated with ${Math.round(data.confidence * 100)}% confidence`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!queryText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question about your data",
        variant: "destructive",
      });
      return;
    }
    generateSqlMutation.mutate(queryText);
  };

  const handleExampleClick = (example: string) => {
    setQueryText(example);
  };

  const examples = [
    "Show me the 7-day retention rate for users who signed up last month",
    "What are the top 5 most used features this quarter?",
    "Show conversion rates from signup to first purchase by user segment",
    "Compare weekly active users between this month and last month",
    "Which features have the highest adoption rate among premium users?",
  ];

  return (
    <div className="bg-card border-b border-border p-8" data-testid="query-input-panel">
      <div className="max-w-4xl">
        <Label htmlFor="query-input" className="block text-sm font-medium text-foreground mb-3">
          Ask a question about your data
        </Label>
        
        <div className="relative">
          <Textarea
            id="query-input"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="w-full h-24 px-4 py-3 bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            placeholder="e.g., Show me the weekly active users for the last 3 months, broken down by user segment"
            data-testid="input-query-text"
          />
          
          <Button
            onClick={handleGenerate}
            disabled={generateSqlMutation.isPending || !queryText.trim()}
            className="absolute bottom-3 right-3"
            data-testid="button-generate-sql"
          >
            {generateSqlMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            Generate SQL
          </Button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Quick examples:</span>
            {examples.slice(0, 3).map((example, index) => (
              <Button
                key={index}
                variant="link"
                className="text-sm text-primary hover:text-primary/80 p-0 h-auto"
                onClick={() => handleExampleClick(example)}
                data-testid={`button-example-${index}`}
              >
                {example.slice(0, 25)}...
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
