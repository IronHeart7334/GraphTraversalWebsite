
class InputBox {

}

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
class Canvas {
    constructor(id){
        if(!id.startsWith("#")){
            id = "#" + id;
        }
        this.elementSel = $(id);
        this.draw = this.elementSel.get(0).getContext("2d");
    }

    setImg(path){
        //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
        this.img = new Image();
        this.img.onload=this.repaint.bind(this);
        this.img.src=path;
    }

    repaint(){
        if(!!this.img){
            this.draw.scale(0.25, 0.25);
            this.draw.drawImage(this.img, 0, 0);
        }
    }
}

function linkGui(options={}){

}

new Canvas("map").setImg("./data/5f3.jpg");

export default linkGui;
