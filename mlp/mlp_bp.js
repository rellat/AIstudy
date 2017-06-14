var p5_screen_size = [1250, 360];
var in1rbtn, in2rbtn;
var bpbtn, rstbtn;
var l1n1w1sl, l1n1w2sl, l1n2w1sl, l1n2w2sl, l2n1w1sl, l2n1w2sl;
var neural_net;
var iter =0;
var training_interval;

var nwcl1n1, nwcl1n2, nwcl2n1, ncc;

//---------------------------------------------------------------------
// Ploty.js weight chart
//
// var nwc = new NetweightChart({
//     dom: 'myplotly',
//     neural_net: neural_net,
//     net_pos: [1,0] // layer, neuron
// })
//---------------------------------------------------------------------
var NetweightChart = function(options) {
    this.xy_data = []
    for (var i = -2.0; i <= 2.0; i = i+ 0.1) { this.xy_data.push(i) }
    this.z_data = []
    this.dom = options.dom || 'myplotly'
    this.neural_net = options.neural_net
    this.net_pos = options.net_pos || [1,0]
    this.initplot()
}
NetweightChart.prototype.initplot = function() {
    var save_netx = this.neural_net.net_weights[this.net_pos[0]][this.net_pos[1]][0]
    var save_nety = this.neural_net.net_weights[this.net_pos[0]][this.net_pos[1]][1]
    for (var ix = 0; ix < this.xy_data.length; ix++) {
        var ty = []
        for (var iy = 0; iy < this.xy_data.length; iy++) {
            this.neural_net.net_weights[this.net_pos[0]][this.net_pos[1]][0] = this.xy_data[ix]
            this.neural_net.net_weights[this.net_pos[0]][this.net_pos[1]][1] = this.xy_data[iy]
            ty.push(checkxor(false))
        }
        this.z_data.push(ty)
    }
    this.neural_net.net_weights[this.net_pos[0]][this.net_pos[1]][0] = save_netx
    this.neural_net.net_weights[this.net_pos[0]][this.net_pos[1]][1] = save_nety

    var data = [{
        x: this.xy_data,
        y: this.xy_data,
        z: this.z_data,
        type: 'surface',
        cmin: 0, cmax: 4
    }];
    Plotly.newPlot(this.dom, data, {
        title: 'weights of Layer:'+this.net_pos[0]+' Neuron:'+(this.net_pos[1]+1),
        autosize: false,
        width: 380,
        height: 280,
        margin: {l:10, r:10, t:80, b:10}
    });
    // console.log("init plot "+JSON.stringify(z_data))
}
NetweightChart.prototype.updateplot = function() {
    var is_changed = false
    var save_netx = this.neural_net.net_weights[this.net_pos[0]][this.net_pos[1]][0]
    var save_nety = this.neural_net.net_weights[this.net_pos[0]][this.net_pos[1]][1]
    for (var ix = 0; ix < this.xy_data.length; ix++) {
        for (var iy = 0; iy < this.xy_data.length; iy++) {
            this.neural_net.net_weights[this.net_pos[0]][this.net_pos[1]][0] = this.xy_data[ix]
            this.neural_net.net_weights[this.net_pos[0]][this.net_pos[1]][1] = this.xy_data[iy]
            var iz = checkxor(false)
            if(iz !== this.z_data[ix][iy]) {
                is_changed = true
                this.z_data[ix][iy] = iz
            }
        }
    }
    this.neural_net.net_weights[this.net_pos[0]][this.net_pos[1]][0] = save_netx
    this.neural_net.net_weights[this.net_pos[0]][this.net_pos[1]][1] = save_nety
    if(is_changed) {
        Plotly.redraw(this.dom)
    }
}
//---------------------------------------------------------------------
// Ploty.js cost chart
//---------------------------------------------------------------------
var NetCostChart = function(options) {
    this.x_data = []
    this.y_data = []
    this.y_cursor = 0
    for (var i = 0; i <= 10000; i++) { this.x_data.push(i) }
    this.dom = options.dom || 'myplotly'
    this.initplot()
}
NetCostChart.prototype.initplot = function() {
    var data = [{
        x: this.x_data,
        y: this.y_data,
        mode: 'lines',
        type: 'scatter',
        line: {shape: 'spline'},
        connectgaps: true
    }];
    Plotly.newPlot(this.dom, data, {
        title: 'Cost by epoch',
        width: 350, height: 280,
        showlegend: false,
        xaxis: {
            // range: [100, 10000],
            autorange: true
        },
        yaxis: {
            range: [0, 1],
            autorange: false
        },
        margin: {l:20, r:15, t:80, b:20}
    });
    // console.log("init plot "+JSON.stringify(z_data))
}
NetCostChart.prototype.updateplot = function(inputs) {
    inputs = (inputs instanceof Array) ? inputs : [inputs]
    for (var i = 0; i <= inputs.length; i++) { 
        this.y_data.push(inputs[i])
    }
    Plotly.redraw(this.dom)
}
//---------------------------------------------------------------------
// P5.js mlp simulation
//---------------------------------------------------------------------
var xor = [[0,0,0,false],[1,0,1,false],[0,1,1,false],[1,1,0,false]];
var checkxor = function(display) {
    display = display || true
    var clear = 0;
    for (var i = 0; i < xor.length; i++) {
        if(display) xor[i][3] = false;
        neural_net.feedForwad([xor[i][0], xor[i][1]])
        if(xor[i][2] === 1) {
            if(neural_net.net_outputs[2][0] > 0) {
                if(display) xor[i][3] = true;
                clear++;
            }
        }else {
            if(neural_net.net_outputs[2][0] <= 0) {
                if(display) xor[i][3] = true;
                clear++;
            }
        }
    }
    return clear;
}

