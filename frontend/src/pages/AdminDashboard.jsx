import { useState, useEffect } from 'react';
import {
  Box, Flex, VStack, Heading, Text, Button, Grid, 
  Card, CardHeader, CardBody, Badge, Divider, useToast, HStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, 
  ModalBody, ModalCloseButton, Input, useDisclosure, FormControl, FormLabel, Textarea
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('classrooms');
    const [classrooms, setClassrooms] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState(null); // Tracks which class we are viewing
    const [activeChallenges, setActiveChallenges] = useState([]);

    const [pendingSubmissions, setPendingSubmissions] = useState([]);
    
    // Classroom Form State
    const [newClassName, setNewClassName] = useState('');
    const [isCreatingClass, setIsCreatingClass] = useState(false);
    
    // Challenge Form State
    const [challengeData, setChallengeData] = useState({ title: '', description: '', points: 50 });
    const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
    
    // We now have TWO independent pop-ups!
    const { isOpen: isCreateClassOpen, onOpen: openCreateClass, onClose: closeCreateClass } = useDisclosure(); 
    const { isOpen: isAddChallengeOpen, onOpen: openAddChallenge, onClose: closeAddChallenge } = useDisclosure(); 

    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
    const fetchPendingSubmissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://gamified-platform-1.onrender.com/api/submissions/pending', {
                headers: { 'x-auth-token': token }
            });
            if (response.ok) {
                const data = await response.json();
                setPendingSubmissions(data);
            }
        } catch (error) {
            console.error("Failed to load grading queue", error);
        }
    };

    if (activeTab === 'grading') {
        fetchPendingSubmissions();
    }
}, [activeTab]);
    // Fetch Classrooms on Load
    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('https://gamified-platform-1.onrender.com/api/classrooms/me', {
                    headers: { 'x-auth-token': token }
                });
                if (response.ok) {
                    const data = await response.json();
                    setClassrooms(data);
                }
            } catch (error) {
                console.error("Failed to load classrooms", error);
            }
        };
        fetchClassrooms();
    }, []);
    // Fetch challenges specifically for the selected classroom
    useEffect(() => {
        const fetchChallenges = async () => {
            if (!selectedClassroom) return;
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://gamified-platform-1.onrender.com/api/classrooms/${selectedClassroom._id}/challenges`, {
                    headers: { 'x-auth-token': token }
                });
                if (response.ok) {
                    const data = await response.json();
                    setActiveChallenges(data);
                }
            } catch (error) {
                console.error("Failed to load challenges", error);
            }
        };

        // Only fetch if we are actually looking at the class detail view
        if (activeTab === 'class-detail') {
            fetchChallenges();
        }
    }, [selectedClassroom, activeTab]);

    // --- ACTION HANDLERS ---

    const handleApproveSubmission = async (submissionId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://gamified-platform-1.onrender.com/api/submissions/${submissionId}/approve`, {
                method: 'POST',
                headers: { 'x-auth-token': token }
            });

            if (response.ok) {
                toast({ title: 'Quest Complete!', description: 'XP has been awarded to the student.', status: 'success', duration: 3000 });
                
                // Optimistic UI Update: Instantly filter this submission out of the array
                // so it disappears from the screen without needing a page refresh!
                setPendingSubmissions(pendingSubmissions.filter(sub => sub._id !== submissionId));
            } else {
                toast({ title: 'Grading Failed', status: 'error', duration: 3000 });
            }
        } catch (error) {
            toast({ title: 'Network Error', status: 'error', duration: 3000 });
        }
    };

    const handleCreateClassroom = async () => {
        setIsCreatingClass(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://gamified-platform-1.onrender.com/api/classrooms/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ name: newClassName })
            });

            const data = await response.json();
            if (response.ok) {
                setClassrooms([...classrooms, data.classroom]); 
                toast({ title: 'Classroom Created!', status: 'success', duration: 2000 });
                setNewClassName(''); 
                closeCreateClass(); 
            }
        } catch (error) {
            toast({ title: 'Network Error', status: 'error', duration: 2000 });
        } finally {
            setIsCreatingClass(false);
        }
    };

    const handleCreateChallenge = async () => {
        setIsCreatingChallenge(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://gamified-platform-1.onrender.com/api/classrooms/${selectedClassroom._id}/challenges`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(challengeData)
            });

               if (response.ok) {
                // ADD THIS LINE to instantly put the new challenge at the top of the list
                const newChallengeData = await response.json();
                setActiveChallenges([newChallengeData, ...activeChallenges]); 
                
                toast({ title: 'Challenge Deployed!', status: 'success', duration: 2000 });
                setChallengeData({ title: '', description: '', points: 50 }); 
                closeAddChallenge(); 
            }
            else {
                toast({ title: 'Failed to create challenge', status: 'error', duration: 2000 });
            }
        } catch (error) {
            toast({ title: 'Network Error', status: 'error', duration: 2000 });
        } finally {
            setIsCreatingChallenge(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/');
    };
    const handleApproveStudent=async(studentId)=>{
        try{
            const token=localStorage.getItem('token');
            const response = await fetch(`https://gamified-platform-1.onrender.com/api/classrooms/${selectedClassroom._id}/approve`, {
    method: 'POST', // 🚨 DOUBLE CHECK THIS LINE! Make sure it says 'POST', not 'GET'
    headers: { 
        'Content-Type': 'application/json', 
        'x-auth-token': token 
    },
    body: JSON.stringify({ studentId })
});
            if (response.ok) {
    toast({ title: 'Student Approved!', status: 'success', duration: 2000 });
    
    // FIX 1: Use _id (MongoDB convention) instead of id
    const approvedStudent = selectedClassroom.pendingRequests.find(s => s._id === studentId);
    const updatedPending = selectedClassroom.pendingRequests.filter(s => s._id !== studentId);
    
    // FIX 2: Fixed the typo, and added a fallback just in case the students array is empty
    const updatedStudents = [...(selectedClassroom.students || []), approvedStudent];
    
    const updatedClassroom = {
        ...selectedClassroom, 
        pendingRequests: updatedPending, 
        students: updatedStudents
    };

    setSelectedClassroom(updatedClassroom);
    setClassrooms(classrooms.map(c => c._id === updatedClassroom._id ? updatedClassroom : c));
}
            else{
                toast({ title: 'Approval Failed', status: 'error', duration: 2000 });
            }

        }
        catch (error) {
            toast({ title: 'Network Error', status: 'error', duration: 2000 });
        }
    };
    
    const formatExternalLink=(url)=>
    {
        if(!url) return '#';
        if(!url.startsWith('http://')&& !url.startsWith('https://')){
            return `https://${url}`
        }
        return url;
    }
    return (
        <Flex bg="gray.50" minH="100vh">
            {/* SIDEBAR ANCHOR */}
            <Box w="250px" bg="gray.900" color="white" h="100vh" p={5} position="fixed">
                <Heading size="md" mb={8} color="blue.400">Professor OS</Heading>
                <VStack align="start" spacing={4}>
                    <Button 
                        variant={activeTab === 'classrooms' || activeTab === 'class-detail' ? 'solid' : 'ghost'} 
                        colorScheme="blue" w="full" justifyContent="flex-start"
                        onClick={() => setActiveTab('classrooms')}
                    >
                        🏫 My Classrooms
                    </Button>
                    <Button 
                        variant={activeTab === 'grading' ? 'solid' : 'ghost'} 
                        colorScheme="blue" w="full" justifyContent="flex-start"
                        onClick={() => setActiveTab('grading')}
                    >
                        📝 Grading Desk
                    </Button>
                    <Button 
                        variant={activeTab === 'profile' ? 'solid' : 'ghost'} 
                        colorScheme="blue" w="full" justifyContent="flex-start"
                        onClick={() => setActiveTab('profile')}
                    >
                        👤 Profile
                    </Button>
                </VStack>
            </Box>
            
            {/* MAIN CONTENT WORKSPACE */}
            <Box ml="250px" p={8} w="full">
                
                {/* 1. CLASSROOMS GRID TAB */}
                {activeTab === 'classrooms' && (
                    <Box>
                        <Flex justify="space-between" align="center" mb={6}>
                            <Heading size="lg">Active Classrooms</Heading>
                            <Button colorScheme="blue" onClick={openCreateClass}>➕ Create Classroom</Button>
                        </Flex>
                        
                        {classrooms.length === 0 ? (
                            <Text color="gray.500">You haven't created any classrooms yet.</Text>
                        ) : (
                            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
                                {classrooms.map(room => (
                                    <Card key={room._id} variant="outline" bg="white">
                                        <CardHeader pb={2}>
                                            <Flex justify="space-between">
                                                <Heading size="md">{room.name}</Heading>
                                            </Flex>
                                        </CardHeader>
                                        <CardBody pt={2}>
                                            <Text color="gray.500" mb={4}>
                                                Join Code: <Badge fontSize="md" colorScheme="purple">{room.joinCode}</Badge>
                                            </Text>
                                            <HStack>
                                                <Button 
                                                    size="sm" colorScheme="blue" variant="outline" w="full"
                                                    onClick={() => {
                                                        setSelectedClassroom(room);
                                                        setActiveTab('class-detail');
                                                    }}
                                                >
                                                    View Class
                                                </Button>
                                                <Button 
                                                    size="sm" colorScheme="purple" w="full"
                                                    onClick={() => {
                                                        setSelectedClassroom(room);
                                                        openAddChallenge();
                                                    }}
                                                >
                                                    Add Challenge
                                                </Button>
                                            </HStack>
                                        </CardBody>
                                    </Card>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                {/* 2. SPECIFIC CLASSROOM DETAIL VIEW */}
                {activeTab === 'class-detail' && selectedClassroom && (
                    <Box>
                        <Button mb={4} size="sm" onClick={() => setActiveTab('classrooms')}>
                            ← Back to Classrooms
                        </Button>
                        <Flex justify="space-between" align="center" mb={6}>
                            <Box>
                                <Heading size="lg">{selectedClassroom.name}</Heading>
                                <Text color="gray.500" mt={1}>
                                    Join Code: <Badge colorScheme="purple">{selectedClassroom.joinCode}</Badge>
                                </Text>
                            </Box>
                            <Button colorScheme="purple" onClick={openAddChallenge}>
                                ➕ New Challenge
                            </Button>
                        </Flex>

                        {/* We will populate these with real data later! */}
                        <Grid templateColumns="1fr 1fr" gap={8}>
                            <Box p={5} bg="white" borderRadius="md" shadow="sm" border="1px" borderColor="gray.200">
    <Heading size="md" mb={4}>Active Challenges</Heading>
    
    {/* WIRED TO ACTIVECHALLENGES STATE */}
    {activeChallenges && activeChallenges.length > 0 ? (
        <VStack align="stretch" spacing={4}>
            {activeChallenges.map((challenge) => (
                <Box key={challenge._id} p={4} borderWidth="1px" borderRadius="md" bg="gray.50" _hover={{ shadow: 'sm' }}>
                    <Flex justify="space-between" align="center" mb={2}>
                        <Heading size="sm">{challenge.title}</Heading>
                        <Badge colorScheme="purple">{challenge.points || 50} XP</Badge>
                    </Flex>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {challenge.description}
                    </Text>
                </Box>
            ))}
        </VStack>
    ) : (
        <Text color="gray.500">Challenges will appear here.</Text>
    )}
</Box>
                           
                               
                            <Box p={5} bg="white" borderRadius="md" shadow="sm" border="1px" borderColor="gray.200">
                                <Heading size="md" mb={4}>Student Roster</Heading>
                                
                                
                                {selectedClassroom.pendingRequests?.length > 0 && (
                                    <Box mb={6} p={4} bg="orange.50" border="1px" borderColor="orange.200" borderRadius="md">
                                        <Text fontWeight="bold" color="orange.800" mb={3}>
                                            ⏳ Waiting Room ({selectedClassroom.pendingRequests.length})
                                        </Text>
                                        <VStack align="stretch" spacing={2}>
                                            {selectedClassroom.pendingRequests.map(student => (
                                                <Flex key={student._id} justify="space-between" align="center" bg="white" p={2} borderRadius="md" shadow="sm">
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm">{student.name}</Text>
                                                        <Text fontSize="xs" color="gray.500">{student.email}</Text>
                                                    </Box>
                                                    <Button size="sm" colorScheme="green" onClick={() => handleApproveStudent(student._id)}>
                                                        Approve
                                                    </Button>
                                                </Flex>
                                            ))}
                                        </VStack>
                                    </Box>
                                )}

                                {/* 2. The Official Roster */}
                                <Text fontWeight="bold" color="gray.700" mb={3}>
                                    ✅ Enrolled Students ({selectedClassroom.students?.length || 0})
                                </Text>
                                {selectedClassroom.students?.length === 0 ? (
                                    <Text color="gray.500" fontSize="sm">No students enrolled yet.</Text>
                                ) : (
                                    <VStack align="stretch" spacing={2}>
                                        {selectedClassroom.students.map(student => (
                                            <Flex key={student._id} justify="space-between" align="center" bg="gray.50" p={2} borderRadius="md" borderWidth="1px">
                                                <Box>
                                                    <Text fontWeight="bold" fontSize="sm">{student.name}</Text>
                                                    <Text fontSize="xs" color="gray.500">{student.email}</Text>
                                                </Box>
                                                <Badge colorScheme="blue">Student</Badge>
                                            </Flex>
                                        ))}
                                    </VStack>
                                )}
                            </Box>
                            
                        </Grid>
                    </Box>
                )}

                {/* 3. GRADING DESK TAB */}
                {activeTab === 'grading' && (
                    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
                        <Heading size="lg" mb={2}>📝 Grading Desk</Heading>
                        <Text color="gray.500" mb={6}>Evaluate incoming code proofs and award XP points.</Text>

                        {pendingSubmissions.length === 0 ? (
                            <Text color="gray.500">Your grading inbox is empty! No pending submissions.</Text>
                        ) : (
                            <VStack align="stretch" spacing={4}>
                                {pendingSubmissions.map((sub) => (
                                    <Box key={sub._id} p={4} borderWidth="1px" borderRadius="md" bg="gray.50 shadow='sm'">
                                        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                                            <Box>
                                                <HStack mb={1}>
                                                    <Text fontWeight="bold" fontSize="lg">{sub.challenge?.title}</Text>
                                                    <Badge colorScheme="purple">+{sub.challenge?.points} XP</Badge>
                                                </HStack>
                                                <Text fontSize="sm" color="gray.600">
                                                    Submitted by: <b>{sub.student?.name}</b> ({sub.student?.email})
                                                </Text>
                                                {sub.comment && (
                                                    <Text fontSize="xs" color="gray.500" mt={2} fontStyle="italic" bg="white" p={2} borderRadius="sm" borderLeft="2px solid gray">
                                                        Comment: "{sub.comment}"
                                                    </Text>
                                                )}
                                            </Box>
                                            
                                            <HStack spacing={3}>
                                                <Button 
                                                    as="a" 
                                                    href={formatExternalLink(sub.submissionUrl)} 
                                                    target="_blank" 
                                                    size="sm" 
                                                    colorScheme="blue" 
                                                    variant="outline"
                                                >
                                                    🔗 Review Code
                                                </Button>
                                                <Button size="sm" colorScheme="green"
                                                onClick={() => handleApproveSubmission(sub._id)}>
                                                    Accept & Reward
                                                </Button>
                                            </HStack>
                                        </Flex>
                                    </Box>
                                ))}
                            </VStack>
                        )}
                    </Box>
                )}

                {/* 4. PROFILE TAB */}
                {activeTab === 'profile' && (
                    <Box>
                        <Heading size="lg" mb={6}>Professor Profile</Heading>
                        <Button colorScheme="red" onClick={handleLogout}>Log Out</Button>
                    </Box>
                )}
            </Box>

            {/* --- MODAL 1: CREATE CLASSROOM --- */}
            <Modal isOpen={isCreateClassOpen} onClose={closeCreateClass}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create a New Classroom</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl isRequired>
                            <FormLabel>Classroom Name</FormLabel>
                            <Input 
                                placeholder="e.g. Data Structures 101" 
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                focusBorderColor="blue.500"
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={closeCreateClass}>Cancel</Button>
                        <Button colorScheme="blue" onClick={handleCreateClassroom} isLoading={isCreatingClass}>
                            Generate Code
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* --- MODAL 2: CREATE CHALLENGE --- */}
            <Modal isOpen={isAddChallengeOpen} onClose={closeAddChallenge} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Deploy New Challenge</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Challenge Title</FormLabel>
                                <Input 
                                    placeholder="e.g. Build a React Navbar" 
                                    value={challengeData.title}
                                    onChange={(e) => setChallengeData({...challengeData, title: e.target.value})}
                                    focusBorderColor="purple.500"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Description / Instructions</FormLabel>
                                <Textarea 
                                    placeholder="Provide links, instructions, or repo requirements..." 
                                    value={challengeData.description}
                                    onChange={(e) => setChallengeData({...challengeData, description: e.target.value})}
                                    focusBorderColor="purple.500"
                                    rows={4}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>XP Reward</FormLabel>
                                <Input 
                                    type="number"
                                    value={challengeData.points}
                                    onChange={(e) => setChallengeData({...challengeData, points: e.target.value})}
                                    focusBorderColor="purple.500"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={closeAddChallenge}>Cancel</Button>
                        <Button colorScheme="purple" onClick={handleCreateChallenge} isLoading={isCreatingChallenge}>
                            Deploy Challenge
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Flex>
    );
}

export default AdminDashboard;