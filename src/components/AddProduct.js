import React, { useState } from "react";
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";

const AddProduct = () => {
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [weight, setWeight] = useState("");
  const [metal, setMetal] = useState("");
  const [carat, setCarat] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [ringSize, setRingSize] = useState("");
  const [stoneType, setStoneType] = useState("");
  const [stoneColor, setStoneColor] = useState("");

  const toast = useToast(); // Move useToast outside the component

  const removeEmptyValues = (obj) => {
    const newObj = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== 0
      ) {
        newObj[key] = value;
      }
    });
    return newObj;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const productData = {
      category,
      length: category !== "ring" ? Number(length) : undefined,
      width: category !== "ring" ? Number(width) : undefined,
      weight: Number(weight),
      metal,
      carat: Number(carat),
      brand,
    };

    if (category === "ring") {
      productData.ringSize = Number(ringSize);
      productData.stoneType = stoneType;
      productData.stoneColor = stoneColor;
    }

    const cleanedProductData = removeEmptyValues(productData);

    const jsonData = {
      products: [cleanedProductData],
    };

    try {
      const storedToken = localStorage.getItem("authToken");
      if (!storedToken) {
        console.error("Authentication token not found.");
        return;
      }

      const response = await axios.post(
        "http://localhost:3002/search-agent/match",
        jsonData,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Product added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const typeOptions =
    category === "ring" ? ["Alliance", "Signet"] : ["Beehive", "Anchor"];

  return (
    <Box p={4}>
      <Heading mb={4}>Add Product</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Category</FormLabel>
            <Select
              placeholder="Select category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="ring">Ring</option>
              <option value="necklace">Necklace</option>
              <option value="wristband">Wristband</option>
            </Select>
          </FormControl>

          {/* Common Fields */}
          <FormControl>
            <FormLabel>Type</FormLabel>
            <Select
              placeholder="Select type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Exclude length and width when category is "ring" */}
          {category !== "ring" && (
            <>
              <FormControl>
                <FormLabel>Length</FormLabel>
                <Input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Width</FormLabel>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                />
              </FormControl>
            </>
          )}

          <FormControl>
            <FormLabel>Weight</FormLabel>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Metal</FormLabel>
            <Select
              placeholder="Select metal"
              value={metal}
              onChange={(e) => setMetal(e.target.value)}
            >
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="white gold">White Gold</option>
              <option value="rose gold">Rose Gold</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Carat</FormLabel>
            <Select
              placeholder="Select carat"
              value={carat}
              onChange={(e) => setCarat(e.target.value)}
            >
              {/* Add carat options based on the selected metal */}
              {metal === "gold" && (
                <>
                  <option value="24">24</option>
                  <option value="21">21</option>
                  <option value="18">18</option>
                  <option value="14">14</option>
                </>
              )}
              {metal === "silver" && (
                <>
                  <option value="tretårnet">Tretårnet</option>
                  <option value="sterling">Sterling</option>
                </>
              )}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Brand</FormLabel>
            <Select
              placeholder="Select brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="bnh">BNH</option>
              <option value="pandora">Pandora</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Price</FormLabel>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </FormControl>

          {/* Ring-specific Fields */}
          {category === "ring" && (
            <>
              <FormControl>
                <FormLabel>Ring Size</FormLabel>
                <Input
                  type="number"
                  value={ringSize}
                  onChange={(e) => setRingSize(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Stone Type</FormLabel>
                <Select
                  placeholder="Select stone type"
                  value={stoneType}
                  onChange={(e) => setStoneType(e.target.value)}
                >
                  <option value="pearl">Pearl</option>
                  <option value="diamond">Diamond</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Stone Color</FormLabel>
                <Select
                  placeholder="Select stone color"
                  value={stoneColor}
                  onChange={(e) => setStoneColor(e.target.value)}
                >
                  <option value="white">White</option>
                  <option value="red">Red</option>
                </Select>
              </FormControl>
            </>
          )}

          <Button type="submit" colorScheme="teal" mt={4}>
            Add Product
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default AddProduct;
