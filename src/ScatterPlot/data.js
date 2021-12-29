var testObjects = 100;
var testRange = 2;

const randomArray = (length, max) =>
  Array(length)
    .fill()
    .map(() => Math.random() * max);

var trace1 = {
  x: randomArray(testObjects, testRange),
  y: randomArray(testObjects, testRange),
  z: randomArray(testObjects, testRange),
  mode: "markers",
  marker: {
    size: 12,
    line: {
      color: "rgba(217, 217, 217, 0.14)",
      width: 0.5,
    },
    opacity: 0.8,
  },
  type: "scatter3d",
};

var trace2 = {
  x: randomArray(testObjects, testRange),
  y: randomArray(testObjects, testRange),
  z: randomArray(testObjects, testRange),
  mode: "markers",
  marker: {
    color: "rgb(127, 127, 127)",
    size: 12,
    symbol: "circle",
    line: {
      color: "rgb(204, 204, 204)",
      width: 1,
    },
    opacity: 0.8,
  },
  type: "scatter3d",
};

var data = [trace1, trace2];

export default data;
