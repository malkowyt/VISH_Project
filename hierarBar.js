var margin = {top: 30, right: 120, bottom: 0, left: 120},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var barHeight = 20;

var color = d3.scale.ordinal()
	.range(["steelblue", "#ccc","red","yellow"]);
    //.range(["steelblue", "#ccc"]);

var duration = 750,
    delay = 25,
	shift = 200;

var partition = d3.layout.partition()
    .value(function(d) { return convertCurrency(d.ProjectAmount, d.Currency, d.FXrateEUR); });

function convertCurrency(Amount, Currency, FXrateEUR){
	var ratio;
	var optList = document.getElementById("optionCurrency");
    var selOpt = optList.options[optList.selectedIndex].value;
    
	if (Currency == selOpt){
		return Amount;
	} else {
		switch (selOpt){
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
		
		return Amount * ratio;
	}
}
	
	
	
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + shift + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + (margin.left + shift) + "," + margin.top + ")");

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", up);

svg.append("g")
    .attr("class", "x axis");

svg.append("g")
    .attr("class", "y axis")
  .append("line")
    .attr("y1", "100%");

d3.json("data/data_credit.json", function(error, root) {
  if (error) throw error;

  postProcessData(root);

  partition.nodes(root);
  x.domain([0, root.value]).nice();
  down(root, 0);
});

function postProcessData(data) {
    ["ProjectAmount", "WholeSyndicationAmount", "Amount", "UnderwritingAmount", "OwnSynAmount", "FinalTakeAmount"].forEach(amount => {
        var amountEur = amount + "EUR",
            amountPct = amount + "Pct";
        data[amountEur] = d3.sum(data.children.map(type =>
            type[amountEur] = d3.sum(type.children.map(subType =>
                subType[amountEur] = d3.sum(subType.children.map(deal =>
                    deal[amountEur] = deal[amount] / deal.FXrateEUR
                ))
            ))
        ));
        data[amountPct] = 1;
        data.children.forEach(type => {
            type[amountPct] = type[amountEur] / data[amountEur];
            type.children.forEach(subType => {
                subType[amountPct] = subType[amountEur] / type[amountEur];
                subType.children.forEach(deal => {
                    deal[amountPct] = deal[amountEur] / subType[amountEur];
                });
            });
        });
    })
}

function down(d, i) {
  if (!d.children || this.__transition__) return;
  var end = duration + d.children.length * delay;

  // Mark any currently-displayed bars as exiting.
  var exit = svg.selectAll(".enter")
      .attr("class", "exit");

  // Entering nodes immediately obscure the clicked-on bar, so hide it.
  exit.selectAll("rect").filter(function(p) { return p === d; })
      .style("fill-opacity", 1e-6);

  // Enter the new bars for the clicked-on data.
  // Per above, entering bars are immediately visible.
  var enter = bar(d)
      .attr("transform", stack(i))
      .style("opacity", 1);

  // Have the text fade-in, even though the bars are visible.
  // Color the bars as parents; they will fade to children if appropriate.
  enter.select("text").style("fill-opacity", 1e-6);
  enter.select("rect").style("fill", color(true));

  // Update the x-scale domain.
  x.domain([0, d3.max(d.children, function(d) { return d.value; })]).nice();

  // Update the x-axis.
  svg.selectAll(".x.axis").transition()
      .duration(duration)
      .call(xAxis);

  // Transition entering bars to their new position.
  var enterTransition = enter.transition()
      .duration(duration)
      .delay(function(d, i) { return i * delay; })
      .attr("transform", function(d, i) { return "translate(0," + barHeight * i * 1.2 + ")"; });

  // Transition entering text.
  enterTransition.select("text")
      .style("fill-opacity", 1);

  // Transition entering rects to the new x-scale.
  enterTransition.select("rect")
      .attr("width", function(d) { return x(d.value); })
      .style("fill", function(d) { return color(!!d.children); });

  // Transition exiting bars to fade out.
  var exitTransition = exit.transition()
      .duration(duration)
      .style("opacity", 1e-6)
      .remove();

  // Transition exiting bars to the new x-scale.
  exitTransition.selectAll("rect")
      .attr("width", function(d) { return x(d.value); });

  // Rebind the current node to the background.
  svg.select(".background")
      .datum(d)
    .transition()
      .duration(end);

  d.index = i;
}

