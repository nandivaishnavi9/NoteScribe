import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../api/axiosInstance.js';

export default function EditNote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNote();
  }, [id]);

  async function fetchNote() {
    setLoading(true);
    try {
      const res = await api.get(`/notes/${id}`);
      setTitle(res.data.note.title);
      setText(res.data.note.converted_text);
    } catch (err) {
      setError('Could not load this note.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!title.trim() || !text.trim()) {
      setError('Title and text cannot be empty.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.put(`/notes/${id}`, { title: title.trim(), convertedText: text });
      navigate(`/notes/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update note.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container page-content">
        <h1 className="page-title">Edit Note</h1>
        <p className="page-subtitle">Update the title or text, then save your changes.</p>

        {loading ? (
          <p style={{ color: '#a89fc0' }}>Loading note...</p>
        ) : (
          <div style={{ maxWidth: 640 }}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label>Note Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Note Text</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} />
            </div>

            <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
