import { UploadResponse, ChatResponse, PlaceholdersResponse } from './types';

// Use environment variable or default to production backend
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://sdf-backend.onrender.com";

export async function uploadDocument(file: File): Promise<UploadResponse> {
  console.group('📤 Upload Document');
  console.log('File:', file.name, file.size, 'bytes');
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE}/upload-document`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Response:', data);
    console.groupEnd();
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    console.groupEnd();
    throw error;
  }
}

export async function sendChat(documentId: string, userInput: string): Promise<ChatResponse> {
  console.group('💬 Send Chat');
  console.log('Document ID:', documentId);
  console.log('User Input:', userInput);

  try {
    const response = await fetch(`${API_BASE}/chat/${documentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_input: userInput }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chat failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Response:', data);
    
    // Map backend response to frontend format
    const mappedResponse: ChatResponse = {
      status: data.status || 'success',
      question: data.question,
      message: data.question || data.message || 'Placeholders updated',
      fills: data.fills ? data.fills.map((fill: any) => ({
        unique_id: fill.placeholder_id || fill.unique_id,
        field: fill.match || fill.field,
        value: fill.value,
      })) : undefined,
    };
    
    console.groupEnd();
    return mappedResponse;
  } catch (error) {
    console.error('Chat error:', error);
    console.groupEnd();
    throw error;
  }
}

export async function getPlaceholders(documentId: string): Promise<PlaceholdersResponse> {
  console.group('📋 Get Placeholders');
  console.log('Document ID:', documentId);

  try {
    const response = await fetch(`${API_BASE}/placeholders/${documentId}`);

    if (!response.ok) {
      throw new Error(`Fetch placeholders failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Response:', data);
    console.groupEnd();
    return data;
  } catch (error) {
    console.error('Placeholders error:', error);
    console.groupEnd();
    throw error;
  }
}

export function downloadDocument(documentId: string): void {
  console.log('⬇️ Download Document:', documentId);
  window.open(`${API_BASE}/download/${documentId}`, '_blank');
}

export async function getDocumentBlob(documentId: string): Promise<Blob> {
  console.group('👁️ Get Document Preview');
  console.log('Document ID:', documentId);

  try {
    const response = await fetch(`${API_BASE}/download/${documentId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log('Document blob received:', blob.type, blob.size);
    console.groupEnd();
    return blob;
  } catch (error) {
    console.error('Document fetch error:', error);
    console.groupEnd();
    throw error;
  }
}
