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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
} from "@chakra-ui/react";
import axios from "axios";

const SearchAgentList = ({ searchAgents, onDelete }) => {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [agentIdToDelete, setAgentIdToDelete] = useState(null);
  const [editedAgent, setEditedAgent] = useState({});
  const [editModalId, setEditModalId] = useState(null);

  const agentsToDisplay = searchAgents || [];

  const formatRange = (from, to) => (from && to ? `${from}-${to}` : "");

  const getProperties = (agent) => {
    const properties = [];

    for (const [key, value] of Object.entries(agent.filter)) {
      if (
        key === "width" ||
        key === "length" ||
        key === "ringSize" ||
        key === "weight"
      ) {
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

  const handleEditClick = (id) => {
    const agentToEdit = agentsToDisplay.find((agent) => agent.id === id);
    setEditModalId(id);
    setEditedAgent(agentToEdit);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditModalId(null);
    setEditedAgent({});
  };

  const handleSaveChanges = async () => {
    let updatedFilter;
    try {
      // Check if there are changes to the brand
      if (
        editedAgent.filter &&
        (editedAgent.filter.brand !== undefined ||
          Array.isArray(editedAgent.filter.brand))
      ) {
        const brandArray = Array.isArray(editedAgent.filter.brand)
          ? editedAgent.filter.brand
          : editedAgent.filter.brand
          ? editedAgent.filter.brand.split(",").map((brand) => brand.trim())
          : [];

        updatedFilter = {
          ...editedAgent.filter,
          brand: brandArray,
        };
      }
      updatedFilter = { ...editedAgent.filter };
      const storedToken = localStorage.getItem("authToken");
      await axios.put(
        `http://13.51.85.49:3000/search-agent/update/${editModalId}`,
        {
          filter: updatedFilter,
        },
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      setIsEditModalOpen(false);
      setEditModalId(null);
      setEditedAgent({});
      window.location.reload(false);
    } catch (error) {
      console.error("Error updating search agent:", error);
    }
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
          <ButtonGroup mt="auto" spacing={4} position="absolute" bottom="4">
            <Button
              colorScheme="blue"
              onClick={() => handleEditClick(agent.id)}
            >
              EDIT
            </Button>
            <Button
              colorScheme="red"
              onClick={() => handleDeleteClick(agent.id)}
            >
              DELETE
            </Button>
          </ButtonGroup>

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

          <Modal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            scrollBehavior={"inside"}
            blockScrollOnMount={false}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Search Agent</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {editedAgent &&
                  Object.entries(editedAgent.filter || {}).map(
                    ([key, value]) => (
                      <Box key={key} mb={4}>
                        <Text fontSize="lg" fontWeight="bold">
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </Text>
                        {key === "length" ||
                        key === "width" ||
                        key === "ringSize" ||
                        key === "weight" ? (
                          <Flex>
                            <Text fontSize="sm" mr={2}>
                              From:
                            </Text>
                            <Input
                              type="number"
                              value={value.from}
                              onChange={(e) =>
                                setEditedAgent({
                                  ...editedAgent,
                                  filter: {
                                    ...editedAgent.filter,
                                    [key]: {
                                      ...editedAgent.filter[key],
                                      from: e.target.value,
                                    },
                                  },
                                })
                              }
                              mr={4}
                            />
                            <Text fontSize="sm" mr={2}>
                              To:
                            </Text>
                            <Input
                              type="number"
                              value={value.to}
                              onChange={(e) =>
                                setEditedAgent({
                                  ...editedAgent,
                                  filter: {
                                    ...editedAgent.filter,
                                    [key]: {
                                      ...editedAgent.filter[key],
                                      to: e.target.value,
                                    },
                                  },
                                })
                              }
                            />
                          </Flex>
                        ) : (
                          <Input
                            mb={2}
                            value={value}
                            onChange={(e) =>
                              setEditedAgent({
                                ...editedAgent,
                                filter: {
                                  ...editedAgent.filter,
                                  [key]: e.target.value,
                                },
                              })
                            }
                          />
                        )}
                      </Box>
                    )
                  )}
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" onClick={handleSaveChanges}>
                  Save Changes
                </Button>
                <Button onClick={handleCloseEditModal}>Cancel</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      ))}
    </Flex>
  );
};

export default SearchAgentList;
