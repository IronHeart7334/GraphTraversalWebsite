import {
    downloadFile,
    downloadGoogleDriveFile
} from "./importData.js";

downloadFile("../data/testCoords.csv").then((t)=>console.log(t));
downloadGoogleDriveFile("1Q99ku0cMctu3kTN9OerjFsM9Aj-nW6H5").then((t)=>console.log(t));
