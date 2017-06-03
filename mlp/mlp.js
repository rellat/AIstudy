var screen_size;
var in1rbtn, in2rbtn;
var l1n1w1sl, l1n1w2sl, l1n2w1sl, l1n2w2sl, l2n1w1sl, l2n1w2sl;
var l1n1out, l1n2out, l2n1out;
var bias = 1;
var activate = function(val, method_name) {
    method_name = !method_name ? "identity" : method_name;
    switch (method_name) {
        case "sigmoid":
            return 1/(1+exp(-val));
        case "relu":
            return max(0, val);
        case "thresold":
            if (val > 0) return 1;
            else return -1;
        case "identity":
        default:
            return val;
    }
}

var xor = [[0,0,0,false],[1,0,1,false],[0,1,1,false],[1,1,0,false]];
var checkxor = function() {
    var clear = 0;
    for (var i = 0; i < xor.length; i++) {
        xor[i][3] = false;
        if(xor[i][2] === 1) {
            if(activate(activate(l1n1w1sl.value * xor[i][0] + l1n1w2sl.value * xor[i][1] + bias,"relu") *
            l2n1w1sl.value +
            activate(l1n2w1sl.value * xor[i][0] + l1n2w2sl.value * xor[i][1] + bias,"relu") *
            l2n1w2sl.value + bias,"relu")
            > 0) {
                xor[i][3] = true;
                clear++;
            }
        }else {
            if(activate(activate(l1n1w1sl.value * xor[i][0] + l1n1w2sl.value * xor[i][1] + bias,"relu") *
            l2n1w1sl.value +
            activate(l1n2w1sl.value * xor[i][0] + l1n2w2sl.value * xor[i][1] + bias,"relu") *
            l2n1w2sl.value + bias,"relu")
            <= 0) {
                xor[i][3] = true;
                clear++;
            }
        }
    }
    if(clear >= 4) {
        console.log("clear XOR!! "+
        "\n l1n1w1sl: " + l1n1w1sl.value + 
        "\n l1n1w2sl: " + l1n1w2sl.value + 
        "\n l1n2w1sl: " + l1n2w1sl.value + 
        "\n l1n2w2sl: " + l1n2w2sl.value + 
        "\n l2n1w1sl: " + l2n1w1sl.value + 
        "\n l2n1w2sl: " + l2n1w2sl.value)
    }
}

function setup() {
    screen_size = [1250, 360];
    createCanvas(screen_size[0], screen_size[1]);
    background(255);
    ellipseMode(CORNER);
    strokeWeight(4);
    in1rbtn = new RadioButton({x:20,y:65,width:100,height:50,labels:["0","1"]});
    in2rbtn = new RadioButton({x:20,y:245,width:100,height:50,labels:["0","1"]});
    l1n1w1sl = new Slider({x:160,y:20,width:120,height:50,value:0,onClick: checkxor});
    l1n1w2sl = new Slider({x:160,y:110,width:120,height:50,value:0,onClick: checkxor});
    l1n2w1sl = new Slider({x:160,y:200,width:120,height:50,value:0,onClick: checkxor});
    l1n2w2sl = new Slider({x:160,y:290,width:120,height:50,value:0,onClick: checkxor});
    l2n1w1sl = new Slider({x:710,y:65,width:120,height:50,value:0,onClick: checkxor});
    l2n1w2sl = new Slider({x:710,y:245,width:120,height:50,value:0,onClick: checkxor});
    l1n1out = 0;
    l1n2out = 0;
    l2n1out = 0;
}

