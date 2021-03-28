const MARGIN = { LEFT: 300, RIGHT: 130, TOP: 100, BOTTOM: 170 };
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 700 - MARGIN.TOP - MARGIN.BOTTOM;

// /////////////////////////////1

function draw(selector, url, legendName, colorBarGraphAndLegend) {
  let flag = true;

  const svg = d3
    .select(selector)
    .append('svg')
    .attr('width', WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr('height', HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

  const g = svg
    .append('g')
    .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

  // X label
  g.append('text')
    .attr('class', 'x axis-label')
    .attr('x', WIDTH / 2)
    .attr('y', HEIGHT + 120)
    .attr('font-size', '30px')
    .attr('text-anchor', 'middle')
    .text('Rent ranges (Per Week)');

  // Y label
  const yLabel = g
    .append('text')
    .attr('class', 'y axis-label')
    .attr('x', -(HEIGHT / 2))
    .attr('y', -80)
    .attr('font-size', '20px')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)');

  const x = d3
    .scaleBand()
    .range([0, WIDTH])
    .paddingInner(0.3)
    .paddingOuter(0.2);

  const y = d3.scaleLinear().range([HEIGHT, 0]);

  const xAxisGroup = g
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${HEIGHT})`);

  const yAxisGroup = g.append('g').attr('class', 'y axis');

  const legend = g
    .append('g')
    .attr('transform', `translate(${WIDTH + 30}, ${HEIGHT - 125})`);

  legend
    .append('circle')
    .attr('cx', 10)
    .attr('cy', 10)
    .attr('r', 10)
    .attr('fill', colorBarGraphAndLegend);

  legend
    .append('text')
    .attr('x', 100)
    .attr('y', 10)
    .attr('text-anchor', 'end')
    .style('font-size', '12px')
    .text(legendName)
    .style('text-transform', 'capitalize');

  d3.csv(url).then(data => {
    console.log(data);
    data.forEach(d => {
      d.year2006 = Number(d.year2006);
      d.year2016 = Number(d.year2016);
    });

    d3.interval(() => {
      flag = !flag;
      const newData = flag ? data : data;
      update(newData);
    }, 4000);

    update(data);
  });

  function update(data) {
    const value = flag ? 'year2006' : 'year2016';
    const t = d3.transition().duration(750);

    x.domain(data.map(d => d.rangesparramatta));
    y.domain([0, d3.max(data, d => d[value] + 1000)]);

    const xAxisCall = d3.axisBottom(x);
    xAxisGroup
      .transition(t)
      .call(xAxisCall)
      .selectAll('text')
      .attr('y', '10')
      .attr('x', '-5')
      .style('font-size', '15px')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-40)');

    const yAxisCall = d3
      .axisLeft(y)
      .ticks(15)
      .tickFormat(d => d);

    yAxisGroup.transition(t).call(yAxisCall).style('font-size', '15px');

    // JOIN new data with old elements.
    const rects = g.selectAll('rect').data(data, d => d.rangesparramatta);

    // EXIT old elements not present in new data.
    rects
      .exit()
      .attr('fill', 'red')
      .attr('class', 'rectangle')
      .transition(t)
      .attr('height', 0)
      .attr('y', y(0))
      .remove();

    // ENTER new elements present in new data...
    rects
      .enter()
      .append('rect')
      .attr('fill', colorBarGraphAndLegend)
      .attr('y', y(0))
      .attr('height', 0)
      // AND UPDATE old elements present in new data.
      .merge(rects)
      .transition(t)
      .attr('x', d => x(d.rangesparramatta))
      .attr('width', x.bandwidth)
      .attr('y', d => y(d[value]))
      .attr('height', d => HEIGHT - y(d[value]));

    const text = flag
      ? 'Number of Dwellings (2006)'
      : 'Number of Dwellings (2016)';
    yLabel.text(text);
  }
}

draw('#section--1', 'parramatta.csv', 'Parramatta', 'grey');
draw('#section--1', 'sydney.csv', 'Sydney', 'Black');
