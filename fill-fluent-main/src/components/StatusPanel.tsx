import { useState, useMemo } from 'react';
import { Search, RefreshCw, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAppState } from '@/lib/store';
import { getPlaceholders } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function StatusPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'filled' | 'unfilled'>('all');
  const [sortBy, setSortBy] = useState<'page' | 'paragraph' | 'confidence'>('page');
  const { documentId, placeholdersData, setPlaceholdersData, setIsLoading } = useAppState();
  const { toast } = useToast();

  const handleRefresh = async () => {
    if (!documentId) return;
    
    setIsLoading(true);
    try {
      const data = await getPlaceholders(documentId);
      setPlaceholdersData(data);
      toast({
        title: "Status updated",
        description: "Placeholder data refreshed",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: error instanceof Error ? error.message : "Failed to refresh",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlaceholders = useMemo(() => {
    if (!placeholdersData) return [];

    let filtered = placeholdersData.placeholders;

    // Filter by type
    if (filterType === 'filled') {
      filtered = filtered.filter((p) => p.is_filled);
    } else if (filterType === 'unfilled') {
      filtered = filtered.filter((p) => !p.is_filled);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.match.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.unique_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.value && p.value.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'page') {
        return a.estimated_page_number - b.estimated_page_number;
      } else if (sortBy === 'paragraph') {
        return a.paragraph_index - b.paragraph_index;
      } else {
        // Sort by filled status first
        if (a.is_filled !== b.is_filled) {
          return a.is_filled ? 1 : -1;
        }
        return 0;
      }
    });

    return filtered;
  }, [placeholdersData, filterType, searchQuery, sortBy]);

  if (!documentId) {
    return (
      <Card className="h-full flex items-center justify-center bg-gradient-card">
        <div className="text-center p-8">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Status Yet</h3>
          <p className="text-sm text-muted-foreground">
            Upload a document to track placeholders
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-gradient-card shadow-card">
      <div className="border-b border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Placeholder Status</span>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {placeholdersData && (
          <div className="space-y-3">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary transition-all duration-500 animate-pulse-glow"
                style={{ width: `${placeholdersData.summary.completion_percentage}%` }}
              />
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-success/20 text-success font-medium">
                {placeholdersData.summary.filled_count} Filled
              </span>
              <span className="px-2 py-1 rounded-full bg-warning/20 text-warning font-medium">
                {placeholdersData.summary.unfilled_count} Unfilled
              </span>
              <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                {placeholdersData.summary.total_placeholders} Total
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button
            variant={filterType === 'filled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('filled')}
          >
            Filled
          </Button>
          <Button
            variant={filterType === 'unfilled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('unfilled')}
          >
            Unfilled
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search placeholders..."
            className="w-full bg-background border border-input rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="page">Sort by Page</option>
          <option value="paragraph">Sort by Paragraph</option>
          <option value="confidence">Sort by Status</option>
        </select>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Accordion type="single" collapsible className="space-y-2">
          {filteredPlaceholders.map((placeholder) => (
            <AccordionItem
              key={placeholder.unique_id}
              value={placeholder.unique_id}
              className="border border-border rounded-lg overflow-hidden animate-slide-in"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-2">
                    {placeholder.is_filled ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    )}
                    <span className="font-medium text-sm">{placeholder.match}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Page {placeholder.estimated_page_number}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 space-y-3 bg-card/50">
                {placeholder.value && (
                  <div className="p-2 bg-success/10 border border-success/20 rounded text-sm">
                    <span className="font-medium text-success">Value: </span>
                    <span>{placeholder.value}</span>
                  </div>
                )}
                
                <div className="text-xs space-y-2">
                  <div>
                    <span className="font-medium text-foreground">Context:</span>
                    <p className="text-muted-foreground mt-1">{placeholder.llm_context}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                    <div>
                      <span className="text-muted-foreground">ID:</span>
                      <p className="font-mono text-foreground">{placeholder.unique_id}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Paragraph:</span>
                      <p className="text-foreground">{placeholder.paragraph_index}</p>
                    </div>
                  </div>
                </div>

                {!placeholder.is_filled && (
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <MessageSquare className="h-3 w-3 mr-2" />
                    Ask about this field
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Card>
  );
}
