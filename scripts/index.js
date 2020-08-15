import {
    downloadFile,
    downloadVersionLog
} from "./importData.js";

import {
    Vertex
} from "./vertexEdge.js";

import {
    parseResponseText
} from "./csv.js";

const VERSION_LOG_URL = "../data/versionLog.csv";

//downloadFile("../data/testCoords.csv").then((t)=>console.log(t));
downloadVersionLog(VERSION_LOG_URL).then((vlog)=>console.log(vlog));
downloadFile("../data/testData.csv").then((text)=>console.log(parseResponseText(text).toString()));
