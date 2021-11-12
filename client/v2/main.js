function getSelectedOptions(elem) {
  return Array.from(elem.options)
              .filter(o => o.selected)
              .map(o => o.value);
}

function setSelectSize(elem) {
  var len = elem.length;
  if (len >= 10) {
    elem.size = 10;
  } else {
    elem.size = len;
  }
}

/* Populate options with data from forensics.json */
function populateOptions(data) {
  // TODO: loop for multiple systems
  var gambit = data.options.gambit;

  populateSelect(['gambit'], systemSelect);
  populateSelect(gambit.benchmarks, benchmarkSelect);
  populateSelect(gambit.commits, commitSelect);
  populateSelect(gambit.configs, configSelect);
}

function populateSelect(items, select) {
  items.forEach((s, i) => {
    select.insertAdjacentHTML('beforeend', `<option value="${s}">${s}</option>`);
  })
  setSelectSize(select);
}

function updatePlotState() {
  // TODO: loop for multiple systems

  plotState.system = systemSelect.value;
  plotState.benchmarks = getSelectedOptions(benchmarkSelect);
  plotState.commits = getSelectedOptions(commitSelect);
  plotState.config = configSelect.value;
  plotState.plotType = plotTypeSelect.value;
  plotState.xAxis = xAxisSelect.value;
  plotState.normalization = normalizationSelect.value;
  plotState.yAxisScale = yAxisScaleSelect.value;
  plotState.mean = meanCheckbox.checked;
  plotState.stickyZero = stickyZeroCheckbox.checked;
  plotState.sortXAxis = sortXAxisCheckbox.checked;

  updatePlot();
}

/* This sets up the initial state of the system */
async function init(url) {
  fetch(url)
    .then(function(res) {
      if (res.status == 200) {
        res.json().then((data) => {
          forensicsData = data;
          populateOptions(data);
          forensicsPresets = initPresets(data.options);
          forensicsPresets.populatePresets();
          forensicsPresets.applyPreset();
          initPlot();
        });
      } else {
        console.log("Error getting options - ", res);
      }
    })
    .catch(function(err) {
      console.log("Error during fetch - ", err);
    });
}

/*
 * Plot
 */
function avg(v) {
  // Don't return NaN
  return (v.map(o => Number(o)).reduce((a,b) => a+b, 0) / v.length) || 0;
}

function genColumns() {
  var columns = [];
  var system = plotState.system;
  var xAxis = plotState.xAxis;

  if (xAxis === 'benchmarks') {
    columns.push(["x"].concat(plotState.benchmarks));
    plotState.commits.forEach((c) => {
      var res = [c];
      plotState.benchmarks.forEach((b) => {
        res.push(avg(forensicsData.results[system][b][c]))
      })
      columns.push(res);
    })
  } else if (xAxis == 'commits') {
    columns.push(["x"].concat(plotState.commits));
    plotState.benchmarks.forEach((b) => {
      var res = [b];
      plotState.commits.forEach((c) => {
        res.push(avg(forensicsData.results[system][b][c]));
      })
      columns.push(res);
    })
  }

  return columns;
}

function genPlotObject() {
  return {
    data: {
      x: "x",
      columns: genColumns(),
      type: plotState.plotType
    },
    axis: {
      y: {
        label: "Time (s)"
      },
      x: {
        type: "category",
        tick: {
          // TODO: Add user-defined filters
          values: (t) => t
        }
      }
    },
    bindto: "#chart"
  }
}

function initPlot() {
  // TODO: Generate input from plotState
  chart = bb.generate(genPlotObject());
}

function updatePlot() {
  chart = bb.generate(genPlotObject());
  console.log("updatePlot()");
}

/* Main */
var base = 'http://localhost:8888'
var plotState = {};
var forensicsData = {};
var forensicsPresets = {};
var chart = {};

/* TODO: Generate this from index.html + element attributes */
/* Get all select elements as we will query them every time they are updated */
var presetSelect = document.getElementById("presets-list");
var systemSelect = document.getElementById("systems-list");
var benchmarkSelect = document.getElementById("benchmarks-list");
var commitSelect = document.getElementById("commits-list");
var configSelect = document.getElementById("configs-list");
var plotTypeSelect = document.getElementById("plot-type-list");
var xAxisSelect = document.getElementById("x-axis-list");
var normalizationSelect = document.getElementById("normalization-list");
var yAxisScaleSelect = document.getElementById("y-axis-scale-list");
var meanCheckbox = document.getElementById('mean');
var stickyZeroCheckbox = document.getElementById('sticky-zero');
var sortXAxisCheckbox = document.getElementById('sort-x-axis');

var selects = [benchmarkSelect, commitSelect, configSelect, plotTypeSelect, xAxisSelect,
 normalizationSelect, yAxisScaleSelect, meanCheckbox, stickyZeroCheckbox, sortXAxisCheckbox];

presetSelect.onchange = function () {
  forensicsPresets.applyPreset(Number(this.value));
}

selects.forEach((o) => {
   o.onchange = updatePlotState;
 })

init(base+'/forensics.json');
