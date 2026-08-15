const fs = require('fs');
const axios = require('axios');
const qs = require('querystring');
const db = require('../config/db');
require('dotenv').config();

// POST /api/notes/upload
// Receives an image file, sends it to OCR.space, returns extracted text.
// Does NOT save to the database yet — that happens in /api/notes/save,
// after the student has had a chance to edit the text and add a title.
async function uploadAndConvert(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file was uploaded.' });
    }

    const imagePath = req.file.path;
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    const mimeType = req.file.mimetype; // e.g. image/png

    const requestBody = qs.stringify({
      apikey: process.env.OCR_SPACE_API_KEY,
      base64Image: `data:${mimeType};base64,${imageBase64}`,
      language: 'eng',
      isOverlayRequired: false,
      OCREngine: 2, // engine 2 handles handwriting better
      scale: true,
      detectOrientation: true
    });

    const ocrResponse = await axios.post(process.env.OCR_SPACE_URL, requestBody, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000
    });

    const data = ocrResponse.data;

    if (data.IsErroredOnProcessing) {
      const errMsg = Array.isArray(data.ErrorMessage) ? data.ErrorMessage.join(', ') : data.ErrorMessage;
      return res.status(422).json({ message: 'OCR failed to process the image: ' + errMsg });
    }

    const parsedText = data.ParsedResults && data.ParsedResults[0]
      ? data.ParsedResults[0].ParsedText
      : '';

    return res.status(200).json({
      message: 'Image converted successfully.',
      convertedText: parsedText.trim(),
      imagePath: req.file.filename // frontend sends this back on /save
    });
  } catch (err) {
    console.error('OCR upload error:', err.message);
    return res.status(500).json({ message: 'Server error while converting image. Check your OCR API key.' });
  }
}

// POST /api/notes/save
// Saves the (possibly edited) title + converted text + image reference to MySQL
async function saveNote(req, res) {
  try {
    const { title, convertedText, imagePath } = req.body;
    const userId = req.userId;

    if (!title || !convertedText) {
      return res.status(400).json({ message: 'Title and note text are required.' });
    }

    const [result] = await db.query(
      'INSERT INTO notes (user_id, title, original_image, converted_text) VALUES (?, ?, ?, ?)',
      [userId, title, imagePath || null, convertedText]
    );

    return res.status(201).json({
      message: 'Note saved successfully.',
      noteId: result.insertId
    });
  } catch (err) {
    console.error('Save note error:', err);
    return res.status(500).json({ message: 'Server error while saving note.' });
  }
}

// GET /api/notes
async function getAllNotes(req, res) {
  try {
    const userId = req.userId;
    const [rows] = await db.query(
      'SELECT id, title, original_image, converted_text, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    return res.status(200).json({ notes: rows });
  } catch (err) {
    console.error('Get notes error:', err);
    return res.status(500).json({ message: 'Server error while fetching notes.' });
  }
}

// GET /api/notes/search?keyword=
async function searchNotes(req, res) {
  try {
    const userId = req.userId;
    const keyword = req.query.keyword || '';

    const [rows] = await db.query(
      `SELECT id, title, original_image, converted_text, created_at, updated_at
       FROM notes
       WHERE user_id = ? AND (title LIKE ? OR converted_text LIKE ?)
       ORDER BY updated_at DESC`,
      [userId, `%${keyword}%`, `%${keyword}%`]
    );

    return res.status(200).json({ notes: rows });
  } catch (err) {
    console.error('Search notes error:', err);
    return res.status(500).json({ message: 'Server error while searching notes.' });
  }
}

// GET /api/notes/:id
async function getNoteById(req, res) {
  try {
    const userId = req.userId;
    const noteId = req.params.id;

    const [rows] = await db.query(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    return res.status(200).json({ note: rows[0] });
  } catch (err) {
    console.error('Get note error:', err);
    return res.status(500).json({ message: 'Server error while fetching note.' });
  }
}

// PUT /api/notes/:id
async function updateNote(req, res) {
  try {
    const userId = req.userId;
    const noteId = req.params.id;
    const { title, convertedText } = req.body;

    // Confirm the note belongs to this user before updating
    const [rows] = await db.query(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Note not found or access denied.' });
    }

    await db.query(
      'UPDATE notes SET title = ?, converted_text = ? WHERE id = ? AND user_id = ?',
      [title, convertedText, noteId, userId]
    );

    return res.status(200).json({ message: 'Note updated successfully.' });
  } catch (err) {
    console.error('Update note error:', err);
    return res.status(500).json({ message: 'Server error while updating note.' });
  }
}

// DELETE /api/notes/:id
async function deleteNote(req, res) {
  try {
    const userId = req.userId;
    const noteId = req.params.id;

    const [rows] = await db.query(
      'SELECT id, original_image FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Note not found or access denied.' });
    }

    await db.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);

    // Clean up the stored image file, if any
    const imageName = rows[0].original_image;
    if (imageName) {
      const imagePath = require('path').join(__dirname, '..', 'uploads', imageName);
      fs.unlink(imagePath, () => {}); // ignore errors — file may already be gone
    }

    return res.status(200).json({ message: 'Note deleted successfully.' });
  } catch (err) {
    console.error('Delete note error:', err);
    return res.status(500).json({ message: 'Server error while deleting note.' });
  }
}

module.exports = {
  uploadAndConvert,
  saveNote,
  getAllNotes,
  searchNotes,
  getNoteById,
  updateNote,
  deleteNote
};
