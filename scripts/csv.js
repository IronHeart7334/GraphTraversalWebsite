/*
This file is used to convert fetch response text to CsvFile objects.
*/

//                     0 or more \r followed by an \n
const NEWLINE_REGEX = /\r?\n|\r/;
//                          or just \r

const LONGEST_STRING_LENGTH_IN_ARRAY = (longestSoFar, currentStr)=>{
    return (currentStr.length < longestSoFar) ? longestSoFar : currentStr.length;
};
const LONGEST_STRING_LENGTH_IN_ARRAY_OF_ARRAYS = (longestSoFar, currentRow)=>{
    let currRowLongest = currentRow.reduce(LONGEST_STRING_LENGTH_IN_ARRAY, 0);
    return (currRowLongest < longestSoFar) ? longestSoFar : currRowLongest;
};

function padJoinArray(array, len){
    //                                  adds spaces to the end until it is at least len characters long.
    return array.map((element)=>element.padEnd(len, ' ')).join(", ");
}

// TODO: add cell / header sanitizer
class CsvFile {
    constructor(headers=[]){
        this.headerRow = [];
        this.headerToCol = new Map();
        this.body = [];

        headers.map((header)=>{
            return header.toUpperCase();
        }).forEach((header)=>{
            this.addHeader(header);
        });
    }

    addHeader(header){
        header = header.toUpperCase().trim();
        if(!this.hasHeader(header)){
            this.headerToCol.set(header, this.headerRow.length);
            this.headerRow.push(header);
        }
    }

    getHeaders(){
        return this.headerRow;
    }

    hasHeader(header){
        return this.headerToCol.has(header.toUpperCase());
    }

    addRow(contents){
        if(contents.length !== this.headerRow.length){
            throw new Error(`Row ${contents} does not contain the right number of columns. It should contain exactly ${this.headerRow.length}.`);
        }
        this.body.push(contents.map((cell)=>cell.toString().trim()));
    }

    getBody(){
        return this.body;
    }

    toString(){
        let longestHeader = this.headerRow.reduce(LONGEST_STRING_LENGTH_IN_ARRAY, 0);
        let longestCell = this.body.reduce(LONGEST_STRING_LENGTH_IN_ARRAY_OF_ARRAYS, 0);
        let cellSize = (longestHeader < longestCell) ? longestCell : longestHeader;
        let ret = "";
        // build headers
        ret += padJoinArray(this.headerRow, cellSize);
        ret += this.body.map((row)=>'\n' + padJoinArray(row, cellSize)).join('');

        return ret;
    }
}

/*
responseText: string
returns CsvFile
*/
function parseResponseText(responseText){
    let ret = new CsvFile();

    let allLines = responseText.trim().split(NEWLINE_REGEX);
    let headers = allLines[0].trim().split(",");
    let body = allLines.slice(1).map((line)=>line.trim().split(",")); // everything at index 1 and up
    headers.forEach((header)=>ret.addHeader(header));
    body.forEach((array)=>ret.addRow(array));

    return ret;
}

export {
    parseResponseText
};
