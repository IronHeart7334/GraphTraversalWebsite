/*
This file is used to convert fetch response text
to CsvFile objects for easier parsing.
*/

//                     0 or more \r followed by an \n
const NEWLINE_REGEX = /\r?\n|\r/;
//                          or just \r

/*
These three functions are used for outputting CSV in a nice format.
They are rather complicated, so I left them as globals to maximize clarity,
rather than embedding them in the CsvFile::toString method.
*/
const LONGEST_STRING_LENGTH_IN_ARRAY = (longestSoFar, currentStr)=>{
    return (currentStr.length < longestSoFar) ? longestSoFar : currentStr.length;
};
const LONGEST_STRING_LENGTH_IN_ARRAY_OF_ARRAYS = (longestSoFar, currentRow)=>{
    let currRowLongest = currentRow.reduce(LONGEST_STRING_LENGTH_IN_ARRAY, 0);
    return (currRowLongest < longestSoFar) ? longestSoFar : currRowLongest;
};
const PAD_JOIN_ARRAY = (array, len)=> {
    //                                  adds spaces to the end until it is at least len characters long.
    return array.map((element)=>element.padEnd(len, ' ')).join(", ");
};



/*
These functions are used for
formatting CSV data into a
more usable format.
*/

// does this need to handle escaped quotes or commas?
const CLEAN_CELL = (cell)=>{
    let ret = cell.toString().trim();
    // remove quotes surrounding the value
    while((ret.startsWith('"') && ret.endsWith('"')) || (ret.startsWith("'") && ret.endsWith("'"))){
        ret = ret.substring(1, ret.length - 2);
    }
    return ret;
};
const CLEAN_HEADER = (header)=>{
    return CLEAN_CELL(header).toUpperCase();
};



/*
The CsvFile class provides methods for interacting
with the data parsed by toCsvFile.
*/
class CsvFile {
    constructor(headers=[]){
        this.headerRow = [];
        this.headerToCol = new Map();
        this.body = [];

        headers.forEach((header)=>{
            this.addHeader(header);
        });
    }

    addHeader(header){
        header = CLEAN_HEADER(header);
        if(!this.hasHeader(header)){
            this.headerToCol.set(header, this.headerRow.length);
            this.headerRow.push(header);
        }
    }

    /*
    Returns whether or not any headers have
    been set for this file. Some files, such
    as vertex csv files will require headers,
    whereas edge csv files may not.
    */
    containsHeaders(){
        return this.headerRow.length !== 0;
    }

    /*
    This method is currently only
    used by importData.js. This
    method can be removed once I
    reformat the version log from
    CSV to JSON.
    */
    getHeaders(){
        return this.headerRow;
    }

    hasHeader(header){
        return this.headerToCol.has(CLEAN_HEADER(header));
    }

    /*
    Returns the index of the given header in this file's headers.
    */
    getColIdx(header){
        return this.headerToCol.get(CLEAN_HEADER(header));
    }

    /*
    Adds the given row of data to this csv file. Note that if this has any headers,
    the length of the contents must match the number of headers.
    */
    addRow(contents){
        /*
        This does not work for version logs, so I'll un-comment this once that
        is stored as JSON instead of CSV
         
        if(this.containsHeaders() || contents.length !== this.headerRow.length){
            throw new Error(`Row ${contents} does not contain the right number of columns. It should contain exactly ${this.headerRow.length}.`);
        }*/
        this.body.push(contents.map((cell)=>CLEAN_CELL(cell)));
    }

    /*
    Returns the body contents of this csv file.
    The body is stored as an array of arrays, with
    getBody()[i] giving the i'th non-header row
    of the csv text from whence this came,
    and getBody()[i][j] returning the j'th column's
    cell of that row. Note that this means you needn't
    skip the first row, as it will not contain headers.

    May replace this with a body iterator later.
    */
    getBody(){
        return this.body;
    }

    /*
    Returns a pretty-printed representation of this csv file, with each cell and header
    taking up equal space. Note that this data is not formatted for saving to a file.
    */
    toString(){
        let longestHeader = this.headerRow.reduce(LONGEST_STRING_LENGTH_IN_ARRAY, 0);
        let longestCell = this.body.reduce(LONGEST_STRING_LENGTH_IN_ARRAY_OF_ARRAYS, 0);
        let cellSize = (longestHeader < longestCell) ? longestCell : longestHeader;
        let ret = "";
        // build headers
        ret += PAD_JOIN_ARRAY(this.headerRow, cellSize);
        ret += this.body.map((row)=>'\n' + PAD_JOIN_ARRAY(row, cellSize)).join('');

        return ret;
    }
}

/*
Converts the given string to a CsvFile object.

If hasHeaders is set to true, this will use the first
row of text as the headers of the returned CsvFile.
Otherwise, every row is considered body data.
*/
function toCsvFile(responseText, hasHeaders=true){
    let ret = new CsvFile();

    let allLines = responseText.trim().split(NEWLINE_REGEX);
    if(hasHeaders){
        //                     removes first row and returns it.
        let headers = allLines.shift().trim().split(",");
        headers.forEach((header)=>ret.addHeader(header));
    }
    let body = allLines.map((line)=>line.trim().split(","));
    body.forEach((array)=>ret.addRow(array));

    return ret;
}

export {
    toCsvFile
};
