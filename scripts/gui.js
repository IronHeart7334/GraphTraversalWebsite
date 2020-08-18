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
        //this.elementSel
        /*
        $(window).scroll((scrollEvent)=>{
            console.log(scrollEvent);
            this.draw.scale(0.1, 0.1);
        }); // for some reason this isn't firing when applied to elementSel, but it works manually
        */
        this.spinFactor = 0;
    }

    setGraph(graph){
        this.renderedGraph = graph;
    }
    setPath(path){
        this.renderedPath = path;
    }

    /*
    setImg(path){
        //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
        this.img = new Image();
        this.img.onload=this.repaint.bind(this);
        this.img.src=path;
    }
    */
    /*
    spin(){
        this.draw.setTransform(Math.cos(this.spinFactor), Math.sin(this.spinFactor), -Math.sin(this.spinFactor), Math.cos(this.spinFactor), 0, 0);
        this.spinFactor+=1;
        this.repaint();
    }
    */

    repaint(){
        this.draw.translate(0.5, 0.5); // fixes blurring issues
        if(this.renderedGraph != null){
            this.renderedGraph.draw(this);
        }
        if(this.renderedPath != null){
            this.renderedPath.draw(this);
        }
        /*
        if(!!this.img){
            this.draw.scale(0.25, 0.25);
            this.draw.drawImage(this.img, 0, 0);
        }
        */
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
/*
let canvas = new Canvas("map");
canvas.setImg("./data/5f3.jpg");
let i = setInterval(()=>{
    console.log(canvas);
    canvas.spin();
}, 10);
setTimeout(()=>clearInterval(i), 360 * 10);
*/
export {
    Canvas
};
