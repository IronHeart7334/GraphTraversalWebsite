import {
    downloadFile
} from "./importData.js";

import {
    Vertex
} from "./vertexEdge.js";

downloadFile("../data/testCoords.csv").then((t)=>console.log(t));
