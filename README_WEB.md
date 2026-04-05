# Telegram Members Adder - Web Interface

A modern web application for efficiently adding members to Telegram groups using CSV files. Built with Next.js frontend and FastAPI Python backend using Telethon for Telegram API integration.

## Features

- **CSV Upload** - Drag and drop or click to upload CSV files with member data
- **Bulk Member Addition** - Add multiple members to Telegram groups at once
- **Rate Limiting** - Configurable delay between requests to avoid Telegram restrictions
- **Real-time Progress** - See detailed results for each member addition attempt
- **Error Handling** - Comprehensive error messages for failed additions
- **Modern UI** - Clean, dark-themed interface built with React and Tailwind CSS
- **Telegram API Integration** - Direct integration with Telegram using Telethon

## Project Structure

```
telegram-members-adder/
├── frontend/                 # Next.js web application
│   ├── app/                 # App directory with pages and API routes
│   │   ├── api/
│   │   │   └── add-members/  # API route to forward requests to backend
│   │   ├── page.tsx          # Main page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/          # React components
│   │   ├── FileUploader.tsx
│   │   ├── ConfigForm.tsx
│   │   └── ResultsDisplay.tsx
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                  # FastAPI Python backend
│   ├── main.py              # FastAPI application
│   ├── telegram_service.py  # Telethon integration
│   ├── pyproject.toml       # Python dependencies
│   └── telegram_session.session  # (Generated during auth)
│
├── vercel.json              # Vercel multi-service configuration
├── .gitignore               # Git ignore rules
└── README_WEB.md            # This file
```

## Prerequisites

- **Telegram Account** - With API credentials from my.telegram.org
- **Node.js** - v18 or higher (for frontend development)
- **Python** - v3.11 or higher (for backend development)
- **API Credentials**:
  - API ID from my.telegram.org
  - API Hash from my.telegram.org
  - Telegram phone number
  - Target group ID or username

## Getting Started

### Local Development

#### 1. Clone and Install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt  # or use pyproject.toml with uv
```

#### 2. Get Telegram Credentials

1. Go to [my.telegram.org](https://my.telegram.org)
2. Sign in with your Telegram account
3. Go to "API development tools"
4. Create an application (if you haven't already)
5. Copy your **API ID** and **API Hash**

#### 3. Run the Application

**Terminal 1 - Python Backend:**
```bash
cd backend
python main.py
# Backend runs on http://localhost:8000
```

**Terminal 2 - Next.js Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

#### 4. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

### CSV File Format

Your CSV file should contain a column named `username_or_phone`:

```csv
username_or_phone
john_doe
jane_smith
+2348135169887
@telegram_username
```

## Usage Steps

1. **Prepare CSV File**
   - Create a CSV with `username_or_phone` column
   - Include Telegram usernames (without @) or phone numbers (with country code)

2. **Upload CSV**
   - Drag and drop or click to upload your CSV file
   - The app validates the file and shows the number of members

3. **Configure Settings**
   - Enter your Telegram **API ID**
   - Enter your Telegram **API Hash**
   - Enter your Telegram **Phone Number** (with country code, e.g., +234)
   - Enter the target **Group ID** or **Group Username**
   - Set **Delay** between requests (recommended: 15-30 seconds)

4. **Add Members**
   - Click "Add Members to Group"
   - Monitor progress and view detailed results
   - Each member's addition attempt is logged with success/failure reason

## API Reference

### POST /api/add-members

Adds multiple members to a Telegram group.

**Request Body:**
```json
{
  "api_id": 26015605,
  "api_hash": "32528923bcd3e948341aaf5fe2a250b7",
  "phone": "+2348135169887",
  "group_id": "-1002502451021",
  "members": ["john_doe", "+2348135169887"],
  "delay": 2.0
}
```

**Response:**
```json
{
  "total": 2,
  "successful": 1,
  "failed": 1,
  "results": [
    {
      "username_or_phone": "john_doe",
      "success": true,
      "message": "Successfully added to group"
    },
    {
      "username_or_phone": "+2348135169887",
      "success": false,
      "message": "User has privacy restrictions"
    }
  ]
}
```

### Error Codes

- **400** - Bad request (missing fields, invalid data)
- **401** - Authentication failed (invalid credentials)
- **500** - Server error

## Error Messages & Solutions

| Error | Solution |
|-------|----------|
| "Failed to authenticate with Telegram" | Check API ID, API Hash, and phone number are correct |
| "Group not found or not accessible" | Verify group ID/username is correct, ensure you're a member |
| "User has privacy restrictions" | Target user has privacy settings preventing addition |
| "User not found" | Username doesn't exist or phone number is invalid |
| "Admin permission required" | Your account needs admin rights in the group |

## Deployment to Vercel

### 1. Connect Git Repository

```bash
# Make sure you're in the project root
git init
git add .
git commit -m "Initial commit: Telegram Members Adder"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set **Framework Preset** to **"Services"** in the build settings
5. Click "Deploy"

