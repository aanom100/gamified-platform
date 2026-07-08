import { Link } from 'react-router-dom';

function Navbar({ role, setRole }) {
    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#333', color: 'white' }}>
            <h3 style={{ margin: 0 }}>Gamified Platform</h3>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {/* Conditional Links based on Role */}
                {role === 'admin' ? (
                    <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin Dashboard</Link>
                ) : (
                    <Link to="/student" style={{ color: 'white', textDecoration: 'none' }}>Student Arena</Link>
                )}

                {/* TEMPORARY DEV TOGGLE: Remove this once real Auth is built */}
                <button 
                    onClick={() => setRole(role === 'admin' ? 'student' : 'admin')}
                    style={{ padding: '5px 10px', backgroundColor: '#ff4757', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Dev Toggle: Currently {role.toUpperCase()}
                </button>
            </div>
        </nav>
    );
}

export default Navbar;