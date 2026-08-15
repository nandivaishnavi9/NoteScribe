import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../api/axiosInstance.js';

export default function UploadNote() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  }

  async function handleConvert() {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await api.post('/notes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Move to the editor page with the OCR result in navigation state
      navigate('/editor', {
        state: {
          convertedText: res.data.convertedText,
          imagePath: res.data.imagePath,
          previewUrl
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container page-content">
        <h1 className="page-title">Upload Handwritten Note</h1>
        <p className="page-subtitle">Select a clear photo of your handwritten notes to convert it to text.</p>

        <div style={{ maxWidth: 560 }}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="upload-box" onClick={() => fileInputRef.current.click()}>
            <div className="icon">📤</div>
            <p>{selectedFile ? selectedFile.name : 'Click to select an image (JPG, PNG, WEBP)'}</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="preview-image" />
          )}

          {loading && <p className="loading-text">Converting your handwriting to text, please wait...</p>}

          <button
            className="btn btn-primary btn-block"
            onClick={handleConvert}
            disabled={loading || !selectedFile}
            style={{ marginTop: 16 }}
          >
            {loading ? 'Converting...' : 'Convert to Digital Text'}
          </button>
        </div>
      </div>
    </div>
  );
}
