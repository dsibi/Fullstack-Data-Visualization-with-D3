var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
//1. Access data
function drawChart() {
    return __awaiter(this, void 0, void 0, function () {
        var dataset, metricAccessor, yAccessor, width, dimensions, wrapper, bounds, xScale, binsGenerator, bins, yScale, binsGroup, binGroups, barPadding, barRects, barText, mean, meanLine, meanLabel, xAxisGenerator, xAxis, xAxisLabel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, d3.json('../data/nyc_weather_data.json')];
                case 1:
                    dataset = _a.sent();
                    metricAccessor = function (d) { return d.humidity; };
                    yAccessor = function (d) { return d.length; };
                    width = 600;
                    dimensions = {
                        width: width,
                        height: width * .6,
                        margin: {
                            top: 30,
                            right: 10,
                            bottom: 50,
                            left: 50
                        }
                    };
                    dimensions.boundedWidth = dimensions.width
                        - dimensions.margin.left - dimensions.margin.right;
                    dimensions.boundedHeight = dimensions.height
                        - dimensions.margin.top - dimensions.margin.bottom;
                    wrapper = d3.select('#wrapper')
                        .append('svg')
                        .attr('width', dimensions.width)
                        .attr('height', dimensions.height);
                    wrapper.attr("role", "figure")
                        .attr("tabindex", "0")
                        .append("title")
                        .text("Histogram looking at the distribution of humidity in 2016");
                    wrapper.selectAll("text")
                        .attr("role", "presentation")
                        .attr("aria-hidden", "true");
                    bounds = wrapper.append('g')
                        .attr('class', 'chart')
                        .style('transform', "translate(".concat(dimensions.margin.left, "px,\n            ").concat(dimensions.margin.top, "px)"));
                    xScale = d3.scaleLinear()
                        .domain(d3.extent(dataset, metricAccessor))
                        .range([0, dimensions.boundedWidth])
                        .nice();
                    binsGenerator = d3.histogram()
                        .domain(xScale.domain())
                        .value(metricAccessor)
                        // .thresholds([0, 0.2, 0.4, 0.6, 0.8, 1]);
                        .thresholds(12);
                    bins = binsGenerator(dataset);
                    yScale = d3.scaleLinear()
                        .domain([0, d3.max(bins, yAccessor)])
                        .range([dimensions.boundedHeight, 0])
                        .nice();
                    binsGroup = bounds.append('g')
                        .attr("tabindex", "0")
                        .attr("role", "list")
                        .attr("aria-label", "histogram bars");
                    binGroups = binsGroup.selectAll('g')
                        .data(bins)
                        .enter()
                        .append('g')
                        .attr("tabindex", "0")
                        .attr("role", "listitem")
                        .attr("aria-label", function (d) { return "There were ".concat(yAccessor(d), " days between ").concat(d.x0.toString().slice(0, 4), " and ").concat(d.x1.toString().slice(0, 4), " humidity levels."); });
                    barPadding = 1;
                    barRects = binGroups.append('rect')
                        .attr('x', function (d) { return xScale(d.x0) + barPadding / 2; })
                        .attr('y', function (d) { return yScale(yAccessor(d)); })
                        .attr('width', function (d) { return d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]); })
                        .attr('height', function (d) { return dimensions.boundedHeight - yScale(yAccessor(d)); })
                        .attr('fill', 'cornflowerblue');
                    barText = binGroups.filter(yAccessor)
                        .append('text')
                        .attr('x', function (d) { return xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2; })
                        .attr('y', function (d) { return yScale(yAccessor(d) + 1); })
                        .text(yAccessor)
                        .style('text-anchor', 'middle')
                        .attr("fill", "darkgrey")
                        .style("font-size", "12px")
                        .style("font-family", "sans-serif");
                    mean = d3.mean(dataset, metricAccessor);
                    meanLine = bounds.append('line')
                        .attr('x1', xScale(mean))
                        .attr('x2', xScale(mean))
                        .attr('y1', -15)
                        .attr('y2', dimensions.boundedHeight)
                        .attr("stroke", "maroon")
                        .attr("stroke-dasharray", "2px 4px");
                    meanLabel = bounds.append('text')
                        .attr('x', xScale(mean))
                        .attr('y', -20)
                        .text("mean")
                        .attr("fill", "maroon")
                        .style("font-size", "12px")
                        .style("text-anchor", "middle");
                    xAxisGenerator = d3.axisBottom()
                        .scale(xScale);
                    xAxis = bounds.append("g")
                        .attr('class', 'xAxis')
                        .call(xAxisGenerator)
                        .style("transform", "translateY(".concat(dimensions.boundedHeight, "px)"));
                    xAxisLabel = xAxis.append("text")
                        .attr("x", dimensions.boundedWidth / 2)
                        .attr("y", dimensions.margin.bottom - 10)
                        .attr("fill", "black")
                        .style("font-size", "1.4em")
                        .text("Reltaive Humidity");
                    return [2 /*return*/];
            }
        });
    });
}
drawChart();
