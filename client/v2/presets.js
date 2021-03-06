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
    var $system = "zipi";

    /* Default preset from which all presets inherit */
    function forensicsPreset(config) {
      var _this = this;

      /* Default options are retrieved from the HTML */
      _this.name = "All commits, normalized to the latest"
      _this.system = $system;
      _this.benchmarks = opts[$system].benchmarks.slice(0, 1); // First benchmark
      _this.commits = opts[$system].commits; // All commits
      /* Uses the first value set in index.html by default */
      _this.config = configSelect.value;
      _this.plotType = plotTypeSelect.value;
      _this.xAxis = xAxisSelect.value;
      _this.yAxisScale = yAxisScaleSelect.value;
      _this.sortType = sortTypeSelect.value;
      _this.title = plotTitleInput.value;
      _this.normalizationType = normalizationTypeSelect.value;
      _this.reference = _this.commits[_this.commits.length - 1]; // Normalize to latest commit
      _this.stickyZero = stickyZeroCheckbox.checked;
      _this.geometricMean = geometricMeanCheckbox.checked;

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
      geometricMeanCheckbox.checked = preset.geometricMean;

      // Manually set plotState.reference since this variable needs to
      // survive plotState updates.
      setReference(preset.reference);

      updatePlotState();
    }

    function populatePresets() {
      presets.forEach((p, i) => {
        presetSelect.insertAdjacentHTML('beforeend', `<option value="${i}">${p.name}</option>`);
      })
    }

    var defaultPreset = new forensicsPreset();

    /* Custom presets go here*/
    var gambitAllReleasesPreset = new forensicsPreset({
      name: "Latest release, all benchmarks",
      benchmarks: opts[$system].benchmarks,
      commits: [opts[$system].commits[opts[$system].commits.length - 1]],
      xAxis: "benchmark",
      plotType: "bar",
      sortType: "value-desc",
      reference: false
    });

    /* Exports */
    return {
      presets: presets,
      applyPreset: applyPreset,
      populatePresets: populatePresets
    };

  })(opts);
};
