# Development Guide - Telegram Members Adder

Guide for developers who want to contribute or extend the project.

## Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Components: FileUploader, ConfigForm, Results      │  │
│  │ Pages: page.tsx, api/add-members/route.ts         │  │
│  │ Styling: Tailwind CSS                             │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTP POST /api/add-members
                     │
┌────────────────────▼─────────────────────────────────────┐
│                  Backend (FastAPI)                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │ main.py: FastAPI app & request handlers           │  │
│  │ telegram_service.py: Telethon integration         │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │ Telethon Library
                     │
        ┌────────────▼──────────────┐
        │   Telegram API (MTProto)   │
        └────────────────────────────┘
```

## Frontend Development

### Directory Structure

```
frontend/
├── app/
│   ├── api/
│   │   └── add-members/
│   │       └── route.ts          # API route handler
│   ├── page.tsx                  # Main page component
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── FileUploader.tsx          # CSV upload component
│   ├── ConfigForm.tsx            # Configuration form
│   └── ResultsDisplay.tsx        # Results display component
├── package.json
├── next.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Adding a New Component

1. Create new file in `frontend/components/NewComponent.tsx`
2. Use 'use client' directive for client-side components
3. Export as default
4. Import and use in pages

Example:
```tsx
// frontend/components/StatusBadge.tsx
'use client'

interface StatusBadgeProps {
  status: 'success' | 'error' | 'pending'
  message: string
}

export default function StatusBadge({ status, message }: StatusBadgeProps) {
  return (
    <div className={`px-4 py-2 rounded ${
      status === 'success' ? 'bg-green-900' : 'bg-red-900'
    }`}>
      {message}
    </div>
  )
}
```

### Styling with Tailwind

The project uses Tailwind CSS with a dark Telegram theme:

```tsx
// Colors available:
// - telegram-blue: #0088cc (primary)
// - telegram-dark: #0f0f10 (dark background)
// - gray-700, gray-800, gray-900 (neutrals)

<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
  <h2 className="text-telegram-blue font-semibold">Heading</h2>
</div>
```

### API Route Modifications

Edit `frontend/app/api/add-members/route.ts` to:
- Change request validation
- Modify response format
- Add logging
- Update backend URL logic

## Backend Development

### Directory Structure

```
backend/
├── main.py                # FastAPI application
├── telegram_service.py    # Telethon service class
├── requirements.txt       # Python dependencies
└── pyproject.toml         # Project metadata
```

### Adding a New Backend Endpoint

Example: Add a validation endpoint

```python
# In backend/main.py

@app.post("/validate-group")
async def validate_group(group_id: str) -> dict:
    """Validate if group exists and user is admin."""
    try:
        service = TelegramService(api_id, api_hash)
        connected = await service.connect(phone)
        
        if not connected:
            return {"valid": False, "message": "Not connected"}
        
        try:
            group = await service._get_group(group_id)
            is_valid = group is not None
            return {
                "valid": is_valid,
                "group_id": group.id if group else None,
                "name": group.title if group else None
            }
        finally:
            await service.disconnect()
    except Exception as e:
        return {"valid": False, "message": str(e)}
```

### Extending TelegramService

Add methods to `backend/telegram_service.py`:

```python
class TelegramService:
    # ... existing code ...
    
    async def get_group_members(self, group_id: str) -> list[dict]:
        """Get list of group members."""
        if not self.client:
            return []
        
        group = await self._get_group(group_id)
        if not group:
            return []
        
        members = []
        async for member in self.client.iter_participants(group):
            members.append({
                'id': member.id,
                'username': member.username,
                'first_name': member.first_name,
                'is_bot': member.bot,
            })
        
        return members
    
    async def is_admin(self, group_id: str) -> bool:
        """Check if current user is admin in group."""
        group = await self._get_group(group_id)
        if not group:
            return False
        
        me = await self.client.get_me()
        # Check admin status...
```

### Error Handling

Create custom error classes:

```python
# In telegram_service.py

class TelegramServiceError(Exception):
    """Base exception for Telegram service."""
    pass

class AuthenticationError(TelegramServiceError):
    """Raised when authentication fails."""
    pass

class GroupNotFoundError(TelegramServiceError):
    """Raised when group cannot be found."""
    pass

# Use in methods:
try:
    if not connected:
        raise AuthenticationError("Failed to authenticate")
except AuthenticationError as e:
    logger.error(f"Auth error: {e}")
```

### Testing the Backend

Create a test script:

```python
# backend/test_api.py
import asyncio
import httpx

async def test_add_members():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/add-members",
            json={
                "api_id": 123456,
                "api_hash": "abc123",
                "phone": "+1234567890",
                "group_id": "@testgroup",
                "members": ["user1", "user2"],
                "delay": 2.0,
            }
        )
        print(response.json())

asyncio.run(test_add_members())
```

