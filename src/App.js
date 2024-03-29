import { ChakraProvider, CSSReset, Box, extendTheme } from "@chakra-ui/react";
import LoginForm from "./components/LoginForm";
import SearchAgentList from "./components/SearchAgentList";
import { useState, useEffect } from "react";
import axios from "axios";
import ProductView from "./components/ProductView";

const theme = extendTheme(/* Chakra UI theme config here */);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [searchAgents, setSearchAgents] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUserRole = localStorage.getItem("userRole");
    const storedEmail = localStorage.getItem("email");

    const fetchSearchAgents = async () => {
      try {
        const encodedEmail = encodeURIComponent(storedEmail);
        const response = await axios.get(
          `http://13.51.85.49:3000/search-agent/find?email=${encodedEmail}`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setSearchAgents(response.data);
      } catch (error) {
        console.error("Error fetching search agents:", error);
      }
    };

    const checkLoginStatus = async () => {
      if (storedToken && storedUserRole) {
        try {
          await axios.get("http://16.171.39.224:3000/verify", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          setUserRole(storedUserRole);
          if (storedUserRole === "user") {
            await fetchSearchAgents();
          }

          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error verifying token:", error);
        }
      }
    };

    checkLoginStatus();
  }, []);

  const handleSuccessfulLogin = async (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
    const storedToken = localStorage.getItem("authToken");
    const storedEmail = localStorage.getItem("email");

    if (role === "user") {
      try {
        const response = await axios.get(
          `http://13.51.85.49:3000/search-agent/find?email=${storedEmail}`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setSearchAgents(response.data);
      } catch (error) {
        console.error("Error fetching search agents:", error);
      }
    }
  };

  const handleDeleteAgent = async (id) => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const storedEmail = localStorage.getItem("email");
      await axios.delete(`http://13.51.85.49:3000/search-agent/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      const response = await axios.get(
        `http://13.51.85.49:3000/search-agent/find?email=${storedEmail}`,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
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
              <ProductView />
            ) : (
              <SearchAgentList
                searchAgents={searchAgents}
                onDelete={handleDeleteAgent}
              />
            )}
          </Box>
        ) : (
          <LoginForm onSuccessfulLogin={handleSuccessfulLogin} />
        )}
      </Box>
    </ChakraProvider>
  );
};

export default App;