function neuralnet_update(layer,neuron, weight, value) {
    neural_net.net_weights[layer][neuron][weight] = value
    neural_net.feedForwad([in1rbtn.selected, in2rbtn.selected])
}

var p5sketch = function(p) {
    p.setup = function() {
        p.createCanvas(p5_screen_size[0], p5_screen_size[1]);
        p.background(255);
        p.ellipseMode(p.CORNER);
        p.strokeWeight(4);

        neural_net = new NeuralNetwork({
            bias: 1.0,
            learning_rate: 0.1,
            net_shape: [2,2,1],
            net_act_method: ["none","relu","thresold"]
        })

        in1rbtn = new RadioButton({p5:p, x:20,y:65,width:100,height:50,labels:["0","1"],
            onClick: function(value) { neural_net.feedForwad([in1rbtn.selected, in2rbtn.selected]) }
        });
        in2rbtn = new RadioButton({p5:p, x:20,y:245,width:100,height:50,labels:["0","1"],
            onClick: function(value) { neural_net.feedForwad([in1rbtn.selected, in2rbtn.selected]) }
        });
        l1n1w1sl = new Slider({p5:p, x:160,y:20,width:120,height:50,value:neural_net.net_weights[1][0][0],
            onClick: function(value) { 
                neuralnet_update(1,0,0,value)
                nwcl1n1.updateplot()
                nwcl1n2.updateplot()
                nwcl2n1.updateplot()
                checkxor()
            }
        });
        l1n1w2sl = new Slider({p5:p, x:160,y:110,width:120,height:50,value:neural_net.net_weights[1][0][1],
            onClick: function(value) { 
                neuralnet_update(1,0,1,value) 
                nwcl1n1.updateplot()
                nwcl1n2.updateplot()
                nwcl2n1.updateplot()
                checkxor()
            }
        });
        l1n2w1sl = new Slider({p5:p, x:160,y:200,width:120,height:50,value:neural_net.net_weights[1][1][0],
            onClick: function(value) { 
                neuralnet_update(1,1,0,value) 
                nwcl1n1.updateplot()
                nwcl1n2.updateplot()
                nwcl2n1.updateplot()
                checkxor()
            }
        });
        l1n2w2sl = new Slider({p5:p, x:160,y:290,width:120,height:50,value:neural_net.net_weights[1][1][1],
            onClick: function(value) { 
                neuralnet_update(1,1,1,value) 
                nwcl1n1.updateplot()
                nwcl1n2.updateplot()
                nwcl2n1.updateplot()
                checkxor()
            }
        });
        l2n1w1sl = new Slider({p5:p, x:710,y:65,width:120,height:50,value:neural_net.net_weights[2][0][0],
            onClick: function(value) { 
                neuralnet_update(2,0,0,value) 
                nwcl1n1.updateplot()
                nwcl1n2.updateplot()
                nwcl2n1.updateplot()
                checkxor()
            }
        });
        l2n1w2sl = new Slider({p5:p, x:710,y:245,width:120,height:50,value:neural_net.net_weights[2][0][1],
            onClick: function(value) { 
                neuralnet_update(2,0,1,value) 
                nwcl1n1.updateplot()
                nwcl1n2.updateplot()
                nwcl2n1.updateplot()
                checkxor()
            }
        });

        bpbtn = new Button({p5:p, x: 750,y: 10, width: 280, height: 38, label: "Do Back Propagation 10 times",
            onClick: function() {
                // console.log("back-prop started")
                iter = 0;
                if(!training_interval) training_interval = setInterval(function() {
                    for (var i = 0; i < xor.length; i++) {
                        neural_net.feedForwad([xor[i][0], xor[i][1]])
                        neural_net.backProp([xor[i][2]])
                    }

                    l1n1w1sl.value = neural_net.net_weights[1][0][0]
                    l1n1w2sl.value = neural_net.net_weights[1][0][1]
                    l1n2w1sl.value = neural_net.net_weights[1][1][0]
                    l1n2w2sl.value = neural_net.net_weights[1][1][1]
                    l2n1w1sl.value = neural_net.net_weights[2][0][0]
                    l2n1w2sl.value = neural_net.net_weights[2][0][1]
                    
                    nwcl1n1.updateplot()
                    nwcl1n2.updateplot()
                    nwcl2n1.updateplot()
                    var ncost = checkxor()
                    ncc.updateplot((4-ncost)/4)
                    
                    if(ncost >= 4) { clearInterval(training_interval); training_interval = null; }
                    else iter++
                    if(iter >= 10) { clearInterval(training_interval); training_interval = null; }
                    console.log('back-prop epoch: '+iter/*+' json: '+JSON.stringify(neural_net.net_weights)*/)
                },200)
            }
        });
        rstbtn = new Button({p5:p, x: 600,y: 10, width: 135, height: 38, label: "Weight Reset",
            onClick: function() {
                console.log("reset weight of neural network")                
                neural_net.resetWeight()

                neural_net.feedForwad([in1rbtn.selected, in2rbtn.selected])
                l1n1w1sl.value = neural_net.net_weights[1][0][0]
                l1n1w2sl.value = neural_net.net_weights[1][0][1]
                l1n2w1sl.value = neural_net.net_weights[1][1][0]
                l1n2w2sl.value = neural_net.net_weights[1][1][1]
                l2n1w1sl.value = neural_net.net_weights[2][0][0]
                l2n1w2sl.value = neural_net.net_weights[2][0][1]
                nwcl1n1.updateplot()
                nwcl1n2.updateplot()
                nwcl2n1.updateplot()
                ncc.y_data.splice(0,ncc.y_data.length-1)
                ncc.updateplot((4-checkxor())/4)
            }
        })

        checkxor();

        nwcl1n1 = new NetweightChart({dom:'nwcplot1', neural_net:neural_net, net_pos:[1,0]})
        nwcl1n2 = new NetweightChart({dom:'nwcplot2', neural_net:neural_net, net_pos:[1,1]})
        nwcl2n1 = new NetweightChart({dom:'nwcplot3', neural_net:neural_net, net_pos:[2,0]})

        ncc = new NetCostChart({dom:'nwcplot4'})
    }

    p.draw = function() {
        p.background(255);
        p.stroke(40);
        p.line(120, 90, 150, 45);
        p.line(120, 90, 150, 225);
        p.line(120, 270, 150, 135);
        p.line(120, 270, 150, 315);
        p.line(290, 45, 340, 90);
        p.line(290, 135, 340, 90);

        // layer 1 neuron 1
        p.noStroke(); p.fill(225,225,40);
        p.ellipse(340, 40, 100, 100);
        p.fill(40);
        p.ellipse(360, 80, 10, 10);
        p.ellipse(410, 80, 10, 10);
        p.stroke(40);
        p.noFill();
        var happiness = 105 + neural_net.net_outputs[1][0] * 15
        p.bezier(360, 105, 370, happiness, 410, happiness, 420, 105);
        p.line(440, 90, 470, 90);
        p.noStroke(); p.fill(40); p.textSize(19); p.textAlign(p.LEFT);
        p.text("Activation", 480,70);
        p.text("Function: ", 480,90);
        p.textAlign(p.RIGHT); p.text(neural_net.net_act_method[1], 570,110);
        p.stroke(40);
        p.line(580, 90, 590, 90);
        p.noStroke(); p.fill(40); p.textSize(19); p.textAlign(p.LEFT);
        p.text("Output: " + Math.round(neural_net.net_outputs[1][0] * 100) / 100, 600,95);

        // layer 1 neuron 2
        p.stroke(40);
        p.line(290, 225, 340, 270);
        p.line(290, 315, 340, 270);
        p.noStroke(); p.fill(225,225,40);
        p.ellipse(340, 220, 100, 100);
        p.fill(40);
        p.ellipse(360, 260, 10, 10);
        p.ellipse(410, 260, 10, 10);
        p.stroke(40);
        p.noFill();
        var happiness2 = 285 + neural_net.net_outputs[1][1] * 15
        p.bezier(360, 285, 370, happiness2, 410, happiness2, 420, 285);
        p.line(440, 270, 470, 270);
        p.noStroke(); p.fill(40); p.textSize(19); p.textAlign(p.LEFT);
        p.text("Activation", 480,250);
        p.text("Function: ", 480,270);
        p.textAlign(p.RIGHT); p.text(neural_net.net_act_method[1], 570,290);
        p.stroke(40);
        p.line(580, 270, 590, 270);
        p.noStroke(); p.fill(40); p.textSize(19); p.textAlign(p.LEFT);
        p.text("Output: " + Math.round(neural_net.net_outputs[1][1] * 100) / 100, 600,275);

        // layer 2 neuron 1
        p.stroke(40);
        p.line(840, 90, 880, 180);
        p.line(840, 270, 880, 180);
        p.noStroke(); p.fill(225,225,40);
        p.ellipse(880, 130, 100, 100);
        p.fill(40);
        p.ellipse(900, 170, 10, 10);
        p.ellipse(950, 170, 10, 10);
        p.stroke(40);
        p.noFill();
        var happiness3 = 195 + neural_net.net_outputs[2][0] * 15
        p.bezier(900, 195, 910, happiness3, 950, happiness3, 960, 195);
        p.line(980, 180, 1000, 180);
        p.noStroke(); p.fill(40); p.textSize(19); p.textAlign(p.LEFT);
        p.text("Activation", 1010,160);
        p.text("Function: ", 1010,180);
        p.textAlign(p.RIGHT); p.text(neural_net.net_act_method[2], 1100,200);
        p.stroke(40);
        p.line(1110, 180, 1130, 180);
        p.noStroke(); p.fill(40); p.textSize(19); p.textAlign(p.LEFT);
        p.text("Output: " + Math.round(neural_net.net_outputs[2][0] * 100) / 100, 1140,180);

        for (var i = 0; i < xor.length; i++) {
            if(xor[i][3] == true) p.fill(100,200,100);
            else p.fill(100);
            p.rect(360 + i*100,330,95,30)
            p.fill(0); p.textSize(14); p.textAlign(p.LEFT);
            p.text(""+xor[i][0]+" : "+xor[i][1]+" => "+xor[i][2], 370 + i*100,350);
        }
        p.textSize(18);
        p.text("bias = " + neural_net.bias, 780,350);

        in1rbtn.draw();
        in2rbtn.draw();
        l1n1w1sl.draw();
        l1n1w2sl.draw();
        l1n2w1sl.draw();
        l1n2w2sl.draw();
        l2n1w1sl.draw();
        l2n1w2sl.draw();
        bpbtn.draw();
        rstbtn.draw();
    }

    p.mousePressed = function() {
        in1rbtn.handleMouseClick();
        in2rbtn.handleMouseClick();
        l1n1w1sl.handleMouseClick();
        l1n1w2sl.handleMouseClick();
        l1n2w1sl.handleMouseClick();
        l1n2w2sl.handleMouseClick();
        l2n1w1sl.handleMouseClick();
        l2n1w2sl.handleMouseClick();
        bpbtn.handleMouseClick();
        rstbtn.handleMouseClick();
    }
    p.mouseDragged = function() {
        l1n1w1sl.handleMouseClick();
        l1n1w2sl.handleMouseClick();
        l1n2w1sl.handleMouseClick();
        l1n2w2sl.handleMouseClick();
        l2n1w1sl.handleMouseClick();
        l2n1w2sl.handleMouseClick();
    }
}
new p5(p5sketch, 'myp5sketch');
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
    this.p5 = config.p5 || p5;
    this.onClick = config.onClick || function () {};
};

