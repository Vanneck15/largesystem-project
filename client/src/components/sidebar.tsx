import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChartLine, Search, Database, BarChart, Plus, Star, Table } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Query } from "@shared/schema";

interface SidebarProps {
  onQuerySelect: (query: { naturalLanguage: string; sql: string; title: string }) => void;
}

export default function Sidebar({ onQuerySelect }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("query-builder");
  const queryClient = useQueryClient();

  const { data: queries = [], isLoading } = useQuery({
    queryKey: ["/api/queries"],
  });

  const { data: favoriteQueries = [] } = useQuery({
    queryKey: ["/api/queries/favorites"],
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const response = await fetch(`/api/queries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });
      if (!response.ok) throw new Error("Failed to update favorite status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/queries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/queries/favorites"] });
    },
  });

  const handleQueryClick = (query: Query) => {
    onQuerySelect({
      naturalLanguage: query.naturalLanguageQuery,
      sql: query.sqlQuery,
      title: query.title,
    });
  };

  const handleToggleFavorite = (query: Query) => {
    toggleFavoriteMutation.mutate({
      id: query.id,
      isFavorite: query.isFavorite,
    });
  };

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col" data-testid="sidebar">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <ChartLine className="text-sidebar-primary-foreground text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-sidebar-foreground">DataInsight Pro</h1>
            <p className="text-sm text-muted-foreground">Product Analytics Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-b border-sidebar-border">
        <nav className="space-y-2">
          <Button
            variant={activeTab === "query-builder" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              activeTab === "query-builder" && "bg-sidebar-primary/10 text-sidebar-primary"
            )}
            onClick={() => setActiveTab("query-builder")}
            data-testid="nav-query-builder"
          >
            <Search className="w-4 h-4 mr-3" />
            Query Builder
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-sidebar-foreground"
            data-testid="nav-datasets"
          >
            <Database className="w-4 h-4 mr-3" />
            Datasets
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-sidebar-foreground"
            data-testid="nav-dashboards"
          >
            <BarChart className="w-4 h-4 mr-3" />
            Dashboards
          </Button>
        </nav>
      </div>

      {/* Query History */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sidebar-foreground">Recent Queries</h3>
          <Button variant="ghost" size="icon" data-testid="button-add-query">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {queries.slice(0, 10).map((query: Query) => (
              <div
                key={query.id}
                className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleQueryClick(query)}
                data-testid={`query-item-${query.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-sidebar-foreground line-clamp-1">
                    {query.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-4 h-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(query);
                    }}
                    data-testid={`button-favorite-${query.id}`}
                  >
                    <Star
                      className={cn(
                        "w-3 h-3",
                        query.isFavorite ? "text-accent fill-accent" : "text-muted-foreground"
                      )}
                    />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {query.naturalLanguageQuery}
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(query.createdAt).toRelativeTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample Datasets */}
      <div className="p-6 border-t border-sidebar-border">
        <h3 className="font-medium text-sidebar-foreground mb-3">Sample Datasets</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Table className="w-3 h-3" />
            <span>user_analytics</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Table className="w-3 h-3" />
            <span>feature_usage</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Table className="w-3 h-3" />
            <span>conversion_metrics</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Extend Date prototype for relative time
declare global {
  interface Date {
    toRelativeTimeString(): string;
  }
}

Date.prototype.toRelativeTimeString = function() {
  const now = new Date();
  const diffInMs = now.getTime() - this.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${diffInDays} days ago`;
};
