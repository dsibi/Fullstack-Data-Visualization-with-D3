async function createEvent() {
    const rectColors = ['yellowgreen', 'cornflowerblue', 'seagreen', 'slateblue']

    d3.select('#svg')
        .selectAll('.rect')
        .data(rectColors)
        .enter()
        .append('rect')
        .attr('height', 100)
        .attr('width', 100)
        .attr('x', (d, i) => i * 110)
        .attr('fill', 'lightgrey')
        .on('mouseover', (event, d) => {
            d3.select(event.currentTarget).style('fill', d)
        })
        .on('mouseout', (event) => {
            d3.select(event.currentTarget).style('fill', 'lightgrey')
        })
}
createEvent()