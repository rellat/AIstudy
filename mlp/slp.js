var screen_size;
var in1rbtn, in2rbtn, w1sl, w2sl;
var neuronOutput = 0;

function setup() {
    screen_size = [800, 180];
    createCanvas(screen_size[0], screen_size[1]);
    background(255);
    ellipseMode(CORNER);
    strokeWeight(4);
    in1rbtn = new RadioButton({x:20,y:20,width:100,height:50,labels:["0","1"]});
    in2rbtn = new RadioButton({x:20,y:110,width:100,height:50,labels:["0","1"]});
    w1sl = new Slider({x:130,y:20,width:120,height:50,value:0});
    w2sl = new Slider({x:130,y:110,width:120,height:50,value:0});
}

function draw() {
    background(255);    
    in1rbtn.draw();
    in2rbtn.draw();
    w1sl.draw();
    w2sl.draw();
    stroke(40);
    line(260, 45, 310, 90);
    line(260, 135, 310, 90);
    noStroke(); fill(100);
    ellipse(310, 40, 100, 100);
    fill(40);
    ellipse(330, 80, 10, 10);
    ellipse(380, 80, 10, 10);
    stroke(40);
    noFill();
    neuronOutput = w1sl.value * in1rbtn.selected + w2sl.value * in2rbtn.selected + 1;
    var happiness = 105 + neuronOutput * 15
    bezier(330, 105, 340, happiness, 380, happiness, 390, 105);
    line(410, 90, 440, 90);
    noStroke(); fill(40); textSize(19); textAlign(LEFT);
    text("Activation", 450,70);
    text("Function: ", 450,90);
    textAlign(RIGHT); text("none ", 540,110);
    stroke(40);
    line(550, 90, 580, 90);
    noStroke(); fill(40); textSize(19); textAlign(LEFT);
    text("Output: "+neuronOutput, 590,95);
}

function mousePressed() {
    in1rbtn.handleMouseClick();
    in2rbtn.handleMouseClick();
    w1sl.handleMouseClick();
    w2sl.handleMouseClick();
}
function mouseDragged() {
    w1sl.handleMouseClick();
    w2sl.handleMouseClick();
}

// -------------------------------------------------
// UI interfaces
/*
var btn1 = new Button({
    x: 100,y: 100, label: "Please click!",
    onClick: function() {
        text("You made the right choice!", this.x, this.y+this.height);
    }
});
btn1.draw();
btn1.handleMouseClick();
*/
// -------------------------------------------------
var Button = function (config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 150;
    this.height = config.height || 50;
    this.label = config.label || "Click";
    this.onClick = config.onClick || function () {};
};

Button.prototype.draw = function () {
    noStroke();
    fill(0, 234, 255);
    rect(this.x, this.y, this.width, this.height);
    fill(0, 0, 0);
    textSize(19);
    textAlign(CENTER);
    text(this.label, this.x + 10, this.y + this.height / 4);
};

Button.prototype.isMouseInside = function () {
    return mouseX > this.x && mouseX < (this.x + this.width) && mouseY > this.y && mouseY < (this.y + this.height);
};

Button.prototype.handleMouseClick = function () {
    if (this.isMouseInside()) {
        this.onClick();
    }
};

var Slider = function (config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 150;
    this.height = config.height || 50;
    this.value = config.value || 0;
    this.onClick = config.onClick || function () {console.log('slider: '+ this.value)};
};

Slider.prototype.draw = function () {
    noStroke();
    fill(80, 80, 80);
    rect(this.x, this.y + round(this.height / 2), this.width, 1);
    fill(40, 40, 40);
    ellipse(this.x + round((this.width-this.height) * (this.value + 1) / 2), this.y, this.height,this.height);    
};

Slider.prototype.isMouseInside = function () {
    return mouseX > this.x && mouseX < (this.x + this.width) && mouseY > this.y && mouseY < (this.y + this.height);
};

Slider.prototype.handleMouseClick = function () {
    if (this.isMouseInside()) {
        var cpos = mouseX - this.x;
        this.value = (cpos - (this.width / 2)) / (this.width / 2)
        this.onClick();
    }
};

var RadioButton = function (config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 150;
    this.height = config.height || 50;
    this.selected = config.selected || 0;
    this.labels = config.labels || ["0","1"];
    this.onClick = config.onClick || function () {console.log('slider: '+ this.selected)};
};

RadioButton.prototype.draw = function () {
    noStroke();
    for (var index = 0; index < this.labels.length; index++) {
        var label = this.labels[index];
        fill(180);
        if (index === this.selected) fill(70,70,120);
        var xsize = this.width / this.labels.length;
        rect(this.x + index*xsize, this.y, xsize, this.height);
        fill(100);
        if (index === this.selected) fill(200);
        textSize(19);
        textAlign(CENTER);
        text(label, this.x + index*xsize + 23, this.y + this.height / 2 + 6);
    }
};

RadioButton.prototype.isMouseInside = function () {
    return mouseX > this.x && mouseX < (this.x + this.width) && mouseY > this.y && mouseY < (this.y + this.height);
};

RadioButton.prototype.handleMouseClick = function () {
    if (this.isMouseInside()) {
        this.selected = floor((mouseX - this.x)/(this.width/this.labels.length));
        this.onClick();
    }
};