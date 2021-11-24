/*
 * forensicsPresets module factory
 *
 * The opts argument is the options available to the front-end.
 * This will change based on the contents of the database, thus
 * actual preset contents are generated _after_ loading the proper
 * information from the server. This is required to, for example,
 * give meaning to a preset that uses the "last 10 commits" and
 * "all benchmarks".
 */
function initPresets(opts) {
  return (() => {
    var presets = [];

    /* Default preset from which all presets inherit */
    function forensicsPreset(config) {
      var _this = this;

      /* Default options are retrieved from the HTML */
      _this.name = "Last 10 revisions, top 10 benchmarks, by commits"
      _this.system = 'gambit';
      _this.benchmarks = opts.gambit.benchmarks.slice(0, 10);
      _this.commits = opts.gambit.commits.slice(-10);
      /* Uses the first value set in index.html by default */
      _this.config = configSelect.value;
      _this.plotType = plotTypeSelect.value;
      _this.xAxis = xAxisSelect.value;
      _this.yAxisScale = yAxisScaleSelect.value;
      _this.sortType = sortTypeSelect.value;
      _this.title = plotTitleInput.value;
      _this.normalizationType = normalizationTypeSelect.value;
      _this.stickyZero = stickyZeroCheckbox.checked;

      if (config !== undefined) {
        Object.keys(config).forEach((key) => {
          _this[key] = config[key];
        });
      }

      presets.push(_this);
    }

    function applyPreset(index) {
      if (index === undefined) {
        var preset = presets[0];
      } else {
        preset = presets[index];
      }

      // Multiplets
      setOptions(benchmarkSelect, preset.benchmarks);
      setOptions(commitSelect, preset.commits);

      // Singlets
      configSelect.value = preset.config;
      plotTypeSelect.value = preset.plotType
      xAxisSelect.value = preset.xAxis;
      yAxisScaleSelect.value = preset.yAxisScale;
      sortTypeSelect.value = preset.sortType;
      plotTitleInput.value = preset.title;
      normalizationTypeSelect.value = preset.normalizationType;
      stickyZeroCheckbox.checked = preset.stickyZero;

      updatePlotState();
    }

    function populatePresets() {
      presets.forEach((p, i) => {
        presetSelect.insertAdjacentHTML('beforeend', `<option value="${i}">${p.name}</option>`);
      })
    }

    var defaultPreset = new forensicsPreset();

    /* Custom presets go here*/
    var gambitAllBenchmarksPreset = new forensicsPreset({
      name: "Last 5 Gambit commits, all benchmarks, by benchmark",
      benchmarks: opts.gambit.benchmarks,
      commits: opts.gambit.commits.slice(-5),
      xAxis: "benchmark"
    })

    /* Exports */
    return {
      presets: presets,
      applyPreset: applyPreset,
      populatePresets: populatePresets
    };

  })(opts);
};
