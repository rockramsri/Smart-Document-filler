import { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage, PlaceholdersResponse } from './types';

interface AppState {
  documentId: string | null;
  fileName: string | null;
  chatHistory: ChatMessage[];
  placeholdersData: PlaceholdersResponse | null;
  isLoading: boolean;
  setDocumentId: (id: string | null) => void;
  setFileName: (name: string | null) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  setPlaceholdersData: (data: PlaceholdersResponse | null) => void;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [placeholdersData, setPlaceholdersData] = useState<PlaceholdersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addChatMessage = (message: ChatMessage) => {
    setChatHistory((prev) => [...prev, message]);
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  return (
    <AppContext.Provider
      value={{
        documentId,
        fileName,
        chatHistory,
        placeholdersData,
        isLoading,
        setDocumentId,
        setFileName,
        addChatMessage,
        clearChat,
        setPlaceholdersData,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}
