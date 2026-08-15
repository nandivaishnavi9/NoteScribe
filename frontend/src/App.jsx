import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UploadNote from './pages/UploadNote.jsx';
import NoteEditor from './pages/NoteEditor.jsx';
import MyNotes from './pages/MyNotes.jsx';
import NoteView from './pages/NoteView.jsx';
import EditNote from './pages/EditNote.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Protected pages — require login */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><UploadNote /></ProtectedRoute>} />
      <Route path="/editor" element={<ProtectedRoute><NoteEditor /></ProtectedRoute>} />
      <Route path="/my-notes" element={<ProtectedRoute><MyNotes /></ProtectedRoute>} />
      <Route path="/notes/:id" element={<ProtectedRoute><NoteView /></ProtectedRoute>} />
      <Route path="/notes/:id/edit" element={<ProtectedRoute><EditNote /></ProtectedRoute>} />
    </Routes>
  );
}
