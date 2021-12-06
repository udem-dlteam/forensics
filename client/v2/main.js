/*
 * Globals with default values
 */
var plotState = {};
var forensicsData = {};
var forensicsPresets = {}; /* Exported from presets.js */
var chart = {};

/*
 * Elements
 */
/* TODO: Generate this from index.html + element attributes? */
const presetSelect = document.getElementById("presets-list");
const systemSelect = document.getElementById("systems-list");
const benchmarkSelect = document.getElementById("benchmarks-list");
const commitSelect = document.getElementById("commits-list");
const configSelect = document.getElementById("configs-list");
const plotTypeSelect = document.getElementById("plot-type-list");
const xAxisSelect = document.getElementById("x-axis-list");
const yAxisScaleSelect = document.getElementById("y-axis-scale-list");
const sortTypeSelect = document.getElementById("sort-type-list");
const normalizationTypeSelect = document.getElementById("normalization-type-list");
const plotTitleInput = document.getElementById('plot-title');
const plotTitleText = document.getElementById('plot-title-text');
const chartDiv = document.getElementById("chart");
const stickyZeroCheckbox = document.getElementById("sticky-zero-cb");
const plotSubtitleText = document.getElementById("plot-subtitle-text");
const exportSVGBtn = document.getElementById("export-svg");
const geometricMeanCheckbox = document.getElementById("geometric-mean-cb");

var selects = [benchmarkSelect, commitSelect, configSelect, plotTypeSelect,
               xAxisSelect,yAxisScaleSelect, sortTypeSelect, stickyZeroCheckbox,
              normalizationTypeSelect, geometricMeanCheckbox];

presetSelect.onchange = () => {
  forensicsPresets.applyPreset(Number(presetSelect.value));
}

// Set the event handlers for our options elements to update
// the plot state at every change
selects.forEach((o) => {
  o.onchange = updatePlotState;
});

exportSVGBtn.onclick = () => {
  var path = prompt("Export SVG to path:", "chart.svg");
  return exportSVG(path);
}

// https://stackoverflow.com/a/66881124
function exportSVG(path){
  fetch('/main.css')
    .then(response => response.text())
    .then(text => {
      var svg_data = document.getElementsByTagName("svg")[0].innerHTML
      var head = '<svg title="chart" version="1.1" xmlns="http://www.w3.org/2000/svg">'
      var style = "<style>" + text + "</style>"
      var full_svg = head +  style + svg_data + "</svg>"
      var blob = new Blob([full_svg], {type: "image/svg+xml"});
      saveAs(blob, path);
    })
};

function setPlotTitle(title) {
  plotTitleText.innerHTML = title;
}

function setPlotSubtitle(subtitle) {
  plotSubtitleText.innerHTML = subtitle;
}

// Utility functions for normalization
function setReference(ref) {
  plotState.reference = ref;
  plotState.subtitle = `(normalized to ${ref})`;
  setPlotSubtitle(plotState.subtitle);
}

function unsetReference() {
  plotState.reference = false;
  plotState.subtitle = "";
  setPlotSubtitle(plotState.subtitle);
}

// Don't regen whole plot when only changing the title
plotTitleInput.oninput = (e) => {
  setPlotTitle(e.target.value);
  plotState.title = e.target.value;
  plotStateToURL();
}

// Utility function
function getSelectedOptions(elem) {
  return Array.from(elem.options)
              .filter(o => o.selected)
              .map(o => o.value);
}

// Utility function
function setSelectSize(elem) {
  var len = elem.length;
  if (len >= 10) {
    elem.size = 10;
  } else {
    elem.size = len;
  }
}

// Utility function
function populateSelect(items, select) {
  items.forEach((s, i) => {
    select.insertAdjacentHTML('beforeend', `<option value="${s}">${s}</option>`);
  })
  setSelectSize(select);
}

// Utility function
// Setting multiple options of a select element
function setOptions(elem, values) {
  for (const opt of elem.options) {
    if (values.indexOf(opt.value) !== -1) {
      opt.selected = true;
    } else {
      opt.selected = false;
    }
  }
}

/*
 * Data manipulation
 */
/* Populate options with data from forensics.json */
function populateOptions(data) {
  // TODO: loop for multiple systems
  var gambit = data.options.gambit;

  // TODO: compact_paths by feeley, see filters.js
  // Should be done when generating the JSON, otherwise
  // we need to modify data.options.gambit.benchmarks
  // and all benchmark keys in data.results.gambit.

  populateSelect(['gambit'], systemSelect);
  populateSelect(gambit.benchmarks, benchmarkSelect);
  populateSelect(gambit.commits, commitSelect);
  populateSelect(gambit.configs, configSelect);

}

