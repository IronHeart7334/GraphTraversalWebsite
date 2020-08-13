/*
This module handles graph vertices, edges, and paths.
*/

class Vertex {
    constructor(id, x, y){
        this.id = id;
        this.x = x;
        this.y = y;

        this.neighborIds = [];
        this.labels = [];
    }

    isAdjTo(id){
        // binary search
        let min = 0;
        let max = this.neighborIds.length;
        let mid = parseInt((min + max) / 2);
        let isAdj = false;
        while(!isAdj && min < max){
            if(this.neighborIds[mid] < id){
                min = mid + 1;
            } else if(this.neighborIds[mid] > id){
                max = mid - 1;
            } else {
                isAdj = true;
            }
            mid = parseInt((min + max) / 2);
        }
        return isAdj;
    }

    addNeighbor(neighborId){
        if(!this.isAdjTo(neighborId)){
            // perform insertion sort
            let insertIdx = this.neighborIds.length;
            let temp;
            this.neighborIds.push(neighborId);
            while(insertIdx > 0 && this.neighborIds[insertIdx - 1] > neighborId){
                temp = this.neighborIds[insertIdx - 1];
                this.neighborIds[insertIdx - 1] = neighborId;
                this.neighborIds[insertIdx] = temp;
                insertIdx--;
            }
        }
    }

    distanceFrom(vertex2){
        return Math.sqrt(Math.pow(vertex2.x - this.x, 2), Math.pow(vertex2.y - this.y, 2));
    }
}

class Edge {
    constructor(from, to){
        this.from = from;
        this.to = to;
        this.length = from.distanceFrom(to);
    }
}

class Path {
    constructor(...vertices){
        this.vertices = vertices;
    }
}

class Graph {
    constructor(){
        this.idToVertex = new Map();
        this.labelToId = new Map();
    }

    addVertex(vertex){
        this.idToVertex.set(vertex.id, vertex);
        vertex.labels.forEach((lable)=>{
            this.labelToId.set(label, vertex.id);
        });
    }

    // maybe make an addEdge(vertex1, vertex2) method

    getVertexById(id){
        return this.idToVertex.get(id);
    }

    getVertexByLabel(label){
        return this.labelToId.get(label);
    }

    prettyPrintGraphData(){
        console.log("GRAPH:");
        console.log("  VERTICES:");
        this.idToVertex.values().forEach((vertex)=>{
            console.log("    " + vertex.toString());
        });
        console.log("  LABELS:");
        //                     Map::forEach is backwards like this, right?
        this.labelToId.forEach((id, label)=>{
            console.log(`    ${label} => ${id}`);
        });
        console.log("END OF GRAPH");
    }
}

let n = new Vertex(1, 1, 1);
n.addNeighbor(5);
n.addNeighbor(1);
n.addNeighbor(3);
n.addNeighbor(2);
n.addNeighbor(4);
n.addNeighbor(5);
n.addNeighbor(5);

export {
    Vertex,
    Path
};
