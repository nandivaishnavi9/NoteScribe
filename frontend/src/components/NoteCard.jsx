import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NoteCard({ note, onDelete }) {
  const navigate = useNavigate();

  const formattedDate = new Date(note.updated_at || note.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="card note-card">
      <h3>{note.title}</h3>
      <p>{note.converted_text}</p>
      <div className="note-date">Updated {formattedDate}</div>
      <div className="note-card-actions">
        <button onClick={() => navigate(`/notes/${note.id}`)}>View</button>
        <button onClick={() => navigate(`/notes/${note.id}/edit`)}>Edit</button>
        <button onClick={() => onDelete(note.id)}>Delete</button>
      </div>
    </div>
  );
}