function up(d) {
  if (!d.parent || this.__transition__) return;
  var end = duration + d.children.length * delay;

  // Mark any currently-displayed bars as exiting.
  var exit = svg.selectAll(".enter")
      .attr("class", "exit");

  // Enter the new bars for the clicked-on data's parent.
  var enter = bar(d.parent)
      .attr("transform", function(d, i) { return "translate(0," + barHeight * i * 1.2 + ")"; })
      .style("opacity", 1e-6);

  // Color the bars as appropriate.
  // Exiting nodes will obscure the parent bar, so hide it.
  enter.select("rect")
     .style("fill", function(d) { return color(!!d.children); })
    .filter(function(p) { return p === d; })
      .style("fill-opacity", 1e-6);

  // Update the x-scale domain.
  x.domain([0, d3.max(d.parent.children, function(d) { return d.value; })]).nice();

  // Update the x-axis.
  svg.selectAll(".x.axis").transition()
      .duration(duration)
      .call(xAxis);

  // Transition entering bars to fade in over the full duration.
  var enterTransition = enter.transition()
      .duration(end)
      .style("opacity", 1);

  // Transition entering rects to the new x-scale.
  // When the entering parent rect is done, make it visible!
  enterTransition.select("rect")
      .attr("width", function(d) { return x(d.value); })
      .each("end", function(p) { if (p === d) d3.select(this).style("fill-opacity", null); });

  // Transition exiting bars to the parent's position.
  var exitTransition = exit.selectAll("g").transition()
      .duration(duration)
      .delay(function(d, i) { return i * delay; })
      .attr("transform", stack(d.index));

  // Transition exiting text to fade out.
  exitTransition.select("text")
      .style("fill-opacity", 1e-6);

  // Transition exiting rects to the new scale and fade to parent color.
  exitTransition.select("rect")
      .attr("width", function(d) { return x(d.value); })
      .style("fill", color(true));

  // Remove exiting nodes when the last child has finished transitioning.
  exit.transition()
      .duration(end)
      .remove();

  // Rebind the current parent to the background.
  svg.select(".background")
      .datum(d.parent)
    .transition()
      .duration(end);
}

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
	
// Creates a set of bars for the given data node, at the specified index.
function bar(d) {
  include('wz_tooltip.js');
  var optList = document.getElementById("optionCurrency");
  var selOpt = optList.options[optList.selectedIndex].value;
  var bar = svg.insert("g", ".y.axis")
      .attr("class", "enter")
      .attr("transform", "translate(0,5)")
    .selectAll("g")
      .data(d.children)
    .enter().append("g")
      .style("cursor", function(d) { return !d.children ? null : "pointer"; })
      .on("click", down)
      .on("mouseover", function(d) {
			var total = totalSum(d, "ProjectAmount");
			Tip(Math.round(total * 100) / 100 + " " + selOpt);
		})
	  	.on("mouseout", function(d){
			UnTip();
		});
	  
  bar.append("text")
      .attr("x", -6)
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d.name; });

  bar.append("rect")
      .attr("width", function(d) { return x(d.value); })
      .attr("height", barHeight);

  return bar;
}

function totalSum(d, val){
	var total = 0;
	if (d.children){
		for ( var i = 0, _len = d.children.length; i < _len; i++ ) {
			total += totalSum(d.children[i], val);
		}
	} else {		
		total += convertCurrency(d[val], d.Currency, d.FXrateEUR);
	}
	return total;
}

function include(file)
{
    var script = document.createElement('script');
    var type = document.createAttribute('type');
    type.value = 'text/javascript';
    script.setAttributeNode(type);
    var source = document.createAttribute('src');
    source.value = file;
    script.setAttributeNode(source);
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(script);
}

// A stateful closure for stacking bars horizontally.
function stack(i) {
  var x0 = 0;
  return function(d) {
    var tx = "translate(" + x0 + "," + barHeight * i * 1.2 + ")";
    x0 += x(d.value);
    return tx;
  };
}

function changePercVal(){
  //TODO change view
  var optList = document.getElementById("option");
  var selOpt = optList.options[optList.selectedIndex].value;
  var setDisp;
  if (selOpt == "currency") {
	  setDisp = '';
  } else {
	  setDisp = 'hidden';
  }
  document.getElementById("optionCurrency").style.visibility = setDisp;
  document.getElementById("lblOptionCurrency").style.visibility = setDisp;
}
function changeCurrency(){
  //TODO change view  
  d3.json("data/data_credit.json", function(error, root) {
  if (error) throw error;

  postProcessData(root);

  partition.nodes(root);
  x.domain([0, root.value]).nice();
  down(root,0);
});
  //document.location.reload();
}