import {
    parseResponseText
} from "./csv.js";

class Manifest {
    constructor(){
        this.mapUrl = null;
        this.vertexUrl = null;
        this.edgeUrl = null;
        this.labelUrl = null;
    }

    setMapUrl(url){
        this.mapUrl = url;
    }
    setVertexUrl(url){
        this.vertexUrl = url;
    }
    setEdgeUrl(url){
        this.edgeUrl = url;
    }
    setLabelUrl(url){
        this.labelUrl = url;
    }

    getMapUrl(){
        return this.mapUrl;
    }
    getVertexUrl(){
        return this.vertexUrl;
    }
    getEdgeUrl(){
        return this.edgeUrl;
    }
    getLabelUrl(){
        return this.labelUrl;
    }

    toString(){
        return `Manifest:
            Map Image : ${this.mapUrl}
            Vertices : ${this.vertexUrl}
            Edges : ${this.edgeUrl}
            Labels : ${this.labelUrl}`
    }
}

/*
Version Logs are currently stored as CSV files to maintain backwards compatibility
with the old Wayfinding system. Future versions of this application will instead
store version log data as JSON or some other format, as the current CSV format
leaves empty cells when one version has more manifests than others.
*/
class VersionLog {
    constructor(){
        this.versionNameToManifests = new Map();
    }

    addVersion(versionName, manifestUrl){
        versionName = versionName.toUpperCase();
        if(!this.containsVersion(versionName)){
            this.versionNameToManifests.set(versionName, []);
        }
        this.versionNameToManifests.get(versionName).push(manifestUrl);
    }

    containsVersion(versionName){
        return this.versionNameToManifests.has(versionName.toUpperCase());
    }

    getManifestsForVersion(versionName){
        versionName = versionName.toUpperCase();
        if(!this.containsVersion(versionName)){
            throw new Error(`Version log does not contain version ${versionName}.`);
        }
        return this.versionNameToManifests.get(versionName);
    }
}

async function downloadFile(url){
    let req = await fetch(url);
    let text = await req.text();
    return text;
}

// CORS issues
async function downloadGoogleDriveFile(fileId){
    return downloadFile(`https://drive.google.com/uc?export=download&id=${fileId}`);
}

async function downloadManifest(url){
    let man = new Manifest();
    let text = await downloadFile(url);
    console.log(text);
    let json = JSON.parse(text.trim());
    man.setMapUrl(json["image"]);
    man.setVertexUrl(json["vertices"]);
    man.setEdgeUrl(json["edges"]);
    man.setLabelUrl(json["labels"]);

    console.log(man.toString());
    return man;
}

async function downloadVersionLog(url){
    let rawText = await downloadFile(url);
    let vlog = new VersionLog();
    let csv = parseResponseText(rawText);

    const headers = csv.getHeaders();
    const numCols = headers.length;
    const body = csv.getBody();
    const numBodyRows = body.length;
    let cellData;

    for(let colNum = 0; colNum < numCols; colNum++){
        for(let bodyRowNum = 0; bodyRowNum < numBodyRows && cellData !== ""; bodyRowNum++){
            cellData = body[bodyRowNum][colNum];
            if(cellData !== ""){
                vlog.addVersion(headers[colNum], cellData);
            }
        }
    }
    return vlog;
}

async function getLatestManifest(versionLogUrl, version){
    // first, download the given version log.
    let versionLog = await downloadVersionLog(versionLogUrl);

    // check if it has the given version
    let isValidVersion = versionLog.containsVersion(version);
    let manifestList = (isValidVersion) ? versionLog.getManifestsForVersion(version) : versionLog.getDefaultManifests();
    // the manifest list is stored as a stack (latest exports at the bottom)
    let currUrl = null;
    while(manifestList.length !== 0 && currUrl === null){
        currUrl = manifestList.pop();
        // check if is valid, if not, set to null
        if(currUrl === ""){
            currUrl = null;
        }
    }

    // by now, we should have a valid manifest URL.
    let ret = await downloadManifest(currUrl);
    return ret;
}

async function getLatestGraph(versionLogUrl, version, graph){
    let latestManifest = await getLatestManifest(versionLogUrl, version);
    let vertexText = await downloadFile(latestManifest.getVertexUrl());
    let edgeText = await downloadFile(latestManifest.getEdgeUrl());
    let labelText = await downloadFile(latestManifest.getLabelUrl());
    console.log(labelText);
    let vertexFile = parseResponseText(vertexText);
    let edgeFile = parseResponseText(edgeText, false); // has no headers
    let labelFile = parseResponseText(labelText);
    console.log(labelFile.toString());
    graph.parseVertexCsv(vertexFile);
    graph.parseEdgeCsv(edgeFile);
    graph.parseLabelCsv(labelFile);
    graph.setImage(latestManifest.getMapUrl());
}

export {
    downloadFile,
    getLatestGraph
};
