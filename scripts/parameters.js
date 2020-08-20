import {
    DEFAULT_VERSION
} from "./importData.js";

/*
This file handles the extraction of parameters from the URL.
Parameters are passed to the URL as follows:
URL?key=value&key2=value2&key3=value3 etc.
*/

class Parameters {
    constructor(){
        // create default parameters.
        this.start = 0;
        this.end = 1; // assume at least 2 vertices.
        this.version = DEFAULT_VERSION;
        this.debug = false;

        const url = window.location.href;
        // check if parameters were passed.
        let qIdx = url.indexOf("?");
        if(qIdx !== -1){
            let args = url.substring(qIdx + 1); // everything after the '?'
            let pairs = args.split("&").map((str)=>str.split("="));
            let key;
            let val;
            pairs.forEach((pair)=>{
                //    fix special characters in the URL.
                key = decodeURIComponent(pair[0]).toUpperCase();
                val = decodeURIComponent(pair[1]).toUpperCase();
                if(key.includes("START")){
                    this.start = val;
                }
                if(key.includes("END")){
                    this.end = val;
                }
                if(key.includes("VERSION") || key.includes("MODE")){
                    this.version = val;
                }
                if(key.includes("DEBUG")){
                    this.debug = (val == "TRUE");
                }
            });
        }
    }

    toString(){
        return `Parameters: start=${this.start}, end=${this.end}, version=${this.version}, debug=${this.debug}`;
    }
}

let cachedParams = null;

function getParams(){
    if(cachedParams == null){
        cachedParams = new Parameters();
    }
    return cachedParams;
}

export {
    getParams
};
