import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Link as RouterLink } from 'react-router-dom';
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
Link
} from '@chakra-ui/react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate=useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('https://gamified-platform-1.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // 1. Save the VIP Ticket to the browser's memory!
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.user.role);

                // 2. Show a beautiful success pop-up
                toast({
                    title: 'Login Successful',
                    description: `Welcome back, ${data.user.name}!`,
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'top',
                });
                
                // Redirect based on the role stored in the database
if (data.user.role === 'professor') {
    navigate('/admin');
} else {
    navigate('/student');
}

            } else {
                toast({
                    title: 'Access Denied',
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
                        <Heading size="xl">Welcome back</Heading>
                        <Text color="gray.500">Enter your credentials to access the arena.</Text>
                    </VStack>

                    <Box w="full" as="form" onSubmit={handleLogin}>
                        <VStack spacing="5">
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

                            <Button 
                                type="submit" 
                                colorScheme="blue" 
                                size="lg" 
                                fontSize="md" 
                                w="full"
                                isLoading={isLoading}
                                loadingText="Authenticating..."
                            >
                                Sign in
                            </Button>
                            <Text fontSize="sm" color="gray.600" mt={4}>
    Don't have an account?{' '}
    <Link as={RouterLink} to="/register" color="blue.500" fontWeight="bold">
        Sign up here
    </Link>
</Text>
                        </VStack>
                    </Box>
                </VStack>
            </Box>
        </Container>
    );
}

export default Login;