## Full Stack Development Workflow

### 1. Make Changes

**Frontend:**
```bash
# Edit components or pages
vim frontend/components/FileUploader.tsx
# Changes auto-reload on save
```

**Backend:**
```bash
# Edit service or main
vim backend/telegram_service.py
# Restart: Kill and re-run `python main.py`
```

### 2. Test Locally

```bash
# Terminal 1: Backend
cd backend
python main.py
# Should show: "Uvicorn running on http://0.0.0.0:8000"

# Terminal 2: Frontend
cd frontend
npm run dev
# Should show: "ready - started server on 0.0.0.0:3000"

# Terminal 3: Test
curl -X POST http://localhost:8000/health
curl -X POST http://localhost:3000
```

### 3. Commit Changes

```bash
git add .
git commit -m "Add feature: description"
git push origin feature-branch
```

## Debugging

### Frontend Debugging

1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls
4. Use React DevTools extension

Example debug logging:
```tsx
'use client'

useEffect(() => {
  console.log('[v0] CSV data loaded:', csvData?.length)
}, [csvData])
```

### Backend Debugging

1. Check terminal logs
2. Add print statements
3. Use Python debugger

```python
# In main.py
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.post("/add-members")
async def add_members(request: AddMembersRequest):
    logger.debug(f"[v0] Received request: {request}")
    # ... rest of code
    logger.debug(f"[v0] Processing {len(request.members)} members")
```

### Common Development Issues

**Issue:** Frontend shows 404 for API
```
Solution: Backend not running. Start it first.
```

**Issue:** "Module not found" in backend
```bash
# Reinstall dependencies
cd backend
pip install -r requirements.txt
```

**Issue:** Hot reload not working
```
Solution: Restart dev servers
Kill (Ctrl+C) and rerun npm run dev / python main.py
```

## Code Style Guide

### Python (Backend)

```python
# Use type hints
async def add_members(
    members: list[str],
    group_id: str,
    delay: float = 2.0,
) -> list[MemberResult]:
    """Add members to group."""
    pass

# Docstrings
class TelegramService:
    """Service for managing Telegram operations."""
    
    async def connect(self, phone: str) -> bool:
        """
        Connect to Telegram.
        
        Args:
            phone: Phone number with country code
            
        Returns:
            True if successful
        """
        pass

# Logging
logger.info("Starting member addition process")
logger.error(f"Failed to add member: {error}")
```

### TypeScript/React (Frontend)

```tsx
// Use interfaces
interface Props {
  onSubmit: (data: FormData) => void
  isLoading: boolean
}

// Component naming
export default function ConfigForm({ onSubmit, isLoading }: Props) {
  // Component code
}

// Event handlers
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  // Handle submit
}
```

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
npm start  # Test production build
```

### Backend Build

```bash
cd backend
pip install -r requirements.txt
# Backend runs as: python main.py
```

### Full Project Build

```bash
# This happens on Vercel automatically, but locally:
cd frontend && npm run build && cd ..
cd backend && pip install -r requirements.txt && cd ..
```

## Performance Optimization

### Frontend

```tsx
// Use React.memo for expensive components
const FileUploader = React.memo(function FileUploader(props) {
  // Component code
})

// Use useCallback for event handlers
const handleUpload = useCallback((file: File) => {
  // Handle upload
}, [])
```

### Backend

```python
# Use connection pooling
from telethon import TelegramClient

# Cache group lookups
self._group_cache = {}

async def _get_group(self, group_id: str):
    if group_id in self._group_cache:
        return self._group_cache[group_id]
    
    group = await self.client.get_entity(group_id)
    self._group_cache[group_id] = group
    return group
```

## Testing Strategy

### Frontend Testing (with Jest)

```bash
# Install testing dependencies
cd frontend
npm install --save-dev jest @testing-library/react

# Create test file: components/FileUploader.test.tsx
```

### Backend Testing

```bash
# Install pytest
pip install pytest pytest-asyncio

# Run tests
pytest backend/
```

## Deployment Checklist

Before deploying:

- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables set
- [ ] Dependencies updated
- [ ] Code reviewed
- [ ] Credentials not in code
- [ ] Performance acceptable
- [ ] Error handling complete

## Resources

- **Telethon Docs:** https://docs.telethon.dev/
- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs/

## Getting Help

1. Check existing code comments
2. Search GitHub Issues
3. Review related documentation
4. Ask in project discussions
5. File a detailed bug report

---

Happy coding! 🚀
