import { useState } from 'react';
import { RefreshCw, Download, FileText, Eye, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppState } from '@/lib/store';
import { downloadDocument, getPlaceholders, getDocumentBlob } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { DocumentDocxPreview } from './DocumentDocxPreview';

export function DocumentViewer() {
  const { documentId, fileName, placeholdersData, setPlaceholdersData, setIsLoading } = useAppState();
  const { toast } = useToast();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [documentBlob, setDocumentBlob] = useState<Blob | null>(null);

  const handleRefresh = async () => {
    if (!documentId) return;
    
    setIsLoading(true);
    try {
      const data = await getPlaceholders(documentId);
      setPlaceholdersData(data);
      toast({
        title: "Refreshed",
        description: "Document status updated",
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

  const handleDownload = () => {
    if (!documentId) return;
    downloadDocument(documentId);
    toast({
      title: "Downloading",
      description: "Your document is being downloaded",
    });
  };

  const handlePreview = async () => {
    if (!documentId) return;
    
    // Open modal first
    setIsPreviewOpen(true);
    setZoomLevel(100);
    
    // Fetch blob asynchronously - component will handle rendering when ready
    try {
      const blob = await getDocumentBlob(documentId);
      setDocumentBlob(blob);
    } catch (error) {
      console.error('Failed to fetch document blob:', error);
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Failed to load document",
        variant: "destructive",
      });
      setIsPreviewOpen(false);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  if (!documentId) {
    return (
      <Card className="h-full flex items-center justify-center bg-gradient-card">
        <div className="text-center p-8">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Document Yet</h3>
          <p className="text-sm text-muted-foreground">
            Upload a .docx file to get started
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-gradient-card shadow-card">
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-medium truncate">{fileName || 'Document'}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-background/50 rounded-lg p-6 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-lg font-semibold">Document Preview</h3>
              {placeholdersData && (
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                    {placeholdersData.summary.filled_count} Filled
                  </span>
                  <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-sm font-medium">
                    {placeholdersData.summary.unfilled_count} Remaining
                  </span>
                </div>
              )}
            </div>

            {placeholdersData && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion Progress</span>
                  <span className="font-semibold text-primary">
                    {placeholdersData.summary.completion_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary transition-all duration-500"
                    style={{ width: `${placeholdersData.summary.completion_percentage}%` }}
                  />
                </div>

                <div className="mt-6 p-4 bg-card rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    Document is being filled interactively through the chat. 
                    Each placeholder you complete will be reflected in the final document.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handlePreview}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview Dialog */}
      <Dialog 
        open={isPreviewOpen} 
        onOpenChange={(open) => {
          setIsPreviewOpen(open);
          if (!open) {
            // Clear blob when dialog closes to avoid re-render issues
            setDocumentBlob(null);
          }
        }}
      >
        <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle>Document Preview - {fileName || 'Document'}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                  {zoomLevel}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomReset}
                  disabled={zoomLevel === 100}
                  className="ml-2"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4" style={{ minHeight: '500px' }}>
            {isPreviewOpen && documentBlob && (
              <div className="bg-white dark:bg-gray-800 shadow-lg mx-auto" style={{ maxWidth: '8.5in' }}>
                <DocumentDocxPreview
                  blob={documentBlob}
                  zoom={zoomLevel / 100}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
