function initChart() {
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    /*
     * value accessor - returns the value to encode for a given data object.
     * scale - maps value to a visual display encoding, such as a pixel position.
     * map function - maps from data value to display value
     * axis - sets up axis
     */

// setup x
    var xValue = function (d) {
            return convertCurrency(d["FinalTakeAmount"], d["Currency"], d["FXrateEUR"]);
        }, // data -> value
        xScale = d3.scale.linear().range([0, width]), // value -> display
        xMap = function (d) {
            return xScale(xValue(d));
        }, // data -> display
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
    var yValue = function (d) {
            return convertCurrency(d["UnderwritingAmount"], d["Currency"], d["FXrateEUR"]);
        }, // data -> value
        yScale = d3.scale.linear().range([height, 0]), // value -> display
        yMap = function (d) {
            return yScale(yValue(d));
        }, // data -> display
        yAxis = d3.svg.axis().scale(yScale).orient("left");

// setup fill color
    var cValue = function (d) {
            return d["AssetType"];
        },
        color = d3.scale.category10();
//color = d3.scale.category30();

    d3.select('svg').remove();

// add the graph canvas to the body of the webpage
    var svg = d3.select("#svg").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

// load data
    d3.csv("data/data_credit.csv", function (data) {
        "use strict";
        console.log("data:", data);
        // convert variables from string to float
        data.forEach(function (d) {
            d["FinalTakeAmount"] = parseFloat(d["FinalTakeAmount"]);
            d["UnderwritingAmount"] = parseFloat(d["UnderwritingAmount"]);
        });

        // don't want dots overlapping axis, so add in buffer to data domain
        xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1]);
        yScale.domain([d3.min(data, yValue) - 20, d3.max(data, yValue) + 20]);

        // x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("FinalTakeAmount [in Mio]");

        // y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("UnderwritingAmount [in Mio]");

        // draw dots
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", function (d) {
                return color(cValue(d));
            })
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d["Dealname"] + " " + d["AssetType"] + "<br/> (" + xValue(d)
                    + ", " + yValue(d) + ")")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // draw legend
        var legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 14 + ")";
            });

        // draw legend colored rectangles
        legend.append("rect")
            .attr("x", width - 6)
            .attr("width", 6)
            .attr("height", 6)
            .style("fill", color);

        // draw legend text
        legend.append("text")
            .attr("x", width - 12)
            .attr("y", 3)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) {
                return d;
            });
        svg.select(".legend").append("text")
            .attr("x", width)
            .attr("y", -13)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .text("AssetTypen");
    });
}

function convertCurrency(Amount, Currency, FXrateEUR) {
    var ratio;
    var optList = document.getElementById("optionCurrency");
    var selOpt = optList.options[optList.selectedIndex].value;
    if (Currency == selOpt) {
        return Amount;
    } else {
        switch (selOpt) {
            case "EUR":
                ratio = 1 / FXrateEUR;
                break;
            case "USD":
                ratio = 1 / FXrateEUR * 1.1349;
                break;
            case "GBP":
                ratio = 1 / FXrateEUR * 0.7872;
                break;
        }

        return Math.round(Amount * ratio * 100) / 100;
    }
}

window.onload = initChart;