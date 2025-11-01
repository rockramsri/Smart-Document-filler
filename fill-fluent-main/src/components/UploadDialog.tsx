import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { uploadDocument, getPlaceholders } from '@/lib/api';
import { useAppState } from '@/lib/store';

export function UploadDialog() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { setDocumentId, setFileName, clearChat, setPlaceholdersData, setIsLoading, addChatMessage } = useAppState();

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .docx file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setIsLoading(true);
    try {
      const response = await uploadDocument(file);
      setDocumentId(response.document_id);
      setFileName(file.name);
      clearChat();

      // Fetch initial placeholders
      const placeholders = await getPlaceholders(response.document_id);
      setPlaceholdersData(placeholders);

      // Add welcome message
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Hey there! 👋 I'm your Smart Document Filler assistant. I just took a peek at your "${file.name}" and I'm ready to help you fill it out. We've got ${placeholders.summary.total_placeholders} fields to tackle, but don't worry - I'll make this quick and easy! 😊\n\nJust tell me anything you know about your document, and I'll take care of the rest. What's the name of the company in this SAFE agreement?`,
        timestamp: new Date(),
      });

      toast({
        title: "Document uploaded",
        description: `${file.name} is ready to be filled`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsLoading(false);
    }
  }, [toast, setDocumentId, setFileName, clearChat, setPlaceholdersData, setIsLoading]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
        isDragging ? 'border-primary bg-primary/10' : 'border-border bg-card'
      } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!isUploading) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Processing Document...</h3>
            <p className="text-sm text-muted-foreground">
              Analyzing placeholders and generating metadata. This may take a moment.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-primary/20 p-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your .docx file here, or click to browse
            </p>
          </div>
          <Button variant="outline" className="relative">
            <Upload className="mr-2 h-4 w-4" />
            Choose File
            <input
              type="file"
              accept=".docx"
              onChange={handleFileInput}
              disabled={isUploading}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </Button>
        </div>
      )}
    </div>
  );
}
