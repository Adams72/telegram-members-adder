# Quick Start Guide - Telegram Members Adder

Get up and running in 5 minutes!

## 1. Get Telegram Credentials (2 minutes)

1. Open [my.telegram.org](https://my.telegram.org)
2. Sign in with your Telegram account
3. Click "API development tools"
4. Create an app if needed
5. **Copy:**
   - Your **API ID** (e.g., `26015605`)
   - Your **API Hash** (e.g., `32528923bcd3e948341aaf5fe2a250b7`)
   - Your **Phone Number** (with country code, e.g., `+2348135169887`)

## 2. Prepare Your CSV File (1 minute)

Create a file named `members.csv`:

```csv
username_or_phone
john_doe
jane_smith
+2348135169887
@telegram_username
```

Save it somewhere you can easily find it.

## 3. Run Locally (2 minutes)

### Start Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
You should see: `Uvicorn running on http://0.0.0.0:8000`

### Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
You should see: `ready - started server on 0.0.0.0:3000`

## 4. Use the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Upload your `members.csv` file
3. Fill in the form:
   - **API ID:** `26015605` (your ID from step 1)
   - **API Hash:** `32528923bcd3e948341aaf5fe2a250b7` (your hash)
   - **Phone Number:** `+2348135169887` (your Telegram phone)
   - **Group ID:** `-1002502451021` or `@groupname` (target group)
   - **Delay:** `30 seconds` (recommended)
4. Click "Add Members to Group"
5. Watch as members are added with detailed progress!

## Common Issues & Quick Fixes

### "Backend error" or "Cannot connect to backend"
```bash
# Make sure backend is running:
# Terminal 1 should show "Uvicorn running on http://0.0.0.0:8000"
```

### "Failed to authenticate with Telegram"
- Double-check your API ID and API Hash are correct
- Verify phone number includes country code
- Try deleting `backend/telegram_session.session` and try again

### "Group not found"
- Verify you're a member of the group
- Use group ID (e.g., `-1002502451021`) not just the name
- If using @username, make sure it's correct

### Members not being added
- Increase the delay (try 60 seconds)
- Ensure you're an admin in the group
- Check if members have privacy restrictions enabled

## Next Steps

### Deploying to Vercel (Recommended)

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Import from GitHub
4. Set **Framework Preset** to **"Services"**
5. Click "Deploy"

Your app is live! 🚀

### For Detailed Documentation

- **Full Guide:** See [README_WEB.md](README_WEB.md)
- **Deployment:** See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Troubleshooting:** See [README_WEB.md#troubleshooting](README_WEB.md#troubleshooting)

## Tips for Success

✅ **Do:**
- Use reasonable delays (15-60 seconds) to avoid rate limits
- Add 10-20 members first to test
- Keep CSV files organized
- Back up your session file if needed

❌ **Don't:**
- Add hundreds of members in one batch
- Use very short delays (<5 seconds)
- Share your API credentials
- Use this for spam or unauthorized invites

## Need More Help?

1. Check the error message - it usually explains what's wrong
2. Look at backend logs (Terminal 1)
3. Check browser console (F12 on the website)
4. Review [README_WEB.md](README_WEB.md) for detailed docs

---

**That's it!** You should be able to add members to your Telegram groups in minutes. 🎉
