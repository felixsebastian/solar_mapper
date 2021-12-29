import "./index.css";
import ScatterPlot from "./ScatterPlot";
import { Flex, Text, Box } from "@chakra-ui/react";

const App = () => (
  <Flex h="100vh">
    <Box flex="1" bg="gray.500">
      <Text>Box 1</Text>
    </Box>
    <Box bg="gray.600">
      <ScatterPlot />
    </Box>
  </Flex>
);

export default App;
