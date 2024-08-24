import React from 'react'
import ReactDOM from 'react-dom/client'
import Admin from './pages/Admin.tsx'
import Home from './pages/Home.tsx'
import './index.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router basename="/ODHack">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