Button.prototype.draw = function () {
    this.p5.noStroke();
    this.p5.fill(70,70,120);
    this.p5.rect(this.x, this.y, this.width, this.height);
    this.p5.fill(255);
    this.p5.textSize(19);
    this.p5.textAlign(this.p5.LEFT);
    this.p5.text(this.label, this.x + 10, this.y + (this.height *0.6));
};

Button.prototype.isMouseInside = function () {
    return this.p5.mouseX > this.x && this.p5.mouseX < (this.x + this.width) && this.p5.mouseY > this.y && this.p5.mouseY < (this.y + this.height);
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
    this.p5 = config.p5 || p5;
    this.onClick = config.onClick || function () {console.log('slider: '+ this.value)};
};

Slider.prototype.draw = function () {
    this.p5.noStroke();
    this.p5.fill(80, 80, 80);
    this.p5.rect(this.x, this.y + Math.round(this.height / 2), this.width, 1);
    this.p5.fill(40, 40, 40);
    var xpos = this.x + Math.round((this.width-this.height) * (this.value + 1) / 2);
    this.p5.ellipse(xpos, this.y, this.height,this.height);    

    this.p5.fill(100);
    this.p5.ellipse(xpos + 10, this.y + 20, 6, 6);
    this.p5.ellipse(xpos + 35, this.y + 20, 6, 6);
    this.p5.stroke(100); this.p5.noFill();
    var happiness = this.y + 30 + this.value * 5
    this.p5.bezier(xpos + 10, this.y + 30, xpos + 20, happiness, xpos + 30, happiness, xpos + 41, this.y + 30);
};

