import { CLASS } from './class';

const initText = function () {
    const $$ = this;
    $$.main.select('.' + CLASS.chart).append('g')
        .attr('class', CLASS.chartTexts);
    $$.mainText = $$.d3.selectAll([]);
};
const updateTargetsForText = function (targets) {
    let $$ = this, mainTextUpdate, mainTextEnter,
        classChartText = $$.classChartText.bind($$),
        classTexts = $$.classTexts.bind($$),
        classFocus = $$.classFocus.bind($$);
    mainTextUpdate = $$.main.select('.' + CLASS.chartTexts).selectAll('.' + CLASS.chartText)
        .data(targets)
        .attr('class', (d) => { return classChartText(d) + classFocus(d); });
    mainTextEnter = mainTextUpdate.enter().append('g')
        .attr('class', classChartText)
        .style('opacity', 0)
        .style('pointer-events', 'none');
    mainTextEnter.append('g')
        .attr('class', classTexts);
};
const updateText = function (durationForExit) {
    let $$ = this, config = $$.config,
        barOrLineData = $$.barOrLineData.bind($$),
        classText = $$.classText.bind($$);
    $$.mainText = $$.main.selectAll('.' + CLASS.texts).selectAll('.' + CLASS.text)
        .data(barOrLineData);
    $$.mainText.enter().append('text')
        .attr('class', classText)
        .attr('text-anchor', (d) => { return config.axis_rotated ? (d.value < 0 ? 'end' : 'start') : 'middle'; })
        .style('stroke', 'none')
        .style('fill', (d) => { return $$.color(d); })
        .style('fill-opacity', 0);
    $$.mainText
        .text((d, i, j) => { return $$.dataLabelFormat(d.id)(d.value, d.id, i, j); });
    $$.mainText.exit()
        .transition().duration(durationForExit)
        .style('fill-opacity', 0)
        .remove();
};
const redrawText = function (xForText, yForText, forFlow, withTransition) {
    return [
        (withTransition ? this.mainText.transition() : this.mainText)
            .attr('x', xForText)
            .attr('y', yForText)
            .style('fill', this.color)
            .style('fill-opacity', forFlow ? 0 : this.opacityForText.bind(this)),
    ];
};
const getTextRect = function (text, cls, element) {
    let dummy = this.d3.select('body').append('div').classed('c3', true),
        svg = dummy.append('svg').style('visibility', 'hidden').style('position', 'fixed').style('top', 0).style('left', 0),
        font = this.d3.select(element).style('font'),
        rect;
    svg.selectAll('.dummy')
        .data([text])
      .enter().append('text')
        .classed(cls ? cls : '', true)
        .style('font', font)
        .text(text)
      .each(function () { rect = this.getBoundingClientRect(); });
    dummy.remove();
    return rect;
};
const generateXYForText = function (areaIndices, barIndices, lineIndices, forX) {
    let $$ = this,
        getAreaPoints = $$.generateGetAreaPoints(areaIndices, false),
        getBarPoints = $$.generateGetBarPoints(barIndices, false),
        getLinePoints = $$.generateGetLinePoints(lineIndices, false),
        getter = forX ? $$.getXForText : $$.getYForText;
    return function (d, i) {
        const getPoints = $$.isAreaType(d) ? getAreaPoints : $$.isBarType(d) ? getBarPoints : getLinePoints;
        return getter.call($$, getPoints(d, i), d, this);
    };
};
const getXForText = function (points, d, textElement) {
    let $$ = this,
        box = textElement.getBoundingClientRect(), xPos, padding;
    if ($$.config.axis_rotated) {
        padding = $$.isBarType(d) ? 4 : 6;
        xPos = points[2][1] + padding * (d.value < 0 ? -1 : 1);
    } else {
        xPos = $$.hasType('bar') ? (points[2][0] + points[0][0]) / 2 : points[0][0];
    }
    // show labels regardless of the domain if value is null
    if (d.value === null) {
        if (xPos > $$.width) {
            xPos = $$.width - box.width;
        } else if (xPos < 0) {
            xPos = 4;
        }
    }
    return xPos;
};
const getYForText = function (points, d, textElement) {
    let $$ = this,
        box = textElement.getBoundingClientRect(),
        yPos;
    if ($$.config.axis_rotated) {
        yPos = (points[0][0] + points[2][0] + box.height * 0.6) / 2;
    } else {
        yPos = points[2][1];
        if (d.value < 0 || (d.value === 0 && !$$.hasPositiveValue)) {
            yPos += box.height;
            if ($$.isBarType(d) && $$.isSafari()) {
                yPos -= 3;
            }
            else if (!$$.isBarType(d) && $$.isChrome()) {
                yPos += 3;
            }
        } else {
            yPos += $$.isBarType(d) ? -3 : -6;
        }
    }
    // show labels regardless of the domain if value is null
    if (d.value === null && !$$.config.axis_rotated) {
        if (yPos < box.height) {
            yPos = box.height;
        } else if (yPos > this.height) {
            yPos = this.height - 4;
        }
    }
    return yPos;
};

export {
    initText,
    updateTargetsForText,
    updateText,
    redrawText,
    getTextRect,
    generateXYForText,
    getXForText,
    getYForText,
};
