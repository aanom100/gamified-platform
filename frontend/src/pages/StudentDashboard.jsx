import { useState, useEffect } from 'react';

function StudentDashboard() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                // Fetch from our local Express server
                const response = await fetch('http://localhost:5000/api/challenges');
                if (response.ok) {
                    const data = await response.json();
                    setChallenges(data);
                } else {
                    console.error('Failed to fetch challenges');
                }
            } catch (error) {
                console.error('Error connecting to backend:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, []); // Empty array means this runs exactly ONCE when the page loads

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Arena...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>Available Quests & Challenges</h2>
            <p>Select a quest to begin your submission.</p>

            {challenges.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No active challenges at the moment. Check back soon!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                    {challenges.map((challenge) => (
                        <div 
                            key={challenge._id} 
                            style={{ 
                                padding: '20px', 
                                border: '1px solid #e0e0e0', 
                                borderRadius: '8px', 
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                backgroundColor: '#fff'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{challenge.title}</h3>
                                <span style={{ 
                                    backgroundColor: '#e3faf2', 
                                    color: '#0ca678', 
                                    padding: '5px 10px', 
                                    borderRadius: '16px', 
                                    fontWeight: 'bold',
                                    fontSize: '14px' 
                                }}>
                                    +{challenge.points} XP
                                </span>
                            </div>
                            <p style={{ color: '#555', margin: '0 0 15px 0', lineHeight: '1.5' }}>
                                {challenge.description}
                            </p>
                            <button style={{ 
                                padding: '8px 16px', 
                                backgroundColor: '#1098ad', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer' 
                            }}>
                                Submit Solution
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StudentDashboard;