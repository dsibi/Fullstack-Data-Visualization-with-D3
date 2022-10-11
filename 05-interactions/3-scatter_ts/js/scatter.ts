//1. Access data
async function drawChart() {
  const dataset:any = await d3.json('../../data/nyc_weather_data.json');
  function xAccessor(d: any) {return d.dewPoint};
  const yAccessor = (d: any) => d.humidity * 100;
  const colorAccessor = (d: any) => d.cloudCover;
  // console.log(dataset[0].humidity);
  // console.table(yAccessor(dataset[0]));

  //2. Create chart dimensions
  const width = d3.min([window.innerWidth * .9, window.innerHeight * .9]);
  // const width=Math.min(window.innerWidth*.9,window.innerHeight*.9);
  // console.log(width);
  const dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50
    }
  };
  // console.log(dimensions);
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.right - dimensions.margin.left;
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top - dimensions.margin.bottom;
  // console.log(dimensions.boundedWidth);

  //3. Draw canvas
  const wrapper = d3.select('#wrapper')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)
  const bounds = wrapper.append('g')
    .attr('class', 'chart')
    .style('transform', `translate(${dimensions.margin.left}px,
      ${dimensions.margin.top}px)`);

  //4. Create scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();
  // console.log(xScale(0));
  // console.log(xScale.domain())
  // console.log(xScale.range());
  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();
  // console.log(d3.extent(dataset, yAccessor))
  // console.log(yScale.domain())
  const colorScale = d3.scaleLinear()
    .domain(d3.extent(dataset, colorAccessor))
    .range(['skyblue', 'darkslategrey']);

  //5. Draw data
  let dots = bounds.selectAll('circle')
    // console.log(dots)
    .data(dataset)
    // console.log(dots._enter[0][0].__data__.time)
    // console.log(dots)
    .enter()
    // console.log(dots)
    .append('circle')
    // console.log(dots)
    .attr('cx', d => xScale(xAccessor(d)))
    .attr('cy', d => yScale(yAccessor(d)))
    .attr('r', 3)
    .attr("fill", d => colorScale(colorAccessor(d)));

  //voronoi
  const delaunay = d3.Delaunay.from(
    dataset,
    d => xScale(xAccessor(d)),
    d => yScale(yAccessor(d))
  )

  const voronoi = delaunay.voronoi()
  voronoi.xmax = dimensions.boundedWidth;
  voronoi.ymax = dimensions.boundedHeight;
  bounds.selectAll('.voronoi')
    .data(dataset)
    .enter()
    .append('path')
    .attr('class', 'voronoi')
    .attr('d', (d, i) => voronoi.renderCell(i))
    // .attr("stroke", "salmon")

  //6. Draw peripherals
  const axes = wrapper.append('g')
    .attr('class', 'axes')
    .style('transform', `translate(${dimensions.margin.left}px,
      ${dimensions.margin.top}px)`);
  const xAxisGenerator = d3.axisBottom()
    .scale(xScale);
  const xAxis = axes.append('g')
    .attr('class', 'xAxis')
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);
  // console.log(xAxis._groups[0]);
  const xAxisLabel = xAxis.append('text')
    .attr('x', dimensions.boundedWidth / 2)
    .attr('y', dimensions.margin.bottom - 10)
    .attr('fill', 'black')
    .style('font-size', '1.4em')
    .html('Dew Point, &deg;F');
  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)
    .ticks(4);
  const yAxis = axes.append('g')
    .attr('class', 'yAxis')
    .call(yAxisGenerator);
  const yAxisLabel = yAxis.append('text')
    .attr('x', -dimensions.boundedHeight / 2)
    .attr('y', -dimensions.margin.left + 15)
    .attr('fill', 'black')
    .style('font-size', '1.4em')
    .html('Humidity, %')
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle");
  // console.log(yAxisLabel._groups[0][0]);

  //7. Set up interactions
  const onMouseOut = () => {
    tooltip.style("opacity", 0)
    d3.selectAll(".tooltipDot").remove();
  }

  bounds.selectAll('.voronoi')
    .on('mouseover', onMouseOver)
    .on('mouseout', onMouseOut)

  const tooltip = d3.select('#tooltip')

  function onMouseOver(e, d) {
    const dayDot = bounds.append('circle')
      .attr('class', 'tooltipDot')
      .attr('cx', xScale(xAccessor(d)))
      .attr('cy', yScale(yAccessor(d)))
      .attr('r', 4)
      .style('fill', 'maroon')
      .style('pointer-events', 'none')
    const formatData = d3.format(".2f");
    tooltip.select("#humidity")
      .text(formatData(yAccessor(d)));
    tooltip.select("#dew-point")
      .text(formatData(xAccessor(d)));
    const dateParser = d3.timeParse('%Y-%m-%d');
    const formatDate = d3.timeFormat('%B %A %-d, %Y');
    tooltip.select("#date")
      .text(formatDate(dateParser(d.date)));
    const x = xScale(xAccessor(d)) + dimensions.margin.left;
    const y = yScale(yAccessor(d)) + dimensions.margin.top;
    tooltip.style("transform", `translate(`
      + `calc( -50% + ${x}px),`
      + `calc(-100% + ${y}px)`
      + `)`);
    tooltip.style("opacity", 1);
    ;
  }
}

drawChart();