/*
This file is used to convert fetch response text to CsvFile objects.
*/

class CsvFile {
    constructor(headers){
        this.headerRow = [];
        this.headerToCol = new Map();
        this.body = [];

        headers.map((header)=>{
            return header.toUpperCase();
        }).forEach((header)=>{
            if(!this.headerToCol.has(header)){
                this.headerToCol.set(header, this.headerRow.length);
                this.headerRow.push(header);
            }
        });
    }

    getHeaders(){
        return this.headerRow;
    }

    getBody(){
        return this.body;
    }
}

/*
responseText: string
returns CsvFile
*/
function parseResponseText(responseText){
    throw "not done with csv.js!";
}
