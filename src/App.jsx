import React from 'react';
import './App.css';
import Register from '../front-end/register';
import Login from '../front-end/login';
import Start from '../front-end/start';
import AdminDashboard from '../front-end/AdminDashboard'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
