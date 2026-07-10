import { useState, useEffect } from "react";

function StudentDashboard() {
    // --- 1. MEMORY VARIABLES (Clean camelCase) ---
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChallengeId, setActiveChallengeId] = useState(null);
    const [submitData, setSubmitData] = useState({ studentName: '', contentURL: '' });
    const [submitStatus, setSubmitStatus] = useState('');

    // --- 2. FETCH DATA ON LOAD ---
    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/challenges');
                if (response.ok) {
                    const data = await response.json();
                    setChallenges(data);
                }
            } catch (error) {
                console.error("Network Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenges();
    }, []); 

    // --- 3. HANDLE TYPING ---
    const handleInputChange = (e) => {
        setSubmitData({ ...submitData, [e.target.name]: e.target.value });
    };

    // --- 4. HANDLE SUBMIT ---
    const handleFormSubmit = async (e, challengeId) => {
        e.preventDefault();
        setSubmitStatus('Submitting solution...');

        try {
            const response = await fetch('http://localhost:5000/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challenge: challengeId,
                    studentName: submitData.studentName,
                    contentURL: submitData.contentURL 
                })
            });

            if (response.ok) {
                setSubmitStatus('Successfully submitted!');
                setSubmitData({ studentName: '', solutionText: '' });
                setActiveChallengeId(null); // Closes the form
            } else {
                setSubmitStatus('Failed to submit solution.');
            }
        } catch (error) {
            console.error(error);
            setSubmitStatus('Error connecting to server.');
        }
    };

    // --- 5. THE UI (HTML) ---
    if (loading) return <div>Loading Arena...</div>;

    return (
        <div>
            <h2>Student Arena</h2>
            <p>{submitStatus}</p>

            {challenges.length === 0 ? (
                <p>No active challenges at the moment.</p>
            ) : (
                <div>
                    {challenges.map((challenge) => (
                        <div key={challenge._id} style={{ border: '1px solid gray', margin: '10px', padding: '10px' }}>
                            <h3>{challenge.title}</h3>
                            <p>{challenge.description}</p>
                            <p><strong>Reward:</strong> {challenge.points} XP</p>

                            {/* The Toggle Logic */}
                            {activeChallengeId === challenge._id ? (
                                <form onSubmit={(e) => handleFormSubmit(e, challenge._id)}>
                                    <input 
                                        type="text" 
                                        name="studentName" 
                                        placeholder="Your Name / Roll No" 
                                        value={submitData.studentName}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                    <br /><br />
                                    <textarea 
                                        name="contentURL" 
                                        placeholder="Paste your code or solution link here..." 
                                        value={submitData.contentURL}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                    <br />
                                    <button type="submit">Send to Professor</button>
                                    <button type="button" onClick={() => setActiveChallengeId(null)}>Cancel</button>
                                </form>
                            ) : (
                                <button onClick={() => setActiveChallengeId(challenge._id)}>
                                    Submit Solution
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StudentDashboard;