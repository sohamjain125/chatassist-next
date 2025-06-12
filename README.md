## 🧭 Application Flow


graph TD
    A[Login] --> B[Dashboard]
    B --> C[Search Property]
    B --> D[View Recent Searches]
    B --> E[View Historical Data]
    C --> F[Property Details]
    F --> G[Ask AI (Chat)]
    G --> H[Chat Session]
    H --> I[Chat History]
    D --> I
    E --> J[Historical Data Page]


- **Dashboard**: Entry point after login, shows recent searches and navigation.
- **Search**: Find properties, view details, and start a chat.
- **Chat**: AI assistant for property questions, with session management.
- **History**: View/search previous chats and property searches.
- **Historical Data**: See property transaction and event history.

## 🔑 Key Pages & Components

### Pages

- `src/app/dashboard/page.tsx` — Main dashboard, recent searches, navigation.
- `src/app/search/page.tsx` — Property search with suggestions and map.
- `src/app/property/page.tsx` — Property details, zoning, overlays, and AI chat entry.
- `src/app/chat/page.tsx` — AI chat interface, session management, chat history.
- `src/app/history/page.tsx` — View/search all previous property searches and chats.
- `src/app/historical-data/page.tsx` — Historical data for a property.

### Components

- `Card`, `Button`, `Loader2`, `Avatar`, `Sidebar`, `StickyHeader`, etc.
- `PropertyDetails` — Shows property info, zoning, overlays, and chat entry.
- `Map` — Google Maps integration for property location.
- `Chat` — AI chat UI, message bubbles, session logic.

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/login` — User login
- `GET /api/auth/user` — Get current user info

### Property

- `GET /api/property-list?query=...` — Autocomplete property search
- `GET /api/property-details?assessmentNumber=...` — Property details
- `GET /api/zone?assessmentNumber=...` — Zoning info
- `GET /api/overlay?assessmentNumber=...` — Overlay info

### Search & History

- `GET /api/search/history` — User's recent property searches

### Chat

- `POST /api/chat/save` — Save chat session/messages
- `GET /api/chat/history?searchId=...` — All chat sessions for a property
- `GET /api/chat/history?searchId=...&sessionId=...` — Messages for a session
- `POST /api/chat/end` — End a chat session

## 🛠️ How to Run & Develop

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` and fill in your secrets (DB, AWS, etc.)

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   - Visit [http://localhost:3000](http://localhost:3000)

