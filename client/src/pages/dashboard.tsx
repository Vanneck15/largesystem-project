import { useState } from "react";
import Sidebar from "@/components/sidebar";
import QueryInput from "@/components/query-input";
import SqlDisplay from "@/components/sql-display";
import DataVisualization from "@/components/data-visualization";
import InsightsPanel from "@/components/insights-panel";
import { Button } from "@/components/ui/button";
import { Download, Share, Plus } from "lucide-react";

export default function Dashboard() {
  const [currentQuery, setCurrentQuery] = useState<{
    naturalLanguage: string;
    sql: string;
    title: string;
    results?: any[];
    executionTime?: number;
    insights?: string[];
  } | null>(null);

  const handleQueryGenerated = (data: {
    naturalLanguage: string;
    sql: string;
    title: string;
  }) => {
    setCurrentQuery({
      naturalLanguage: data.naturalLanguage,
      sql: data.sql,
      title: data.title,
    });
  };

  const handleQueryExecuted = (data: {
    results: any[];
    executionTime: number;
    insights: string[];
  }) => {
    if (currentQuery) {
      setCurrentQuery({
        ...currentQuery,
        results: data.results,
        executionTime: data.executionTime,
        insights: data.insights,
      });
    }
  };

  const handleExport = () => {
    if (currentQuery?.results) {
      const csv = convertToCSV(currentQuery.results);
      downloadCSV(csv, `${currentQuery.title.replace(/\s+/g, '_')}.csv`);
    }
  };

  const handleShare = () => {
    if (currentQuery) {
      const shareData = {
        title: currentQuery.title,
        text: currentQuery.naturalLanguage,
        url: window.location.href,
      };
      
      if (navigator.share) {
        navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-background" data-testid="dashboard">
      <Sidebar onQuerySelect={handleQueryGenerated} />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Natural Language Query Builder
              </h2>
              <p className="text-muted-foreground">
                Ask questions about your data in plain English
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleExport}
                disabled={!currentQuery?.results}
                data-testid="button-export"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="outline"
                onClick={handleShare}
                disabled={!currentQuery}
                data-testid="button-share"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </header>

        {/* Query Input Section */}
        <QueryInput onQueryGenerated={handleQueryGenerated} />

        {/* Results Section */}
        <div className="flex-1 p-8 bg-background">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <SqlDisplay 
              query={currentQuery?.sql || ""}
              title={currentQuery?.title || ""}
              executionTime={currentQuery?.executionTime}
              resultCount={currentQuery?.results?.length}
              onExecute={handleQueryExecuted}
              naturalLanguageQuery={currentQuery?.naturalLanguage || ""}
            />
            
            <DataVisualization 
              data={currentQuery?.results || []}
              isLoading={false}
            />
          </div>

          {/* Insights Panel */}
          {currentQuery?.insights && currentQuery.insights.length > 0 && (
            <InsightsPanel insights={currentQuery.insights} />
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg"
        size="icon"
        data-testid="button-quick-query"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}

function convertToCSV(data: any[]): string {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
