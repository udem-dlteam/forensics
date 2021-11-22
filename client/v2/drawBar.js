// https:ghenshaw-work.medium.com/customizing-axes-in-d3-js-99d58863738b
function drawBar() {
  const data = plotState.data;

  const colors = d3.schemeCategory10;

  const xs = d3.map(data, o => o[plotState.xAxis]);
  const ys = d3.map(data, o => o.value);
  const zs = d3.map(data, o => o[plotState.ordinal]);

  // Keep only unique values
  const xDomain = new d3.InternSet(xs);
  const zDomain = new d3.InternSet(zs);
  const yDomain = [0, d3.max(ys)];

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
     .call(yAxis)
     .attr("class", "y-axis")
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
                 .attr("height", i => yScale(0) - yScale(ys[i]))
                 .attr("fill", i => zScale(zs[i]))
                 .on("mouseover", (event, i) => {
                   tooltip.transition()
                          .duration(200)
                          .style("opacity", .9);
                   tooltip.html(`Benchmark: ${data[i].benchmark}<br /><br />Commit: ${data[i].commit}<br /><br />Value: ${data[i].value}`)
                          .style("left", (event.pageX) + "px")
                          .style("top", (event.pageY - 28) + "px");
                 })
                 .on("mouseout", d => {
                   tooltip.transition()
                          .duration(500)
                          .style("opacity", 0);
                 })

  svg.append("g")
     .call(xAxis)
     .attr("class", "x-axis")
     .attr("transform", "translate(0," + height + ")") // lower the axis
     .selectAll("text")
     .style("text-anchor", "start")
     .attr("dx", ".8em")
     .attr("dy", "-5px")
     .attr("transform", "rotate(90)");

  // Legend
  svg.selectAll("legendMarks")
     .data(zDomain)
     .enter()
     .append("rect")
     .attr("x", width + 10)
     .attr("y", (d, i) => margin.top + i * 25)
     .attr("width", 10)
     .attr("height", 10)
  // .attr("r", 7)
    .style("fill", zScale);

  svg.selectAll("legendLabels")
     .data(zDomain)
     .enter()
     .append("text")
     .attr("x", width + 30)
     .attr("y", (d, i) => margin.top + i * 25 + 5)
     .style("fill", "currentColor")
     .text(d => d)
     .attr("text-anchor", "left")
     .style("alignment-baseline", "middle")
}
