import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentViewer } from '@/components/DocumentViewer';
import { ChatPanel } from '@/components/ChatPanel';
import { StatusPanel } from '@/components/StatusPanel';
import { UploadDialog } from '@/components/UploadDialog';
import { useAppState } from '@/lib/store';
import { useState } from 'react';

const Index = () => {
  const { documentId } = useAppState();
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Smart Document Filler
            </h1>
          </div>
          <Button
            onClick={() => setShowUpload(true)}
            className="bg-gradient-primary shadow-elevated"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {!documentId && !showUpload ? (
          <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-2xl w-full animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Welcome to Smart Document Filler</h2>
                <p className="text-lg text-muted-foreground">
                  Upload a .docx document and let AI help you fill all the placeholders interactively.
                </p>
              </div>
              <UploadDialog />
            </div>
          </div>
        ) : showUpload ? (
          <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-2xl w-full animate-fade-in">
              <div className="mb-4">
                <Button variant="ghost" onClick={() => setShowUpload(false)}>
                  ← Back
                </Button>
              </div>
              <UploadDialog />
            </div>
          </div>
        ) : (
          <div className="h-full grid grid-cols-12 gap-4 p-4">
            {/* Left: Document Viewer */}
            <div className="col-span-3 animate-fade-in h-full overflow-hidden">
              <DocumentViewer />
            </div>

            {/* Center: Chat */}
            <div className="col-span-6 animate-fade-in h-full overflow-hidden" style={{ animationDelay: '0.1s' }}>
              <ChatPanel />
            </div>

            {/* Right: Status */}
            <div className="col-span-3 animate-fade-in h-full overflow-hidden" style={{ animationDelay: '0.2s' }}>
              <StatusPanel />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
