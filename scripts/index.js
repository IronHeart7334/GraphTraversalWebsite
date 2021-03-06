import {
    getLatestGraph
} from "./importData.js";

import {
    Graph
} from "./graph.js";

import {
    toCsvFile
} from "./csv.js";

import {
    CalcPathForm,
    Canvas
} from "./gui.js";

import {
    getParams
} from "./parameters.js";

const VERSION_LOG_URL = "../data/versionLog.csv";

let parameters = getParams();
let form = new CalcPathForm("form", "start", "end");
let canvas = new Canvas("map");
let graph = new Graph();

if(parameters.debug){
    console.log(parameters.toString());
}

canvas.setGraph(graph);
canvas.repaint();

getLatestGraph(VERSION_LOG_URL, parameters.version, graph).then(()=>{
    form.addOptions(graph.getAllLabels());
    form.setOnSubmit((startLabel, endLabel)=>{
        let newPath = graph.findPath(startLabel, endLabel);
        canvas.setPath(newPath);
        canvas.repaint();
    });
    if(parameters.debug){
        graph.prettyPrintGraphData();
    }
    let p = graph.findPath(parameters.start, parameters.end);
    canvas.setPath(p);
    canvas.repaint();
});
