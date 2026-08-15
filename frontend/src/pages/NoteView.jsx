import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../api/axiosInstance.js';

export default function NoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNote();
  }, [id]);

  async function fetchNote() {
    setLoading(true);
    try {
      const res = await api.get(`/notes/${id}`);
      setNote(res.data.note);
    } catch (err) {
      setError('Note not found.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    try {
      await api.delete(`/notes/${id}`);
      navigate('/my-notes');
    } catch (err) {
      alert('Failed to delete note.');
    }
  }

  function downloadAsText() {
    const blob = new Blob([note.converted_text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container page-content">
        {loading && <p style={{ color: '#a89fc0' }}>Loading note...</p>}
        {error && <div className="alert alert-error">{error}</div>}

        {note && (
          <>
            <h1 className="page-title">{note.title}</h1>
            <p className="page-subtitle">
              Last updated {new Date(note.updated_at).toLocaleString()}
            </p>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {note.original_image && (
                <div style={{ flex: '0 0 260px' }}>
                  <img
                    src={`http://localhost:5000/uploads/${note.original_image}`}
                    alt={note.title}
                    className="preview-image"
                    style={{ margin: 0 }}
                  />
                </div>
              )}

              <div className="panel" style={{ flex: 1, minWidth: 280 }}>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{note.converted_text}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <Link to={`/notes/${note.id}/edit`} className="btn btn-primary">Edit Note</Link>
              <button className="btn btn-secondary" onClick={downloadAsText}>⬇ Download as .txt</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Note</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
