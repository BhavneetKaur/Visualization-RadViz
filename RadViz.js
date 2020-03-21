/*Used https://github.com/WYanChao/RadViz as base for the RadViz code*/

function RadViz() {

    // define var
    let DOMRadViz,
        TableTitle,
        ColorAccessor,
        Dimensionality,
        DAnchor,
        DATA;

    // main function
    function RV(div) {

        // set some constent values
        let radiusDA = 7,
            radiusDT = 5; // radius of DA and data points
        let nodecolor = d3.scaleOrdinal(d3.schemeCategory20); //set color scheme
        const formatnumber = d3.format(',d');
        let margin = { top: 50, right: 130, bottom: 50, left: 200 },
            width = 1000,
            height = 650;
        let chartRadius = Math.min((height - margin.top - margin.bottom), (width - margin.left - margin.right)) / 3;



        // Data pre-processing
        var titles = TableTitle;



        var dimensions = Dimensionality,
            normalizeSuffix = '_normalized',
            dimensionNamesNormalized = dimensions.map(function(d) { return d + normalizeSuffix; }), // 'sepalL_normalized'
            DN = dimensions.length,
            DA = DAnchor.slice(),
            dataE = DATA.slice();

        dataE.forEach((d, i) => {
            d.index = i;
            d.id = i;
            d.color = nodecolor(ColorAccessor(d));
        });

        dataE = addNormalizedValues(dataE);
        dataE = calculateNodePosition(dataE, dimensionNamesNormalized, DA); // calculateNodePosition. need update when DAs move.	

        // prepare the DA data 
        let DAdata = dimensions.map(function(d, i) {
            return {
                theta: DA[i],
                x: Math.cos(DA[i]) * chartRadius + chartRadius,
                y: Math.sin(DA[i]) * chartRadius + chartRadius,
                fixed: true,
                name: d
            };
        });

        let colorspace = [],
            colorclass = [];
        dataE.forEach(function(d, i) {
            if (colorspace.indexOf(d.color) < 0) {
                colorspace.push(d.color);
                colorclass.push(d[label]);
            }
        });

        const radviz = d3.select(DOMRadViz);
        d3.select("svg").remove();
        let svg = radviz.append('svg').attr('id', 'radviz')
            .attr('width', width)
            .attr('height', height);
        svg.append('rect').attr('fill', 'transparent')
            .attr('width', width)
            .attr('height', height);

        svg.append("text")
            .attr("x", 700).attr("y", 35)
            .text(label)
            .style('font-size', '20px').attr('dominat-baseline', 'start')
            .style("font-weight", "bold");

        let center = svg.append('g').attr('class', 'center').attr('transform', `translate(${margin.left},${margin.top})`);

        let tooltipContainer = svg.append('g')
            .attr('class', 'tip')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .attr('display', 'none');


        const RVRadviz = d3.select(DOMRadViz).data([RVradviz()]);

        RVRadviz.each(render);

        function render(method) {
            d3.select(this).call(method);
        }

        function RVradviz() {
            function chart(div) {
                div.each(function() {

                    drawPanel(chartRadius);
                    drawDA(); // draw the DA nodes
                    drawDALabel(); // the DA nodes label

                    let tooltip = tooltipContainer.selectAll('text').data(dimensions)
                        .enter().append('g').attr('x', 0).attr('y', function(d, i) { return 25 * (i); });
                    tooltip.append('rect').attr('width', 200).attr('height', 30).attr('x', 0).attr('y', function(d, i) { return 25 * (i + 0.5); })
                        .attr('fill', d3.rgb(150, 250, 300));
                    tooltip.append('text').attr('width', 150).attr('height', 40).attr('x', 5).attr('y', function(d, i) { return 25 * (i + 1); })
                        .text(d => d + ':').attr('text-anchor', 'start').attr('dominat-baseline', 'hanging').style("font-size", "20px");

                    drawDT();

                    drawLegend();

                    function drawPanel(a) {
                        let panel = center.append('circle')
                            .attr('class', 'big-circle')
                            .attr('stroke', d3.rgb(0, 0, 0))
                            .attr('stroke-width', 3)
                            .attr('fill', 'transparent')
                            .attr('r', a)
                            .attr('cx', a)
                            .attr('cy', a);
                    }

                    function drawDA() {
                        center.selectAll('circle.DA-node').remove();
                        let DANodes = center.selectAll('circle.DA-node')
                            .data(DAdata)
                            .enter().append('circle').attr('class', 'DA-node')
                            .attr('fill', d3.rgb(120, 120, 120))
                            .attr('stroke', d3.rgb(120, 120, 120))
                            .attr('stroke-width', 1)
                            .attr('r', radiusDA)
                            .attr('cx', d => d.x)
                            .attr('cy', d => d.y)
                            .on('mouseenter', function(d) {
                                let damouse = d3.mouse(this); // get current mouse position
                                svg.select('g.DAtip').select('text').text('(' + formatnumber((d.theta / Math.PI) * 180) + ')').attr('fill', 'darkorange').attr('font-size', '18pt');
                                svg.select('g.DAtip').attr('transform', `translate(${margin.left + damouse[0] +0},${margin.top+damouse[1] - 50})`);
                                svg.select('g.DAtip').attr('display', 'block');
                            })
                            .on('mouseout', function(d) {
                                svg.select('g.DAtip').attr('display', 'none');
                            })
                            .call(d3.drag()
                                .on('start', dragstarted)
                                .on('drag', dragged)
                                .on('end', dragended)
                            );
                    } //end of function drawDA	

                    /* Referenced from https://bl.ocks.org/EfratVil/2bcc4bf35e28ae789de238926ee1ef05*/
                    d3.select("#range1").on("input", function() {
                        svg.selectAll(".circle-data")
                            .transition()
                            .duration(1000)
                            .ease(d3.easeLinear)
                            .style("opacity", d3.select("#range1").property("value") / 100);
                    });

                    function dragstarted(d) {
                        d3.select(this).raise().classed('active', true);
                    }

                    function dragended(d) {
                        d3.select(this).classed('active', false);
                        d3.select(this).attr('stroke-width', 0);
                    }

                    function dragged(d, i) {
                        d3.select(this).raise().classed('active', true);
                        let tempx = d3.event.x - chartRadius;
                        let tempy = d3.event.y - chartRadius;
                        let newAngle = Math.atan2(tempy, tempx);
                        newAngle = newAngle < 0 ? 2 * Math.PI + newAngle : newAngle;
                        d.theta = newAngle;
                        d.x = chartRadius + Math.cos(newAngle) * chartRadius;
                        d.y = chartRadius + Math.sin(newAngle) * chartRadius;
                        d3.select(this).attr('cx', d.x).attr('cy', d.y);

                        drawDA();
                        drawDALabel();

                        DA[i] = newAngle;
                        calculateNodePosition(dataE, dimensionNamesNormalized, DA);
                        drawDT();
                    }


                    function drawDALabel() {
                        center.selectAll('text.DA-label').remove();
                        let DANodesLabel = center.selectAll('text.DA-label')
                            .data(DAdata).enter().append('text').attr('class', 'DA-label')
                            .attr('x', d => d.x).attr('y', d => d.y)
                            .attr('text-anchor', d => Math.cos(d.theta) > 0 ? 'start' : 'end')
                            .attr('dominat-baseline', d => Math.sin(d.theta) < 0 ? 'baseline' : 'hanging')
                            .attr('dx', d => Math.cos(d.theta) * 15)
                            .attr('dy', d => Math.sin(d.theta) < 0 ? Math.sin(d.theta) * (15) : Math.sin(d.theta) * (15) + 10)
                            .text(d => d.name)
                            .attr('font-size', '18pt');
                    }


                    function drawDT() {
                        center.selectAll('.circle-data').remove();
                        let DTNodes = center.selectAll('.circle-data')
                            .data(dataE).enter().append('circle').attr('class', 'circle-data')
                            .attr('id', d => d.index)
                            .attr('r', radiusDT)
                            .attr('fill', d => d.color)
                            .attr('stroke', 'black')
                            .attr('stroke-width', 0.5)
                            .attr('cx', d => d.x0 * chartRadius + chartRadius)
                            .attr('cy', d => d.y0 * chartRadius + chartRadius)
                            .on('mouseenter', function(d) {
                                let mouse = d3.mouse(this);
                                let tip = svg.select('g.tip').selectAll('text').text(function(k, i) {
                                    return k + ': ' + d[k];
                                });

                                svg.select('g.tip').attr('transform', `translate(${margin.left + mouse[0] +20},${margin.top+mouse[1] - 120})`);

                                svg.select('g.tip').attr('display', 'block');

                                d3.select(this).raise().transition().attr('r', radiusDT * 2).attr('stroke-width', 3);
                            })
                            .on('mouseout', function(d) {

                                svg.select('g.tip').attr('display', 'none');

                                d3.select(this).transition().attr('r', radiusDT).attr('stroke-width', 0.5);
                            });
                    }


                    function drawLegend() {
                        let heightLegend = 25,
                            xLegend = margin.left + chartRadius * 1.5,
                            yLegend = 25;
                        let legendcircle = center.selectAll('circle.legend').data(colorspace)
                            .enter().append('circle').attr('class', 'legend')
                            .attr('r', radiusDT)
                            .attr('cx', xLegend)
                            .attr('cy', (d, i) => i * yLegend)
                            .attr('fill', d => d);

                        let legendtexts = center.selectAll('text.legend').data(colorclass)
                            .enter().append('text').attr('class', 'legend')
                            .attr('x', xLegend + 2 * radiusDT)
                            .attr('y', (d, i) => i * yLegend + 5)
                            .text(d => d).attr('font-size', '12pt').attr('dominat-baseline', 'middle')
                            .on('mouseover', function(d) {


                                let tempa = d3.select(DOMRadViz).selectAll('.circle-data');
                                tempa.nodes().forEach((element) => {
                                    let tempb = element.getAttribute('id');
                                    if (dataE[tempb][label] != d) {
                                        d3.select(element).attr('fill-opacity', 0.2).attr('stroke-width', 0);
                                    }
                                });
                            })
                            .on('mouseout', function(d) {

                                d3.select(DOMRadViz).selectAll('.circle-data')
                                    .attr('fill-opacity', 1).attr('stroke-width', 0.5);
                            });
                    }
                });
            }
            return chart;
        }

        function calculateNodePosition(dataE, dimensionNamesNormalized, DA) {
            dataE.forEach(function(d) {
                let dsum = d.dsum,
                    dx = 0,
                    dy = 0;
                dimensionNamesNormalized.forEach(function(k, i) {
                    dx += Math.cos(DA[i]) * d[k];
                    dy += Math.sin(DA[i]) * d[k];
                }); // dx & dy
                d.x0 = dx / dsum;
                d.y0 = dy / dsum;
                d.dist = Math.sqrt(Math.pow(dx / dsum, 2) + Math.pow(dy / dsum, 2)); // calculate r
                d.distH = Math.sqrt(Math.pow(dx / dsum, 2) + Math.pow(dy / dsum, 2)); // calculate r
                d.theta = Math.atan2(dy / dsum, dx / dsum) * 180 / Math.PI;
            });
            return dataE;
        }

        function addNormalizedValues(data) {
            data.forEach(function(d) {
                dimensions.forEach(function(dimension) {
                    d[dimension] = +d[dimension];
                });
            });
            var normalizationScales = {};
            dimensions.forEach(function(dimension) {
                normalizationScales[dimension] = d3.scaleLinear().domain(d3.extent(data.map(function(d, i) {
                    return d[dimension];
                }))).range([0, 1]);
            });
            data.forEach(function(d) {
                dimensions.forEach(function(dimension) {
                    d[dimension + '_normalized'] = normalizationScales[dimension](d[dimension]);
                });
            });
            data.forEach(function(d) {
                let dsum = 0;
                dimensionNamesNormalized.forEach(function(k) { dsum += d[k]; }); // sum
                d.dsum = dsum;
            });
            return data;
        }
    }


    // handle input
    RV.DOMTable = function(_a) {
        if (!arguments.length) { return console.log('No Table DOM') };
        DOMTable = _a;
        return RV;
    };
    RV.DOMRadViz = function(_a) {
        if (!arguments.length) { return console.log('No RadViz DOM') };
        DOMRadViz = _a;
        return RV;
    };
    RV.TableTitle = function(_a) {
        if (!arguments.length) { return console.log('Input TableTitle') };
        TableTitle = _a;
        return RV;
    };
    RV.ColorAccessor = function(_a) {
        if (!arguments.length) return console.log('Input ColorAccessor');
        ColorAccessor = _a;
        return RV;
    };
    RV.Dimensionality = function(_a) {
        if (!arguments.length) return console.log('Input Dimensionality');
        Dimensionality = _a;
        return RV;
    };
    RV.DAnchor = function(_a) {
        if (!arguments.length) return console.log('Input initial DAnchor');
        DAnchor = _a;
        return RV;
    };
    RV.DATA = function(_a) {
        if (!arguments.length) return console.log('Input DATA');
        DATA = _a;
        return RV;
    };

    return RV;
};