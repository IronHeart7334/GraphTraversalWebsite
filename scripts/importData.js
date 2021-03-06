import {
    toCsvFile
} from "./csv.js";
import {
    getParams
} from "./parameters.js";



const DEFAULT_VERSION = "default";


async function downloadFile(url){
    // https://stackoverflow.com/questions/29246444/fetch-how-do-you-make-a-non-cached-request
    let headers = new Headers();
    headers.append("pragma", "no-cache");
    headers.append("cache-control", "no-cache");
    let req = await fetch(new Request(url), {
        method: "GET",
        headers: headers
    });
    let text = await req.text();
    return text;
}

// CORS issues
async function downloadGoogleDriveFile(fileId){
    return downloadFile(`https://drive.google.com/uc?export=download&id=${fileId}`);
}


/*
A manifest details which files
belong together to form a graph.
A manifest is stored as a JSON file
with the following attributes:
- image
- vertices
- edges
- labels
Each containing a URL to the appropriate
resource.
*/
class Manifest {
    constructor(){
        this.mapUrl = null;
        this.vertexUrl = null;
        this.edgeUrl = null;
        this.labelUrl = null;
    }

    toString(){
        return `Manifest:
            Map Image : ${this.mapUrl}
            Vertices : ${this.vertexUrl}
            Edges : ${this.edgeUrl}
            Labels : ${this.labelUrl}`
    }
}
async function downloadManifest(url){
    let man = new Manifest();
    let text = await downloadFile(url);

    let json = JSON.parse(text.trim());
    man.mapUrl = json["image"];
    man.vertexUrl = json["vertices"];
    man.edgeUrl = json["edges"];
    man.labelUrl = json["labels"];

    if(getParams().debug){
        console.log("Downloaded manifest: " + man.toString());
    }
    return man;
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

    getDefaultManifests(){
        return this.getManifestsForVersion(DEFAULT_VERSION);
    }
}
async function downloadVersionLog(url){
    let rawText = await downloadFile(url);
    let vlog = new VersionLog();
    let csv = toCsvFile(rawText);

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
    let vertexText = await downloadFile(latestManifest.vertexUrl);
    let edgeText = await downloadFile(latestManifest.edgeUrl);
    let labelText = await downloadFile(latestManifest.labelUrl);
    let vertexFile = toCsvFile(vertexText);
    let edgeFile = toCsvFile(edgeText, false); // has no headers
    let labelFile = toCsvFile(labelText);
    graph.parseVertexCsv(vertexFile);
    graph.parseEdgeCsv(edgeFile);
    graph.parseLabelCsv(labelFile);
    graph.setImage(latestManifest.mapUrl);
}


export {
    downloadFile,
    getLatestGraph,
    DEFAULT_VERSION
};
