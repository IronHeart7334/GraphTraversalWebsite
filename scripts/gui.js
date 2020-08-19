/*

*/

class InputBox {
    constructor(id){
        if(!id.startsWith("#")){
            id = "#" + id;
        }
        this.elementSel = $(id);
    }

    addOptions(options){
        console.log(this.elementSel);
        options.forEach((option)=>{
            this.elementSel.append(`<option value="${option}">${option}</option>`);

        });
    }
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

        // (panX, panY) is the new origin of the canvas
        this.panX = 0;
        this.panY = 0;

        // offsets created by clicking and dragging the mouse
        this.dragDeltaX = 0;
        this.dragDeltaY = 0;

        this.scaleFactor = 1.0;

        // the coordinates of where the user clicks the mouse
        this.clickStart = [null, null];

        // listen for beginning to drag
        this.elementSel[0].addEventListener("mousedown", (e)=>{
            //console.log("Mousedown", e);
            this.clickStart = this.getMouseCoordsOnCanvas(e);
            //console.log(this.clickStart);
        });

        /*
        When the user clicks and drags, move the canvas based on
        the offset between where they initially click, and where
        they drag their mouse to. Note that this method should not
        alter panX or panY, as that distrupts calculations.
        */
        this.elementSel[0].addEventListener("mousemove", (e)=>{
            if(e.buttons === 1){ // left mouse button is held.
                //console.log(e);
                let newCoords = this.getMouseCoordsOnCanvas(e);
                this.dragDeltaX = newCoords[0] - this.clickStart[0];
                this.dragDeltaY = newCoords[1] - this.clickStart[1];
                this.repaint();
            }
        });

        /*
        When the user releases the mouse, they have chosen their
        deltas they want to offset the canvas by. Increase the pan
        coordinates by these drag deltas, and reset the drag information.
        */
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
        if(this.scaleFactor < 0.2){
            this.scaleFactor = 0.2;
        } else if(this.scaleFactor > 5){
            this.scaleFactor = 5;
        }
        if(this.panX > 0){
            this.panX = 0;
        } else if(this.graph != null){
            let bounds = this.graph.getBounds();
            if(this.panX < bounds[0]){
                this.panX = bounds[0];
            }
        }

        if(this.panY > 0){
            this.panY = 0;
        } else if(this.graph != null){
            let bounds = this.graph.getBounds();
            if(this.panY < bounds[1]){
                this.panY = bounds[1];
            }
        }

        this.draw.setTransform(1, 0, 0, 1, 0, 0); // reset to identity matrix
        this.draw.clearRect(0, 0, this.elementSel[0].scrollWidth, this.elementSel[0].scrollHeight);
        this.draw.translate(0.5 + this.panX + this.dragDeltaX, 0.5 + this.panY + this.dragDeltaY); // 0.5 fixes blurring issues
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
    InputBox,
    Canvas
};
