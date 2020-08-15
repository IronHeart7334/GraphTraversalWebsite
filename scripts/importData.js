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

    addVersion(versionName, manifestUrl){
        versionName = versionName.toUpperCase();
        if(!this.versionNameToManifests.has(versionName)){
            this.versionNameToManifests.set(versionName, []);
        }
        this.versionNameToManifests.get(versionName).push(manifestUrl);
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
    console.log(csv);
    return vlog;
}

export {
    downloadFile,
    downloadGoogleDriveFile,
    downloadVersionLog
};
