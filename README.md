# Fill Fluent 🚀

**AI-Powered Document Filler using Conversational Interface**

Fill Fluent is an intelligent document filling system that uses natural language conversations to automatically fill placeholders in Word documents. Built with React, FastAPI, and powered by Google's Gemini 2.5 Flash.

---

## 🌐 Live Demo - https://fill-fluent.vercel.app/


- **Frontend**: [fill-fluent.vercel.app](https://fill-fluent.vercel.app/)
- **Backend API**: [sdf-backend.onrender.com](https://sdf-backend.onrender.com)

---

## 🏗️ Architecture

### Monorepo Structure
```
Smart-legal-filler/
├── Main-UI/              # React Frontend (Vercel)
│   └── fill-fluent/
└── Main-backend/         # Python Backend (Render)
    ├── main.py          # FastAPI server
    └── document_storage/
```

### Tech Stack

**Frontend**
- React 18 + TypeScript + Vite
- shadcn/ui components
- TailwindCSS
- docx-preview for document rendering
- Built with Lovable & Cursor

**Backend**
- Python 3.11+
- FastAPI
- LangChain + Google Gemini 2.5 Flash
- python-docx for document processing
- Uvicorn server

---

## 🎯 Features

✅ **Conversational Filling**: Chat with AI to fill document placeholders
✅ **Smart Context**: LLM analyzes each placeholder with full document context
✅ **Real-time Preview**: View filled document before download
✅ **Progress Tracking**: Monitor completion percentage of placeholders
✅ **Multiple Patterns**: Supports various placeholder formats (\[Name\], \_\_\_\_, \{Field\}, etc.)

### Current Limitations

⚠️ **Free Tier Constraints**
- Backend: 50s spin-up delay after inactivity (Render free tier)
- No persistent storage (ephemeral file system)
- Keep chat active to prevent shutdowns

⚠️ **Functionality**
- Signing blocks require manual review
- Some repetitive questions need prompt improvements
- Gemini API key is added of my personal account in the deployment
- Response time optimization needed (chunking & prompt chaining)

---

## 🔌 API Endpoints

### Base URL
```
https://sdf-backend.onrender.com
```

### Endpoints

#### 1. Upload Document
```bash
curl -X POST "https://sdf-backend.onrender.com/upload-document" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.docx"
```

**Response:**
```json
{
  "status": "success",
  "document_id": "abc-123-def-456",
  "message": "Document uploaded and metadata generated successfully",
  "summary": {
    "total_placeholders": 11,
    "unique_placeholders": 9
  }
}
```

---

#### 2. Chat with Document
```bash
curl -X POST "https://sdf-backend.onrender.com/chat/{document_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_input": "The company name is TechStart Inc."
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Placeholders updated",
  "question": "What is the investor name?",
  "fills": [
    {
      "placeholder_id": "PLACEHOLDER_0001",
      "match": "[Company Name]",
      "value": "TechStart Inc.",
      "confidence": "High"
    }
  ]
}
```

---

#### 3. Get Placeholders Status
```bash
curl "https://sdf-backend.onrender.com/placeholders/{document_id}"
```

**Response:**
```json
{
  "status": "success",
  "summary": {
    "total_placeholders": 11,
    "filled_count": 3,
    "unfilled_count": 8,
    "completion_percentage": 27.27
  },
  "placeholders": [
    {
      "unique_id": "PLACEHOLDER_0001",
      "match": "[Company Name]",
      "is_filled": true,
      "value": "TechStart Inc.",
      "llm_context": "This placeholder is for...",
      "sentence_with_match": "The company name is [Company Name]",
      "estimated_page_number": 1
    }
  ]
}
```

---

#### 4. Download Filled Document
```bash
curl "https://sdf-backend.onrender.com/download/{document_id}" \
  --output filled_document.docx
```

**Response:** Binary .docx file with filled values

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- Google Gemini API Key

### Backend Setup

```bash
cd Main-backend

# Install dependencies
pip install -r requirements.txt

# Set API key
export GOOGLE_API_KEY="your-api-key-here"

# Run server
uvicorn main:app --reload --port 8000
```

**Backend runs on:** `http://localhost:8000`

### Frontend Setup

```bash
cd Main-UI/fill-fluent

# Install dependencies
npm install

# Set backend URL
export VITE_API_BASE_URL=http://localhost:8000

# Run dev server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

---

## 📦 Dependencies

### Backend (`requirements.txt`)
```
python-docx
langchain==1.0.0
langchain-core==1.0.0
langchain-community==0.4.0
langchain-classic==1.0.0
langchain-google-genai==2.1.12
fastapi
uvicorn
pydantic
python-multipart
```

### Frontend (`package.json`)
Key dependencies:
- React 18.3+ & TypeScript
- shadcn/ui & Radix UI
- TailwindCSS & Tailwind Animate
- docx-preview 0.1.4
- React Router 6.30+
- TanStack Query 5.83+

---

## 🔮 Planned Improvements

1. **Performance**
   - Implement context chunking for large documents
   - Add prompt chaining for sequential question generation
   - Reduce LLM response latency

2. **Features**
   - Dynamic placeholder pattern detection using LLM
   - User-provided API key support
   - Persistent storage integration
   - Batch document processing

3. **Reliability**
   - Better error handling and retry logic
   - Improved repetitive question detection
   - Enhanced placeholder context analysis

4. **UX**
   - Real-time document updates
   - Better loading states
   - Mobile responsive improvements

---

## 🤝 Contributing

Contributions welcome! Please feel free to submit PRs or open issues.

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## 🔗 Links

- **Live Demo**: [fill-fluent.vercel.app](https://fill-fluent.vercel.app)
- **API Docs**: See curl examples above
- **Built with**: React + FastAPI + Gemini 2.5 Flash

---

## 💡 Usage Example

```bash
# 1. Upload document
curl -X POST "https://sdf-backend.onrender.com/upload-document" \
  -F "file=@contract.docx"
# Returns: { "document_id": "abc-123" }

# 2. Chat to fill
curl -X POST "https://sdf-backend.onrender.com/chat/abc-123" \
  -H "Content-Type: application/json" \
  -d '{"user_input": "Company: Acme Corp, Date: 2024-01-15"}'

# 3. Check progress
curl "https://sdf-backend.onrender.com/placeholders/abc-123"

# 4. Download result
curl "https://sdf-backend.onrender.com/download/abc-123" \
  --output filled_contract.docx
```

---

**Note**: This is a demo project using free-tier services. For production use, upgrade to paid tiers for persistent storage and better reliability.

