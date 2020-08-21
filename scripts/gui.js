/*

*/

class ElementInterface {
    constructor(id){
        if(!id.startsWith("#")){
            id = "#" + id;
        }
        this.elementSel = $(id);
        this.element = this.elementSel[0];
    }
}

class InputBox extends ElementInterface {
    constructor(id){
        super(id);
    }

    addOptions(options){
        options.forEach((option)=>{
            this.elementSel.append(`<option value="${option}">${option}</option>`);

        });
    }

    getSelectedOption(){
        return this.elementSel.val();
    }
}

class CalcPathForm extends ElementInterface {
    constructor(formId, startBoxId, endBoxId){
        super(formId);
        this.startBox = new InputBox(startBoxId);
        this.endBox = new InputBox(endBoxId);
        this.onSubmit = (start, end)=>{
            console.log("Default onSubmit for CalcPathForm: ", start, end);
        };
        this.elementSel.submit((e)=>{
            try {
                this.onSubmit(this.startBox.getSelectedOption(), this.endBox.getSelectedOption());
            } catch(err){
                console.error(err);
            }
            e.preventDefault();
        });
    }

    addOptions(options){
        this.startBox.addOptions(options);
        this.endBox.addOptions(options);
    }

    /*
    Sets the function which should be fired when the user clicks the "Find Path" button.
    func should be a biconsumer, accepting two strings: the labels selected by the user
    via this' start- and end-box respectively.
    */
    setOnSubmit(func){
        this.onSubmit = func;
    }
}

const VERTEX_COLOR = "blue";

// may still need the vertex space to canvas space conversion

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
class Canvas extends ElementInterface {
    constructor(id){
        super(id);

        this.draw = this.elementSel.get(0).getContext("2d");

        //https://medium.com/wdstack/fixing-html5-2d-canvas-blur-8ebe27db07da
        // fix blurry canvas
        let dpi = window.devicePixelRatio;
        this.element.setAttribute("width", dpi * getComputedStyle(this.element).getPropertyValue("width").slice(0, -2));
        this.element.setAttribute("height", dpi * getComputedStyle(this.element).getPropertyValue("height").slice(0, -2));

        this.draw.fillStyle = VERTEX_COLOR;
        this.draw.strokeStyle = "black";
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
        this.element.addEventListener("mousedown", (e)=>{
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
        this.element.addEventListener("mousemove", (e)=>{
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
        this.element.addEventListener("mouseup", (e)=>{
            this.clickStart = [null, null];
            this.panX += this.dragDeltaX;
            this.panY += this.dragDeltaY;
            this.dragDeltaX = 0;
            this.dragDeltaY = 0;
            this.repaint();
        });

        // handle zooming
        this.element.addEventListener("wheel", (e)=>{
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

    tx(vertexSpaceX){
        let ret = vertexSpaceX;
        if(this.renderedGraph != null){
            let percRight = parseFloat(vertexSpaceX - this.renderedGraph.getVertexById(-1).x) / (this.renderedGraph.getVertexById(-2).x - this.renderedGraph.getVertexById(-1).x);
            ret = percRight * this.renderedGraph.image.width;
        }
        return ret;
    }

    ty(vertexSpaceY){
        let ret = vertexSpaceY;
        if(this.renderedGraph != null){
            let percDown = parseFloat(vertexSpaceY - this.renderedGraph.getVertexById(-1).y) / (this.renderedGraph.getVertexById(-2).y - this.renderedGraph.getVertexById(-1).y);
            ret = percDown * this.renderedGraph.image.height;
        }
        return ret;
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
        this.draw.translate(0.5 + parseInt(this.panX + this.dragDeltaX), 0.5 + parseInt(this.panY + this.dragDeltaY)); // 0.5 fixes blurring issues
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
    Input is in vertex-space, so these methods
    automatically transform the coordinates to
    image space, assuming vertex -1 marks the
    upper-left corner of the image, and -2 marks
    the lower-right.
    */

    drawImage(img){
        this.draw.drawImage(img, 0, 0);
    }

    rect(x, y, w, h){
        this.draw.fillRect(this.tx(x), this.ty(y), w, h);
    }

    line(x1, y1, x2, y2){
        this.draw.beginPath();
        this.draw.moveTo(this.tx(x1), this.ty(y1));
        this.draw.lineTo(this.tx(x2), this.ty(y2));
        this.draw.stroke();
    }

    text(msg, x, y){
        this.draw.strokeText(msg, this.tx(x), this.ty(y));
    }
}


export {
    CalcPathForm,
    Canvas
};
