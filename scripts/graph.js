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

    toString(){
        return `#${this.id}(${this.x}, ${this.y})`;
    }
}

class Edge {
    /*
    from and to are Vertex objects
    */
    constructor(from, to){
        this.from = from;
        this.to = to;
        this.length = from.distanceFrom(to);
    }

    toString(){
        return `Edge ${this.from.id} => ${this.to.id}`;
    }
}

class Path {
    constructor(){
        this.vertices = [];
    }

    addVertex(vertex){
        this.vertices.push(vertex);
    }

    getVertices(){
        return this.vertices;
    }

    toString(){
        return "PATH: " + this.vertices.map((v)=>v.toString()).join(" => ");
    }
}

class Graph {
    constructor(){
        /*
        Vertex => Edge[]
        Key is start, value is the edges connecting it to its neighbors.
        */
        this.edges = new Map();
        this.idToVertex = new Map();
        this.labelToVertex = new Map();
        this.image = null;
    }

    addVertex(vertex){
        this.idToVertex.set(vertex.id, vertex);
    }
    addEdge(edge){
        if(!this.edges.has(edge.from)){
            this.edges.set(edge.from, []);
        }
        this.edges.get(edge.from).push(edge);
    }
    addLabel(labelStr, vertex){
        this.labelToVertex.set(labelStr, vertex);
    }
    setImage(path){
        this.image = new Image();
        this.image.src = path;
    }

    /*
    Takes a CsvFile, and
    adds the vertices contained
    therein.
    */
    parseVertexCsv(csv){
        console.log("Parsing the following vertex file:");
        console.log(csv.toString());
        let errors = [];
        let idCol = csv.getColIdx("id");
        let xCol = csv.getColIdx("x");
        let yCol = csv.getColIdx("y");
        let data = csv.getBody();
        let row;
        let id;
        let x;
        let y;
        let errorFlag = false;
        for(let rowNum = 0; rowNum < data.length; rowNum++){
            errorFlag = false;
            row = data[rowNum];
            id = parseInt(row[idCol]);
            x = parseInt(row[xCol]);
            y = parseInt(row[yCol]);
            if(isNaN(id)){
                errors.push(`Invalid ID: ${row[idCol]}`);
                errorFlag = true;
            }
            if(isNaN(x)){
                errors.push(`Invalid X coordinate: ${row[xCol]}`);
                errorFlag = true;
            }
            if(isNaN(y)){
                errors.push(`Invalid Y coordinate: ${row[yCol]}`);
                errorFlag = true;
            }

            if(!errorFlag){
                this.addVertex(new Vertex(id, x, y));
            }
            errorFlag = false;
        }
        if(errors.length === 0){
            console.log("File parsed 100% successfully!");
        } else {
            console.error("Encountered a the following errors:");
            errors.forEach((e)=>console.error(e));
        }
    }

    parseEdgeCsv(csv){
        console.log("Parsing the following edge file:");
        console.log(csv.toString());
        let body = csv.getBody();
        let errors = [];
        let row;
        let id1;
        let id2;
        let vertex1;
        let vertex2;
        let errorFlag;
        for(let rowNum = 0; rowNum < body.length; rowNum++){
            errorFlag = false;
            row = body[rowNum];
            id1 = parseInt(row[0]);
            id2 = parseInt(row[1]);
            if(isNaN(id1)){
                errors.push(`Invalid ID in first column: ${row.toString()}`);
                errorFlag = true;
            }
            if(isNaN(id2)){
                errors.push(`Invalid ID in second column: ${row.toString()}`);
                errorFlag = true;
            }

            if(!errorFlag){
                // now see if I have the proper vertices
                vertex1 = this.idToVertex.get(id1);
                vertex2 = this.idToVertex.get(id2);
                if(vertex1 == null){
                    errors.push(`Graph contains no vertex with ID ${id1}`);
                    errorFlag = true;
                }
                if(vertex2 == null){
                    errors.push(`Graph contains no vertex with ID ${id2}`);
                    errorFlag = true;
                }
            }

            if(!errorFlag){
                // if we got here, we have 2 valid vertices
                this.addEdge(new Edge(vertex1, vertex2));
            }
        }

        if(errors.length === 0){
            console.log("File parsed 100% successfully!");
        } else {
            console.error("Encountered a the following errors:");
            errors.forEach((e)=>console.error(e));
        }
    }

    parseLabelCsv(csv){
        console.log("Parsing the following label file:");
        console.log(csv.toString());
        let body = csv.getBody();
        let errors = [];
        let labelCol = csv.getColIdx("label");
        let idCol = csv.getColIdx("id");
        let row;
        let label;
        let id;

        for(let rowNum = 0; rowNum < body.length; rowNum++){
            row = body[rowNum];
            label = row[labelCol].toString();
            id = parseInt(row[idCol]);
            if(isNaN(id)){
                errors.push(`Invalid id in row ${row.toString()}`);
            } else if(this.getVertexById(id) == null){
                errors.push(`Graph contains no vertex with ID ${id}`);
            } else {
                this.addLabel(label, this.getVertexById(id));
            }
        }


        if(errors.length === 0){
            console.log("File parsed 100% successfully!");
        } else {
            console.error("Encountered a the following errors:");
            errors.forEach((e)=>console.error(e));
        }
    }

