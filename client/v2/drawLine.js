// https:ghenshaw-work.medium.com/customizing-axes-in-d3-js-99d58863738b
function drawLine() {
  const data = plotState.data;

  const colors = d3.schemeCategory10;
  const zScale = d3.scaleOrdinal(colors);

  // Y values
  const ys = data.map(o => o.value);

  lines = Array.from(d3.group(data, d => d[plotState.ordinal]),
                     ([ordinal, values]) => ({ordinal, values}));

  // NOTE: We assume all series are of the same length.
  const xData = lines[0].values.map(o => o[plotState.xAxis]);
  const xs = [...Array(xData.length).keys()];

  // TODO: Fix responsiveness with viexBox
  const svg = d3.select("#chart").append("svg")
                .attr("id", "d3-chart")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let xScale = d3.scaleLinear()
                 .domain([0, xs.length - 1])
                 .range([0, width]);

  let xAxisGenerator = d3.axisBottom(xScale)
                         .ticks(xs.length)
                         .tickValues(xs)
                         .tickFormat((e, i) => xData[i]);

  // NOTE: Sticky zero?
  let yScale = d3.scaleLinear()
                 .domain([0, d3.max(ys)])
                 .range([height, 0]);

  let yAxisGenerator = d3.axisLeft(yScale);

  var tooltip = d3.select("body").append("div")
                  .attr("id", "d3-tooltip")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

  var line = d3.line()
               .x((d, i) => xScale(i))
               .y(d => yScale(d.value));

  // Generate the plot
  svg.append("g")
     .call(xAxisGenerator)
     .attr("class", "x-axis")
     .attr("transform", "translate(0," + height + ")") // lower the axis
     .selectAll("text")
     .style("text-anchor", "start")
     .attr("dx", ".8em")
     .attr("dy", "-5px")
     .attr("transform", "rotate(90)")

  svg.append("g")
     .call(yAxisGenerator)
     .attr("class", "y-axis")
     .call(g => g.append("text")
                 .attr("x", -margin.left / 2)
                 .attr("y", -margin.top / 2)
                 .attr("fill", "currentColor")
                 .attr("text-anchor", "start")
                 .text("Run time (s)"));

  lines.forEach((l, i) => {
    svg.append("path")
       .data([l.values])
       .attr("class", "line")
       .style("stroke", zScale(i))
       .attr("d", line);

    // Add the scatterplot
    // TODO: Make dots invisible for tooltip
    svg.selectAll("dot")
       .data(l.values)
       .enter()
       .append("circle")
       .attr("class", "dot")
       .attr("cx", (d, i) => xScale(i))
       .attr("cy", d => yScale(d.value))
    // Tooltip contents
      .on("mouseover", (event, d) => {
        tooltip.transition()
               .duration(200)
               .style("opacity", .9);
        tooltip.html(`Benchmark: ${d.benchmark}<br /><br />Commit: ${d.commit}<br /><br />Value: ${d.value}`)
               .style("left", (event.pageX) + "px")
               .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", d => {
        tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });
  });

  // Legend
  svg.selectAll("legendMarks")
     .data(lines)
     .enter()
     .append("rect")
     .attr("x", width + 10)
     .attr("y", (d, i) => margin.top + i * 25)
     .attr("width", 10)
     .attr("height", 10)
     .style("fill", (d, i) => zScale(i));

  svg.selectAll("legendLabels")
     .data(lines)
     .enter()
     .append("text")
     .attr("x", width + 30)
     .attr("y", (d, i) => margin.top + i * 25 + 5)
     .style("fill", "currentColor")
     .text(d => d.ordinal)
     .attr("text-anchor", "left")
     .style("alignment-baseline", "middle")
}
