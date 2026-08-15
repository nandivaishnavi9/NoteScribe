# NoteScribe — Handwritten Notes to Digital Notes Converter

A full-stack app for students: sign up, upload a photo of handwritten notes,
convert it to editable digital text via OCR, then save, search, edit, and
delete notes.

**Stack:** React + Vite (frontend) · Node.js + Express (backend) · MySQL (database) · JWT + bcrypt (auth) · OCR.space (handwriting OCR)

---

## 1. Prerequisites

Install these first if you don't already have them:
- [Node.js](https://nodejs.org/) (v18 or higher) — includes `npm`
- [MySQL](https://dev.mysql.com/downloads/installer/) (v8 recommended) — MySQL Workbench is helpful but optional
- A free OCR.space API key: https://ocr.space/ocrapi/freekey (just an email signup, instant key)

---

## 2. Project Structure

```
handwritten-notes-app/
├── backend/     ← Express API server
└── frontend/    ← React + Vite client
```

---

## 3. MySQL Database Setup

1. Open a terminal and log into MySQL:
   ```bash
   mysql -u root -p
   ```
2. Run the schema file (creates the database + both tables):
   ```bash
   mysql -u root -p < backend/models/schema.sql
   ```
   This creates:
   - Database: `handwritten_notes_db`
   - Table: `users` (id, full_name, student_id, password, created_at)
   - Table: `notes` (id, user_id, title, original_image, converted_text, created_at, updated_at)
   - Foreign key: `notes.user_id → users.id` (with cascade delete)

You can verify it worked:
```sql
USE handwritten_notes_db;
SHOW TABLES;
```

---

## 4. Backend Setup

```bash
cd backend
npm install
```

Create your real `.env` file from the template:
```bash
cp .env.example .env
```

Open `backend/.env` and fill in your real values:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=handwritten_notes_db

JWT_SECRET=make_this_a_long_random_string_like_a29f8e...
JWT_EXPIRES_IN=7d

OCR_SPACE_API_KEY=paste_your_ocr_space_key_here
OCR_SPACE_URL=https://apipro1.ocr.space/parse/image
```

> **Where do I get `OCR_SPACE_API_KEY`?**
> Go to https://ocr.space/ocrapi/freekey, enter your email, and they instantly email you a free API key. Paste it in as-is — no billing/credit card needed for the free tier.

Start the backend:
```bash
npm run dev
```

You should see:
```
✅ MySQL connected successfully
🚀 Server running on http://localhost:5000
```

If you see a MySQL connection error, double-check `DB_PASSWORD` and that MySQL is actually running.

---

## 5. Frontend Setup

Open a **second terminal** (keep the backend running in the first one):

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
Local:   http://localhost:5173/
```

Open that URL in your browser.

---

## 6. Testing the Full Flow

### Test Signup
1. Go to `http://localhost:5173/signup`
2. Fill in Full Name, a unique Student ID (e.g. `STU2026001`), and a password (6+ characters) twice
3. Click **Sign Up** → you should land on the Dashboard automatically

### Test Login
1. Click **Logout** (top right)
2. Go to `/login`, enter the same Student ID + password
3. You should be redirected to the Dashboard

### Test Image Upload + OCR Conversion
1. From the Dashboard, click **+ Upload Notes**
2. Click the upload box, select a photo of handwriting (a clear phone photo works — good lighting, not blurry)
3. Click **Convert to Digital Text**
4. Wait a few seconds — you'll be taken to the editor page showing the extracted text next to your image

### Test Save / Edit / Search / Delete
1. On the editor page, give the note a **title**, fix any OCR mistakes in the text box, click **Save Note**
2. You'll land on **My Notes** — your note should appear as a card
3. Type a keyword from the note into the search bar — it should filter live
4. Click **View** on a note to see the full text + download it as `.txt`
5. Click **Edit** to change the title/text and save changes
6. Click **Delete** to remove a note (with a confirmation prompt)

### Test Logout
Click **Logout** in the navbar — you should be sent to the Login page, and protected pages (`/dashboard`, `/my-notes`, etc.) should redirect you back to `/login` if you try to visit them directly.

---

## 7. Common Issues

| Problem | Fix |
|---|---|
| `MySQL connection failed` | Check `DB_PASSWORD` in `.env`, confirm MySQL service is running |
| OCR returns empty text | Use a clearer, well-lit photo; make sure `OCR_SPACE_API_KEY` is correct |
| `401 Unauthorized` on notes pages | Your token expired — log out and log back in |
| CORS error in browser console | Make sure backend is running on port 5000 and frontend on 5173 |
| "This Student ID is already registered" | Student IDs must be unique — use a different one or log in instead |

---

## 8. API Reference

| Method | Endpoint | Auth required | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Log in, get JWT |
| POST | `/api/notes/upload` | Yes | Upload image → OCR → return text |
| POST | `/api/notes/save` | Yes | Save title + text + image ref to DB |
| GET | `/api/notes` | Yes | Get all of the logged-in user's notes |
| GET | `/api/notes/:id` | Yes | Get one note (must belong to user) |
| PUT | `/api/notes/:id` | Yes | Update a note's title/text |
| DELETE | `/api/notes/:id` | Yes | Delete a note |
| GET | `/api/notes/search?keyword=` | Yes | Search notes by title/text |

All protected routes read the JWT from `Authorization: Bearer <token>` and only return/modify notes owned by that user.
