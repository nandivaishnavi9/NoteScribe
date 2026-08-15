import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import NoteCard from '../components/NoteCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import api from '../api/axiosInstance.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecentNotes();
  }, []);

  async function fetchRecentNotes() {
    setLoading(true);
    try {
      const res = await api.get('/notes');
      setNotes(res.data.notes.slice(0, 6)); // show recent 6 on dashboard
    } catch (err) {
      setError('Could not load your notes.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(keyword) {
    if (!keyword) {
      fetchRecentNotes();
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
        <div className="dashboard-header">
          <h1>Welcome back, {user?.fullName}! 👋</h1>
          <p>Here's what's happening with your notes.</p>
        </div>

        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            + Upload Notes
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/my-notes')}>
            📚 View All My Notes
          </button>
        </div>

        <SearchBar onSearch={handleSearch} />

        <div className="section-title">
          <h2>Recent Notes</h2>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p style={{ color: '#a89fc0' }}>Loading your notes...</p>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📝</div>
            <p>You haven't saved any notes yet. Click "Upload Notes" to get started.</p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
