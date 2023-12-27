import React, { useState } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  Flex,
  Button,
  ButtonGroup,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

const SearchAgentList = ({ searchAgents, onDelete }) => {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [agentIdToDelete, setAgentIdToDelete] = useState(null);

  const agentsToDisplay = searchAgents || [];

  const formatRange = (from, to) => (from && to ? `${from}-${to}` : "");

  const getProperties = (agent) => {
    const properties = [];

    for (const [key, value] of Object.entries(agent.filter)) {
      if (key === "width" || key === "length") {
        const { from, to } = value;
        properties.push(
          <Box key={key} mb={2}>
            <Text fontSize="lg" fontWeight="bold">
              {key.charAt(0).toUpperCase() + key.slice(1)}:
            </Text>
            <Text>{formatRange(from, to)}</Text>
          </Box>
        );
      } else if (Array.isArray(value)) {
        properties.push(
          <Box key={key} mb={2}>
            <Text fontSize="lg" fontWeight="bold">
              {key.charAt(0).toUpperCase() + key.slice(1)}:
            </Text>
            <Text>{value.join(", ")}</Text>
          </Box>
        );
      } else {
        properties.push(
          <Box key={key} mb={2}>
            <Text fontSize="lg" fontWeight="bold">
              {key.charAt(0).toUpperCase() + key.slice(1)}:
            </Text>
            <Text>{value}</Text>
          </Box>
        );
      }
    }

    return properties;
  };

  const handleDeleteClick = (id) => {
    setAgentIdToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const handleCloseDeleteAlert = () => {
    setIsDeleteAlertOpen(false);
    setAgentIdToDelete(null);
  };

  const handleConfirmDelete = () => {
    onDelete(agentIdToDelete);
    setIsDeleteAlertOpen(false);
    setAgentIdToDelete(null);
  };

  return (
    <Flex
      direction="row"
      align="center"
      justify="flex-start"
      flexWrap="wrap"
      style={{ margin: "0 auto" }}
    >
      {agentsToDisplay.map((agent) => (
        <Box
          key={agent.id}
          borderWidth="1px"
          borderRadius="lg"
          p={4}
          m={2}
          width="350px"
          height="400px"
          textAlign="left"
          position="relative"
        >
          <Text fontSize="lg" fontWeight="bold">
            ID: {agent.id}
          </Text>
          <SimpleGrid columns={2} spacingX={4} spacingY={2} mt={2}>
            {getProperties(agent)}
          </SimpleGrid>
          <ButtonGroup
            mt="auto" // This makes the ButtonGroup stick to the bottom
            spacing={4}
            position="absolute"
            bottom="4"
          >
            <Button colorScheme="blue">EDIT</Button>
            <Button
              colorScheme="red"
              onClick={() => handleDeleteClick(agent.id)}
            >
              DELETE
            </Button>
          </ButtonGroup>

          {/* Delete Confirmation Alert */}
          <AlertDialog
            isOpen={isDeleteAlertOpen}
            onClose={handleCloseDeleteAlert}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Delete Search Agent
                </AlertDialogHeader>

                <AlertDialogBody>
                  Are you sure you want to delete this search agent?
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button onClick={handleCloseDeleteAlert}>Cancel</Button>
                  <Button
                    colorScheme="red"
                    onClick={handleConfirmDelete}
                    ml={3}
                  >
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </Box>
      ))}
    </Flex>
  );
};

export default SearchAgentList;
