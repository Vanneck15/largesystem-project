import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Code, Copy, Indent, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SqlDisplayProps {
  query: string;
  title: string;
  executionTime?: number;
  resultCount?: number;
  naturalLanguageQuery: string;
  onExecute: (data: { results: any[]; executionTime: number; insights: string[] }) => void;
}

export default function SqlDisplay({
  query,
  title,
  executionTime,
  resultCount,
  naturalLanguageQuery,
  onExecute,
}: SqlDisplayProps) {
  const [formattedQuery, setFormattedQuery] = useState(query);
  const { toast } = useToast();

  const executeQueryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/queries/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sqlQuery: formattedQuery,
          naturalLanguageQuery,
          title,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to execute query");
      }

      return response.json();
    },
    onSuccess: (data) => {
      onExecute({
        results: data.results,
        executionTime: data.executionTime,
        insights: data.insights,
      });
      toast({
        title: "Query Executed",
        description: `Returned ${data.resultCount} rows in ${data.executionTime}ms`,
      });
    },
    onError: (error) => {
      toast({
        title: "Execution Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(formattedQuery);
      toast({
        title: "Copied",
        description: "SQL query copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleFormatSQL = () => {
    // Simple SQL formatting - in production, you might want to use a proper SQL formatter library
    const formatted = formattedQuery
      .replace(/\s+/g, " ")
      .replace(/SELECT/gi, "SELECT")
      .replace(/FROM/gi, "\nFROM")
      .replace(/WHERE/gi, "\nWHERE")
      .replace(/GROUP BY/gi, "\nGROUP BY")
      .replace(/ORDER BY/gi, "\nORDER BY")
      .replace(/HAVING/gi, "\nHAVING")
      .replace(/JOIN/gi, "\nJOIN")
      .replace(/LEFT JOIN/gi, "\nLEFT JOIN")
      .replace(/RIGHT JOIN/gi, "\nRIGHT JOIN")
      .replace(/INNER JOIN/gi, "\nINNER JOIN")
      .trim();
    
    setFormattedQuery(formatted);
    toast({
      title: "Formatted",
      description: "SQL query has been formatted",
    });
  };

  // Update formatted query when query prop changes
  useState(() => {
    setFormattedQuery(query);
  }, [query]);

  return (
    <Card data-testid="sql-display">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center space-x-2">
            <Code className="text-primary w-4 h-4" />
            <span>Generated SQL Query</span>
          </h3>
          <div className="flex items-center space-x-2">
            {executeQueryMutation.isPending && (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopySQL}
              title="Copy SQL"
              data-testid="button-copy-sql"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFormatSQL}
              title="Format SQL"
              data-testid="button-format-sql"
            >
              <Indent className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {query ? (
          <>
            <div className="query-editor rounded-lg p-4 text-sm overflow-auto max-h-96 border">
              <pre className="text-foreground font-mono whitespace-pre-wrap">
                <code data-testid="sql-code">{formattedQuery}</code>
              </pre>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-4">
                {executionTime !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    Execution time: <span className="text-foreground font-medium">{executionTime}ms</span>
                  </span>
                )}
                {resultCount !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    Rows: <span className="text-foreground font-medium">{resultCount}</span>
                  </span>
                )}
              </div>
              <Button
                onClick={() => executeQueryMutation.mutate()}
                disabled={executeQueryMutation.isPending || !query}
                className="bg-accent hover:bg-accent/90"
                data-testid="button-execute-query"
              >
                {executeQueryMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Execute Query
              </Button>
            </div>
          </>
        ) : (
          <div className="h-64 bg-muted/30 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Code className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Generate a query to see SQL here</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
