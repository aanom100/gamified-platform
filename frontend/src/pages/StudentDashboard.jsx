import { useState, useEffect } from 'react';
import {
   Box, Flex, VStack, Heading, Text, Button, Grid, 
  Card, CardHeader, CardBody, Badge, Divider, useToast, HStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, 
  ModalBody, ModalCloseButton, Input, useDisclosure, FormControl, FormLabel, Textarea,InputGroup,InputRightElement
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
    const [activeTab, setActiveTab] = useState('arena');
    const [classrooms, setClassrooms] = useState([]);
    
    // Join Class State
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const [activeArena, setActiveArena] = useState(null); // Tracks the currently entered classroom
    const [challenges, setChallenges] = useState([]);      // Tracks challenges for this classroom
    
    // Challenge Submission States
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [submissionData, setSubmissionData] = useState({ submissionUrl: '', comment: '' });
    const [mediaFile, setMediaFile] = useState(null); // Holds the raw file before upload
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [leaderboard, setLeaderboard] = useState([]);
    const [viewMode, setViewMode] = useState('challenges'); // Toggles between challenges and leaderboard

    // Submission Modal Remote Control
    const { 
        isOpen: isSubmitOpen, 
        onOpen: openSubmitModal, 
        onClose: closeSubmitModal 
    } = useDisclosure();

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
    const handleEnterArena = async (classroom) => {
    try {
        const token = localStorage.getItem('token');
        
        // Fetch Challenges
        const challengeRes = await fetch(`http://localhost:5000/api/classrooms/${classroom._id}/challenges`, {
            headers: { 'x-auth-token': token }
        });
        
        // Fetch Leaderboard
        const leaderRes = await fetch(`http://localhost:5000/api/classrooms/${classroom._id}/leaderboard`, {
            headers: { 'x-auth-token': token }
        });
        
        if (challengeRes.ok && leaderRes.ok) {
            setChallenges(await challengeRes.json());
            setLeaderboard(await leaderRes.json());
            setActiveArena(classroom);
            setViewMode('challenges'); // Default view
        }
    } catch (error) {
        toast({ title: 'Network Error', status: 'error', duration: 2000 });
    }
};
    const handleSubmitSolution = async () => {
        if (!submissionData.submissionUrl && !mediaFile) {
            return toast({ title: 'Missing Input', description: 'Please provide a link or upload a file.', status: 'warning', duration: 2000 });
        }
        
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            
            const formData=new FormData();
            if(mediaFile){
                formData.append('mediaFile',mediaFile);
            }
            else{
                formData.append('submissionUrl',submissionData.submissionUrl)
            }
            if(submissionData.comment) formData.append('comment',submissionData.comment);

            const response = await fetch(`http://localhost:5000/api/challenges/${selectedChallenge._id}/submit`, {
                method: 'POST',
                headers: { 
                 // 🚨 CRITICAL: Do NOT add 'Content-Type': 'application/json' here!
                    // The browser will automatically set the correct multipart/form-data boundary.

                    'x-auth-token': token 
                },
                body: formData
            });

            const data = await response.json();

           if (response.ok) {
                toast({ title: 'Solution Deployed!', description: 'Your file is safely in the vault.', status: 'success', duration: 3000 });
                // Reset everything
                setSubmissionData({ submissionUrl: '', comment: '' }); 
                setMediaFile(null);
                closeSubmitModal();
            } else {
                toast({ title: 'Submission Failed', description: data.error, status: 'error', duration: 3000 });
            }
        } catch (error) {
            toast({ title: 'Network Error', status: 'error', duration: 3000 });
        } finally {
            setIsSubmitting(false);
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
        {activeArena ? (
            // --- ARENA ACTIVE VIEW: SHOW CHALLENGES ---
            <Box>
                <Button onClick={() => setActiveArena(null)} mb={4} size="sm">
                    ← Back to Classrooms
                </Button>
                
                <Flex justify="space-between" align="center" mb={6}>
                    <Box>
                        <Heading size="lg">🏟️ {activeArena.name} Arena</Heading>
                        <Text color="gray.500" mt={1}>Complete quests and climb the ranks.</Text>
                    </Box>
                    
                    {/* THE TOGGLE SWITCH */}
                    <HStack bg="gray.100" p={1} borderRadius="lg">
                        <Button 
                            size="sm" 
                            colorScheme={viewMode === 'challenges' ? 'purple' : 'gray'} 
                            variant={viewMode === 'challenges' ? 'solid' : 'ghost'}
                            onClick={() => setViewMode('challenges')}
                        >
                            🎯 Quests
                        </Button>
                        <Button 
                            size="sm" 
                            colorScheme={viewMode === 'leaderboard' ? 'yellow' : 'gray'} 
                            variant={viewMode === 'leaderboard' ? 'solid' : 'ghost'}
                            onClick={() => setViewMode('leaderboard')}
                        >
                            🏆 Leaderboard
                        </Button>
                    </HStack>
                </Flex>

                {/* --- CONDITIONALLY RENDER BASED ON VIEW MODE --- */}
{viewMode === 'challenges' ? (
    // 🎯 SHOW ONLY QUESTS WHEN VIEW MODE IS 'challenges'
    challenges.length === 0 ? (
        <Text color="gray.500">No active challenges deployed in this arena yet.</Text>
    ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(320px, 1fr))" gap={6}>
            {challenges.map((challenge) => (
                <Card key={challenge._id} variant="outline" bg="white">
                    <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                            <Heading size="md">{challenge.title}</Heading>
                            <Badge colorScheme="purple" p={1} borderRadius="md">
                                {challenge.points || 50} XP
                            </Badge>
                        </Flex>
                    </CardHeader>
                    <CardBody pt={2}>
                        <Text color="gray.600" mb={4} noOfLines={3}>
                            {challenge.description}
                        </Text>
                        <Button 
                            colorScheme="purple" 
                            w="full"
                            onClick={() => {
                                setSelectedChallenge(challenge);
                                openSubmitModal();
                            }}
                        >
                            Submit Solution
                        </Button>
                    </CardBody>
                </Card>
            ))}
        </Grid>
    )
) : (
    // 🏆 SHOW ONLY LEADERBOARD WHEN VIEW MODE IS NOT 'challenges'
    <Box bg="white" borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200" overflow="hidden">
        {leaderboard.length === 0 ? (
            <Box p={8} textAlign="center">
                <Text color="gray.500">No XP has been awarded in this arena yet. Be the first!</Text>
            </Box>
        ) : (
            <VStack align="stretch" spacing={0} divider={<Box borderBottomWidth="1px" borderColor="gray.100" />}>
                {leaderboard.map((student, index) => (
                    <Flex key={student._id} p={4} align="center" bg={index === 0 ? 'yellow.50' : index === 1 ? 'gray.50' : index === 2 ? 'orange.50' : 'white'}>
                        <Heading size="md" w="40px" textAlign="center" color="gray.500">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </Heading>
                        
                        <Box flex="1" ml={4}>
                            <Text fontWeight="bold" fontSize="lg">{student.name}</Text>
                        </Box>
                        
                        <Badge colorScheme="purple" fontSize="md" p={2} borderRadius="md">
                            {student.totalXP} XP
                        </Badge>
                    </Flex>
                ))}
            </VStack>
        )}
    </Box>
)}

                                             
            
                
            </Box>
        ) : (
            // --- ARENA DEFAULT VIEW: SHOW JOIN BANNER & CLASSROOM LIST ---
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
                                    {/* CLICKING THIS NOW TRIGGERS THE SWITCH */}
                                    <Button 
                                        w="full" 
                                        colorScheme="purple" 
                                        variant="outline"
                                        onClick={() => handleEnterArena(room)}
                                    >
                                        Enter Arena
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </Grid>
                )}
            </Box>
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
            {/* --- CHALLENGE SUBMISSION MODAL --- */}
            <Modal isOpen={isSubmitOpen} onClose={closeSubmitModal} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Submit Solution: {selectedChallenge?.title}
                    </ModalHeader>
                    <ModalCloseButton />
                    
                    <ModalBody>
                        <VStack spacing={5} align="stretch">
                            
                            {/* THE NEW FILE UPLOADER */}
                            <Box p={4} border="2px dashed" borderColor="purple.300" borderRadius="md" bg="purple.50">
                                <FormControl>
                                    <FormLabel fontWeight="bold" color="purple.700">
                                        📁 Upload Media (Image, Video, PDF)
                                    </FormLabel>
                                    <Input 
                                        type="file" 
                                        accept="image/*,video/*,.pdf"
                                        onChange={(e) => {
                                            setMediaFile(e.target.files[0]);
                                            setSubmissionData({...submissionData, submissionUrl: ''}); // Clear link if they pick a file
                                        }}
                                        p={1}
                                        border="none"
                                        sx={{
                                            '::file-selector-button': {
                                                height: 8,
                                                padding: '0 15px',
                                                mr: 4,
                                                background: 'purple.500',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 'md',
                                                cursor: 'pointer'
                                            }
                                        }}
                                    />
                                    {mediaFile && <Text fontSize="sm" color="green.600" mt={2}>Ready to upload: {mediaFile.name}</Text>}
                                </FormControl>
                            </Box>

                            <Text textAlign="center" color="gray.500" fontWeight="bold">— OR —</Text>
                            
                            {/* THE CLASSIC LINK INPUT */}
                            <FormControl>
                                <FormLabel>Submission Link (GitHub / Live Site)</FormLabel>
                                <Input 
                                    placeholder="https://github.com/..." 
                                    value={submissionData.submissionUrl}
                                    onChange={(e) => {
                                        setSubmissionData({...submissionData, submissionUrl: e.target.value});
                                        setMediaFile(null); // Clear file if they type a link
                                    }}
                                    focusBorderColor="purple.500"
                                    isDisabled={!!mediaFile} // Lock if file is selected
                                />
                            </FormControl>
                            
                            <FormControl>
                                <FormLabel>Notes / Comments (Optional)</FormLabel>
                                <Textarea 
                                    placeholder="Add notes about your implementation..." 
                                    value={submissionData.comment}
                                    onChange={(e) => setSubmissionData({...submissionData, comment: e.target.value})}
                                    focusBorderColor="purple.500"
                                    rows={3}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={closeSubmitModal}>Cancel</Button>
                        <Button 
                            colorScheme="purple" 
                            onClick={handleSubmitSolution}
                            isLoading={isSubmitting}
                        >
                            Upload Solution
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
}

export default StudentDashboard;