### 3. Set Environment Variables (if needed)

In Vercel project settings, add any required environment variables:
- `PYTHON_API_URL` - URL of Python backend (auto-configured by Vercel)

## Rate Limiting

To avoid Telegram rate limits and restrictions:

- **Minimum delay:** 2-5 seconds between requests
- **Recommended delay:** 15-30 seconds between requests
- **Safe range:** 30-60 seconds for large batch operations
- **Maximum members per batch:** 100 users at a time

## Troubleshooting

### Backend Connection Issues

If you see "Backend error occurred":

1. **Check if Python backend is running**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Verify backend URL in frontend:**
   - Check `PYTHON_API_URL` environment variable
   - Default: `http://localhost:8000`

3. **Check backend logs** for error messages

### Authentication Issues

1. **Verify API Credentials**
   - Go to [my.telegram.org](https://my.telegram.org)
   - Confirm API ID and Hash are correct
   - Ensure phone number matches your Telegram account

2. **Session Issues**
   - Delete `backend/telegram_session.session` and try again
   - You may be prompted to verify with a code

### Member Addition Failures

- **Ensure you're an admin** in the target group
- **Check member privacy settings** - some users restrict invites
- **Verify usernames** - typos will cause failures
- **Use correct phone format** - include country code (e.g., +234)

## Security Considerations

⚠️ **Important:** 

- Never share your API credentials with others
- Don't store credentials in version control
- The session file (`telegram_session.session`) contains sensitive data - keep it safe
- Use environment variables for sensitive information in production
- This tool should be used responsibly and in accordance with Telegram's Terms of Service

## Limitations

- **Max 100 members per batch** - for safety and performance
- **Session persistence** - requires storing session data
- **Phone verification** - may require code verification on first run
- **Rate limiting** - Telegram imposes strict rate limits
- **Privacy restrictions** - some users cannot be added via API

## Advanced Configuration

### Custom Delays

In `frontend/components/ConfigForm.tsx`, modify the delay options:

```tsx
<option value={5}>5 seconds</option>
<option value={30}>30 seconds</option>
<option value={60}>60 seconds</option>
```

### Batch Size Limits

In `frontend/app/api/add-members/route.ts`, change the limit:

```ts
if (members.length > 100) {  // Modify this number
  // Return error
}
```

## Development Tips

### Adding Features

1. **Frontend changes** - Modify files in `frontend/app` or `frontend/components`
2. **Backend changes** - Modify `backend/main.py` or `backend/telegram_service.py`
3. **Hot reload** - Both frontend and backend support hot reload during development

### Testing

Create a test CSV file:
```csv
username_or_phone
test_user_1
test_user_2
```

Use test accounts or members before doing batch operations.

## Support & Contributing

For issues, questions, or contributions:
1. Check the troubleshooting section above
2. Review error messages in the browser console
3. Check backend logs in the terminal
4. Open an issue with detailed error logs

## License

MIT License - Feel free to use, modify, and distribute.

## Disclaimer

This tool is provided as-is. Users are responsible for:
- Complying with Telegram's Terms of Service
- Using this tool responsibly and ethically
- Ensuring they have permission to add members
- Understanding the limitations and risks

Unauthorized bulk operations may result in account restrictions or bans from Telegram.
