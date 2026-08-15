const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  uploadAndConvert,
  saveNote,
  getAllNotes,
  searchNotes,
  getNoteById,
  updateNote,
  deleteNote
} = require('../controllers/notesController');

// Every route below requires a valid JWT
router.use(authMiddleware);

// IMPORTANT: /search must be declared BEFORE /:id
// otherwise Express treats "search" as an :id value.
router.get('/search', searchNotes);

router.post('/upload', upload.single('image'), uploadAndConvert);
router.post('/save', saveNote);
router.get('/', getAllNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
