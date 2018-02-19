var d3 = require("d3");
var fs = require("fs");
var jsdom = require("jsdom").jsdom;


var size = 80;
var half = size / 2;
var barbsize = 30;
var speeds = d3.range(5, 205, 5);
speeds.forEach(function(d) {
    generateWindBarb(d);
});

function generateWindBarb(d){
    var document = jsdom();
    var svg = d3.select(document.body).append("svg")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("height", size)
        .attr("width", size);
    var thisbarb = svg.append('g')
        .attr("stroke", "#000")
        .attr("transform", "translate("+half+","+half+") rotate(180)");
    
    var flags = Math.floor(d/50);
    var pennants = Math.floor((d - flags*50)/10);
    var halfpennants = Math.floor((d - flags*50 - pennants*10)/5);
    var px = barbsize - 0.5;
            
    // Draw wind barb stems
    thisbarb.append("line")
        .attr("x1", 0).attr("x2", 0)
        .attr("y1", 0).attr("y2", barbsize)
        .attr("stroke-width", 1);
 
    // Draw wind barb flags and pennants for each stem
    for (i=0; i<flags; i++) {
        thisbarb.append("polyline")
            .attr("points", "0,"+px+" -10,"+(px)+" 0,"+(px-4))
            .attr("class", "flag")
            .attr("fill", "#000");
         px -= 5;
    }
    if (flags > 0) px -= 2;
    // Draw pennants on each barb
    for (i=0; i<pennants; i++) {
        thisbarb.append("line")
            .attr("x1", 0)
            .attr("x2", -10)
            .attr("y1", px)
            .attr("y2", px+4)
            .attr("stroke-width", 1)
         px -= 3;
    }
    // Draw half-pennants on each barb
    for (i=0; i<halfpennants; i++) {
        thisbarb.append("line")
            .attr("x1", 0)
            .attr("x2", -5)
            .attr("y1", px)
            .attr("y2", px+2)
            .attr("stroke-width", 1)
        px -= 3;
    }

    var svgstr = document.body.innerHTML;
    fs.writeFile("windbarb-" + (d / 5) + ".svg" , svgstr);
}


