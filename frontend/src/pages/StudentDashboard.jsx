import { useState, useEffect } from 'react';
import {
  Box, Flex, VStack, Heading, Text, Button, Grid, 
  Card, CardHeader, CardBody, Badge, Divider, useToast, HStack,
  Input, InputGroup, InputRightElement, Icon
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
    const [activeTab, setActiveTab] = useState('arena');
    const [classrooms, setClassrooms] = useState([]);
    
    // Join Class State
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const navigate = useNavigate();
    const toast = useToast();

    // Fetch Enrolled Classrooms on Load
    useEffect(() => {
        const fetchEnrolledClasses = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/classrooms/enrolled', {
                    headers: { 'x-auth-token': token }
                });
                if (response.ok) {
                    const data = await response.json();
                    setClassrooms(data);
                }
            } catch (error) {
                console.error("Failed to load classes", error);
            }
        };
        fetchEnrolledClasses();
    }, []);

    // --- ACTION HANDLERS ---
    const handleJoinClass = async () => {
        if (!joinCode) return;
        setIsJoining(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/classrooms/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ joinCode })
            });

            const data = await response.json();
            
            if (response.ok) {
                toast({ 
                    title: 'Request Sent!', 
                    description: 'You are in the waiting room. The professor must approve you.',
                    status: 'success', 
                    duration: 5000,
                    isClosable: true 
                });
                setJoinCode(''); // Clear the input
            } else {
                toast({ title: 'Join Failed', description: data.error, status: 'error', duration: 3000 });
            }
        } catch (error) {
            toast({ title: 'Network Error', status: 'error', duration: 3000 });
        } finally {
            setIsJoining(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    return (
        <Flex bg="gray.50" minH="100vh">
            {/* SIDEBAR ANCHOR */}
            <Box w="250px" bg="gray.900" color="white" h="100vh" p={5} position="fixed">
                <Heading size="md" mb={8} color="purple.400">Student OS</Heading>
                <VStack align="start" spacing={4}>
                    <Button 
                        variant={activeTab === 'arena' ? 'solid' : 'ghost'} 
                        colorScheme="purple" w="full" justifyContent="flex-start"
                        onClick={() => setActiveTab('arena')}
                    >
                        ⚔️ The Arena
                    </Button>
                    <Button 
                        variant={activeTab === 'leaderboard' ? 'solid' : 'ghost'} 
                        colorScheme="purple" w="full" justifyContent="flex-start"
                        onClick={() => setActiveTab('leaderboard')}
                    >
                        🏆 Leaderboard
                    </Button>
                    <Divider borderColor="gray.600" />
                    <Button 
                        variant={activeTab === 'profile' ? 'solid' : 'ghost'} 
                        colorScheme="purple" w="full" justifyContent="flex-start"
                        onClick={() => setActiveTab('profile')}
                    >
                        👤 Profile
                    </Button>
                </VStack>
            </Box>
            
            {/* MAIN CONTENT WORKSPACE */}
            <Box ml="250px" p={8} w="full">
                
                {/* 1. THE ARENA TAB */}
                {activeTab === 'arena' && (
                    <Box>
                        {/* JOIN CLASSROOM BANNER */}
                        <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200" mb={8}>
                            <Heading size="md" mb={2}>Join a New Classroom</Heading>
                            <Text color="gray.500" mb={4}>Enter the 6-digit secure code provided by your professor.</Text>
                            <InputGroup size="lg" maxW="400px">
                                <Input 
                                    placeholder="Enter Join Code" 
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    focusBorderColor="purple.500"
                                    letterSpacing="2px"
                                    fontWeight="bold"
                                />
                                <InputRightElement width="6rem">
                                    <Button h="1.75rem" size="sm" colorScheme="purple" onClick={handleJoinClass} isLoading={isJoining}>
                                        Join
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </Box>

                        <Heading size="lg" mb={6}>My Active Classes</Heading>
                        
                        {classrooms.length === 0 ? (
                            <Text color="gray.500">You are not enrolled in any classes yet.</Text>
                        ) : (
                            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
                                {classrooms.map(room => (
                                    <Card key={room._id} variant="outline" bg="white" borderLeft="4px solid" borderLeftColor="purple.500">
                                        <CardHeader pb={2}>
                                            <Heading size="md">{room.name}</Heading>
                                        </CardHeader>
                                        <CardBody pt={2}>
                                            <Text color="gray.500" mb={4}>Instructor ID: {room.professor.substring(0, 8)}...</Text>
                                            <Button w="full" colorScheme="purple" variant="outline">
                                                Enter Arena
                                            </Button>
                                        </CardBody>
                                    </Card>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                {/* 2. LEADERBOARD TAB */}
                {activeTab === 'leaderboard' && (
                    <Box>
                        <Heading size="lg" mb={6}>Global Rankings</Heading>
                        <Text color="gray.500">The hall of fame will appear here.</Text>
                    </Box>
                )}

                {/* 3. PROFILE TAB */}
                {activeTab === 'profile' && (
                    <Box>
                        <Heading size="lg" mb={6}>Student Profile</Heading>
                        <Button colorScheme="red" onClick={handleLogout}>Log Out</Button>
                    </Box>
                )}
            </Box>
        </Flex>
    );
}

export default StudentDashboard;