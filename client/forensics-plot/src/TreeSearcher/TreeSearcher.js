/**
 * @file TreeSearcher.js
 * @fileOverview Defines TreeSearcher class.
 * @author Sacha Morin
 */

const mathUtil = require('../utilities/math_utilities.js');

/**
 * @typedef {Object} SearchResult
 * @property {(number[]|Array.<Array.<number>>)} mean - Queried mean points
 * @property {(number[]|Array.<Array.<number>>)} sd - Queried standard
 * deviation points
 */

/**
 * @typedef {Array.<Array.<number>>} Context Describes queried variables. Each
 * index
 * should correspond to depth of tree (variable index) and be assigned to
 * another array holding the indexes of the categories that should be
 * searched. Context described with variablenames (see stringContext) should be
 * processed by the formatContext method.
 */

/**
 * @typedef {Array.<Array.<string>>} StringContext Same as Context, but using
 * category names
 * instead of indexes. Should be processed by the formatContext method to
 * be converted to Context.
 */

/**
 * TreeSearcher class to return data matrix
 * @namespace
 * */
module.exports.TreeSearcher = class {
  /**
   * Wraps searcher object around tree
   * @constructor
   * @param {Object} treeObject See './tree_example.js' for format
   */
  constructor(treeObject) {
    // Tree properties. Should not be changed
    this.title = treeObject.name;
    this.measures = treeObject.measures;
    this.variables = treeObject.tags; // Data variables
    this.cat = treeObject.options; // Variable categories
    this.data = treeObject.data;
    this.metas = treeObject.metas;

    // Mean and sd indexes
    this.meanIdx = this.cat[this.variables.indexOf('stat')].indexOf('mean');
    this.sdIdx = this.cat[this.variables.indexOf('stat')].indexOf('sd');

    // Bind callbacks
    this.sliceLeaf = this.sliceLeaf.bind(this);
    this.sliceTrace = this.sliceTrace.bind(this);
    this.sliceError = this.sliceError.bind(this);
    this.CSVLeaf = this.CSVLeaf.bind(this);
    this.CSVLeafNum = this.CSVLeafNum.bind(this);
    this.CSVTrace = this.CSVTrace.bind(this);
    this.CSVTraceNum = this.CSVTraceNum.bind(this);
    this.sliceDepthLeaf = this.sliceDepthLeaf.bind(this);
    this.sliceMinLeaf = this.sliceMinLeaf.bind(this);
    this.countLeaf = this.countLeaf.bind(this);
    this.countError = this.countError.bind(this);
    this.stringLeaf = this.stringLeaf.bind(this);
    this.stringError = this.stringError.bind(this);
    this.stringTrace = this.stringTrace.bind(this);
  }

  /**
   * Tests type of next node
   * @param {(Array|number)}node Next node in tree
   * @returns {number} 1 for array, -1 for NaN, 0 for something else
   * @todo Could be replaced by a depth test instead of type test.
   */
  probe(node) {
    if (Array.isArray(node)) {
      return 1;
    } if (Number.isNaN(node)) {
      return -1;
    }
    return 0;
  }

  /**
   * Main search algorithm. Recursively searches tree as per the category
   * indexes given in context. The three first callbacks can be customized
   * to achieve desired result and should run the following signature:
   * (context, depth, branchIdx, nextNode, acc, nextTrace, currentNode)
   * following the same parameters as this method. Will search whole tree
   * by default
   * @param {function} leafFunction Called upon finding a leaf (Number)
   * @param {function} traceFunction Called upon finding a branch (Array)
   * @param {function} errorFunction Called upon funding a NaN
   * @param {Context} [context=this.formatContext(this.options)] Defaults
   * to all categories of all variables
   * @param {(Object|Array)} [acc=[]] Accumulator. Can be set to desired
   * type by user. Holds search result
   * @param {string} [trace=''] Can be set to desired type by user. Is updated
   * by traceFunction and can be used to keep track of location in tree
   * @param {number} [depth=0] Depth index at which the search will start
   * @param {(Array|number)} [currentNode=this.data] Currently searched
   * node. Defaults to root of tree
   * @returns {(Object|Array)} Same type defined for acc
   */
  searchTree(
    leafFunction,
    traceFunction,
    errorFunction,
    context = this.formatContext(this.cat),
    acc = [],
    trace = '',
    depth = 0,
    currentNode = this.data,
  ) {
    const contextLayer = context[depth];
    let accTemp = acc;
    let nextTrace = trace;

    // Relative index is the context index.
    // Ex: if contextLayer = [0,3] then relativeIdx = 1 implies treeIdx = 3
    for (let contextIdx = 0;
      contextIdx < contextLayer.length;
      contextIdx += 1) {
      const branchIdx = contextLayer[contextIdx]; // Real index in node
      const nextNode = currentNode[branchIdx];

      // Probe node and apply relevant function
      switch (this.probe(nextNode)) {
        case 1:
          // Next is branch
          // Update trace parameter
          nextTrace = traceFunction(
            context,
            depth,
            branchIdx,
            nextNode,
            accTemp,
            nextTrace,
          );

          // Recursive search on branch
          accTemp = this.searchTree(
            leafFunction,
            traceFunction,
            errorFunction,
            context,
            accTemp, nextTrace,
            depth + 1,
            nextNode,
          );

          break;

        case 0:
          // Next is leaf
          accTemp = leafFunction(
            context,
            depth,
            branchIdx,
            nextNode,
            accTemp,
            nextTrace,
            currentNode,
          );

          break;

        case -1:
          // Next is NaN
          accTemp = errorFunction(
            context,
            depth,
            branchIdx,
            nextNode,
            accTemp,
            nextTrace,
          );

          break;
        default:
          throw new Error('Output from probe function should be provided');
      }
    }

    return accTemp;
  }

  // Callbacks for slice method
  sliceLeaf(context, depth, branchIdx, nextNode, acc, trace, currentNode) {
    acc.mean.push(currentNode[this.meanIdx]);
    acc.sd.push(currentNode[this.sdIdx]);
    return acc;
  }

  sliceError(context, depth, branchIdx, nextNode, acc) {
    // console.log("Warning!!! " + trace
    //   + " " + this.options[depth][branchIdx]
    //   + " is an invalid tag combination.");

    // Add NaNs to result to match the amount of missing values in subtree
    let noNaN = 1;
    for (let i = depth + 1; i < context.length; i += 1) {
      noNaN *= context[i].length;
    }

    // Push noNaN times in accumulator
    for (let i = 0; i < noNaN; i += 1) {
      acc.mean.push(NaN);
      acc.sd.push(NaN);
    }

    return acc;
  }

  sliceTrace(context, depth, branchIdx, nextNode, acc, trace) {
    // Accumulates current context in a string to output error message
    // if needed
    return `${trace} ${this.cat[depth][branchIdx]}`;
  }

  /**
   * Returns all data points in tree corresponding to context
   * @param {Context} context
   * @returns {SearchResult}
   */
  slice(context) {
    const acc = { mean: [], sd: [] };
    return this.searchTree(
      this.sliceLeaf,
      this.sliceTrace,
      this.sliceError,
      context,
      acc,
    );
  }

  /**
   * Calls the slice method and reduces data along the xName dimension.
   * Will average mean points and average the variance to determine
   * standard deviation points.
   * @param {Context} context
   * @param {string} xName
   * @returns {SearchResult}
   */
  groupBy(context, xName) {
    // Get index of groupBy variable
    const groupByIdx = this.variables.indexOf(xName);

    return context[groupByIdx].reduce((acc, x) => {
      // Context copy with only one option for groupBy variable
      const contextCopy = context.slice();
      contextCopy[groupByIdx] = [x];

      // Search new series with only one option for groupBy variable
      // If search returns more than one point, take average of all points
      const { mean, sd } = this.slice(contextCopy);

      acc.mean.push(mathUtil.mean(mean));
      acc.sd.push(mathUtil.standardDeviation(sd));
      return acc;
    }, { mean: [], sd: [] });
  }

  /**
   * Main function that should be called by user. Will always return a 2D
   * matrix of data points corresponding to provided context. The first
   * axis will hold pointers to 1D arrays representing series (z axis). Said
   * series are the result of reduced data points (see groupBy method)
   * @param {Context} context
   * @param {string} xName
   * @param {string} zName
   * @returns {SearchResult}
   */
  seriesBy(context, xName, zName) {
    const seriesByIdx = this.variables.indexOf(zName);
    const groupByIdx = this.variables.indexOf(xName);
    const diagonal = xName === zName;
    const result = { mean: [], sd: [] };

    // If one variable has no option, return empty matrix
    if (!context.every(l => l.length > 0)) {
      const NaNs = mathUtil.NaNmx(
        context[seriesByIdx].length,
        context[groupByIdx].length,
      );

      result.mean = NaNs;
      result.sd = NaNs;

      return result;
    }

    return context[seriesByIdx].reduce((acc, x, i) => {
      // Context copy with only one option for seriesBy variable
      const contextCopy = context.slice();
      contextCopy[seriesByIdx] = [x];
      let { mean, sd } = this.groupBy(contextCopy, xName);

      // Special case when groupBy and seriesBy share the same variable
      // Such scenarios should be avoided, but function will return an empty
      // matrix with results on diagonal as this would be the most accurate
      // representation
      if (diagonal) {
        const NaNs = new Array(context[seriesByIdx].length).fill(NaN);
        NaNs.splice(i, 1, mean[0]);
        mean = NaNs.slice();
        NaNs.splice(i, 1, sd[0]);
        sd = NaNs.slice();
      }

      acc.mean.push(mean);
      acc.sd.push(sd);

      return acc;
    }, result);
  }

  /**
   * Handy method to get the relative difference between two versions
   * following a given context
   * @param {(string|number)} v1 Commit hash, version symbol or version
   * index as ordered in tree. Supports negative indexing (-1 to get last
   * commit)
   * @param {(string|number)} v2 Commit hash, version symbol or version
   * index as ordered in tree. Supports negative indexing (-1 to get last
   * commit)
   * @param {StringContext} stringContext
   * @returns {number[]}
   */
  compareVersions(v1, v2, stringContext = this.defReq()) {
    if (!this.variables.includes('gambit-version')
      || !this.variables.includes('bench')) {
      throw new Error('.compareVersions() requires the presence of a Version and Bench variable.');
    }

    let v1Formatted = v1;
    let v2Formatted = v2;

    const context = this.formatContext(stringContext);

    const versionIndex = this.variables.indexOf('gambit-version');
    const versions = this.cat[versionIndex];

    // Convert to index
    if (typeof v1 === 'string') {
      v1Formatted = versions.indexOf(v1);
    }

    if (typeof v2 === 'string') {
      v2Formatted = versions.indexOf(v2);
    }

    // Allow negative indexing
    // If v1 and v2 are not in options, will default to last options (indexOf
    // will return -1, see above)
    if (v1Formatted < 0) {
      v1Formatted = Math.max(
        0,
        versions.length + v1Formatted,
      );
    }

    if (v2Formatted < 0) {
      v2Formatted = Math.max(
        0,
        versions.length + v2Formatted,
      );
    }

    const context1 = context.slice();
    context1[versionIndex] = [v1Formatted];
    const context2 = context.slice();
    context2[versionIndex] = [v2Formatted];

    let { mean: series1 } = this.seriesBy(
      context1,
      'bench',
      'version',
    );
    let { mean: series2 } = this.seriesBy(
      context2,
      'bench',
      'version',
    );

    // Coerce to average
    series1 = mathUtil.mxMean(series1, 0);
    series2 = mathUtil.mxMean(series2, 0);

    // Return relative difference
    return mathUtil.arrayDiff(series1, series2)
      .map((x, i) => x / series2[i]);
  }

  // Empty callbacks when accumulator and error handling are not required
  noError(context, depth, branchIdx, nextNode, acc) {
    // Do nothing
    return acc;
  }

  noTrace() {
    return null;
  }

  /**
   * Prints tree data as a CSV
   * @param {boolean} [num=false] Whether CSV should only hold variable indexes
   * (true) or full names as strings (false).
   * @param {StringContext} [stringContext=this.options] Defaults to all
   * categories of all variables
   */
  toCSV(num = false, stringContext = this.cat) {
    const context = this.formatContext(stringContext);
    console.log(`${this.variables.join(',')},Value`); // Headers
    this.searchTree(
      num ? this.CSVLeafNum : this.CSVLeaf,
      num ? this.CSVTraceNum : this.CSVTrace,
      this.noError,
      context,
    );
  }

  // To CSV callbacks
  CSVLeaf(context, depth, branchIdx, nextNode, acc, trace) {
    console.log(`${trace.slice(1)},${this.cat[depth][branchIdx]
    },${nextNode}`);
    return null;
  }

  CSVLeafNum(context, depth, branchIdx, nextNode, acc, trace) {
    // Only encodes index to formatSave size
    console.log(`${trace.slice(1)},${branchIdx
    },${nextNode}`);
    return null;
  }

  CSVTrace(context, depth, branchIdx, nextNode, acc, trace) {
    return `${trace},${this.cat[depth][branchIdx]}`;
  }

  CSVTraceNum(context, depth, branchIdx, nextNode, acc, trace) {
    // Only encodes index to formatSave size
    return `${trace},${branchIdx}`;
  }

  /**
   * Checks if all number values in tree are at the same depth. Should be
   * the case in a valid tree
   * @returns {boolean}
   */
  validateTreeDepth() {
    const context = this.formatContext(this.cat);
    return this.searchTree(
      this.sliceDepthLeaf,
      this.noTrace,
      this.noError,
      context,
      this.variables.length - 1,
    ) !== -1;
  }

  // Callback for validateTreeDepth
  sliceDepthLeaf(context, depth, branchIdx, nextNode, acc) {
    return acc === depth ? depth : -1;
  }

  sliceMinLeaf(context, depth, branchIdx, nextNode, acc) {
    if (nextNode !== 0) return Math.min(acc, nextNode);
    return acc;
  }

  /**
   * Finds minimum of a given stat in dataset
   * @param {string} statName
   * @returns {number}
   */
  findStatMin(statName) {
    // Ignore 0s and NaNs
    const newOptions = this.cat.slice();
    newOptions[this.variables.indexOf('stat')] = [statName];
    return this.searchMin(newOptions);
  }

  searchMin(context) {
    const stringContext = this.formatContext(context);
    return this.searchTree(
      this.sliceMinLeaf,
      this.noTrace,
      this.noError,
      stringContext,
      Infinity,
    );
  }


  /**
   * Counts data in tree. Can be called to count NaN values, 0 values or
   * number values.
   * @param {string} type Information that user wants to retrive. See
   * switch case for available options.
   * @param {StringContext} stringContext
   * @returns {number|Object}
   */
  count(type = 'number', stringContext = this.cat) {
    const context = this.formatContext(stringContext);
    const result = this.searchTree(
      this.countLeaf,
      this.noTrace,
      this.countError,
      context,
      { number: 0, zero: 0, nan: 0 },
    );

    switch (type) {
      case 'number':
        return result.zero + result.number;
      case 'zero':
        return result.zero;
      case 'non-zero':
        return result.number;
      case 'NaN':
        return result.nan;
      case 'all':
        return result.nan + result.zero
          + result.number;
      case 'report':
        return { ...result };
      default:
        return result.zero + result.number;
    }
  }

  countLeaf(context, depth, branchIdx, nextNode, acc) {
    if (nextNode === 0) {
      acc.zero += 1;
    } else {
      acc.number += 1;
    }
    return acc;
  }

  countError(context, depth, branchIdx, nextNode, acc) {
    // Add NaNs to result to match the amount of missing values in subtree
    let noNaN = 1;
    for (let i = depth + 1; i < context.length; i += 1) {
      noNaN *= context[i].length;
    }

    acc.nan += noNaN;
    return acc;
  }


  /**
   * Prints data corresponding to a given context
   * @param {StringContext} stringContext Defaults to all categories of all
   * variables
   */
  print(stringContext = this.cat) {
    const context = this.formatContext(stringContext);
    console.log(this.searchTree(
      this.stringLeaf,
      this.stringTrace,
      this.stringError,
      context,
      '',
    ));
  }

  // Callbacks for print function
  stringLeaf(context, depth, branchIdx, nextNode, acc, trace) {
    return `${acc}${trace.slice(1)}${
      this.cat[depth][branchIdx]} : ${nextNode}\n`;
  }

  stringError(context, depth, branchIdx, nextNode, acc, trace) {
    return `${acc}${trace} ${this.cat[depth][branchIdx]} has no data.\n`;
  }

  stringTrace(context, depth, branchIdx, nextNode, acc, trace) {
    return `${trace} ${this.cat[depth][branchIdx]}`;
  }

  /**
   * Generates a default request for all options with mean as stat and real
   * time as measure. This is specific to scheme compiler datasets.
   * @returns {Array}
   */
  defReq() {
    const result = new Array(this.cat.length).fill('all');
    result[this.variables.indexOf('stat')] = ['mean'];
    result[this.variables.indexOf('measure')] = ['real time'];
    return result;
  }

  /**
   * Converts stringContext with variable names to proper Context with
   * variable indexes. Supports the 'all' keyword to select all options.
   * @param {StringContext} stringContext
   * @returns {Context}
   */
  formatContext(stringContext) {
    return stringContext.map((layer, layerIdx) => {
      if (layer === 'all') {
        // Returns all indexes
        return this.cat[layerIdx].map((x, i) => i);
      }
      return layer.map(x => this.cat[layerIdx].indexOf(x));
    });
  }

  /**
   * Returns last options of a given variable as ordered in tree.
   * @param {string} name Name of variable
   * @returns {string}
   */
  getLastOption(name) {
    const nameIndex = this.variables.indexOf(name);
    if (nameIndex === -1) throw new Error(`${name} is not a variable.`);

    return this.cat[nameIndex].slice(-1)[0];
  }

  /**
   * Returns an option index for a given variable as ordered in tree
   * @param {string} name Name of variable
   * @param {string} optionName Variable option
   * @returns {number}
   * @todo For gambit-version variable, currently checks both hash and
   * version symbol (ex: v4.0.1 is an option, but also has a hash which is
   * easier to provide as paramter). This should be fixed to hash only when
   * data structure will allow it.
   */
  indexOf(name, optionName) {
    const nameIndex = this.variables.indexOf(name);
    if (nameIndex === -1) throw new Error(`${name} is not a variable.`);

    if (name === 'gambit-version') {
      // TO BE FIXED. Look at commit hash instead of versions
      // First checks metas, else check standard options
      for (let i = 0; i < this.metas.length; i += 1) {
        if (this.metas[i]
          .split('\n')[0]
          .split(' ')[1] === optionName) return i;
      }
    }

    const result = this.cat[nameIndex].indexOf(optionName);

    if (result === -1) {
      throw new Error(`${optionName} is not a valid option for variable ${
        name}`);
    }
    return result;
  }
};