Slider.prototype.isMouseInside = function () {
    return this.p5.mouseX > this.x && this.p5.mouseX < (this.x + this.width) && this.p5.mouseY > this.y && this.p5.mouseY < (this.y + this.height);
};

Slider.prototype.handleMouseClick = function () {
    if (this.isMouseInside()) {
        var cpos = this.p5.mouseX - this.x;
        this.value = (cpos - (this.width / 2)) / (this.width / 2) * this.limit
        this.onClick(this.value);
    }
};

var RadioButton = function (config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 150;
    this.height = config.height || 50;
    this.selected = config.selected || 0;
    this.labels = config.labels || ["0","1"];
    this.p5 = config.p5 || p5;
    this.onClick = config.onClick || function () {console.log('radio button: '+ this.selected)};
};

RadioButton.prototype.draw = function () {
    this.p5.noStroke();
    for (var index = 0; index < this.labels.length; index++) {
        var label = this.labels[index];
        this.p5.fill(180);
        if (index === this.selected) this.p5.fill(70,70,120);
        var xsize = this.width / this.labels.length;
        this.p5.rect(this.x + index*xsize, this.y, xsize, this.height);
        this.p5.fill(100);
        if (index === this.selected) this.p5.fill(200);
        this.p5.textSize(19);
        this.p5.textAlign(this.p5.CENTER);
        this.p5.text(label, this.x + index*xsize + 23, this.y + this.height / 2 + 6);
    }
};

