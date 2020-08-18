import {
    downloadFile,
    getLatestGraph
} from "./importData.js";

import {
    Graph
} from "./graph.js";

import {
    parseResponseText
} from "./csv.js";

const VERSION_LOG_URL = "../data/versionLog.csv";

let graph = new Graph();

//downloadFile("../data/testCoords.csv").then((t)=>console.log(t));
getLatestGraph(VERSION_LOG_URL, "wayfinding", graph).then(()=>{
    console.log(graph.prettyPrintGraphData());
    console.log(graph.findPath(0, 7).toString());
});
//downloadFile("../data/testData.csv").then((text)=>console.log(parseResponseText(text).toString()));
