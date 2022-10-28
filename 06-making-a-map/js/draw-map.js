async function draw() {

    // 1. Access data
    const countryShapes = await d3.json("./data/world-geojson.json");
    const dataset = await d3.csv("./data/world_bank_data.csv");
    // console.log(dataset);
    const countryNameAccessor = d => d.properties["NAME"];
    const countryIdAccessor = d => d.properties["ADM0_A3_IS"];
    const metric = "Population growth (annual %)";

    let metricDataByCountry = {};
    dataset.forEach(d => {
        if (d['Series Name'] == metric) {
            metricDataByCountry[d['Country Code']] = d['2021 [YR2021]'] || 0
        }
    });
    // console.log(metricDataByCountry);

    // 2. Chart dimensions
    let dimensions = {
        width: window.innerWidth * 0.9,
        margin: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10,
        },
    };
    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;

    const sphere = ({ type: "Sphere" });
    const projection = d3.geoEqualEarth()
        .fitWidth(dimensions.boundedWidth, sphere);
    const pathGenerator = d3.geoPath(projection);
    const [[x0, y0], [x1, y1]] = pathGenerator.bounds(sphere);
    // console.log(pathGenerator(sphere));
    // console.log(pathGenerator.bounds(sphere));
    dimensions.boundedHeight = y1;
    dimensions.height = dimensions.boundedHeight + dimensions.margin.top + dimensions.margin.bottom;

    // 3. Draw canvas
    const wrapper = d3.select('#wrapper')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);

    const bounds = wrapper.append('g')
        .style('transform', `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);

    // 4. Create scales
    const metricValues = Object.values(metricDataByCountry);
    const metricValueExtent = d3.extent(metricValues);
    // console.log(-metricValueExtent[0]);
    const maxChange = d3.max([-metricValueExtent[0], metricValueExtent[1]])
    // console.log(maxChange);
    const colorScale = d3.scaleLinear()
        .domain([-maxChange, 0, maxChange])
        .range(['indigo', 'white', 'darkgreen']);

    // 5. Draw data
    const earth = bounds.append('path')
        .attr('class', 'earth')
        .attr('d', pathGenerator(sphere));
    const graticuleJson = d3.geoGraticule10();
    const graticule = bounds.append('path')
        .attr('class', 'graticule')
        .attr('d', pathGenerator(graticuleJson));
    const countries = bounds.selectAll('.country')
        .data(countryShapes.features)
        .enter()
        .append("path")
        .attr('class', d => ["country", countryIdAccessor(d)].join(" "))
        //.attr("d", pathGenerator) is the same as .attr("d", d => pathGenerator(d))
        .attr('d', pathGenerator)
        .attr("fill", d => {
            const metricValue = metricDataByCountry[countryIdAccessor(d)] || 0
            return colorScale(metricValue)
        });
    // //voronoi
    // const delaunay = d3.Delaunay.from(
    //     dataset,
    //     d => xScale(xAccessor(d)),
    //     d => yScale(yAccessor(d))
    // );
    // const voronoiGenerator = delaunay.voronoi()
    //     .x(d => pathGenerator.centroid(d)[0])
    //     .y(d => pathGenerator.centroid(d)[1])
    //     .extent([
    //         [0, 0],
    //         [dimensions.boundedWidth, dimensions.boundedHeight]
    //     ]);

    // const voronoiPolygons = voronoiGenerator.polygons(countryShapes.features);

    // const voronoi = bounds.selectAll(".voronoi")
    //     .data(voronoiPolygons)
    //     .enter().append("polygon")
    //     .attr("class", "voronoi")
    //     .attr("points", (d = []) => (
    //         d.map(point => (
    //             point.join(",")
    //         )).join(" ")
    //     ));

    // 6. Draw peripherals
    // Map legend
    const legendGroup = wrapper.append('g')
        .attr(
            'transform',
            `translate(${120},${dimensions.width < 800
                ? dimensions.boundedHeight - 30
                : dimensions.boundedHeight * 0.5
            })`
        );
    const legendTitle = legendGroup.append('text')
        .attr('y', -23)
        .attr('class', 'legend-title')
        .text('Population growth');
    const legendByline = legendGroup.append('text')
        .attr('y', -9)
        .attr('class', 'legend-byline')
        .text('Percent change in 2021');
    const defs = wrapper.append('defs');
    const legendGradientId = 'legend-gradient';
    const gradient = defs.append('linearGradient')
        .attr('id', legendGradientId)
        .selectAll('stop')
        .data(colorScale.range())
        .enter()
        .append('stop')
        .attr('stop-color', d => d)
        // 2 is one less than the number of items in our array (3 - 1)
        .attr('offset', (d, i) => `${(i * 100) / 2}%`);
    const legendWidth = 120;
    const legendHeight = 16;
    const legendGradient = legendGroup.append('rect')
        .attr('x', -legendWidth / 2)
        .attr('height', legendHeight)
        .attr('width', legendWidth)
        .style('fill', `url(#${legendGradientId})`);
    const legendValueRight = legendGroup.append('text')
        .attr('class', 'legend-value')
        .attr('x', legendWidth / 2 + 10)
        .attr('y', legendHeight / 2)
        .text(`${d3.format('.1f')(maxChange)}%`);
    const legendValueLeft = legendGroup.append('text')
        .attr('class', 'legend-value')
        .attr('x', -legendWidth / 2 - 10)
        .attr('y', legendHeight / 2)
        .text(`${d3.format('.1f')(-maxChange)}%`)
        .style('text-anchor', 'end');

    // 7. Set up interactions
    countries.on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave);
    const tooltip = d3.select("#tooltip");
    function onMouseEnter(e, d) {
        tooltip.style("opacity", 1)
        const metricValue = metricDataByCountry[countryIdAccessor(d)]
        tooltip.select("#country").text(countryNameAccessor(d))
        tooltip.select("#value").text(`${d3.format(",.2f")(metricValue || 0)}`)
        const [centerX, centerY] = pathGenerator.centroid(d)
        const x = centerX + dimensions.margin.left
        const y = centerY + dimensions.margin.top

        tooltip.style("transform", `translate(`
            + `calc( -0% + ${x}px),`
            + `calc(-50% + ${y}px)`
            + `)`)
    };
    function onMouseLeave() {
        tooltip.style("opacity", 0);
    };
}

draw();