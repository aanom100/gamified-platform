import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  // Mock authentication state. Default is admin.
  // In Step 4, this will be replaced by a real JWT login system.
  const [role, setRole] = useState('admin'); 

  return (
    <Router>
      <div style={{ fontFamily: 'sans-serif' }}>
        {/* The Navbar stays on the screen no matter what page you are on */}
        <Navbar role={role} setRole={setRole} />

        {/* The Routes decide which page to render based on the URL */}
        <Routes>
          {/* If they go to exactly '/', redirect them based on their role */}
          <Route path="/" element={
            role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/student" />
          } />

          {/* The actual page routes */}
          <Route path="/admin" element={
            role === 'admin' ? <AdminDashboard /> : <Navigate to="/student" />
          } />
          
          <Route path="/student" element={
            role === 'student' ? <StudentDashboard /> : <Navigate to="/admin" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;