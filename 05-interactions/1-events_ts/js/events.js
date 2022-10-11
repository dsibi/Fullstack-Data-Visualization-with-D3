"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function createEvent() {
    return __awaiter(this, void 0, void 0, function* () {
        const rectColors = ['yellowgreen', 'cornflowerblue', 'seagreen', 'slateblue'];
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
            d3.select(event.currentTarget).style('fill', d);
        })
            .on('mouseout', (event) => {
            d3.select(event.currentTarget).style('fill', 'lightgrey');
        });
    });
}
createEvent();
