async function drawLineChart() {

  // 1. Access data
  const pathToJSON = '../../data/nyc_weather_data.json'
  let dataset = await d3.json(pathToJSON)

  const yAccessor = d => d.humidity
  const dateParser = d3.timeParse("%Y-%m-%d")
  const xAccessor = d => dateParser(d.date)
  let datasetDS = downsampleData(dataset, xAccessor, yAccessor);
  // console.log(dataset);
  // console.log(datasetDS);

  // console.log(dateParser(dataset[0].date));
  // console.log(typeof dateParser(dataset[0].date));

  // 2. Create chart dimensions
  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
    margin: {
      top: 35,
      right: 15,
      bottom: 40,
      left: 60,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  // 3. Draw canvas
  const wrapper = d3.select("#wrapper");

  const bounds = wrapper.append("g")
    .attr("class", "graph")
    .append("svg")
    .attr("class", "graph1")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)
    .append("g")
    .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

  const boundsLegend = wrapper.append("g")
    .attr("class", "legend")
    .append("svg")
    .attr("class", "legend1")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)
    .append("g")
    // .style("transform", `translate(${dimensions.margin.left / 2 - 10}px, ${dimensions.margin.top}px)`)

  bounds.append("defs").append("clipPath")
    .attr("id", "bounds-clip-path")
    .append("rect")
    .attr("width", dimensions.boundedWidth - 10)
    .attr("height", dimensions.boundedHeight)

  const clip = bounds.append("g")
    .attr("clip-path", "url(#bounds-clip-path)")

  // 4. Create scales
  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice()

  const xScale = d3.scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth - 10])
    .nice()

  //Color scale
  const seasonNames = ["Spring", "Summer", "Fall", "Winter"]
  var colorScale = d3.scaleOrdinal()
    .domain(seasonNames)
    .range(d3.schemeSet2);

  // 5. Draw data
  const seasonBoundaries = [
    "3-01", // Spring starts on March 20th of every year
    "6-01", // Summer starts on June 21st of every year
    "9-01", // Fall starts on September 21st of every year
    "12-01",  // Winter starts on December 21st of every year
  ];
  // Season name here correlates to the appropriate start date in seasonBoundaries

  let seasonsData = []
  // Identify the start and end dates of our dataset
  const startDate = xAccessor(dataset[0])
  const endDate = xAccessor(dataset[dataset.length - 1])
  // Identify specific years contained within our dataset
  const years = d3.timeYears(d3.timeMonth.offset(startDate, -13), endDate)
  years.forEach(yearDate => { // For each year in our dataset
    const year = +d3.timeFormat("%Y")(yearDate) // 2019
    // For each of our defined season boundaries
    seasonBoundaries.forEach((boundary, index) => {
      // Identify the start and end of our season for the year
      const seasonStart = dateParser(`${year}-${boundary}`)
      const seasonEnd = seasonBoundaries[index + 1] ?
        dateParser(`${year}-${seasonBoundaries[index + 1]}`) :
        dateParser(`${year + 1}-${seasonBoundaries[0]}`)
      // Which is greater? Our dataset start date, or the start of the season for the year?
      const boundaryStart = d3.max([startDate, seasonStart])
      // Which is greater? Our dataset end date, or the end of the season for the year?
      const boundaryEnd = d3.min([endDate, seasonEnd])
      // console.log(boundaryStart);
      // Identify the days in our dataset that match this season's boundary
      const days = dataset.filter(d => xAccessor(d) > boundaryStart && xAccessor(d) <= boundaryEnd)
      if (!days.length) return
      seasonsData.push({
        start: boundaryStart,
        end: boundaryEnd,
        name: seasonNames[index],
        mean: d3.mean(days, yAccessor),
      })
      // console.log(seasonsData);
    })
  });
  // console.log(seasonsData);
  const seasons = bounds.selectAll(".season")
    .data(seasonsData)
    .enter().append("rect")
    .attr("x", d => xScale(d.start))
    .attr("width", d => xScale(d.end) - xScale(d.start))
    .attr("y", 0)
    .attr("height", dimensions.boundedHeight)
    .attr("class", d => `season ${d.name}`)
    .style("fill", d => colorScale(d.name))
    .style("opacity", .3);

  const lineGenerator = d3.line()
  .x(function (d) {
    console.log(typeof xScale(xAccessor(d)))
    return xScale(xAccessor(d))
  })
    .y(d => yScale(yAccessor(d)))
    .curve(d3.curveCatmullRom.alpha(.5));
  // .curve(d3.curveBasis);

  const line = clip.append("path")
    .attr("class", "line")
    .attr("d", lineGenerator(datasetDS))

  const dots = bounds.selectAll(".dot")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(xAccessor(d)))
    .attr("cy", d => yScale(yAccessor(d)))
    .attr("r", 2)
    .attr("class", "dot")

  // 6. Draw peripheralss
  const seasonMeans = bounds.selectAll(".season-mean")
    .data(seasonsData)
    .enter().append("line")
    .attr("x1", d => xScale(d.start))
    .attr("x2", d => xScale(d.end))
    .attr("y1", d => yScale(d.mean))
    .attr("y2", d => yScale(d.mean))
    .attr("class", "season-mean")
  const seasonMeanLabel = bounds.append("text")
    .attr("x", 5)
    .attr("y", yScale(seasonsData[0].mean)-6)
    .attr("class", "season-mean-label")
    .text("season mean")

  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)
    .ticks(4)

  const yAxis = bounds.append("g")
    .attr("class", "y-axis")
    .call(yAxisGenerator)

  const yAxisLabel = yAxis.append("text")
    .attr("class", "y-axis-label")
    .attr("x", 110)
    .attr("y", -3)
    .html("Realtive Humidity")

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)

  const xAxis = bounds.append("g")
    .attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .call(xAxisGenerator)

  //add legend
  // Add one dot in the legend for each name.
  var size = 10
  boundsLegend.selectAll("mydots")
    .data(seasonNames)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", function (d, i) { return 50 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function (d) { return colorScale(d) })
    .attr("class", "rect")
    .style("opacity", .5);

  // Add one dot in the legend for each name.
  boundsLegend.selectAll("mylabels")
    .data(seasonNames)
    .enter()
    .append("text")
    .attr("class", "mylabels")
    .attr("x", size * 1.5)
    .attr("y", function (d, i) { return 50 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) { return colorScale(d) })
    .text(function (d) { return d })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

  // const seasonLabels = bounds.selectAll(".season-label")
  //   .data(seasonsData)
  //   .enter().append("text")
  //   // .filter(d => xScale(d.end) - xScale(d.start) > 60)
  //   .attr("x", d => xScale(d.start) + ((xScale(d.end) - xScale(d.start)) / 2))
  //   .attr("y", dimensions.boundedHeight - 20)
  //   .text(d => `${d.name} ${d3.timeFormat("%Y")(d.end)}`) // Season name with year (e.g. "Spring 2018")
  //   .attr("class", "season-label");

  // 7. Set up interactions
  const listeningRect = bounds.append("rect")
    .attr("class", "listening-rect")
    .attr("width", dimensions.boundedWidth - 10)
    .attr("height", dimensions.boundedHeight)
    .on("mousemove", onMouseMove)
    .on("mouseleave", onMouseLeave);

  const tooltip = d3.select('#tooltip');
  function onMouseMove(e, d) {
    const mousePos = d3.pointer(e)
    const hoveredDate = xScale.invert(mousePos[0])
    const getDistanceFromHoveredDate = d => Math.abs(
      xAccessor(d) - hoveredDate)
    const closestIndex = d3.leastIndex(datasetDS, (a, b) => (
      getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
    ))
    // console.log(closestIndex);
    const closestDataPoint = datasetDS[closestIndex]
    // console.log(closestDataPoint);
    const closestXValue = xAccessor(closestDataPoint)
    const closestYValue = yAccessor(closestDataPoint)
    // console.log(closestXValue);
    // console.log(closestYValue);
    const formatDate = d3.timeFormat("%B %A %-d, %Y")
    tooltip.select("#date")
      .text(formatDate(closestXValue))
    // console.log(xScale.invert(498));
    const formatHumidity = d => `${d3.format(".1f")(d)}`
    tooltip.select("#humidity")
      .html(formatHumidity(closestYValue))
    const x = xScale(closestXValue)
      + dimensions.margin.left
    const y = yScale(closestYValue)
      + dimensions.margin.top
    tooltip.style("transform", `translate(`
      + `calc( -50% + ${x}px),`
      + `calc(-100% + ${y}px)`
      + `)`)
    tooltipCircle
      .attr("cx", xScale(closestXValue))
      .attr("cy", yScale(closestYValue))
      .style("opacity", 1)
    tooltip.style('opacity', 1);
  };

  function onMouseLeave() {
    tooltip.style("opacity", 0)
    tooltipCircle.style("opacity", 0)
  };
  const tooltipCircle = bounds.append("circle")
    .attr("r", 4)
    .attr("stroke", "#af9358")
    .attr("fill", "white")
    .attr("stroke-width", 2)
    .style("opacity", 0)
}
drawLineChart()

function downsampleData(data, xAccessor, yAccessor) {
  const weeks = d3.timeWeeks(xAccessor(data[0]), xAccessor(data[data.length - 1]))

  return weeks.map((week, index) => {
    const weekEnd = weeks[index + 1] || new Date()
    const days = data.filter(d => xAccessor(d) > week && xAccessor(d) <= weekEnd)
    return {
      date: d3.timeFormat("%Y-%m-%d")(week),
      humidity: d3.mean(days, yAccessor),
    }
  })
};