    getVertexById(id){
        return this.idToVertex.get(id);
    }

    getVertexByLabel(label){
        return this.labelToVertex.get(label);
    }


    /*
    Dijkstra's algorithm
    */
    findPath(startId, endId){
        const DEBUG = true;
        let path = new Path();

        return path;
    }



    prettyPrintGraphData(){
        console.log("GRAPH:");
        console.log("  IMAGE:");
        if(this.image == null){
            console.log("    no image set");
        } else {
            console.log("    " + this.image.src);
        }
        console.log("  VERTICES:");
        this.idToVertex.forEach((vertex, id)=>{
            console.log("    " + vertex.toString());
        });
        console.log("  EDGES:");
        this.edges.forEach((edgeArray, fromVertexId)=>{
            edgeArray.forEach((edge)=>console.log("    " + edge.toString()));
        });
        console.log("  LABELS:");
        //                     Map::forEach is backwards like this, right?
        this.labelToVertex.forEach((vertex, label)=>{
            console.log(`    ${label} => ${vertex.toString()}`);
        });
        console.log("END OF GRAPH");
    }
}

class PathStep {
    constructor(edge, accumulatedDistance){
        this.edge = edge;
        this.accumulatedDistance = edge.length + accumulatedDistance;
    }

    toString(){
        return `Path Step on edge (${this.edge.toString()}). Total distance: ${this.accumulatedDistance}`;
    }
}
class PathStepMinHeap {
    constructor(){
        this.firstEmptyIdx = 0;
        this.values = [];
    }

    siftUp(pathStep){
        if(this.firstEmptyIdx === this.values.length){
            this.values.push(""); // make room for the new step
        }
        this.values[this.firstEmptyIdx] = pathStep;
        this.firstEmptyIdx++;

        // swap until the pathStep is in its proper place
        let currIdx = this.firstEmptyIdx - 1; // where the pathStep currently is
        let parentIdx = Math.floor((idx - 1) / 2); // starts at the bottom, so we need the node above it.
        // heaps are like a binary tree, so this is how you access a node's parents
        let temp = null;
        while(parentIdx >= 0 && idx !== 0 && this.values[idx].accumulatedDistance < this.values[parentIdx].accumulatedDistance){
            temp = this.values[parentIdx];
            this.values[parentIdx] = this.values[idx];
            this.values[idx] = temp;
            temp = null;
            idx = parentIdx;
            parentIdx = Math.floor((idx - 1) / 2);
        }
    }

    siftDown(){
        if(this.isEmpty()){
            throw new Error("Nothing to sift down");
        }
        // remove topmost item from the heap ...
        let ret = this.values[0];
        // ... the last element becomes the first, overwriting the old one
        this.values[0] = this.values[this.firstEmptyIdx - 1];
        this.firstEmptyIdx--; // last element's slot is marked "up for grabs", and may be overwrittin, effectively deleting it

        // swap this new top into place
        let currIdx = 0;
        let left = 1; // heap is like a binary tree, so this is how you access children
        let right = 2;
        let temp = null;
        while(
            // test if the new top is heavier than either child.
            // check if left or right are (in range and lighter than the new top)
            ((left < this.firstEmptyIdx && this.values[left].accumulatedDistance < this.values[currIdx].accumulatedDistance)) ||
            ((right < this.firstEmptyIdx && this.values[right].accumulatedDistance < this.values[currIdx].accumulatedDistance))
        ) {
            // identify which child is lighter
            if(this.values[left].accumulatedDistance < this.values[right].accumulatedDistance){
                // swap top with its left child
                temp = this.values[left];
                this.values[left] = this.values[currIdx];
                this.values[currIdx] = temp;
                idx = left;
            } else {
                // swap top with its right child
                temp = this.values[right];
                this.values[right] = this.values[currIdx];
                this.values[currIdx] = temp;
                idx = right;
            }
            temp = null;
            left = currIdx * 2 + 1;
            right = currIdx * 2 + 2;
        }

        return ret;
    }

    isEmpty(){
        return this.firstEmptyIdx === 0;
    }

    toString(){
        let ret = "HEAP:";
        let rowNum = 0;
        let colNum = 0;
        let rowMaxWidth = 1;
        let nextRow = null;
        for(let i = 0; i < this.firstEmptyIdx; i++){
            if(nextRow === null){
                nextRow = `\nRow #${rowNum}: `;
            }
            nextRow += this.values[i].toString();
            colNum++;
            if(col >= rowMaxWidth){
                // done with row
                rowNum++;
                rowMaxWidth *= 2;
                colNum = 0;
                ret += nextRow;
                nextRow = null;
            } else {
                nextRow += " | ";
            }
        }

        // don't forget incomplete rows!
        if(nextRow !== null){
            ret += nextRow;
        }

        ret += "\nEND OF HEAP";
        return ret;
    }
}

export {
    Vertex,
    Path,
    Graph
};
