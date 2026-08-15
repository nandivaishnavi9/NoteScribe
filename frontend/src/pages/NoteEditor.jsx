import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../api/axiosInstance.js';

export default function NoteEditor() {
  const location = useLocation();
  const navigate = useNavigate();

  const { convertedText, imagePath, previewUrl } = location.state || {};

  const [title, setTitle] = useState('');
  const [text, setText] = useState(convertedText || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // If someone lands here directly without going through Upload, send them back
    if (!location.state) {
      navigate('/upload');
    }
  }, []);

  async function handleSave() {
    if (!title.trim()) {
      setError('Please give your note a title.');
      return;
    }
    if (!text.trim()) {
      setError('Note text cannot be empty.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.post('/notes/save', {
        title: title.trim(),
        convertedText: text,
        imagePath
      });
      navigate('/my-notes');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container page-content">
        <h1 className="page-title">Review & Edit Your Note</h1>
        <p className="page-subtitle">Check the converted text for errors, then save it to your account.</p>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {previewUrl && (
            <div style={{ flex: '0 0 260px' }}>
              <img src={previewUrl} alt="Original note" className="preview-image" style={{ margin: 0 }} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 280 }}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label>Note Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 4 - Thermodynamics"
              />
            </div>

            <div className="form-group">
              <label>Converted Text (editable)</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Converted text will appear here..."
              />
            </div>

            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
