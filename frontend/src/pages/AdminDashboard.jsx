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

    // Fetch Classrooms on Load
    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/classrooms/me', {
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

    // --- ACTION HANDLERS ---
    
    const handleCreateClassroom = async () => {
        setIsCreatingClass(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/classrooms/create', {
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
            const response = await fetch(`http://localhost:5000/api/classrooms/${selectedClassroom._id}/challenges`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(challengeData)
            });

            if (response.ok) {
                toast({ title: 'Challenge Deployed!', status: 'success', duration: 2000 });
                setChallengeData({ title: '', description: '', points: 50 }); // Reset form
                closeAddChallenge(); 
            } else {
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
                                <Text color="gray.500">Challenges will appear here.</Text>
                            </Box>
                            <Box p={5} bg="white" borderRadius="md" shadow="sm" border="1px" borderColor="gray.200">
                                <Heading size="md" mb={4}>Student Roster</Heading>
                                <Text color="gray.500">Students will appear here once they join.</Text>
                            </Box>
                        </Grid>
                    </Box>
                )}

                {/* 3. GRADING DESK TAB */}
                {activeTab === 'grading' && (
                    <Box>
                        <Heading size="lg" mb={6}>Grading Desk</Heading>
                        <Text color="gray.500">Your pending student submissions will appear here.</Text>
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