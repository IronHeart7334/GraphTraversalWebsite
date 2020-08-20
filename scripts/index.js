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
    CalcPathForm,
    Canvas
} from "./gui.js";

const VERSION_LOG_URL = "../data/versionLog.csv";

let form = new CalcPathForm("form", "start", "end");
let canvas = new Canvas("map");
let graph = new Graph();
canvas.setGraph(graph);
canvas.repaint();

//downloadFile("../data/testCoords.csv").then((t)=>console.log(t));
getLatestGraph(VERSION_LOG_URL, "wayfinding", graph).then(()=>{
    form.addOptions(graph.getAllLabels());
    form.setOnSubmit((startLabel, endLabel)=>{
        let newPath = graph.findPath(
            graph.getVertexByLabel(startLabel).id,
            graph.getVertexByLabel(endLabel).id
        );
        canvas.setPath(newPath);
        canvas.repaint();
    });
    graph.prettyPrintGraphData();
    let p = graph.findPath(0, 7);
    console.log(p.toString());
    canvas.setPath(p);
    canvas.repaint();
});
//downloadFile("../data/testData.csv").then((text)=>console.log(parseResponseText(text).toString()));
