import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppState } from '@/lib/store';
import { sendChat, getPlaceholders } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from '@/lib/types';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [expandedFills, setExpandedFills] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { documentId, chatHistory, addChatMessage, setPlaceholdersData, isLoading } = useAppState();
  const { toast } = useToast();

  const toggleFills = (messageId: string) => {
    setExpandedFills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async () => {
    if (!input.trim() || !documentId || isSending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    addChatMessage(userMessage);
    setInput('');
    setIsSending(true);

    try {
      const response = await sendChat(documentId, input);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        fills: response.fills,
        timestamp: new Date(),
      };

      addChatMessage(assistantMessage);

      // Refresh placeholders after chat
      const placeholders = await getPlaceholders(documentId);
      setPlaceholdersData(placeholders);

      if (response.fills && response.fills.length > 0) {
        toast({
          title: "Fields updated",
          description: `${response.fills.length} placeholder${response.fills.length > 1 ? 's' : ''} filled`,
        });
      }
    } catch (error) {
      toast({
        title: "Chat failed",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!documentId) {
    return (
      <Card className="h-full flex items-center justify-center bg-gradient-card">
        <div className="text-center p-8">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ready to Chat</h3>
          <p className="text-sm text-muted-foreground">
            Upload a document to start filling placeholders
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-gradient-card shadow-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-semibold">Interactive Filler</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-6">
              <p className="text-muted-foreground mb-4">
                I'll help you fill the placeholders in your document.
              </p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">Quick commands:</p>
                <p>/status - View current progress</p>
                <p>/help - Get assistance</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={`animate-fade-in ${
                  message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.fills && message.fills.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <button
                        onClick={() => toggleFills(message.id)}
                        className="flex items-center gap-2 w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
                      >
                        {expandedFills.has(message.id) ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        <span>
                          {message.fills.length} placeholder{message.fills.length > 1 ? 's' : ''} filled
                        </span>
                      </button>
                      {expandedFills.has(message.id) && (
                        <div className="space-y-2 animate-fade-in">
                          {message.fills.map((fill, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-success/20 text-success px-2 py-1 rounded flex items-center gap-2"
                            >
                              <span className="font-medium">{fill.field}:</span>
                              <span>{fill.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            disabled={isSending || isLoading}
            className="flex-1 bg-background border border-input rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isSending || isLoading}
            className="bg-gradient-primary"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
