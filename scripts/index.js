import {
    downloadFile,
    getLatestManifest
} from "./importData.js";

import {
    Vertex
} from "./vertexEdge.js";

import {
    parseResponseText
} from "./csv.js";

const VERSION_LOG_URL = "../data/versionLog.csv";

//downloadFile("../data/testCoords.csv").then((t)=>console.log(t));
getLatestManifest(VERSION_LOG_URL, "default").then((man)=>console.log(man));
//downloadFile("../data/testData.csv").then((text)=>console.log(parseResponseText(text).toString()));
