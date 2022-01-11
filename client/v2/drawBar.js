function drawBar() {
  const data = plotState.data;

  const colors = d3.schemeCategory10;

  const xs = d3.map(data, o => o[plotState.xAxis]);
  const ys = d3.map(data, o => o.mean);
  const zs = d3.map(data, o => o[plotState.ordinal]);

  // Keep only unique values
  const xDomain = new d3.InternSet(xs);
  const zDomain = new d3.InternSet(zs);

  // Dummy yMax
  // var yMin = 1;
  // var yMax = d3.max(ys);
  var [yMin, yMax] = d3.extent(ys);

  // Full scale
  const xScale = d3.scaleBand(xDomain, [0, width]).paddingInner(0.1);
  // Sub scale
  const xzScale = d3.scaleBand(zDomain, [0, xScale.bandwidth()]).padding(0.2);
  var yScale = d3.scaleLog([yMin, yMax], [height, 0]);
  // Colors per ordinal
  const zScale = d3.scaleOrdinal(zDomain, colors);
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 60);

  // var yMax = (() => {
  //   var ticks = yScale.ticks();
  //   var nticks = ticks.length + 1;
  //   var step = ticks[1] - ticks[0];
  //   return ticks[nticks-2]+step;
  // })();

  // yScale = d3.scaleLog([yMin, yMax], [height, 0]);

  var tooltip = d3.select("body").append("div")
                  .attr("id", "d3-tooltip")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

  // Indices
  const I = d3.range(xs.length).filter(i => xDomain.has(xs[i]) && zDomain.has(zs[i]));

  // Generate the plot
  // TODO: Fix responsiveness
  const svg = d3.select("#chart")
                .append("svg")
                .attr("id", "d3-chart")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
     .call(yAxis.tickSize(-width))
     .call(g => g.select(".domain").remove()) // Remove top tick line
     .call(g => g.append("text")
                 .attr("x", -margin.left / 2)
                 .attr("y", -margin.top / 2)
                 .attr("fill", "currentColor")
                 .attr("text-anchor", "start")
                 .text("Mean run time ratio (log)"));

  const bar = svg.append("g")
                 .selectAll("rect")
                 .data(I)
                 .join("rect")
                 .attr("class", "bar")
                 .attr("x", i => xScale(xs[i]) + xzScale(zs[i]))
                 .attr("y", i => yScale(ys[i]))
                 .attr("width", xzScale.bandwidth())
                 .attr("height", i => yScale(yMin) - yScale(ys[i]))
                 .attr("fill", i => {
                   var val = data[i].mean;
                   if (val < 0.95) {
                     return "green";
                   } else if ((val >= 0.95) && (val < 1.05)) {
                     return "yellow";
                   } else  {
                     return "red";
                   }
                 })
                 .on("mouseover", (event, i) => {
                   tooltip.transition()
                          .duration(200)
                          .style("opacity", .9);
                   tooltip.html(`Benchmark: ${data[i].benchmark}<br /><br />Commit: ${data[i].commit}<br /><br />Mean: ${ys[i]}`)
                          .style("left", (event.pageX) + "px")
                          .style("top", (event.pageY - 28) + "px");
                 })
                 .on("mouseout", d => {
                   tooltip.transition()
                          .duration(500)
                          .style("opacity", 0);
                 })
                 .on("click", (event, i) => {
                   // Properly select the commit
                   if (plotState.xAxis === "benchmark") {
                     var ref = zs[i];
                   } else if (plotState.xAxis === "commit") {
                     ref = xs[i];
                   }

                   // Either clear or set the reference commit
                   if (plotState.reference === ref) {
                     unsetReference();
                   } else {
                     setReference(ref);
                   }
                   updatePlotState();
                 })

  svg.append("g")
     .call(xAxis)
     .attr("class", "x-axis")
     .attr("transform", "translate(0," + height + ")") // lower the axis
     .selectAll("text")
     .style("text-anchor", "start")
     .style("font-size", () => {
       if (plotState.xAxis === "suite") {
         var len = forensicsData.options.gambit.benchmarkSuites;
       } else {
         len = ys.length;
       }
       if (len > 40) {
         var s = width / ys.length;
         if (s > 2) {
           return (s - 2) + "px";
         } else {
           return "1px";
         }
       }
     })
     .attr("dx", ".8em")
     .attr("dy", "-5px")
     .attr("transform", "rotate(90)");
}
