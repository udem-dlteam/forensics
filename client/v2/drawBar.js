// https:ghenshaw-work.medium.com/customizing-axes-in-d3-js-99d58863738b
function drawBar() {
  const data = plotState.data;

  const colors = d3.schemeCategory10;

  // The domain should extend up to the maximum "maximum" value
  var yMax = d3.max(data.map(o => o.max));

  const xs = d3.map(data, o => o[plotState.xAxis]);
  const ys = d3.map(data, o => o.mean);
  const zs = d3.map(data, o => o[plotState.ordinal]);

  // Keep only unique values
  const xDomain = new d3.InternSet(xs);
  const zDomain = new d3.InternSet(zs);

  // Handle sticky zero
  // const yMax = Math.ceil(10 * (mean + stddev)) / 10;
  if (plotState.stickyZero) {
    // Draw scales up to ceiling of decimal place
    var yDomain = [0, yMax];
  } else {
    yDomain = [0.85 * d3.min(ys, d => d || Infinity), // Ignore zero values in scaling
               yMax]; // Keep space to show all bars
  }

  // Full scale
  const xScale = d3.scaleBand(xDomain, [0, width]).paddingInner(0.1);
  // Sub scale
  const xzScale = d3.scaleBand(zDomain, [0, xScale.bandwidth()]).padding(0.2);
  const yScale = d3.scaleLinear(yDomain, [height, 0]);
  // Colors per ordinal
  const zScale = d3.scaleOrdinal(zDomain, colors);
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 60);

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
                 .text("Run time (s)"));

  const bar = svg.append("g")
                 .selectAll("rect")
                 .data(I)
                 .join("rect")
                 .attr("class", "bar")
                 .attr("x", i => xScale(xs[i]) + xzScale(zs[i]))
                 .attr("y", i => yScale(ys[i]))
                 .attr("width", xzScale.bandwidth())
                 .attr("height", i => yScale(yDomain[0]) - yScale(ys[i]))
                 .attr("fill", i => {
                   var ref = plotState.reference;
                   // Properly select commit based on x axis
                   if (plotState.xAxis === "commit") {
                     var c = xs[i];
                   } else if (plotState.xAxis === "benchmark") {
                     c = zs[i];
                   }
                   // Color the reference for easier identification
                   if ((plotState.commits.length > 1) && (ref && (c === ref))) {
                     return "#000000";
                   }
                   return zScale(zs[i]);
                 })
                 .on("mouseover", (event, i) => {
                   tooltip.transition()
                          .duration(200)
                          .style("opacity", .9);
                   tooltip.html(`Benchmark: ${data[i].benchmark}<br /><br />Commit: ${data[i].commit}<br /><br />Mean: ${data[i].mean}`)
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
       var len = ys.length;
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

  // Legend
  svg.selectAll("legendMarks")
     .data(zDomain)
     .enter()
     .append("rect")
     .attr("x", width + 85)
     .attr("y", (d, i) => margin.top + i * 25)
     .attr("width", 10)
     .attr("height", 10)
    .style("fill", zScale);

  svg.selectAll("legendLabels")
     .data(zDomain)
     .enter()
     .append("text")
     .attr("x", width + 100)
     .attr("y", (d, i) => margin.top + i * 25 + 5)
     .style("fill", "currentColor")
     .text(d => d)
     .attr("text-anchor", "left")
     .style("alignment-baseline", "middle")
}
