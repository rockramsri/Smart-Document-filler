import { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentDocxPreviewProps {
  fileUrl?: string;
  blob?: Blob;
  zoom?: number;
  className?: string;
}

export function DocumentDocxPreview({
  fileUrl,
  blob: providedBlob,
  zoom = 1,
  className = '',
}: DocumentDocxPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const blobRef = useRef<Blob | null>(null);

  useEffect(() => {
    // Don't render if container isn't mounted or has zero height
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    if (rect.height === 0) {
      console.warn('Container has zero height, waiting...');
      return;
    }

    // Reset state
    setError(null);
    setIsLoading(true);
    container.innerHTML = '';

    const loadAndRender = async () => {
      try {
        let blob: Blob;

        // Get blob from prop or fetch from URL
        if (providedBlob) {
          blob = providedBlob;
        } else if (fileUrl) {
          const response = await fetch(fileUrl, {
            headers: {
              'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch document: ${response.statusText}`);
          }

          blob = await response.blob();
          blobRef.current = blob;
        } else {
          throw new Error('Neither fileUrl nor blob provided');
        }

        // Validate blob type
        if (!blob.type.includes('wordprocessingml') && !blob.type.includes('officedocument')) {
          console.warn('Unexpected blob type:', blob.type);
        }

        // Convert to ArrayBuffer
        const arrayBuffer = await blob.arrayBuffer();

        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error('Document is empty or invalid');
        }

        console.log('Rendering docx-preview:', {
          blobSize: blob.size,
          arrayBufferSize: arrayBuffer.byteLength,
          containerHeight: container.offsetHeight,
          containerVisible: container.offsetParent !== null,
        });

        // Wait for container to be fully visible
        let attempts = 0;
        while (container.offsetParent === null && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        // Render with docx-preview
        await renderAsync(
          arrayBuffer,
          container,
          undefined, // styleContainer
          {
            className: 'docx-wrapper',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            experimental: false,
            trimXmlDeclaration: true,
            useBase64URL: false,
          }
        );

        console.log('Document rendered successfully');
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('docx-preview error:', err);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    loadAndRender();
  }, [fileUrl, providedBlob]);

  // Apply zoom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.transform = `scale(${zoom})`;
      containerRef.current.style.transformOrigin = 'top center';
    }
  }, [zoom]);

  return (
    <div className={`relative ${className}`} style={{ minHeight: '400px' }}>
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to render document: {error}
          </AlertDescription>
        </Alert>
      )}

      <div
        ref={containerRef}
        className="docx-preview-container"
        style={{
          backgroundColor: 'white',
          color: 'black',
          minHeight: '400px',
          padding: '1in',
          transformOrigin: 'top center',
        }}
      />
    </div>
  );
}

