import CreateChallenge from '../components/CreateChallenge';

function AdminDashboard() {
    return (
        <div style={{ padding: '20px' }}>
            <h2>Welcome, Professor</h2>
            <p>Here is your administrative dashboard.</p>
            
            <hr style={{ margin: '20px 0' }} />
            
            {/* The component you built earlier! */}
            <CreateChallenge />
        </div>
    );
}

export default AdminDashboard;