// Plots are generated based on the plotState object
function updatePlotState() {
  // TODO: loop for multiple systems

  plotState.title = plotTitleInput.value;
  plotState.system = systemSelect.value;
  plotState.benchmarks = getSelectedOptions(benchmarkSelect);
  plotState.commits = getSelectedOptions(commitSelect);
  plotState.stickyZero = stickyZeroCheckbox.checked;
  plotState.normalizationType = normalizationTypeSelect.value;
  plotState.geometricMean = geometricMeanCheckbox.checked;

  // Select the proper normalization procedure
  var normalizationProc = (() => {
    var nm = plotState.normalizationType;
    if (nm === "relative") {
      return (data, norm) => data.map(o => o/norm);
    }
  })

  // Select the proper data sorting procedure
  plotState.sortType = sortTypeSelect.value;
  var sortProc = (() => {
    var st = plotState.sortType;
    if (st === "commit-timestamp-asc") {
      return (a, b) => a.timestamp - b.timestamp;
    }
    if (st === "commit-timestamp-desc") {
      return (a, b) => b.timestamp - a.timestamp;
    }
    if (st === "value-asc") {
      return (a, b) => a.value - b.value;
    }
    if (st === "value-desc") {
      return (a, b) => b.value - a.value;
    }
    if (st === "benchmark-asc") {
      return (a, b) => a.benchmark.localeCompare(b.benchmark);
    }
    if (st === "benchmark-desc") {
      return (a, b) => b.benchmark.localeCompare(a.benchmark);
    }
  })();

  // Produce the data consumed by d3.
  plotState.data = forensicsData.results.filter((o) => {
    var bench_idx = plotState.benchmarks.indexOf(o.benchmark);
    var commit_idx = plotState.commits.indexOf(o.commit);
    if ((bench_idx !== -1) && (commit_idx !== -1)) {
      return true;
    }
    return false;
  }).sort(sortProc);

  // Deep copy to avoid mutation issues
  plotState.data = JSON.parse(JSON.stringify(plotState.data));

  // Normalize results if a reference is set.
  // Inefficient. Change the underlying data structure for
  // faster access or maybe binary search over sorted timestamps
  function normalize(data, ref) {
    function getReferenceValue(ref, bench) {
      return forensicsData.results.filter(o => {
        return (o.benchmark === bench) && (o.commit === ref);
      })[0].value;
    }
    plotState.benchmarks.forEach(bench => {
      // Value to normalize to
      var norm = getReferenceValue(ref, bench);
      // Mutate in a single pass
      plotState.data.forEach(o => {
        if (o.benchmark === bench) {
          o.value = o.value / norm;
        }
      })
    })
  }

  if (plotState.reference && !plotState.geometricMean) {
    normalize(plotState.data, plotState.reference);
  }

  // NOTE: The commutator of the geometric mean and normalization is
  // 1/gmean(reference commit)
  if (plotState.geometricMean) {
    // Construct a new data array containing only the geometric mean
    var _data = [];
    var ref_gmean = 1;
    plotState.commits.forEach(commit => {
      // Construct synthetic object
      var obj = {
        commit: commit,
        benchmark: `Geometric mean (${plotState.benchmarks.length})`,
        value: 1
      };
      // Coalesce on benchmarks
      plotState.data.forEach(o => {
        if (o.commit === commit) {
          var val = o.value;
          // Some values might be undefined
          if (val === undefined) {
            val = 1;
          }
          if (plotState.reference && (o.commit === plotState.reference)) {
            ref_gmean = ref_gmean * val;
          }
          // Multiply values for all benchmarks
          obj.value = obj.value * o.value;
        }
      })
      // Take the Nth root to get the gmean
      obj.value = Math.pow(obj.value, 1/plotState.benchmarks.length);
      _data.push(obj);
    })

    // Factor in the commutator to keep normalization at 1
    ref_gmean = Math.pow(ref_gmean, 1/plotState.benchmarks.length);

    // Renormalize results
    _data.forEach(o => {
      o.value = o.value / ref_gmean;
    });

    plotState.data = _data;
  }

  plotState.config = configSelect.value;
  plotState.plotType = plotTypeSelect.value;
  plotState.xAxis = xAxisSelect.value;

  if (plotState.xAxis === "benchmark") {
    plotState.ordinal = "commit";
  } else if (plotState.xAxis === "commit") {
    plotState.ordinal = "benchmark";
  }

  plotState.yAxisScale = yAxisScaleSelect.value;

  // Set the plot title if it is set
  if (plotTitleInput.value === "") {
    var _title = (() => {
      var len = plotState.benchmarks.length;
      if (len > 8) {
        return `${plotState.benchmarks.splice(0, 8).join(',')}, ...`;
      } else {
        return `${plotState.benchmarks.join(',')}`;
      }
    })();

    console.log(_title);

    setPlotTitle(_title);
  } else {
    setPlotTitle(plotTitleInput.value);
  }

  // Set the plot subtitle
  setPlotSubtitle(plotState.subtitle);

  // Change the URL for easy sharing
  plotStateToURL();

  drawPlot();
}

