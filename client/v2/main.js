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

var selects = [benchmarkSelect, commitSelect, configSelect, plotTypeSelect,
               xAxisSelect,yAxisScaleSelect, sortTypeSelect, stickyZeroCheckbox,
              normalizationTypeSelect];

presetSelect.onchange = () => {
  forensicsPresets.applyPreset(Number(presetSelect.value));
}

// Set the event handlers for our options elements to update
// the plot state at every change
selects.forEach((o) => {
  o.onchange = updatePlotState;
});

function setPlotTitle(title) {
  plotTitleInput.value = title;
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

  // Produce the data consumed by d3. Deep copy
  // to avoid mutation issues when normalizing.
  var _data = JSON.parse(JSON.stringify(forensicsData.results));

  plotState.data = _data.filter((o) => {
    var bench_idx = plotState.benchmarks.indexOf(o.benchmark);
    var commit_idx = plotState.commits.indexOf(o.commit);
    if ((bench_idx !== -1) && (commit_idx !== -1)) {
      return true;
    }
    return false;
  }).sort(sortProc);

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

  if (plotState.reference) {
    normalize(plotState.data, plotState.reference);
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
  if (plotState.title === "") {
    setPlotTitle(`${plotState.ordinal} value by ${plotState.xAxis}`);
  } else {
    setPlotTitle(plotState.title)
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

/*
 * Plot
 */
const margin = {
  top: 20,
  right: 250, // Make space for legend
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
    normalizationType, stickyZero, subtitle
  }) => ({
    system, benchmarks, commits, config,
    plotType, sortType, xAxis, title, reference,
    normalizationType, stickyZero, subtitle
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
  plotTitleInput.value = params.get("title");
  normalizationTypeSelect.value = params.get("normalizationType");

  // Serialisation produces a string, which is truthy
  if (params.get("stickyZero") === "true") {
    stickyZeroCheckbox.checked = true;
  } else {
    stickyZeroCheckbox.checked = false;
  }

  plotState.reference = params.get("reference");
  plotState.subtitle = params.get("subtitle");

  // Force recalculating data
  updatePlotState();
}

init('/forensics.json');