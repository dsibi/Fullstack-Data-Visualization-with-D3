async function drawLineChart() {
    // 1. Access data
    const dataset = await d3.json("./data/nyc_weather_data.json");
    // 2. Accessor's Functions
    // 2a. Convert the string into a JavaScript Date
    const dateParser = d3.timeParse('%Y-%m-%d');
    const xAccessor = d => dateParser(d.date);
    const yAccessor = d => d.temperatureMax;
    // 3. Draw chart
    let dimensions = {
        width: window.innerWidth * .9,
        height: 400,
        color: '#777799',
        margin: {
            top: 15,
            right: 15,
            bottom: 40,
            left: 60
        }
    };
    dimensions.boundedWidth = dimensions.width
        - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight = dimensions.height
        - dimensions.margin.top - dimensions.margin.bottom
    // 4. Create workspace
    const wrapper = d3.select('#wrapper')
        // 5. Add SVG element
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);
    // 6.Creation of bounding box
    const bounds = wrapper.append('g')
        .style("transform", `translate(${dimensions.margin.left}px,
            ${dimensions.margin.top}px)`);
    // 6. Creation of scales
    const yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, yAccessor))
        .range([dimensions.boundedHeight, 0]);
    const freezePoint = yScale(32)
    const freezeTemp = bounds.append('rect')
        .attr('x', 0)
        .attr('width', dimensions.boundedWidth)
        .attr('y', freezePoint)
        .attr('height', dimensions.boundedHeight - freezePoint)
        .attr('fill', '#e0f3f3');
    const xScale = d3.scaleTime()
        .domain(d3.extent(dataset, xAccessor))
        .range([0, dimensions.boundedWidth]);
    // 7. Drawing the chart
    const lineDrawer = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor(d)));
    const line = bounds.append('path')
        .attr('d', lineDrawer(dataset))
        .attr('fill', 'none')
        .attr('stroke', '#af9358')
        .attr('stroke-width', 2);
    // 8. Drawing the axes
    const yAxisDrawer = d3.axisLeft()
        .scale(yScale);
    const yAxis = bounds.append('g')
        .call(yAxisDrawer);
    const xAxisDrawer = d3.axisBottom()
        .scale(xScale);
    const xAxis = bounds.append('g')
        .call(xAxisDrawer)
        .style('transform', `translateY(${dimensions.boundedHeight}px)`);
    // console.log(xScale(10));
}

drawLineChart();