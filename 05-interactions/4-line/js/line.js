async function drawLineChart() {

  // 1. Access data
  const pathToJSON = '../../data/nyc_weather_data.json'
  let dataset = await d3.json(pathToJSON)

  const yAccessor = d => d.temperatureMax
  const dateParser = d3.timeParse("%Y-%m-%d")
  const xAccessor = d => dateParser(d.date)
  dataset = dataset.sort((a, b) => xAccessor(a) - xAccessor(b)).slice(0, 100)

  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  // 3. Draw canvas

  const wrapper = d3.select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
    .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

  bounds.append("defs").append("clipPath")
    .attr("id", "bounds-clip-path")
    .append("rect")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight)

  const clip = bounds.append("g")
    .attr("clip-path", "url(#bounds-clip-path)")

  // 4. Create scales

  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])

  // const freezingTemperaturePlacement = yScale(32)
  // Define a custom value for freezing using the Seattle weather dataset
  const freezingTemperaturePlacement = yScale(65)

  const freezingTemperatures = clip.append("rect")
    .attr("class", "freezing")
    .attr("x", 0)
    .attr("width", d3.max([0, dimensions.boundedWidth]))
    .attr("y", freezingTemperaturePlacement)
    .attr("height", d3.max([0, dimensions.boundedHeight - freezingTemperaturePlacement]))

  const xScale = d3.scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])

  // 5. Draw data

  const lineGenerator = d3.line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)))

  const line = clip.append("path")
    .attr("class", "line")
    .attr("d", lineGenerator(dataset))

  // 6. Draw peripherals

  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)

  const yAxis = bounds.append("g")
    .attr("class", "y-axis")
    .call(yAxisGenerator)

  const yAxisLabel = yAxis.append("text")
    .attr("class", "y-axis-label")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 10)
    .html("Minimum Temperature (&deg;F)")

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)

  const xAxis = bounds.append("g")
    .attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .call(xAxisGenerator)

  // 7. Set up interactions
  const listeningRect = bounds.append("rect")
    .attr("class", "listening-rect")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight)
    .on("mousemove", onMouseMove)
    .on("mouseleave", onMouseLeave);

  const tooltip = d3.select('#tooltip');
  function onMouseMove(e, d) {
    const mousePos = d3.pointer(e)
    const hoveredDate = xScale.invert(mousePos[0])
    const formatDate = d3.timeFormat("%B %A %-d, %Y")
    tooltip.select("#date")
      .text(formatDate(hoveredDate))
    // console.log(hoveredDate);
    const getDistanceFromHoveredDate = d => Math.abs(
      xAccessor(d) - hoveredDate)
    const closestIndex = d3.leastIndex(dataset, (a, b) => (
      getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
    ))
    // console.log(closestIndex);
    const closestDataPoint = dataset[closestIndex]
    // console.log(closestDataPoint);
    const closestXValue = xAccessor(closestDataPoint)
    const closestYValue = yAccessor(closestDataPoint)
    // console.log(closestXValue);
    // console.log(closestYValue);
    const formatTemperature = d => `${d3.format(".1f")(d)}°F`
    tooltip.select("#temperature")
      .html(formatTemperature(closestYValue))
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
