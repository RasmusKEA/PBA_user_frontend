import { ChakraProvider, CSSReset, Box, extendTheme } from "@chakra-ui/react";
import LoginForm from "./components/LoginForm";
import SearchAgentList from "./components/SearchAgentList";
import { useState, useEffect } from "react";
import axios from "axios";

const theme = extendTheme(/* Your Chakra UI theme config here */);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [searchAgents, setSearchAgents] = useState([]);

  useEffect(() => {
    // Check for the authentication token on page load
    const storedToken = localStorage.getItem("authToken");
    const storedUserRole = localStorage.getItem("userRole");

    const fetchSearchAgents = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3002/search-agent/find?email=user@al.dk`
        );
        setSearchAgents(response.data);
      } catch (error) {
        console.error("Error fetching search agents:", error);
      }
    };

    const checkLoginStatus = async () => {
      if (storedToken && storedUserRole) {
        try {
          // Verify the token with your server's /verify endpoint
          await axios.get("http://localhost:3000/verify", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          // Token is valid, set user as logged in
          setUserRole(storedUserRole);

          // Fetch user-specific search agents
          await fetchSearchAgents();

          // Set user as logged in after fetching search agents
          setIsLoggedIn(true);
        } catch (error) {
          // Token verification failed, perform logout (clear local storage, etc.)
          // ...
          console.error("Error verifying token:", error);
        }
      }
    };

    checkLoginStatus();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSuccessfulLogin = async (role) => {
    setUserRole(role);
    setIsLoggedIn(true);

    if (role === "user") {
      try {
        const response = await axios.get(
          `http://localhost:3002/search-agent/find?email=user@al.dk`
        );
        setSearchAgents(response.data);
      } catch (error) {
        console.error("Error fetching search agents:", error);
      }
    }
  };

  const handleDeleteAgent = async (id) => {
    try {
      // Make a DELETE request to delete the search agent with the given id
      await axios.delete(`http://localhost:3002/search-agent/delete/${id}`);

      // After deletion, refetch the updated search agents
      const response = await axios.get(
        `http://localhost:3002/search-agent/find?email=user@al.dk`
      );
      setSearchAgents(response.data);
    } catch (error) {
      console.error("Error deleting search agent:", error);
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Box m="auto" p="4">
        {isLoggedIn ? (
          <Box>
            {userRole === "admin" ? (
              <p>You are logged in as an admin.</p>
            ) : (
              <SearchAgentList
                searchAgents={searchAgents}
                onDelete={handleDeleteAgent}
              />
            )}
            {/* Add role-specific components here */}
          </Box>
        ) : (
          <LoginForm onSuccessfulLogin={handleSuccessfulLogin} />
        )}
      </Box>
    </ChakraProvider>
  );
};

export default App;