function draw() {
    background(255);
    stroke(40);
    line(120, 90, 150, 45);
    line(120, 90, 150, 225);
    line(120, 270, 150, 135);
    line(120, 270, 150, 315);
    line(290, 45, 340, 90);
    line(290, 135, 340, 90);
    // layer 1 neuron 1
    noStroke(); fill(225,225,40);
    ellipse(340, 40, 100, 100);
    fill(40);
    ellipse(360, 80, 10, 10);
    ellipse(410, 80, 10, 10);
    stroke(40);
    noFill();
    l1n1out = l1n1w1sl.value * in1rbtn.selected + l1n1w2sl.value * in2rbtn.selected + bias;
    var happiness = 105 + l1n1out * 15
    bezier(360, 105, 370, happiness, 410, happiness, 420, 105);
    line(440, 90, 470, 90);
    noStroke(); fill(40); textSize(19); textAlign(LEFT);
    text("Activation", 480,70);
    text("Function: ", 480,90);
    textAlign(RIGHT); text("relu", 570,110);
    l1n1out = activate(l1n1out,"relu")
    stroke(40);
    line(580, 90, 590, 90);
    noStroke(); fill(40); textSize(19); textAlign(LEFT);
    text("Output: " + round(l1n1out * 100) / 100, 600,95);
    // layer 1 neuron 2
    stroke(40);
    line(290, 225, 340, 270);
    line(290, 315, 340, 270);
    noStroke(); fill(225,225,40);
    ellipse(340, 220, 100, 100);
    fill(40);
    ellipse(360, 260, 10, 10);
    ellipse(410, 260, 10, 10);
    stroke(40);
    noFill();
    l1n2out = l1n2w1sl.value * in1rbtn.selected + l1n2w2sl.value * in2rbtn.selected + bias;
    var happiness2 = 285 + l1n2out * 15
    bezier(360, 285, 370, happiness2, 410, happiness2, 420, 285);
    line(440, 270, 470, 270);
    noStroke(); fill(40); textSize(19); textAlign(LEFT);
    text("Activation", 480,250);
    text("Function: ", 480,270);
    textAlign(RIGHT); text("relu", 570,290);
    l1n2out = activate(l1n2out,"relu")
    stroke(40);
    line(580, 270, 590, 270);
    noStroke(); fill(40); textSize(19); textAlign(LEFT);
    text("Output: " + round(l1n2out * 100) / 100, 600,275);

    // layer 2 neuron 1
    stroke(40);
    line(840, 90, 880, 180);
    line(840, 270, 880, 180);
    noStroke(); fill(225,225,40);
    ellipse(880, 130, 100, 100);
    fill(40);
    ellipse(900, 170, 10, 10);
    ellipse(950, 170, 10, 10);
    stroke(40);
    noFill();
    l2n1out = l2n1w1sl.value * l1n1out + l2n1w2sl.value * l1n2out + bias;
    var happiness3 = 195 + l2n1out * 15
    bezier(900, 195, 910, happiness3, 950, happiness3, 960, 195);
    line(980, 180, 1000, 180);
    noStroke(); fill(40); textSize(19); textAlign(LEFT);
    text("Activation", 1010,160);
    text("Function: ", 1010,180);
    textAlign(RIGHT); text("relu", 1100,200);
    l2n1out = activate(l2n1out,"relu")
    stroke(40);
    line(1110, 180, 1130, 180);
    noStroke(); fill(40); textSize(19); textAlign(LEFT);
    text("Output: " + round(l2n1out * 100) / 100, 1140,180);

    for (var i = 0; i < xor.length; i++) {
        if(xor[i][3] == true) fill(100,200,100);
        else fill(100);
        rect(360 + i*100,330,95,30)
        fill(0); textSize(14); textAlign(LEFT);
        text(""+xor[i][0]+" : "+xor[i][1]+" => "+xor[i][2], 370 + i*100,350);
    }
    textSize(18);
    text("bias = " + bias, 780,350);

    in1rbtn.draw();
    in2rbtn.draw();
    l1n1w1sl.draw();
    l1n1w2sl.draw();
    l1n2w1sl.draw();
    l1n2w2sl.draw();
    l2n1w1sl.draw();
    l2n1w2sl.draw();
}

function mousePressed() {
    in1rbtn.handleMouseClick();
    in2rbtn.handleMouseClick();
    l1n1w1sl.handleMouseClick();
    l1n1w2sl.handleMouseClick();
    l1n2w1sl.handleMouseClick();
    l1n2w2sl.handleMouseClick();
    l2n1w1sl.handleMouseClick();
    l2n1w2sl.handleMouseClick();
}
function mouseDragged() {
    l1n1w1sl.handleMouseClick();
    l1n1w2sl.handleMouseClick();
    l1n2w1sl.handleMouseClick();
    l1n2w2sl.handleMouseClick();
    l2n1w1sl.handleMouseClick();
    l2n1w2sl.handleMouseClick();
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
    this.limit = config.limit || 2;    
    this.onClick = config.onClick || function () {console.log('slider: '+ this.value)};
};

Slider.prototype.draw = function () {
    noStroke();
    fill(80, 80, 80);
    rect(this.x, this.y + round(this.height / 2), this.width, 1);
    fill(40, 40, 40);
    var xpos = this.x + round((this.width-this.height) * (this.value + 1) / 2);
    ellipse(xpos, this.y, this.height,this.height);    

    fill(100);
    ellipse(xpos + 10, this.y + 20, 6, 6);
    ellipse(xpos + 35, this.y + 20, 6, 6);
    stroke(100); noFill();
    var happiness = this.y + 30 + this.value * 5
    bezier(xpos + 10, this.y + 30, xpos + 20, happiness, xpos + 30, happiness, xpos + 41, this.y + 30);
};

Slider.prototype.isMouseInside = function () {
    return mouseX > this.x && mouseX < (this.x + this.width) && mouseY > this.y && mouseY < (this.y + this.height);
};

Slider.prototype.handleMouseClick = function () {
    if (this.isMouseInside()) {
        var cpos = mouseX - this.x;
        this.value = (cpos - (this.width / 2)) / (this.width / 2) * this.limit
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
    this.onClick = config.onClick || function () {console.log('radio button: '+ this.selected)};
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