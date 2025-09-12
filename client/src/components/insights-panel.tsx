import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertTriangle, Star } from "lucide-react";

interface InsightsPanelProps {
  insights: string[];
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  const getInsightIcon = (insight: string, index: number) => {
    const lowerInsight = insight.toLowerCase();
    
    if (lowerInsight.includes('growth') || lowerInsight.includes('increase') || lowerInsight.includes('improve')) {
      return <TrendingUp className="text-accent w-4 h-4" />;
    }
    
    if (lowerInsight.includes('decline') || lowerInsight.includes('decrease') || lowerInsight.includes('attention') || lowerInsight.includes('concern')) {
      return <AlertTriangle className="text-orange-500 w-4 h-4" />;
    }
    
    if (lowerInsight.includes('top') || lowerInsight.includes('best') || lowerInsight.includes('highest') || lowerInsight.includes('perform')) {
      return <Star className="text-primary w-4 h-4" />;
    }
    
    return <Lightbulb className="text-primary w-4 h-4" />;
  };

  const getInsightType = (insight: string) => {
    const lowerInsight = insight.toLowerCase();
    
    if (lowerInsight.includes('growth') || lowerInsight.includes('increase')) {
      return { label: "Growth Trend", variant: "default" as const };
    }
    
    if (lowerInsight.includes('decline') || lowerInsight.includes('attention')) {
      return { label: "Attention Needed", variant: "destructive" as const };
    }
    
    if (lowerInsight.includes('top') || lowerInsight.includes('perform')) {
      return { label: "Top Performer", variant: "secondary" as const };
    }
    
    return { label: "Insight", variant: "outline" as const };
  };

  if (!insights.length) return null;

  return (
    <Card className="mt-8 fade-in" data-testid="insights-panel">
      <CardHeader>
        <h3 className="font-semibold text-foreground flex items-center space-x-2">
          <Lightbulb className="text-primary w-4 h-4" />
          <span>AI-Generated Insights</span>
          <Badge variant="secondary" className="ml-2">
            Beta
          </Badge>
        </h3>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => {
            const { label, variant } = getInsightType(insight);
            
            return (
              <div 
                key={index} 
                className="p-4 bg-muted/30 rounded-lg"
                data-testid={`insight-${index}`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {getInsightIcon(insight, index)}
                  <Badge variant={variant} className="text-xs">
                    {label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insight}
                </p>
              </div>
            );
          })}
        </div>

        {insights.length > 3 && (
          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              AI insights are generated based on your query results and may not always be accurate. 
              Please verify important findings with domain experts.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
