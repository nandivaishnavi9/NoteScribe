import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import NoteCard from '../components/NoteCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import api from '../api/axiosInstance.js';

export default function MyNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setLoading(true);
    try {
      const res = await api.get('/notes');
      setNotes(res.data.notes);
    } catch (err) {
      setError('Could not load your notes.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(keyword) {
    if (!keyword) {
      fetchNotes();
      return;
    }
    try {
      const res = await api.get(`/notes/search?keyword=${encodeURIComponent(keyword)}`);
      setNotes(res.data.notes);
    } catch (err) {
      setError('Search failed.');
    }
  }

  async function handleDelete(noteId) {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      alert('Failed to delete note.');
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container page-content">
        <h1 className="page-title">My Notes</h1>
        <p className="page-subtitle">All your saved digital notes in one place.</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
          <SearchBar onSearch={handleSearch} />
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>+ Upload Notes</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p style={{ color: '#a89fc0', marginTop: 20 }}>Loading your notes...</p>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <p>No notes found. Try uploading a new note or adjusting your search.</p>
          </div>
        ) : (
          <div className="notes-grid" style={{ marginTop: 20 }}>
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
