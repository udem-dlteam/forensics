// https:ghenshaw-work.medium.com/customizing-axes-in-d3-js-99d58863738b
function drawLine() {
  const data = plotState.data;

  const colors = d3.schemeCategory10;
  const zScale = d3.scaleOrdinal(colors);

  const ys = data.map(o => o.value);
  const zs = d3.map(data, o => o[plotState.ordinal]);

  lines = Array.from(d3.group(data, d => d[plotState.ordinal]),
                     ([ordinal, values]) => ({ordinal, values}));

  // Break each line into segments, keeping proper indices
  // in order to properly color and identify each segment
  lines.forEach((line, line_idx) => {
    var between_segments = false;
    var segments = [{color: line_idx, values: []}];
    var segment_idx = 0;
    line.values.forEach((obj, value_idx) => {
      var val = obj.value;
      // Null values are segment delimiters
      if (val === 0) {
        // Increase segment count if not already in a segment
        if (!between_segments) {
          segment_idx++;
          segments.push({color: line_idx, values: []});
        }
        between_segments = true;
        return;
      } else {
        between_segments = false;
      }
      segments[segment_idx].values.push({y: val, x: value_idx})
    });
    line.segments = segments;
  });

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

  let yAxisGenerator = d3.axisLeft(yScale).tickSize(-width);

  var tooltip = d3.select("body").append("div")
                  .attr("id", "d3-tooltip")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

  var line = d3.line()
               .x(d => xScale(d.x))
               .y(d => yScale(d.y));

  // Generate the plot
  svg.append("g")
     .call(xAxisGenerator)
     .attr("class", "x-axis")
     .attr("transform", "translate(0," + height + ")") // lower the axis
     .selectAll("text")
     .style("text-anchor", "start")
     .style("font-size", () => {
       var len = ys[0].length;
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
     .attr("transform", "rotate(90)")

  svg.append("g")
     .call(yAxisGenerator)
     .call(g => g.select(".domain").remove()) // Remove top tick line
     .attr("class", "y-axis")
     .call(g => g.append("text")
                 .attr("x", -margin.left / 2)
                 .attr("y", -margin.top / 2)
                 .attr("fill", "currentColor")
                 .attr("text-anchor", "start")
                 .text(() => {
                   if (plotState.reference) {
                     return "Run time ratio (s)";
                   } else {
                     return "Run time (s)";
                   }
                 }));

  // Add the lines
  svg.selectAll("lines")
     .data(lines)
     .enter()
     .append("g")
     .selectAll("segments")
     .data(l => l.segments)
     .enter()
     .append("path")
     .attr("class", "line")
     .style("stroke", d => {
       return zScale(d.color);
     })
     .attr("d", d => line(d.values))

  // Add the dots
  svg.selectAll("dots")
     .data(lines)
     .enter()
     .append("g")
     .selectAll("dot")
     .data(l => l.values)
     .enter()
     .append("circle")
     .attr("class", d => {
       if (d.value !== 0) {
         return "dot";
       } else {
         // Hide null values
         return "hidden";
       }
     })
     .attr("cx", (d, i) => xScale(i))
     .attr("cy", d => yScale(d.value))
     .on("mouseover", (event, i) => {
       tooltip.transition()
              .duration(200)
              .style("opacity", .9);
       tooltip.html(`Benchmark: ${i.benchmark}<br /><br />Commit: ${i.commit}<br /><br />Value: ${i.value}`)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px");
     })
     .on("mouseout", d => {
       tooltip.transition()
              .duration(500)
              .style("opacity", 0);
     })
     .on("click", (event, i) => {
       ref = i.commit;
       // Either clear or set the reference commit
       if (plotState.reference === ref) {
         unsetReference();
       } else {
         setReference(ref);
       }
       updatePlotState();
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
     .attr("x", width + 25)
     .attr("y", (d, i) => margin.top + i * 25 + 5)
     .style("fill", "currentColor")
     .text(d => d.ordinal)
     .attr("text-anchor", "left")
     .style("alignment-baseline", "middle")

}
