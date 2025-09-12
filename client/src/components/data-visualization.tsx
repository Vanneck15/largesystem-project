import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface DataVisualizationProps {
  data: any[];
  isLoading: boolean;
}

type ViewType = "table" | "bar" | "line" | "pie";

export default function DataVisualization({ data, isLoading }: DataVisualizationProps) {
  const [viewType, setViewType] = useState<ViewType>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const getChartData = () => {
    if (!data.length) return [];
    
    // Transform data for charts - take first 10 items and use first two numeric columns
    const chartData = data.slice(0, 10);
    const columns = Object.keys(data[0] || {});
    const numericColumns = columns.filter(col => 
      typeof data[0][col] === 'number' && !isNaN(data[0][col])
    );
    
    if (numericColumns.length === 0) return chartData;
    
    return chartData.map((item, index) => ({
      name: item[columns[0]] || `Item ${index + 1}`,
      value: item[numericColumns[0]] || 0,
      value2: numericColumns[1] ? item[numericColumns[1]] || 0 : 0,
    }));
  };

  const chartData = getChartData();
  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const renderChart = () => {
    if (!chartData.length) return null;

    switch (viewType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="value" fill={colors[0]} />
              {chartData[0]?.value2 !== undefined && (
                <Bar dataKey="value2" fill={colors[1]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]} 
                strokeWidth={2}
                dot={{ fill: colors[0] }}
              />
              {chartData[0]?.value2 !== undefined && (
                <Line 
                  type="monotone" 
                  dataKey="value2" 
                  stroke={colors[1]} 
                  strokeWidth={2}
                  dot={{ fill: colors[1] }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill={colors[0]}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      if (value % 1 === 0) return value.toLocaleString();
      return value.toFixed(2);
    }
    if (typeof value === 'string' && value.length > 50) {
      return value.slice(0, 50) + '...';
    }
    return value;
  };

  const getGrowthIndicator = (value: any) => {
    if (typeof value === 'string' && value.includes('%')) {
      const num = parseFloat(value.replace('%', ''));
      if (num > 0) return <TrendingUp className="w-4 h-4 text-accent" />;
      if (num < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    }
    return null;
  };

  return (
    <Card data-testid="data-visualization">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center space-x-2">
            <BarChart3 className="text-primary w-4 h-4" />
            <span>Query Results</span>
          </h3>
          <Select value={viewType} onValueChange={(value: ViewType) => setViewType(value)}>
            <SelectTrigger className="w-32" data-testid="select-view-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Table View</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="h-64 bg-muted/30 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">Executing query...</p>
            </div>
          </div>
        ) : !data.length ? (
          <div className="h-64 bg-muted/30 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Execute a query to view results</p>
            </div>
          </div>
        ) : (
          <>
            {viewType !== "table" && (
              <div className="mb-6">
                {renderChart()}
              </div>
            )}

            {/* Data Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 border-b border-border">
                <span className="text-sm font-medium text-foreground">
                  Query Results ({data.length} total rows)
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  {data.length > 0 && (
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        {Object.keys(data[0]).map((header) => (
                          <TableHead key={header} className="font-medium text-foreground">
                            {header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                  )}
                  <TableBody>
                    {paginatedData.map((row, index) => (
                      <TableRow key={startIndex + index} className="hover:bg-muted/30">
                        {Object.entries(row).map(([key, value], cellIndex) => (
                          <TableCell key={cellIndex} className="text-foreground">
                            <div className="flex items-center space-x-2">
                              <span>{formatValue(value)}</span>
                              {getGrowthIndicator(value)}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} results
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    data-testid="button-previous-page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    data-testid="button-next-page"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
