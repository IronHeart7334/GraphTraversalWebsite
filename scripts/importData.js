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
}

class VersionLog {
    constructor(){
        this.versionNameToManifests = new Map();
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

async function downloadVersionLog(url){
    let rawText = await downloadFile(url);
    let vlog = new VersionLog();
    let csv = parseResponseText(rawText);
    
    return vlog;
}

export {
    downloadFile,
    downloadGoogleDriveFile,
    downloadVersionLog
};
