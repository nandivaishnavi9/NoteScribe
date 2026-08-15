import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function Landing() {
  return (
    <div className="page">
      <Navbar />

      <section className="hero">
        <h1>Turn your <span>handwritten notes</span> into clean, searchable digital text</h1>
        <p>
          Upload a photo of your class notes, let NoteScribe convert them into editable text,
          and organize everything in one place — no more losing scraps of paper.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="btn btn-primary">Get Started Free</Link>
          <Link to="/login" className="btn btn-secondary">I already have an account</Link>
        </div>
      </section>

      <div className="features">
        <div className="feature-item">
          <div className="icon">📷</div>
          <h3>Snap & Upload</h3>
          <p>Take a photo of your handwritten notes and upload it directly from your device.</p>
        </div>
        <div className="feature-item">
          <div className="icon">🔤</div>
          <h3>Instant Conversion</h3>
          <p>Our OCR engine reads your handwriting and turns it into editable digital text.</p>
        </div>
        <div className="feature-item">
          <div className="icon">🔍</div>
          <h3>Organize & Search</h3>
          <p>Save, edit, and search all your notes by keyword whenever you need them.</p>
        </div>
      </div>
    </div>
  );
}
