import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  InputGroup,
  InputRightElement,
  Select,
  Link
} from '@chakra-ui/react';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default to student
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const toast = useToast();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('https://gamified-platform-1.onrender.com/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: 'Account Created!',
                    description: "You can now log in with your credentials.",
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'top',
                });
                
                // Send them back to the login page to actually sign in
                navigate('/');
            } else {
                toast({
                    title: 'Registration Failed',
                    description: data.error,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top',
                });
            }
        } catch (error) {
            toast({
                title: 'Network Error',
                description: 'Could not connect to the server.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
            <Box
                py={{ base: '0', sm: '8' }}
                px={{ base: '4', sm: '10' }}
                bg="white"
                boxShadow={{ base: 'none', sm: 'md' }}
                borderRadius={{ base: 'none', sm: 'xl' }}
            >
                <VStack spacing="8">
                    <VStack spacing="2" textAlign="center">
                        <Heading size="xl">Join the Arena</Heading>
                        <Text color="gray.500">Create your account to start earning XP.</Text>
                    </VStack>

                    <Box w="full" as="form" onSubmit={handleRegister}>
                        <VStack spacing="4">
                            <FormControl isRequired>
                                <FormLabel htmlFor="name">Full Name</FormLabel>
                                <Input 
                                    id="name" 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    focusBorderColor="blue.500"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel htmlFor="email">Email</FormLabel>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    focusBorderColor="blue.500"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel htmlFor="password">Password</FormLabel>
                                <InputGroup>
                                    <Input 
                                        id="password" 
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        focusBorderColor="blue.500"
                                    />
                                    <InputRightElement width="4.5rem">
                                        <Button h="1.75rem" size="sm" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? 'Hide' : 'Show'}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel htmlFor="role">I am a...</FormLabel>
                                <Select 
                                    id="role"
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)}
                                    focusBorderColor="blue.500"
                                >
                                    <option value="student">Student</option>
                                    <option value="professor">Professor</option>
                                </Select>
                            </FormControl>

                            <Button 
                                type="submit" 
                                colorScheme="blue" 
                                size="lg" 
                                fontSize="md" 
                                w="full"
                                isLoading={isLoading}
                                loadingText="Creating Account..."
                                mt={2}
                            >
                                Sign Up
                            </Button>

                            <Text fontSize="sm" color="gray.600" mt={4}>
                                Already have an account?{' '}
                                <Link as={RouterLink} to="/" color="blue.500" fontWeight="bold">
                                    Log in here
                                </Link>
                            </Text>
                        </VStack>
                    </Box>
                </VStack>
            </Box>
        </Container>
    );
}

export default Register;