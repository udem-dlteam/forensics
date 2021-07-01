/**
 * @file PlotGenerator.js
 * @fileOverview Defines PlotGenerator class. Manages TreeSearcher
 * instances to output valid plotly figures
 * @author Sacha Morin
 * @todo getFigure would really benefit from being refactored in smaller
 * methods
 * @requires TreeSearcher
 */

const TS = require('../TreeSearcher/TreeSearcher.js');
const plotTypes = require('./plot_types.js');
const presets = require('./presets.js');
const mathUtil = require('../utilities/math_utilities.js');
const formatter = require('./string_format');
const settings = require('./plot_setting.js');

/**
 * @typedef {Object} Param - Object with Objects describing variables and plot
 * settings as properties. Designed to easily interface with react. See
 * PlotGenerator constructor for details.
 */

/**
 * Points to variable with meta information
 * @constant
 * @type {string}
 * @todo Metas could be generalized to all variables with a symbol
 * indicating that no metas are available.
 */
const METATAG = 'gambit-version'; // Variable with meta information

/**
 * Tolerance used to determine if a change is significant or not
 * @constant
 * @type {number}
 */
const TOLERANCE = 0.05; // Used when comparing relative changes to

/**
 * Palette used to color plot. The first and second colors by far the most
 * seen in the app.
 * The third, fourth and fifth are used for quantitative coloring, so
 * shades of green, yellow and red should be preferred.
 * Curret palette is derived from plotly default, updated with bootstrap colors
 * @constant
 * @type {string[]}
 */
const PALETTE = [
  '#007bff', // bootstrap blue
  '#fd7e14', // bootstrap
  '#28a745', // bootstrap green
  '#d62728', // brick red
  '#ffc107', // bootstrap yellow
  '#9467bd', // muted purple
  '#343a40', // bootstrap dark
  '#e377c2', // raspberry yogurt pink
  '#17a2b8', // bootstrap cyan
  '#6c757d', // bootstrap secondary
];

// Default Plotly palette
// const PALETTE = [
//   '#1f77b4', // muted blue
//   '#ff7f0e', // safety orange
//   '#2ca02c', // cooked asparagus green
//   '#d62728', // brick red
//   '#9467bd', // muted purple
//   '#8c564b', // chestnut brown
//   '#e377c2', // raspberry yogurt pink
//   '#7f7f7f', // middle gray
//   '#bcbd22', // curry yellow-green
//   '#17becf', // blue-teal
// ];

// Helper function to return color based on tolerance. Green is good, red
// is bad
const colorSwitch = function (number) {
  if (number < -TOLERANCE * 100) {
    return PALETTE[2]; // Green
  }

  if (number > TOLERANCE * 100) {
    return PALETTE[3]; // Red
  }
  return PALETTE[4]; // Yellow
};


/**
 * Tree variables that are not allowed on the x or z axes
 * @constant
 * @type {string[]}
 */
const RESTRICTEDTAGS = ['stat', 'measure'];

/**
 * PlotGenerator class to generate plotly figures
 * @namespace
 * */
