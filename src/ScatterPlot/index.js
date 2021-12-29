import { useLayoutEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import data from "./data";
import layout from "./layout";

const ScatterPlot = () => {
  const div = useRef();

  useLayoutEffect(() => {
    window.Plotly.newPlot(div.current, data, layout);
  }, []);

  return (
    <Box bg="blue.200">
      <div ref={div}></div>
    </Box>
  );
};

export default ScatterPlot;
