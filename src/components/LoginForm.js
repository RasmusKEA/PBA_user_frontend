import { useState } from "react";
import {
  Box,
  Input,
  Button,
  Flex,
  Center,
  Heading,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";

const LoginForm = ({ onSuccessfulLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const toast = useToast();

  const handleEmailCheck = async () => {
    try {
      const response = await axios.post(
        "http://16.171.39.224:3000/check-email",
        {
          email,
        }
      );

      if (response.status === 200) {
        setShowPasswordInput(true);
      } else {
        toast({
          title: "Email Not Found",
          description: "Something went wrong!",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error checking email:", error);

      if (error.response && error.response.status === 401) {
        toast({
          title: "Email Not Found",
          description: "The provided email is not found in our system.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://16.171.39.224:3000/login", {
        email,
        password,
      });

      const { token, userRole } = response.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("email", response.data.email);

      onSuccessfulLogin(userRole);

      toast({
        title: "Successful login",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.error("Login failed:", error);

      toast({
        title: "Login failed",
        description: "Invalid email or password",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Center height="100vh">
      <Box p={4} borderWidth="1px" borderRadius="lg" textAlign="center">
        <Heading size="lg">Login</Heading>
        <Text mt={2} fontSize="sm" color="gray.500">
          Please login using your email and password
        </Text>

        <Flex direction="column" align="center" justify="center" mt={4}>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            width="200px"
          />
          {showPasswordInput && (
            <Input
              mt={2}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              width="200px"
            />
          )}
          <Button
            mt={2}
            onClick={showPasswordInput ? handleLogin : handleEmailCheck}
            width="200px"
          >
            {showPasswordInput ? "Login" : "Next"}
          </Button>
        </Flex>
      </Box>
    </Center>
  );
};

export default LoginForm;