module.exports.PlotGenerator = class {
  /**
   * @constructor
   * @param {TreeObjectMap} treeObjectsMap
   */
  constructor(treeObjectsMap) {
    // Create a new map of TreeSearcher objects
    this.datasets = new Map();
    treeObjectsMap.forEach((tree, key) => {
      this.datasets.set(key, new TS.TreeSearcher(tree));
    });

    // Fetch available presets
    this.presets = presets.presetNames();

    // Fetch available plot types and lock policy
    this.plotTypes = plotTypes.PLOTTYPES;
    this.lockPolicy = plotTypes.LOCKPOLICY;

    // App has a built in plot type that is specific to gambit, if no
    // gambit dataset is present, said plot types should be removed
    if (!this.datasets.has('gambit')) {
      this.plotTypes = this.plotTypes.filter(x => !(x === 'all systems'));
    }

    // Build parameters object
    // Contains all options and variables as attributes
    // Options contains an array of strings
    // Values contains the associated boolean
    this.param = {};
    this.parameterNames = [];
    this.datasets.forEach((tree, name) => {
      const { variables, cat } = tree;

      // Initialize data variables as parameters
      // Read variables from tree object
      // Active holds a boolean array of the same size as the options array
      // if multiple options can be selected. If only one option can be
      // selected, active holds the index of the active option in the
      // options array.
      variables.forEach((x, j) => {
        if (this.parameterNames.includes(x)) {
          // Datasets with same variables should share the same options.
          // Variables with different categories should have different names.
          if (!mathUtil.arrayEquals(this.param[x].options, cat[j])) {
            throw new Error(`Two dataset share the same variable '${x}' but not the same options.`);
          }

          // If share same options, add to datasets to indicate compatibility
          this.param[x].compaDatasets.push(name);
        } else {
          // New parameter, add properties
          const isMulti = !(x === 'stat' || x === 'measure');
          this.param[x] = {
            name: x,
            options: cat[j],
            active: isMulti ? new Array(cat[j].length).fill(false) : 0,
            isVariable: true,
            // Stat and Measure allow only one option
            multiOption: isMulti,
            hasMeta: x.endsWith("-version"),
            lock: false,
            compaDatasets: [name], // Tag as compatible with this dataset
          };

          // Meta information integration
          if (this.param[x].hasMeta) this.param[x].metas = tree.metas;

          // Build parameterNames
          this.parameterNames.push(x);
        }
      });
    });

    // Declare plot settings and possible options
    // Class will add variables from  data to plotSettings following the
    // same structure
    const plotSettings = settings.PLOTSETTINGS;

    // Initialize plot settings as parameters
    plotSettings.forEach((x) => {
      // Some options are generated dynamically and are not specified in
      // constant
      const opt = x.options === null ? this.getOptions(x.name) : x.options;

      this.param[x.name] = {
        name: x.name,
        active: x.multiOption ? new Array(opt.length).fill(false) : 0,
        options: opt,
        isVariable: x.isVariable,
        multiOption: x.multiOption,
        hasMeta: false,
        lock: false,
        compaDatasets: x.isVariable
          ? Array.from(this.datasets.keys()) : null, // Compatible with all
      };

      // Build parameter Names
      this.parameterNames.push(x.name);
    });

    // Useful constants
    this.variables = Object.keys(this.param)
      .filter(x => this.param[x].isVariable
        && !RESTRICTEDTAGS.includes(x));
    this.plotSettings = Object.keys(this.param)
      .filter(x => !this.param[x].isVariable);
    this.multiOption = Object.keys(this.param)
      .filter(x => this.param[x].multiOption);

    // Set default x and series
    this.param.x.options = this.variables;
    this.param.series.options = this.variables;

    // Set default
    this.setDefault();

    // Handle baseline
    this.previousSeries = -1;
    this.handleBaseline();
  }

  /**
   * Returns current parameters (plot settings and variables)
   * @returns {Param}
   */
  getParameters() {
    return this.param;
  }

  /**
   * Returns selected options of a parameter in param
   * @param {string} paramName
   * @returns {string[]|string}
   */
  getSelectedOptions(paramName) {
    if (!this.listParameters().includes(paramName)) {
      throw new Error(`PlotGenerator has no parameter named '${paramName}'.`);
    }

    const target = this.param[paramName];

    if (target.multiOption) {
      // If parameter allows multiple option, filter boolean arrays to
      // retrieve active options
      return target.options.filter((x, i) => target.active[i]);
    }

    // Parameter has only one active option
    return target.options[target.active];
  }

  /**
   * Comparator family (plot types using baseline) behaves differently in
   * many cases and checks are often required
   * @param {string} plotType
   * @returns {boolean}
   */
  isComparatorFamily(plotType) {
    return ['comparator', 'head', 'tail'].includes(plotType);
  }

  /**
   * Returns all available options for a given parameter
   * @param {string} paramName
   * @returns {string[]}
   */
  getAllOptions(paramName) {
    return this.param[paramName].options;
  }

  /**
   * Returns an array in the format expected by the TreeSearcher object to
   * search tree
   * @param {string} datasetName - Dataset name
   * @returns {Context}
   */
  getTreeMap(datasetName) {
    return this.datasets.get(datasetName).variables
      .map(x => this.getIndexes(x));
  }

  /**
   * Returns active option indexes for a given parameter
   * @param paramName
   * @returns {number[]}
   */
  getIndexes(paramName) {
    if (!this.listParameters().includes(paramName)) {
      throw new Error(`PlotGenerator has no parameter named '${paramName}'.`);
    }

    const target = this.param[paramName];

    // Only one option
    if (!target.multiOption) return [target.active];

    // Multichoice
    const result = [];

    target.active.forEach((x, i) => {
      if (x) result.push(i);
    });
    return result;
  }

  /**
   * Returns status string to describe selected options with a keyword
   * @param {string} varName
   * @returns {string}
   */
  getStatusString(varName) {
    let result = '';
    const selected = this.getSelectedOptions(varName);

    // Reassign varName for proper string formatting
    if (varName === 'baseline') varName = this.getSelectedOptions('series');

    if (typeof selected === 'string') {
      // getSelectedOptions returned only a string, which means only one
      // option is selected
      result = formatter.stringFormat(selected, varName);
    } else if (selected.length === 1) {
      // If only one option is selected, return option name
      result = formatter.stringFormat(selected[0], varName);
    } else if (selected.length === 0) {
      result = 'None';
    } else if (selected.length === this.param[varName].options.length) {
      result = 'All';
    } else {
      result = 'Multiple';
    }

    return result;
  }

  /**
   * Returns TOLERANCE used by plot generator. See constant definition
   * @returns {number}
   */
  getTolerance() {
    return TOLERANCE;
  }

  /**
   * Returns all parameter names
   * @returns {string[]}
   */
  listParameters() {
    return this.parameterNames;
  }

  /**
   * Returns all variable names
   * @returns {string[]}
   */
  listVariables() {
    return this.variables;
  }

  /**
   * Returns all plot setting names
   * @returns {string[]}
   */
  listPlotSettings() {
    return this.plotSettings;
  }

  /**
   * Returns names of all parameters that allow multiple options
   * @returns {string[]}
   */
  listMultiOption() {
    return this.multiOption;
  }

  /**
   * Returns all available plot types
   * @returns {string[]}
   */
  listPlotTypes() {
    return this.plotTypes;
  }

  /**
   * Checks if baseline is set to auto mode
   * @returns {boolean}
   */
  isBaselineAuto() {
    const target = this.param.baselineMode;
    return target.options[target.active] === 'auto';
  }

  /**
   * Main setting method. Will take a parameter name and values either as
   * an array or a string (for a single option). Also handles the "all"
   * keyword to select all options
   * @param {string} paramName
   * @param {(Array.<string> | string | number)} option - Values to be
   * selected. An integer will be mapped to the option with the associated
   * index. Supports negative indexing (-1 will return the last option in
   * the dataset).
   * @param {boolean} [safe=false] - Set to true to indicate that the
   * paramName and value combination is safe. Intended to be used
   * programmatically.
   */
  setParameter(paramName, option, safe = false) {
    // Map X, Y and y to right attribute
    if (paramName === 'X') paramName = 'x';

    if (paramName === 'Y' || paramName === 'y') paramName = 'measure';

    // Log message and return if parameter is locked
    if (!safe && this.param[paramName].lock) {
      throw new Error(`Can't set parameter ${paramName} to ${option} because of selected plot type or baseline mode.`);
    }

    // Name should be an existing parameter
    if (!this.listParameters().includes(paramName)) {
      throw new Error(`PlotGenerator has no parameter named '${paramName}'.`);
    }

    // Numeric support
    if (Number.isInteger(option)) {
      if (option >= 0) {
        option = this.param[paramName].options[option];
      } else {
        // If value is a negative integer start from last
        option = this.param[paramName].options[this.param[paramName].options.length
        + option];
      }
    }

    if (paramName === 'title' && typeof option === 'string') {
      // Special case for title
      this.param[paramName].options = [option];
      this.param[paramName].active = 0;
    } else if (this.param[paramName].multiOption) {
      // Parameter allows multiple options
      if (option === 'all') {
        this.param[paramName].active.forEach((x, i, a) => {
          a[i] = true;
        });
      } else {
        // Allow string as parameter by wrapping it in an array
        if (typeof option === 'string') option = [option];

        // Set all current active to false
        this.param[paramName].active.forEach((x, i, a) => {
          a[i] = false;
        });

        // Set all active
        option.forEach((x) => {
          const idx = this.param[paramName].options.indexOf(x);
          if (idx === -1) {
            throw new Error(`Parameter '${paramName}' does not allow an option '${option}'.`);
          }

          this.param[paramName].active[idx] = true;
        });
      }
    } else {
      // Parameter allows single option
      if (typeof option !== 'string') {
        throw new Error(`Parameter '${paramName}' expects only one option as a string.`);
      }
      const idx = this.param[paramName].options.indexOf(option);
      if (idx === -1) {
        throw new Error(`Parameter '${paramName}' does not allow an option '${option}'.`);
      }

      this.param[paramName].active = idx;
    }

    if (!safe) {
      this.handleLocks(this.getSelectedOptions('type'));
      this.updateAxesOptions();
    }

    if (paramName === 'series') {
      this.handleBaseline();
      this.previousSeries = option;
    }
  }

  /**
   * Sets all parameter using a param object
   * @param {Param} param
   * @param {boolean} [safe = false]
   */
  setAllParameters(param, safe = false) {
    this.param = param;

    this.updateAxesOptions();

    if (!safe) {
      // Locks and baseline can be disabled. Useful when loading a preset
      // that was generated by setParameter calls (and hence already complies
      // with locks and baseline requirements)
      this.handleLocks(this.getSelectedOptions('type'));
      this.handleBaseline();
    }

    this.previousSeries = this.getSelectedOptions('series');
  }

  /**
   * Set all parameters that allow multiple options to "all", except dataset
   */
  all() {
    // Set all multiple options, except dataset
    this.listMultiOption().filter(x => x !== 'dataset')
      .forEach(x => this.setParameter(x, 'all'));
  }

  /**
   * Set all parameters to their default option
   */
  setDefault() {
    // Try defaults else, select first option
    Object.keys(this.param).forEach((x) => {
      try {
        // Baseline will be updated with the 'series' parameter
        if (x === 'baseline') return;
        this.setParameter(x, this.getDefault(x));
      } catch (e) {
        this.setParameter(x, 0);
      }
    });
  }

  /**
   * Returns default option for a given parameter
   * @param {string} paramName
   * @returns {string|Array.<string>}
   */
  getDefault(paramName) {
    const { options } = this.param[paramName];
    const noOptions = options.length;
    const temp = [];

    switch (paramName) {
      case 'gambit-version':
        for (let j = Math.max(noOptions - 15, 0); j < noOptions; j += 1) {
          // Fetch last 15 versions
          temp.push(options[j]);
        }
        return temp;
      case 'bench':
        for (let j = 0; j < noOptions && j < 10; j += 1) {
          // Fetch last 10 benchmarks
          temp.push(options[j]);
        }
        return temp;
      case 'measure':
        return 'real time';
      case 'stat':
        return 'mean';
      case 'title':
        return '';
      case 'type':
        return 'line plot';
      case 'x':
        return 'gambit-version';
      case 'series':
        return 'bench';
      case 'mean':
        return 'no';
      case 'toZero':
        return 'no';
      case 'norm':
        return 'none';
      case 'yScale':
        return 'auto';
      case 'baseline':
        return this.getDefault(this.getSelectedOptions('series'));
      case 'baselineMode':
        return 'auto';
      case 'sortX':
        return 'no';
      default:
        // Default return first option
        return options[0];
    }
  }

  // Option getter for dynamically generated options
  getOptions(paramName) {
    switch (paramName) {
      case 'type':
        return this.plotTypes;
      case 'dataset':
        return Array.from(this.datasets.keys());
      default:
        return null;
    }
  }

  unlockAll() {
    Object.keys(this.param).forEach((x) => {
      this.param[x].lock = false;
    });
  }

  /**
   * Enforces lock policy to ensure compatibility between selected options
   * @param {string} plotType
   */
  handleLocks(plotType) {
    this.unlockAll();
    const target = this.lockPolicy[this.plotTypes.indexOf(plotType)];

    if (target !== null) {
      target.settingNames.forEach((x, i) => {
        this.setParameter(x, target.options[i], true);
        this.param[x].lock = true;
      });
    }
  }

  /**
   * Update x axis and z axis options depending on selected dataset. For
   * instance, "chez-version" is not available when the selected dataset is
   * gambit
   */
  updateAxesOptions() {
    // Special case for 'all systems' plot. Force axes to take what would
    // normally be an illegal combination (if datasets include compilers other
    // than gambit)
    if (this.getSelectedOptions('type') === 'all systems') {
      this.param.x.options = ['gambit-version'];
      this.param.x.active = 0;
      this.param.series.options = ['dataset'];
      this.param.series.active = 0;
      return;
    }

    // Standard case
    const datasets = this.getSelectedOptions('dataset');
    const prevX = this.getSelectedOptions('x');
    const prevZ = this.getSelectedOptions('series');

    // Get options that are compatible with current datasets
    const options = this.listVariables()
      .filter(v => datasets
        .every(i => this.param[v].compaDatasets.includes(i)));


    this.param.x.options = options.slice();
    this.param.series.options = options.slice();

    // If previous option is now unselected, default to first available option
    this.setNewAxisOption(options, 'x', prevX, 0, datasets);
    this.setNewAxisOption(options, 'series', prevZ, 1, datasets);
  }

  /**
   * Update method when axes options have changed. Will try to set to
   * previously selected option if possible. Will also try to select a new
   * '-version' variable if dataset changes (ex: will map
   * 'gambit-version' to 'chez-version')
   * @param {Array.<string>} options - New options
   * @param {string} axisName - 'x' or 'series'
   * @param {string} prevOption - Previously selected option
   * @param {(string|number|Array.<string>)} def - Default option in case the
   * previously selected option is not part of new axis options
   * @param {Array.<string>} datasets - Selected dataset names
   */
  setNewAxisOption(options, axisName, prevOption, def, datasets) {
    if (options.includes(prevOption)) {
      this.setParameter(axisName, prevOption, true);
    } else {
      if (datasets.length === 1 && prevOption.slice(-8) === '-version') {
        // Only one dataset is selected and previous axis option had a
        // -version suffix. Select new option with -version suffix.
        const newVer = `${this.datasets.get(datasets[0]).title}-version`;
        if (this.datasets.get(datasets[0]).variables.includes(newVer)) {
          this.setParameter(axisName, newVer, true);
          return;
        }
      }
      this.setParameter(axisName, def, true);
    }
  }

  /**
   * Baseline is a clone of the series parameter. Allows group comparisons
   * See comparator plot. Method will check if the series parameter has
   * changed and if so, will clone a new set of options
   */
  handleBaseline() {
    const seriesName = this.getSelectedOptions('series');

    if (seriesName !== this.previousSeries) {
      // Do not clone new settings if baseline has not change
      // Clone new settings and update previousSeries
      this.param.baseline = { ...this.param[seriesName] };
      this.param.baseline.name = 'baseline';
      this.param.baseline.active = this.param[seriesName].active.slice();
      this.param.baseline.isVariable = false;
    }

    // If baseline mode is auto, assign decremented cloned variable's options
    if (this.isBaselineAuto()) {
      this.param.baseline.active = this.param[seriesName]
        .active
        .map((x, i, a) => a[(i + 1) % a.length]);
      this.param.baseline.lock = true; // Lock parameter
    } else {
      this.param.baseline.lock = false; // Lock parameter
    }
  }


  /**
   * Returns the baseline context
   * @param {number} datasetName
   * @returns {Context}
   */
  getBaselineMap(datasetName) {
    const seriesName = this.getSelectedOptions('series');
    let map;

    if (seriesName === 'dataset') {
      // Dataset is a special case, because not part of variable context
      const baseName = this.getSelectedOptions('baseline');

      // Backup current option
      const bk = this.getSelectedOptions(seriesName);

      // Temporarily use baseline to set series
      this.setParameter(seriesName, baseName);
      map = this.getTreeMap(datasetName);
      this.setParameter(seriesName, bk);
    } else {
      // Get real map and replace series indexes by baseline indexes
      map = this.getTreeMap(datasetName);
      map[this.datasets.get(datasetName).variables.indexOf(seriesName)] = this.getIndexes('baseline');
    }

    return map;
  }

  /**
   * Returns a list of available preset
   * @returns {Array<string>}
   */
  listPresets() {
    return this.presets;
  }

  /**
   * Sets plot generator instance to the state defined in preset
   * @param {string} presetName
   * @param {string} [commit] - Commit hash can be specified and will be
   * picked up by some preset
   */
  loadPreset(presetName, commit) {
    presets.presetRouter(this, presetName, commit);
  }

  /**
   * Returns plot title with variable descriptions
   * @param {string} title - Plot title
   * @param {Array.<string>} seriesLabels
   * @param {string} seriesName
   * @param {string} xName
   * @param {string} normOption
   * @param {string} plotType
   * @param {boolean} thumbnail - Thumbnail allows a PNG-friendly format,
   * handy for Slack posts. Adapts title accordingly
   * @returns {string}
   */
  formatTitle(title, seriesLabels, seriesName,
    xName, normOption, plotType, thumbnail) {
    // Only generate title if none is given
    if (title === '' || title === null) {
      // Generate title
      if (this.isComparatorFamily(plotType)) {
        // Get status strings
        const statusSeries = this.ellipsis(this.getStatusString(seriesName));
        const statusBase = this.ellipsis(
          this.getStatusString('baseline'),
        );

        const seriesSuffix = (statusSeries === 'All'
          || statusSeries === 'Multiple')
          ? formatter.stringFormat(seriesName) : '';

        const baseSuffix = (statusBase === 'All' || statusBase === 'Multiple')
          ? formatter.stringFormat(seriesName) : '';

        // Combine
        title = `${statusSeries} ${seriesSuffix} compared to ${statusBase} ${baseSuffix}${plotType === 'head' ? ' (Top 10)' : ''
        }${plotType === 'tail' ? ' (Bottom 10)' : ''}`;
      } else if (seriesLabels.length === 1) {
        [title] = [seriesLabels];
      } else {
        title = `${formatter.stringFormat(seriesName)} Performance by ${formatter.stringFormat(xName)}`;
      }
      // Add descriptors to display variable status
      if (!thumbnail) {
        let datasetNames = this.getSelectedOptions('dataset');

        // If baseline is set to 'dataset', baseline options should be
        // taken into account
        if (seriesName === 'dataset' && this.isComparatorFamily(plotType)) {
          datasetNames = datasetNames.concat(this.getSelectedOptions('baseline'));
        }
        title += "<br><i style='font-size:12px'>";

        // Variable should not be set to an axis and should also be relevant to
        // currently selected dataset
        this.listVariables().forEach((x) => {
          if (x !== xName
            && x !== seriesName
            && !this.param[x].compaDatasets.every(d => !datasetNames.includes(d))) {
            title += `${formatter.stringFormat(x)} : ${this.getStatusString(x)}    `;
          }
        });

        if (normOption !== 'none') {
          title += `${formatter.stringFormat('norm')}: ${
            normOption.toLowerCase()}`;
        }

        title += '</i>';
      }
    }
    return title;
  }

  ellipsis(string, length = 20) {
    if (string.length > length) {
      return `${string.slice(0, length)}...`;
    }
    return string;
  }

  searchDataset(datasetName, xName, seriesName, baseline) {
    // If axes are set to 'dataset', seriesName and xName need to be set to
    // a real variable for treeSearcher to work properly. Variable choice
    // does not matter, as data will be reduced via mean.
    if (seriesName === 'dataset') {
      [seriesName] = this.datasets.get(datasetName).variables;
    }
    if (xName === 'dataset') {
      [xName] = this.datasets.get(datasetName).variables;
    }

    const tm = baseline
      ? this.getBaselineMap(datasetName) : this.getTreeMap(datasetName);


    return this.datasets.get(datasetName).seriesBy(
      tm,
      xName,
      seriesName,
    );
  }

  searchForeignDataset(datasetName, xName, seriesName, baseline, expectedWidth) {
    // Set x name to the version dimension of dataset
    xName = `${this.datasets.get(datasetName).title}-version`;

    const data = this.searchDataset(datasetName, xName, seriesName, baseline);

    // Special case for "gambit-version" to allow display of a single point
    // from other compilers
    // Create an empty series with only one point. This will be handled by
    // the horizontal line mode in the line plot type
    const pointMean = data.mean.slice(-1)[0];
    const pointSD = data.sd.slice(-1)[0];
    data.mean = [new Array(expectedWidth).fill(NaN)];
    data.sd = [new Array(expectedWidth).fill(NaN)];
    data.mean[0][expectedWidth - 1] = pointMean;
    data.sd[0][expectedWidth - 1] = pointSD;

    return data;
  }

  /**
   * Main search method. Calls data matrices from TreeSearcher objects and
   * joins them if needed
   * @param {string} xName
   * @param {string} seriesName
   * @param {boolean} baseline - Whether to use main context or baseline
   * context for search
   * @returns {Matrix}
   */
  searchData(xName, seriesName, baseline) {
    const datasetNames = this
      .getSelectedOptions(
        (baseline && seriesName === 'dataset') ? 'baseline' : 'dataset',
      );

    // Accumulate different data matrices for each dataset
    const result = datasetNames.reduce((acc, datasetName) => {
      let data;

      if (this.getSelectedOptions('type') === 'all systems'
        && datasetName !== 'gambit') {
        // Exception for the all systems plot type to display other
        // compilers' data over a gambit axis
        data = this.searchForeignDataset(
          datasetName,
          xName,
          seriesName,
          baseline,
          this.getIndexes(this.getSelectedOptions('x')).length,
        );
      } else {
        // Standard search, will be used in the vast majority of cases
        data = this.searchDataset(
          datasetName,
          xName,
          seriesName,
          baseline,
        );
      }

      acc.mean.push(data.mean);
      acc.sd.push(data.sd);
      return acc;
    }, { mean: [], sd: [] });


    // Combine dataset matrices following axes specified by user
    if (seriesName === 'dataset') {
      result.sd = result.sd.map(m => mathUtil.mxAverageSD(m, 0));
      result.mean = result.mean.map(m => mathUtil.mxMean(m, 0));
    } else if (xName === 'dataset') {
      result.sd = result.sd.map(m => mathUtil.mxAverageSD(m, 1));
      result.mean = result.mean.map(m => mathUtil.mxMean(m, 1));
      result.sd = mathUtil.transpose(result.sd);
      result.mean = mathUtil.transpose(result.mean);
    } else if (result.mean.length > 1) {
      // Averaging over datasets leads to dubious results, but implemented
      result.sd = mathUtil.byElementSd(...result.sd);
      result.mean = mathUtil.byElementMean(...result.mean);
    } else {
      // Extract only matrix
      [result.mean] = result.mean;
      [result.sd] = result.sd;
    }

    return result;
  }

  /**
   * Get Plot figure. Returns an object with 3 properties : data, layout and
   * metas which can be used directly to generate plots with the plotly
   * library.
   * Thumbnail mode can be used to get smaller image with better formatting.
   * Intended for a width of 360px.
   * @param {boolean} thumbnail - PNG-friendly mode
   * @returns {PlotlyFigure}
   */
  getFigure(thumbnail = false) {
    // Get plot type
    const type = this.getSelectedOptions('type');

    // Get axis info
    const xName = this.getSelectedOptions('x');
    const measure = this.getSelectedOptions('measure');
    const sort = this.getSelectedOptions('sortX');
    const seriesName = this.getSelectedOptions('series');

    // Get x and series labels
    let xLabels = this.getSelectedOptions(xName);
    let seriesLabels = this.getSelectedOptions(seriesName);

    // Format x labels
    if (xName === 'gambit-version') {
      xLabels.forEach((x, i, a) => {
        a[i] = x.length > 10 ? `${x.slice(0, 8)}...` : x;
      });
    }

    // Data search
    let { mean, sd } = this.searchData(xName, seriesName, false);


    // Comparison
    if (this.isComparatorFamily(type)) {
      // Comparison mode
      let { mean: meanBase, sd: sdBase } = this.searchData(
        xName,
        seriesName,
        true,
      );

      // Coerce into average to ensure 1D
      sd = mathUtil.mxAverageSD(sd, 0);
      sdBase = mathUtil.mxAverageSD(sdBase, 0);
      mean = mathUtil.mxMean(mean, 0);
      meanBase = mathUtil.mxMean(meanBase, 0);

      // Get diff
      mean = mathUtil.meanDiff(mean, meanBase);
      sd = mathUtil.sdDiff(sd, sdBase);

      // To Relative. Wrap in array for plotly (to get a matrix). Multiply
      // by 100 because comparator family axes are on a percentage basis
      mean = [mean.map((x, i) => meanBase[i] == 0 ? 0 : 100 * x / meanBase[i])];
      sd = [sd.map((x, i) => meanBase[i] == 0 ? 0 : 100 * (x / meanBase[i]))];
    }

    // Define color palette
    let colors;
    let colorX = false;

    if (seriesLabels.length === 1
      && ['bar chart', 'ordered bars'].includes(type)) {
      // Allow x coloring (bars of different color) when only one series is
      // present
      colorX = true;
      colors = xLabels.map((x, i) => PALETTE[i % PALETTE.length]);
    } else if (this.isComparatorFamily(type)) {
      // Quantitative coloring for some plot types
      colorX = true;
      colors = mean[0].map(x => colorSwitch(x));
    } else {
      // Standard coloring by traces
      colors = seriesLabels.map((x, i) => PALETTE[i % PALETTE.length]);
    }

    // Normalization
    const normOption = this.getSelectedOptions('norm');

    if (normOption !== 'none') {
      // To relative sd
      sd = sd.map((line, i) => line.map((e, j) => e / mean[i][j]));

      switch (normOption) {
        case 'minimum':
          mathUtil.byMin(mean);
          break;
        case 'maximum':
          mathUtil.byMax(mean);
          break;
        case 'median':
          mathUtil.byMedian(mean);
          break;
        default:
          break;
      }

      // To absolute
      sd = sd.map((line, i) => line.map((e, j) => e * mean[i][j]));
    }

    // Retrieve metas
    let metas;
    const xContext = this.getIndexes(xName);
    if (this.param[xName].hasMeta) {
      metas = xContext.map(x => this.param[xName].metas[x]);
    } else {
      metas = new Array(xContext.length).fill(null);
    }

    // Sort x axis
    if (sort === 'yes') {
      let data;

      // Sort based on mean performance of each x categories. Only include
      // colors if plot colors are bound to x axis
      if (colorX) {
        [, xLabels, metas, colors, ...data] = mathUtil
          .paraSort(mathUtil.mxMean(mean, 0), xLabels, metas, colors, ...mean, ...sd);
      } else {
        [, xLabels, metas, ...data] = mathUtil
          .paraSort(mathUtil.mxMean(mean, 0), xLabels, metas, ...mean, ...sd);
      }
      mean = data.slice(0, mean.length); // Retrieved sorted series
      sd = data.slice(mean.length); // Retrieved sorted errors
    }

    // Compute average
    if (this.getSelectedOptions('mean') === 'yes') {
      sd = [mathUtil.mxAverageSD(sd, 0)];
      mean = [mathUtil.mxMean(mean, 0)];
      seriesLabels = [`Average ${formatter.stringFormat(seriesName)} Performance by ${formatter.stringFormat(xName)}`];
    }

    // Get title
    const title = thumbnail ? null : this.formatTitle(
      this.getSelectedOptions('title'),
      seriesLabels, seriesName, xName, normOption, type, thumbnail,
    );

    // Get figure
    const result = plotTypes.plotTypeRouter(type, title, xName, xLabels,
      measure, seriesName, mean, seriesLabels, TOLERANCE, this, sd, colors);


    // Figure post-processing
    const targetAxis = type === 'ordered bars' ? 'xaxis' : 'yaxis';

    // To Zero option
    if (this.getSelectedOptions('toZero') === 'yes') {
      result.layout[targetAxis].rangemode = 'tozero';
    }

    // Y-scale
    switch (this.getSelectedOptions('yScale')) {
      case 'log':

        if(type == "comparator"){
          result.layout[targetAxis].title.text += ' (log ratio)';
          let data = result.data[0].y.map(percent => Math.log10(1 + percent/100))
          result.data[0].y = data
          result.layout.yaxis.ticksuffix = ''

          let min = mathUtil.minimum(data)
          let max = mathUtil.maximum(data)


          let tickvals = []
          let ticktext = []
          for(let i = Math.floor(max); i > min; i--){
            tickvals.push(i)
            ticktext.push(Math.pow(10, -i) + "")
          }

          result.layout.yaxis.tickmode = 'array'
          result.layout.yaxis.tickvals = tickvals
          result.layout.yaxis.ticktext = ticktext
        }
        else{
          result.layout[targetAxis].title.text += ' (log)';
          
        }
        result.layout[targetAxis].type = 'symlog';
        result.layout.annotations.forEach((e) => {
          // Log scale of annotations. See plotly issue #1258
          e[targetAxis.charAt(0)] = Math.log10(e[targetAxis.charAt(0)]);
        });
        break;
      case 'linear':
        result.layout[targetAxis].type = 'linear';
        break;
      case 'auto':
        break;
      default:
        break;
    }

    // Thumbnail processing
    if (thumbnail) {
      if (type === 'head' || type === 'tail') {
        if (type === 'head') {
          result.layout.title = 'Top 10 ';
        } else if (type === 'tail') {
          result.layout.title = 'Bottom 10 ';
        }

        result.layout.title += result.layout.xaxis.title.text
          .split(' ').map(x => x.charAt(0).toUpperCase()
            + x.slice(1)).join(' ');
        result.layout.titlefont = 8;
        result.layout.yaxis.title = null;
        result.layout.xaxis.title = null;
        // result.layout["xaxis"].title.font.size = 10;
        result.layout.xaxis.showticklabels = false;
        result.layout.xaxis.tickfont = { size: 10 };
        result.layout.yaxis.tickfont = { size: 10 };

        // Remove any range formatting to ensure proper display of data and
        // labels
        result.layout.xaxis.range = null;
        const margin = 30;
        result.layout.margin = {
          l: margin + 50,
          r: margin,
          b: margin,
          t: margin + 40,
          pad: 0,
        };
      }
    }

    // Package metas with figure for easy access for top level apps
    result.metas = metas;
    return result;
  }
};
