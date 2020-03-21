/* Used https://github.com/WYanChao/RadViz as base for the RadViz code*/
const inputElement = document.getElementById("input");
inputElement.addEventListener("change", handleFiles, false);
var label;

/*Referenced from 
https://stackoverflow.com/questions/28584548/how-to-get-a-filename-in-html-and-use-it-in-d3-js-javascript*/

function handleFiles() {
    const fileList = this.files; /* now you can work with the file list */
    var file = fileList[0];
    var reader = new FileReader();
    var data;

    reader.readAsText(file);
    reader.onload = function(e) {

        data = d3.csvParse(e.target.result)


        const IDradviz = document.querySelector('#radviz'); //the container of radviz
        const titles = data.columns //titles in the data table

        label = titles.pop();
        var dimensions = [];
        for (let i = 0; i < titles.length; i++) {
            dimensions.push(titles[i]);
        }
        const colorAccessor = function(d) { return d[label]; }; //dimension used for coloring
        var dimensionAnchor = Array.apply(null, { length: dimensions.length }).map(Number.call, Number).map(x => x * 2 * Math.PI / (dimensions.length)); // intial DA configration;

        // call the plot function
        RadViz()
            .DOMRadViz(IDradviz)
            .TableTitle(titles)
            .ColorAccessor(colorAccessor)
            .Dimensionality(dimensions)
            .DAnchor(dimensionAnchor)
            .DATA(data)
            .call();


        /* Referenced from http://bl.ocks.org/jurb/5d42c6de467d7a71b2fc855e6aa3157f */
        document.getElementById("filter").innerHTML = '';
        d3.select("#filter")
            .selectAll("input")
            .data(dimensions)
            .enter()
            .append("label")
            .append("input")
            .attr("type", "checkbox")
            .attr("class", "filter-check")
            .attr('checked', 'true')
            .attr("value", function(d) {
                return d
            })
            .attr("id", function(d) {
                return d
            });
        console.log(dimensions)
        d3.selectAll("label")
            .data(dimensions)
            .attr("class", "checkbox")
            .append("text").html(function(d) {
                return d + "<br>"
            })
        var checkBox = d3.selectAll(".filter-check")
        var dt = [];
        checkBox.on("change", function() {
            dt = []
            var checkboxes = document.querySelectorAll('input[type=checkbox]:checked')
            for (var i = 0; i < checkboxes.length; i++) {
                dt.push(checkboxes[i].value)
            }
            updateRadviz(dt);
        });


        function updateRadviz(dt) {

            dimensions = dt;
            dimensionAnchor = Array.apply(null, { length: dimensions.length }).map(Number.call, Number).map(x => x * 2 * Math.PI / (dimensions.length)); // intial DA configration;

            // call the plot function
            RadViz()
                .DOMRadViz(IDradviz)
                .TableTitle(titles)
                .ColorAccessor(colorAccessor)
                .Dimensionality(dimensions)
                .DAnchor(dimensionAnchor)
                .DATA(data)
                .call();
        }
    }
};