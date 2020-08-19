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

import {
    InputBox,
    Canvas
} from "./gui.js";

const VERSION_LOG_URL = "../data/versionLog.csv";

let startBox = new InputBox("start");
let endBox = new InputBox("end");
let canvas = new Canvas("map");
let graph = new Graph();
canvas.setGraph(graph);
canvas.repaint();

//downloadFile("../data/testCoords.csv").then((t)=>console.log(t));
getLatestGraph(VERSION_LOG_URL, "wayfinding", graph).then(()=>{
    let labels = graph.getAllLabels();
    startBox.addOptions(labels);
    endBox.addOptions(labels);
    graph.prettyPrintGraphData();
    let p = graph.findPath(0, 7);
    console.log(p.toString());
    canvas.setPath(p);
    canvas.repaint();
});
//downloadFile("../data/testData.csv").then((text)=>console.log(parseResponseText(text).toString()));
