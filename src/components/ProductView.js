import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  List,
  ListItem,
  Text,
  Image,
  Flex,
  Button,
} from "@chakra-ui/react";

const ProductView = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://13.51.172.202:3000/getUnpublished"
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filterTags = (tags) => {
    const allowedTags = [
      "material_",
      "category_",
      "weight_",
      "ring_size_",
      "carat_",
      "stone_color_",
      "stone_type_",
      "length_cm_",
      "width_mm_",
      "brand_",
      "model_",
    ];

    const excludedTags = ["model_Anden", "model_Anden type"];

    return tags
      .split(", ")
      .filter((tag) => !excludedTags.includes(tag)) // Exclude specific tags
      .filter((tag) =>
        allowedTags.some((allowedTag) => tag.startsWith(allowedTag))
      )
      .map((tag) => {
        let [key, ...values] = tag.split("_");
        let value = values.join("_");

        // Clean up the values and adjust specific keys
        switch (key) {
          case "ring":
            key = "ringSize";
            value = value.replace("size_", "");
            break;
          case "weight":
            value = value.replace("g_", "");
            break;
          case "length":
            key = "length";
            value = value.replace("cm_", "");
            break;
          case "width":
            key = "width";
            value = value.replace("mm_", "");
            break;
          case "stone":
            if (values[0] === "color") {
              key = "stoneColor";
              value = values.slice(1).join("_");
            } else if (values[0] === "type") {
              key = "stoneType";
              value = values.slice(1).join("_");
            }
            break;
        }

        value = value.replace(/^_+|_+$/g, "").trim();

        return { name: key, value: value };
      });
  };
  const removeEmptyValues = (obj) => {
    const newObj = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== 0 &&
        (typeof value !== "number" || !isNaN(value))
      ) {
        newObj[key] = value;
      }
    });
    return newObj;
  };
  const handlePublish = async (productId, productData) => {
    try {
      const { product_type, variants, tags, image, handle } = productData;
      const price = variants[0]?.price;

      const filteredTags = filterTags(tags);

      const relevantData = {
        category: product_type,
        type: filteredTags.find((tag) => tag.name === "model")?.value,
        length: parseFloat(
          filteredTags.find((tag) => tag.name === "length")?.value
        ),
        width: parseFloat(
          filteredTags.find((tag) => tag.name === "width")?.value
        ),
        weight: parseFloat(
          filteredTags.find((tag) => tag.name === "weight")?.value
        ),
        metal: filteredTags.find((tag) => tag.name === "material")?.value,
        carat: parseFloat(
          filteredTags.find((tag) => tag.name === "carat")?.value
        ),
        brand: filteredTags.find((tag) => tag.name === "brand")?.value,
        ringSize: parseFloat(
          filteredTags.find((tag) => tag.name === "ringSize")?.value
        ),
        stoneColor: filteredTags.find((tag) => tag.name === "stoneColor")
          ?.value,
        stoneType: filteredTags.find((tag) => tag.name === "stoneType")?.value,
        price: parseFloat(price),
      };

      // Remove undefined, null, and NaN values from relevantData
      const filteredData = removeEmptyValues(relevantData);

      // Make a POST request to publish the product
      const response = await fetch(
        `http://16.170.254.146:3000/publishProduct/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);

        const arrayifyData = { image, handle, products: [filteredData] };

        const storedToken = localStorage.getItem("authToken");
        const arrayifyResponse = await fetch(
          "http://13.51.85.49:3000/search-agent/match",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${storedToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(arrayifyData),
          }
        );

        if (arrayifyResponse.ok) {
          const arrayifyResult = await arrayifyResponse.json();
          console.log("Arrayify Response:", arrayifyResult);
          // Additional actions after successful arrayifyData posting
        } else {
          const arrayifyErrorData = await arrayifyResponse.json();
          console.error("Error posting arrayifyData:", arrayifyErrorData.error);
          // Handle error cases for arrayifyData posting
        }
      } else {
        const errorData = await response.json();
        console.error("Error publishing product:", errorData.error);
        // Handle error cases for product publishing
      }
    } catch (error) {
      console.error("Error:", error.message);
      // Handle error cases
    }
  };

  return (
    <Box p={4}>
      <Heading mb={4}>ProductView</Heading>
      {products.map((product) => (
        <Flex
          key={product.id}
          borderWidth="1px"
          borderRadius="lg"
          p={4}
          direction="row"
          justify="space-between"
          align="center"
          mb={4}
        >
          <Box>
            <Heading as="h2" fontSize="xl" mb={2}>
              {product.title}
            </Heading>
            <Text>Vendor: {product.vendor}</Text>
            <Text>Product Type: {product.product_type}</Text>
            <Text>Price: {product.variants[0]?.price}</Text>
            <Text>Tags:</Text>
            <List>
              {filterTags(product.tags).map((tag, index) => (
                <ListItem key={index}>
                  <Text>{`${tag.name}: ${tag.value}`}</Text>
                </ListItem>
              ))}
            </List>
          </Box>
          <Image
            src={product.images[0]?.src}
            alt={product.images[0]?.alt}
            boxSize="200px"
            objectFit="cover"
            mr={4}
          />
          <Button onClick={() => handlePublish(product.id, product)}>
            Publish
          </Button>
        </Flex>
      ))}
    </Box>
  );
};

export default ProductView;
