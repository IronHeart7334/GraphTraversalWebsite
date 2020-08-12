
async function downloadFile(url){
    let req = await fetch(url);
    let text = await req.text();
    return text;
}

// CORS issues
async function downloadGoogleDriveFile(fileId){
    return downloadFile(`https://drive.google.com/uc?export=download&id=${fileId}`);
}

export {
    downloadFile,
    downloadGoogleDriveFile
};
