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
    constructor(...vertices){
        this.vertices = vertices;
    }
}

class Graph {
    constructor(){
        /*
        Vertex => Vertex[]
        Key is start, value is the neighbors of the vertex with that ID.
        */
        this.edges = new Map();
        this.idToVertex = new Map();
        this.labelToVertex = new Map();
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

    prettyPrintGraphData(){
        console.log("GRAPH:");
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

/*
let n = new Vertex(1, 1, 1);
n.addNeighbor(5);
n.addNeighbor(1);
n.addNeighbor(3);
n.addNeighbor(2);
n.addNeighbor(4);
n.addNeighbor(5);
n.addNeighbor(5);
*/

export {
    Vertex,
    Path,
    Graph
};
