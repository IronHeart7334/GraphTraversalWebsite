/*

*/

class InputBox {

}

const VERTEX_AND_EDGE_COLOR = "blue";

// may still need the vertex space to canvas space conversion

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
class Canvas {
    constructor(id){
        if(!id.startsWith("#")){
            id = "#" + id;
        }
        this.elementSel = $(id);
        this.draw = this.elementSel.get(0).getContext("2d");
        this.draw.fillStyle = VERTEX_AND_EDGE_COLOR;
        this.draw.strokeStyle = VERTEX_AND_EDGE_COLOR;
        this.renderedGraph = null;
        this.renderedPath = null;

        this.panX = 0;
        this.panY = 0;
        this.dragDeltaX = 0;
        this.dragDeltaY = 0;
        this.scaleFactor = 1.0;

        this.clickStart = [null, null];
        this.elementSel[0].addEventListener("mousedown", (e)=>{
            //console.log("Mousedown", e);
            this.clickStart = this.getMouseCoordsOnCanvas(e);
            //console.log(this.clickStart);
        });
        this.elementSel[0].addEventListener("mousemove", (e)=>{
            if(e.buttons === 1){ // left mouse button is held.
                //console.log(e);
                let newCoords = this.getMouseCoordsOnCanvas(e);
                this.dragDeltaX = newCoords[0] - this.clickStart[0];
                this.dragDeltaY = newCoords[1] - this.clickStart[1];
                this.repaint();
            }
        });
        this.elementSel[0].addEventListener("mouseup", (e)=>{
            this.clickStart = [null, null];
            this.panX += this.dragDeltaX;
            this.panY += this.dragDeltaY;
            this.dragDeltaX = 0;
            this.dragDeltaY = 0;
            this.repaint();
        });

        // handle zooming
        this.elementSel[0].addEventListener("wheel", (e)=>{
            //console.log(e);
            if(e.shiftKey){
                // https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onwheel
                this.scaleFactor -= parseFloat(e.deltaY) / 100;
                this.repaint();
            }
        });
    }

    getMouseCoordsOnCanvas(mouseEvent){
        //https://stackoverflow.com/questions/3234256/find-mouse-position-relative-to-element/42111623#42111623
        let box = mouseEvent.target.getBoundingClientRect();
        return [mouseEvent.clientX - box.left - this.panX, mouseEvent.clientY - box.top - this.panY];
    }

    setGraph(graph){
        this.renderedGraph = graph;
    }
    setPath(path){
        this.renderedPath = path;
    }

    repaint(){
        this.draw.setTransform(1, 0, 0, 1, 0, 0); // reset to identity matrix
        this.draw.clearRect(0, 0, this.elementSel[0].scrollWidth, this.elementSel[0].scrollHeight);
        this.draw.translate(0.5 + this.panX + this.dragDeltaX, 0.5 + this.panY + this.dragDeltaY); // fixes blurring issues
        this.draw.scale(this.scaleFactor, this.scaleFactor);
        if(this.renderedGraph != null){
            this.renderedGraph.draw(this);
        }
        if(this.renderedPath != null){
            this.renderedPath.draw(this);
        }
    }


    /*
    Drawing methods
    These should be invoked by graph elements.
    Input is in vertex-space, so I may need to
    apply transformations to the parameters
    */

    drawImage(img){
        this.draw.drawImage(img, 0, 0);
    }

    rect(x, y, w, h){
        this.draw.fillRect(x, y, w, h);
    }

    line(x1, y1, x2, y2){
        this.draw.beginPath();
        this.draw.moveTo(x1, y1);
        this.draw.lineTo(x2, y2);
        this.draw.stroke();
    }
}

function linkGui(options={}){

}

export {
    Canvas
};