function avg(v) {
  return (v.reduce((a, b) => a + b, 0) / v.length) || 0;
}

function gmean(a) {
  return Math.pow(a.reduce((a, b) => a*b, 1), 1/a.length) || 0;
}

/*
 * Plot
 */
const margin = {
  top: 20,
  right: 170, // Make space for legend
  bottom: 170, // Make space for long tick labels
  left: 40
};
const width = chartDiv.offsetWidth - margin.left - margin.right,
      height = chartDiv.offsetHeight - margin.top - margin.bottom;

function drawPlot() {
  var chart = document.getElementById("d3-chart");
  var tooltip = document.getElementById("d3-tooltip");

  // Remove old chart
  if (chart !== null) {
    chart.remove();
  }

  // Remove old tooltip
  if (tooltip !== null) {
    tooltip.remove();
  }

  if (plotState.plotType === "line") {
    drawLine();
  } else if (plotState.plotType === "bar") {
    drawBar();
  }
}

/* This sets up the initial state of the system */
async function init(url) {
  fetch(url)
    .then(res => {
      if (res.status == 200) {
        res.json().then((data) => {
          // NOTE: Transform list of strings into average value
          // TODO: Do this when preparing JSON?
          data.results.forEach(o => {
            o.value = avg(o.value.map(Number));
          });

          forensicsData = data;
          populateOptions(data);
          forensicsPresets = initPresets(data.options);
          forensicsPresets.populatePresets();

          if (window.location.search !== '') {
            plotStateFromURL();
          } else {
            forensicsPresets.applyPreset();
            drawPlot();
          }
        });
      } else {
        console.log("Error getting options - ", res);
      }
    })
    .catch(err => {
      console.log("Error during fetch - ", err);
    });
}

// Sharing of plots
function plotStateToURL() {
  // Only keep certain attributes from the plotState object
  // Keeping the whole object with all data is impractical.
  const _plotState = (({
    system, benchmarks, commits, config,
    plotType, sortType, xAxis, title, reference,
    normalizationType, stickyZero, subtitle, geometricMean
  }) => ({
    system, benchmarks, commits, config,
    plotType, sortType, xAxis, title, reference,
    normalizationType, stickyZero, subtitle, geometricMean
  }))(plotState);

  const url = new URLSearchParams(_plotState).toString();

  window.history.pushState("", "", "?"+url);
}

// NOTE: Maybe unify this with 'applyPreset' from presets.js
// TODO: Have global plot update lock (mutex) to prevent updates
// on each param change?
function plotStateFromURL() {
  const params = new URLSearchParams(window.location.search);

  // Multiplets
  setOptions(benchmarkSelect, params.get("benchmarks"));
  setOptions(commitSelect, params.get("commits"));

  // Singlets
  systemSelect.value = params.get("system");
  configSelect.value = params.get("config");
  plotTypeSelect.value = params.get("plotType");
  xAxisSelect.value = params.get("xAxis");
  sortTypeSelect.value = params.get("sortType");
  if (params.get("title") === "undefined") {
    plotTitleInput.value = "";
  } else {
    plotTitleInput.value = params.get("title");
  }
  normalizationTypeSelect.value = params.get("normalizationType");

  // Serialisation produces a string, which is truthy
  if (params.get("stickyZero") === "true") {
    stickyZeroCheckbox.checked = true;
  } else {
    stickyZeroCheckbox.checked = false;
  }

  if (params.get("geometricMean") === "true") {
    geometricMeanCheckbox.checked = true;
  } else {
    geometricMeanCheckbox.checked = false;
  }

  plotState.reference = params.get("reference");
  plotState.subtitle = params.get("subtitle");

  // Force recalculating data
  updatePlotState();
}

init('/results/forensics.json');