RadioButton.prototype.isMouseInside = function () {
    return this.p5.mouseX > this.x && this.p5.mouseX < (this.x + this.width) && this.p5.mouseY > this.y && this.p5.mouseY < (this.y + this.height);
};

RadioButton.prototype.handleMouseClick = function () {
    if (this.isMouseInside()) {
        this.selected = Math.floor((this.p5.mouseX - this.x)/(this.width/this.labels.length));
        this.onClick(this.selected);
    }
};


// -------------------------------------------------
// Neural Network
//
// var nn = new NeuralNetwork({
//     bias: 1.0,
//     learning_rate: 0.1,
//     net_shape: [2,2,1],
//     net_act_method: ["none","relu","thresold"]
// });
// btn1.feedForwad(input_data);
// btn1.backProp(train_data);
// -------------------------------------------------
var NeuralNetwork = function(options) {
    this.bias = options.bias || 1.0
    this.learning_rate = options.learning_rate || 0.1
    this.net_weights = []
    this.net_outputs = []
    this.net_errors = []
    this.net_length = options.net_shape.length || 2
    // net_shape: [input,hidden #1,hidden #2,output] 
    this.net_act_method = options.net_act_method || []
    for (var i = 0; i < this.net_length; i++) {
        var neuron_length = options.net_shape[i] || 2
        var ws = []
        var outs = []
        var erorrs = []
        for (var j = 0; j < neuron_length + 1; j++) {
            var ww = []
            if(i > 0) {
                for (var k = 0; k < this.net_outputs[i-1].length; k++) {
                    ww.push(Math.random()*2-1)
                }
            }
            ws.push(ww)
            outs.push(0)
            erorrs.push(0)
        }
        this.net_weights.push(ws)
        this.net_outputs.push(outs)
        this.net_errors.push(erorrs)        
    }
    console.log('init the structure of net '+JSON.stringify(this.net_weights))
}
NeuralNetwork.prototype.resetWeight = function () {
    this.net_weights = []
    // net_shape: [input,hidden #1,hidden #2,output] 
    for (var i = 0; i < this.net_length; i++) {
        var ws = []
        for (var j = 0; j < this.net_outputs[i].length; j++) {
            var ww = []
            if(i > 0) {
                for (var k = 0; k < this.net_outputs[i-1].length; k++) {
                    ww.push(Math.random()*2-1)
                }
            }
            ws.push(ww)
        }
        this.net_weights.push(ws)     
    }
}
NeuralNetwork.prototype.feedForwad = function (input_data) {
    if(input_data.length !== this.net_outputs[0].length - 1) {
        console.log('input doesnt match the structure of net')
        return
    }
    for (var h = 0; h < this.net_outputs[0].length-1; h++) {
        this.net_outputs[0][h] = input_data[h]
    }    
    for (var i = 1; i < this.net_outputs.length; i++) {
        for (var cr = 0; cr < this.net_outputs[i].length; cr++) {
            if(cr === this.net_outputs[i].length -1) { 
                // feed forwad 할 때는 bias 부분 weight를 무시한다. back-prop 하고나면 bias 부분 weight가 변경될 수 있으니 리셋한다.
                for (var pr = 0; pr < this.net_outputs[i-1].length; pr++) { this.net_weights[i][cr][pr] = this.bias; }
                continue;
            }
            var sum_of_w = 0
            for (var pr = 0; pr < this.net_outputs[i-1].length; pr++) {
                if(pr === this.net_outputs[i-1].length -1) { this.net_weights[i][cr][pr] = this.bias; continue; }
                sum_of_w = sum_of_w + this.net_weights[i][cr][pr] * this.net_outputs[i-1][pr]
            } 
            this.net_outputs[i][cr] = this.activate(sum_of_w + this.bias, this.net_act_method[i])
        }
    }
}
NeuralNetwork.prototype.backProp = function (train_data) {
    if(train_data.length !== this.net_outputs[this.net_outputs.length - 1].length - 1) {
        console.log('train data doesnt match the structure of net')
        return
    }
    // 아웃풋 레이어의 error(목표값 - 출력)를 계산
    var l = this.net_errors.length-1
    for (var h = 0; h < this.net_errors[l].length-1; h++) {
        this.net_errors[l][h] = (train_data[h] - this.net_outputs[l][h]) * this.act_grad(this.net_outputs[l][h],this.net_act_method[l])
    }
    // console.log("bp step1: " + JSON.stringify(train_data) + " " +JSON.stringify(this.net_errors[l]))
    // 뒤로 전파하면서 숨은 레이어의 error를 계산
    for (var i = this.net_weights.length - 2; i > 0; i--) { 
        // back-prop 시에는 bias까지 다 넣어서 계산한다. bias로 인한 cost까지 포함해서 계산하려고 하기 때문이다.
        for (var cr = 0; cr < this.net_weights[i].length; cr++) {
            var sum_of_w = 0
            for (var nx = 0; nx < this.net_outputs[i+1].length; nx++) {
                sum_of_w = sum_of_w + this.net_weights[i+1][nx][cr] * this.net_errors[i+1][nx]
            }
            this.net_errors[i][cr] = sum_of_w * this.act_grad(this.net_outputs[i][cr], this.net_act_method[i])
        }
    }
    for (var i = this.net_weights.length - 1; i > 0; i--) {
        for (var cr = 0; cr < this.net_weights[i].length; cr++) {
            for (var pr = 0; pr < this.net_outputs[i-1].length; pr++) {
                this.net_weights[i][cr][pr] = this.net_weights[i][cr][pr] + (this.learning_rate * this.net_errors[i][cr] * this.net_outputs[i][pr])
            }
        }
    }
}
NeuralNetwork.prototype.saveWeight = function () {
    return {};
}
NeuralNetwork.prototype.loadWeight = function (data) {
    // 데이터와 레이어 구조가 일치하는지 확인하기
}
NeuralNetwork.prototype.activate = function(val, method_name) {
    method_name = !method_name ? "identity" : method_name;
    switch (method_name) {
        case "sigmoid":
            return 1/(1+Math.exp(-val));
        case "relu":
            return Math.max(0, val);
        case "thresold":
            if (val > 0) return 1;
            else return 0;
        case "identity":
        default:
            return val;
    }
}
NeuralNetwork.prototype.act_grad = function(val, method_name) {
    method_name = !method_name ? "identity" : method_name;
    switch (method_name) {
        case "sigmoid":
            return (1.0 - val) * val;
        case "relu":
            return (val > 0) ? 1.0 : 0.0;
        case "thresold":
            return (val > 0) ? 1.0 : 0;
        case "identity":
        default:
            return 1.0;
    }
}



