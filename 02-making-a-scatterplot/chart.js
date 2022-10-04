//1. Access data
async function drawChart() {
    const dataset = await d3.json('../data/nyc_weather_data.json');
    const xAccessor = d => d.dewPoint;
    const yAccessor = d => d.humidity * 100;
    const colorAccessor = d => d.cloudCover;
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
    // dataset.forEach(d => {
    //     bounds.append('circle')
    //         .attr('cx', xScale(xAccessor(d)))
    //         .attr('cy', yScale(yAccessor(d)))
    //         .attr('r', 5)
    //         .attr("fill", "cornflowerblue");
    // });
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
    // function drawDots(dataset, color) {
    //     let dots = bounds.selectAll('circle')
    //         .data(dataset)
    //     dots.join('circle')
    //         .attr('cx', d => xScale(xAccessor(d)))
    //         .attr('cy', d => yScale(yAccessor(d)))
    //         .attr('r', 5)
    //         .attr("fill", color);
    // };
    // drawDots(dataset.slice(0, 50), "darkgrey");
    // setTimeout(() => {
    //     drawDots(dataset, "cornflowerblue")
    // }, 1000)

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
}

drawChart();