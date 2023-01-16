async function getData() {
    const pathToData = './data/radar.csv';
    let dataset = await d3.dsv(";", pathToData);
    return dataset;
};

// group the data
let group_the_data = (dataset) => {
    let judges = Array.from(
        d3.group(dataset, d => d.judge_name), ([key, value]) => ({ key, value })
    );
    return judges;
};

const NUM_OF_SIDES = 7;
NUM_OF_LEVEL = 10,
    size = Math.min(window.innerWidth, window.innerHeight, 300),
    offset = Math.PI,
    polyangle = (Math.PI * 2) / NUM_OF_SIDES,
    r = 0.8 * size,
    r_0 = r / 2,
    center =
    {
        x: size / 2,
        y: size / 2
    };

const tooltip = d3.select(".tooltip");

const genTicks = levels => {
    const ticks = [];
    const step = 10 / levels;
    for (let i = -5; i <= levels/2; i++) {
        const num = step * i;
        if (Number.isInteger(step)) {
            ticks.push(num);
        }
        else {
            ticks.push(num.toFixed(2));
        }
    }
    return ticks;
};

const ticks = genTicks(NUM_OF_LEVEL);

const createSVG = (dataset) => {
    const skater_name = d3.select(".skater_name")
            .text(dataset[0].value[0].name_rus)
    for (let index = 0; index < 7; index++) {
        let element = index + 1;
        const svg = d3.select("#j" + element)
            .selectAll('svg')
            .data([dataset[index]])
            .enter()
            .append("svg")
            .attr("class", function (d) { return d.value[0].judge_id; })
            .attr("width", size)
            .attr("height", size);
        const judge_name = d3.select("#j" + element + " .judge_name")
            .text(dataset[index].key);
        const g = d3.select("svg." + dataset[index].value[0].judge_id)
            .append("g");
        const scale = d3.scaleLinear()
            .domain([-5, 5])
            .range([0, r_0])
            .nice();
        generateAndDrawLevels(g, NUM_OF_LEVEL, NUM_OF_SIDES);
        // generateAndDrawLines(NUM_OF_SIDES);
        drawAxis(g, ticks, NUM_OF_LEVEL);
        drawData(g, dataset[index].value, scale, NUM_OF_SIDES);
        drawLabels(g, dataset[index].value, NUM_OF_SIDES);
    }
};

const generatePoint = ({ length, angle }) => {
    const point =
    {
        x: center.x + (length * Math.sin(offset - angle)),
        y: center.y + (length * Math.cos(offset - angle))
    };
    return point;
};

const drawPath = (points, parent) => {
    const lineGenerator = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    parent.append("path")
        .attr("d", lineGenerator(points));
};

const generateAndDrawLevels = (g, levelsCount, sideCount) => {

    for (let level = 1; level <= levelsCount; level++) {
        const hyp = (level / levelsCount) * r_0;

        const points = [];
        for (let vertex = 0; vertex < sideCount; vertex++) {
            const theta = vertex * polyangle;

            points.push(generatePoint({ length: hyp, angle: theta }));

        }
        const group = g.append("g").attr("class", "levels");
        drawPath([...points, points[0]], group);
    }


};

const generateAndDrawLines = (sideCount) => {

    const group = g.append("g").attr("class", "grid-lines");
    for (let vertex = 1; vertex <= sideCount; vertex++) {
        const theta = vertex * polyangle;
        const point = generatePoint({ length: r_0, angle: theta });

        drawPath([center, point], group);
    }

};

const drawCircles = (g, points) => {
    const mouseEnter = d => {
        // console.log( d3.event );
        tooltip.style("opacity", 1);
        const { x, y } = d3.event;
        tooltip.style("top", `${y - 20}px`);
        tooltip.style("left", `${x + 15}px`);
        tooltip.text(d.value);
    };

    const mouseLeave = d => {
        tooltip.style("opacity", 0);
    };

    g.append("g")
        .attr("class", "indic")
        .selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", d => +d.x)
        .attr("cy", d => +d.y)
        .attr("r", 3)
    // .on( "mouseenter", mouseEnter )
    // .on( "mouseleave", mouseLeave );
};

const drawText = (text, point, isAxis, group) => {
    if (isAxis) {
        const xSpacing = text.toString().includes(".") ? 14 : 7;
        group.append("text")
            .attr("x", point.x - xSpacing)
            .attr("y", point.y + 5)
            .html(text);
    }
    else {
        group.append("text")
            .attr("x", point.x)
            .attr("y", point.y)
            .html(text);
    }

};

const drawData = (g, dataset, scale, n) => {
    const points = [];
    dataset.forEach((d, i) => {
        const len = scale(d.mark);
        const theta = i * (2 * Math.PI / n);
        points.push(
            {
                ...generatePoint({ length: len, angle: theta }),
                value: d.mark
            });
    });

    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const group = g
        .append("g").attr("class", "shape")
        .style("fill", function (d, i) {
            // console.log(d);
            return colorScale(i);
        })
        .style("fill-opacity", 0.35);

    drawPath([...points, points[0]], group);
    drawCircles(g, points);
};

const drawAxis = (g, ticks, levelsCount) => {
    const groupL = g.append("g").attr("class", "tick-lines");
    const point = generatePoint({ length: r_0, angle: 0 });
    // drawPath([center, point], groupL);

    const groupT = g.append("g").attr("class", "ticks");

    ticks.forEach((d, i) => {
        const r = (i / levelsCount) * r_0;
        const p = generatePoint({ length: r, angle: 0 });
        const points =
            [
                p,
                {
                    ...p,
                    x: p.x - 10
                }
            ];
        // drawPath(points, groupL);
        drawText(d, p, true, groupT);
    });
};

const drawLabels = (g, dataset, sideCount) => {
    const groupL = g.append("g").attr("class", "labels");
    for (let vertex = 0; vertex < sideCount; vertex++) {
        const angle = vertex * polyangle;
        const label = dataset[vertex].element_name;
        const point = generatePoint({ length: 0.9 * (size / 2), angle });
        drawText(label, point, false, groupL);
    }
};

getData().then((dataset) => {
    let result = group_the_data(dataset);
    createSVG(result);
});