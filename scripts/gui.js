
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
        //this.elementSel
        /*
        $(window).scroll((scrollEvent)=>{
            console.log(scrollEvent);
            this.draw.scale(0.1, 0.1);
        }); // for some reason this isn't firing when applied to elementSel, but it works manually
        */
        this.spinFactor = 0;
    }

    setImg(path){
        //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
        this.img = new Image();
        this.img.onload=this.repaint.bind(this);
        this.img.src=path;
    }

    spin(){
        this.draw.setTransform(Math.cos(this.spinFactor), Math.sin(this.spinFactor), -Math.sin(this.spinFactor), Math.cos(this.spinFactor), 0, 0);
        this.spinFactor+=1;
        this.repaint();
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

let canvas = new Canvas("map");
canvas.setImg("./data/5f3.jpg");
let i = setInterval(()=>{
    console.log(canvas);
    canvas.spin();
}, 10);
setTimeout(()=>clearInterval(i), 360 * 10);

export default linkGui;
