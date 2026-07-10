import { useState, useEffect } from 'react';

function AdminDashboard() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all pending submissions when the page loads
    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/submissions');
                if (response.ok) {
                    const data = await response.json();
                    setSubmissions(data);
                }
            } catch (error) {
                console.error("Error fetching submissions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    // Handle the Approve Button click
    const handleApprove = async (submissionId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/submissions/${submissionId}/approve`, {
                method: 'PUT',
            });

            if (response.ok) {
                // Remove the approved submission from the screen immediately 
                // so the professor doesn't have to refresh the page
                setSubmissions(submissions.filter(sub => sub._id !== submissionId));
                alert("Submission Approved! XP Awarded.");
            } else {
                alert("Failed to approve.");
            }
        } catch (error) {
            console.error("Network Error:", error);
        }
    };

    if (loading) return <div>Loading Professor Desk...</div>;

    return (
        <div>
            <h2>Professor's Grading Desk</h2>
            <p>You have {submissions.length} submissions waiting to be graded.</p>

            {submissions.length === 0 ? (
                <p>All caught up! Time for a coffee.</p>
            ) : (
                <div>
                    {submissions.map((sub) => (
                        <div key={sub._id} style={{ border: '2px solid red', margin: '10px', padding: '15px' }}>
                            {/* Because we used .populate('challenge') in the backend, we can do this: */}
                            <h3>Challenge: {sub.challenge?.title || "Deleted Challenge"}</h3>
                            <p><strong>XP Reward:</strong> {sub.challenge?.points || 0} XP</p>
                            
                            <hr />
                            
                            <p><strong>Student:</strong> {sub.studentName}</p>
                            <p><strong>Solution Link:</strong> <a href={sub.contentURL} target="_blank" rel="noreferrer">{sub.contentURL}</a></p>

                            <button 
                                onClick={() => handleApprove(sub._id)}
                                style={{ backgroundColor: 'green', color: 'white', padding: '10px' }}
                            >
                                Approve & Award XP
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;