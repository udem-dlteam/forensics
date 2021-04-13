/**
 * @file unit_testing.js
 * @fileOverview Testing functions for TreeSearcher and PlotGenerator classes.
 * @author Sacha Morin
 */
const mathUtil = require('./math_utilities.js');
const treeSearcher = require('../TreeSearcher/TreeSearcher.js');
const PG = require('../PlotGenerator/PlotGenerator');
const tree = require('../TreeSearcher/tree_example.js');
const loader = require('./test_data');

// Comparison test
const equals = function () {
  const list1 = [1, 2, 3, 4, 5];
  const list2 = [1, 2, 3, 4, 5];
  const list3 = [NaN, NaN, NaN, NaN, NaN];
  const list4 = [NaN, NaN, NaN, NaN, NaN];
  const list5 = [1, 2, 3, 4, NaN];
  const list6 = [1, 2, 3, 4, 5, 6];
  const mx1 = [list1.slice(), list2.slice()];
  const mx2 = [list1.slice(), list2.slice()];
  const mx3 = [list3.slice(), list4.slice()];
  const mx4 = [list3.slice(), list4.slice()];
  const mx5 = [list1.slice(), list6.slice()];
  const mx6 = [list1.slice(), list2.slice(), list5.slice()];

  console.assert(mathUtil.arrayEquals(list1, list2));
  console.assert(mathUtil.arrayEquals(list3, list4));
  console.assert(!mathUtil.arrayEquals(list1, list5));
  console.assert(!mathUtil.arrayEquals(list1, list6));
  console.assert(mathUtil.arrayEquals(list5, list5));
  console.assert(mathUtil.arrayEquals([], []));
  console.assert(mathUtil.matrixEquals(mx1, mx2));
  console.assert(mathUtil.matrixEquals(mx3, mx4));
  console.assert(!mathUtil.matrixEquals(mx1, mx5));
  console.assert(!mathUtil.matrixEquals(mx1, mx6));
  console.assert(mathUtil.matrixEquals([], []));
};

// Unit testing for quickselect algorithm
const medianTest = function () {
  const list1 = [NaN, 2, 3, NaN, 1, 5, 4, NaN];
  const list2 = mathUtil.stripNan(list1);

  // list2 has no NaNs
  console.assert(mathUtil.arrayEquals(list2, [2, 3, 1, 5, 4]));
  // list2 is a new array
  console.assert(!mathUtil.arrayEquals(list1, list2));

  // Pivot index and partition
  const pivotIndex = mathUtil.partition(list2, 0, 4, 1);
  console.assert(pivotIndex === 2);
  console.assert(mathUtil.arrayEquals(list2, [2, 1, 3, 5, 4]));


  // Find median
  console.assert(mathUtil.findMedian(list1) === 3);

  // Find median of list with an even length
  // (average of two medians)
  const list3 = [NaN, 5, 3, 1, 2, 6, 4];
  console.assert(mathUtil.findMedian(list3) === 3.5);
};

// Mean testing
const meanTest = function () {
  const list1 = [2, 3.2, 4, 2.8];
  const list2 = [NaN, NaN, NaN];
  const list3 = [2, NaN, 4];
  const mx1 = [[1, 1], [NaN, 1]];
  const mx2 = [[3, 3], [3, 3]];
  const mx3 = [[5, 5], [5, 5]];
  const mx6 = [[1], [2], [3]];
  const mx7 = [[1, 2, 3]];
  const means2 = mathUtil.mxMean(mx6, 0);
  const means3 = mathUtil.mxMean(mx6, 1);
  const means4 = mathUtil.mxMean(mx7, 0);
  const sd1 = [0.2];
  const sdReduced1 = mathUtil.standardDeviation(sd1);
  console.assert(mathUtil.mean(list1) === 3);
  console.assert(Number.isNaN(mathUtil.mean(list2)));
  console.assert(mathUtil.mean(list3) === 3);
  console.assert(mathUtil.matrixEquals(mathUtil.byElementMean(mx1, mx2, mx3), [[3, 3], [4, 3]]));
  console.assert(mathUtil.arrayEquals(
    means2,
    [2],
  ));
  console.assert(mathUtil.arrayEquals(
    means3,
    [1, 2, 3],
  ));
  console.assert(mathUtil.arrayEquals(
    means4,
    [1, 2, 3],
  ));
  console.assert(sdReduced1 === 0.2);
};

// Unit testing for min max functions
const minMax = function () {
  const list1 = [NaN, 1, 5, 4, 6, 7, NaN, 100];
  const list2 = [NaN, 10, 50, 400, 60, 35, NaN, 1000];
  const mx1 = [list1, list2];

  console.assert(mathUtil.minimum(list1) === 1);
  console.assert(mathUtil.maximum(list2) === 1000);
  console.assert(mathUtil.minMatrix(mx1) === 1);
  console.assert(mathUtil.maxMatrix(mx1) === 1000);
};

// Unit testing for scaling functions
const scalingTest = function () {
  const list1 = [NaN, 2, 4, 8];
  const list2 = [NaN, 20, 40, 80];
  const mx1 = [list1.slice(), list2.slice()];
  const mx2 = [list1.slice(), list2.slice()];
  const mx3 = [list1.slice(), list2.slice()];
  const mx5 = [list1.slice(), list2.slice()];

  mathUtil.byMin(mx1);
  mathUtil.byMax(mx2);
  mathUtil.byMedian(mx3);
  const means = mathUtil.mxMean(mx5, 0);

  console.assert(mathUtil
    .matrixEquals(mx1, [[NaN, 1, 2, 4], [NaN, 1, 2, 4]]));
  console.assert(mathUtil.matrixEquals(
    mx2,
    [[NaN, 0.25, 0.5, 1], [NaN, 0.25, 0.5, 1]],
  ));
  console.assert(mathUtil.matrixEquals(
    mx3,
    [[NaN, 0.5, 1, 2], [NaN, 0.5, 1, 2]],
  ));
  console.assert(mathUtil.arrayEquals(
    means,
    [NaN, 11, 22, 44],
  ));
};

const transposeTest = function () {
  const arr = [[1, 2, 3], [4, 5, 6]];
  const expected = [[1, 4], [2, 5], [3, 6]];
  console.assert(mathUtil.matrixEquals(mathUtil.transpose(arr), expected));
  console.assert(mathUtil.matrixEquals(mathUtil.transpose([]), []));
};

const paraSortTest = function () {
  const arr = [
    [1, 6, 3, 2, 4, 5],
    ['1', '2', '3', '4', '5', '6'],
    [10, 20, 30, 40, 50, 60],
  ];
  const expected = [
    [1, 2, 3, 4, 5, 6],
    ['1', '4', '3', '5', '6', '2'],
    [10, 40, 30, 50, 60, 20],
  ];

  console.assert(mathUtil.matrixEquals(mathUtil.paraSort(...arr), expected));
};

// Unit testing for functions in math utilities
const mathUtilities = function () {
  equals();
  minMax();
  scalingTest();
  medianTest();
  meanTest();
  transposeTest();
  paraSortTest();
};

// Unit testing for search algorithm
const searchTesting = function () {
  // Initialize test tree
  const ts = new treeSearcher.TreeSearcher(tree.TREE);

  // Plot options
  const plotOptions = ts.cat.slice();

  plotOptions[ts.variables.indexOf('stat')] = ['mean'];

  // Calls slice function with all OPTIONS, should return
  // all data in a 1D array
  plotOptions[ts.variables.indexOf('measure')] = ['real time', 'cpu time'];
  const all = ts.slice(ts.formatContext(plotOptions));
  const allExpected = [10, 0.1, 1, 0.5, 20, 0.2, 2, 0.5, 30, 0.3, 3, 0.5];

  console.assert(mathUtil.arrayEquals(all.mean, allExpected));

  // Should return data only for the ratio measure
  plotOptions[ts.variables.indexOf('measure')] = ['cpu time'];
  const ratio = ts.slice(ts.formatContext(plotOptions));
  const ratioExpected = [0.1, 0.5, 0.2, 0.5, 0.3, 0.5];

  console.assert(mathUtil.matrixEquals(ratio.mean, ratioExpected));

  // Should return data only for the ratio measure grouped by Version
  const ratioByVersion = ts.groupBy(ts.formatContext(plotOptions), 'gambit-version');
  const ratioByVersionExpected = [0.3, 0.35, 0.4];

  console.assert(mathUtil.arrayEquals(ratioByVersion.mean, ratioByVersionExpected));

  // Should return all time data with two series
  // corresponding to 'pi' and 'fib'
  plotOptions[ts.variables.indexOf('measure')] = ['real time'];
  const timeSeries = ts
    .seriesBy(ts.formatContext(plotOptions), 'gambit-version', 'bench');
  const timeSeriesExpected = [[10, 20, 30], [1, 2, 3]];


  console.assert(mathUtil.matrixEquals(timeSeries.mean, timeSeriesExpected));

  // NaN Testing. Suppose Version 2 testing failed
  const backUp = ts.data[0][1];
  ts.data[0][1] = NaN;

  // All
  plotOptions[ts.variables.indexOf('measure')] = ['real time', 'cpu time'];
  const allNaN = ts.slice(ts.formatContext(plotOptions));
  const allExpectedNaN = [10, 0.1, 1, 0.5, NaN, NaN, NaN, NaN, 30, 0.3, 3, 0.5];

  console.assert(mathUtil.arrayEquals(allNaN.mean, allExpectedNaN));

  // cpu time
  plotOptions[ts.variables.indexOf('measure')] = ['cpu time'];
  const ratioNaN = ts.slice(ts.formatContext(plotOptions));
  const ratioExpectedNaN = [0.1, 0.5, NaN, NaN, 0.3, 0.5];

  console.assert(mathUtil.arrayEquals(ratioNaN.mean, ratioExpectedNaN));

  // real time (series by)
  plotOptions[ts.variables.indexOf('measure')] = ['real time'];
  const timeNaN = ts
    .seriesBy(ts.formatContext(plotOptions), 'gambit-version', 'bench');
  const timeSeriesExpectedNaN = [[10, NaN, 30], [1, NaN, 3]];

  console.assert(mathUtil.matrixEquals(timeNaN.mean, timeSeriesExpectedNaN));

  // Restore original test data
  ts.data[0][1] = backUp;
};

// Testing other tree methods
const treeMethodsTesting = function () {
  // Initialize test tree
  const ts = new treeSearcher.TreeSearcher(tree.TREE);

  // Basic depth test
  console.assert(ts.validateTreeDepth());

  const backUp = ts.data[0][1];
  ts.data[0][1] = NaN; // Suppose version 2 failed
  console.assert(ts.validateTreeDepth()); // Validation ignores NaN
  ts.data[0][1] = 1000; // Data point is not at leaf layer
  console.assert(!ts.validateTreeDepth()); // Validation should fail
  ts.data[0][1] = backUp;
  // Data points deeper than the leaf layer will lead to the program running
  // out of context options and crashing.

  console.assert(ts.validateTreeDepth());

  // Min test
  console.assert(ts.findStatMin('mean') === 0.1);
  console.assert(ts.findStatMin('sd') === 0.11);

  // Count test
  console.assert(ts.count() === 36);
  const backUp1 = ts.data[0][1];
  // eslint-disable-next-line no-multi-assign
  const backUp2 = ts.data[0][0][0][0][0] = 0; // Add fake 0
  ts.data[0][1] = NaN; // Suppose version 2 failed
  console.assert(ts.count('all') === 36);
  console.assert(ts.count('NaN') === 12);
  console.assert(ts.count('zero') === 1);
  ts.data[0][1] = backUp1;
  ts.data[0][0][0][0][0] = backUp2;

  // Print
  ts.print();

  // CSV
  ts.toCSV(true);
  ts.toCSV(false);
};

const plotGenerator = function () {
  const pg = new PG.PlotGenerator(loader.data);

  // Generate default plot
  pg.getFigure();

  // Test all presets
  // Preset errors are currently caught to avoid browser errors. Look at
  // console for errors.
  pg.listPresets().forEach((x) => {
    pg.loadPreset(x);
    pg.getFigure();
  });

  pg.loadPreset('Default');

  // Test all plot types
  pg.listPlotTypes().forEach((x) => {
    pg.setParameter('type', x);
    pg.getFigure();
  });
};

/**
 * Unit testing function for TreeSearcher, PlotGenerator and math utilities.
 */
module.exports.unitTesting = function () {
  console.log('Testing math functions...');
  mathUtilities();
  console.log('Testing search algorithm...');
  searchTesting();
  treeMethodsTesting();
  console.log('Testing plot generation...');
  plotGenerator();
  console.log('Testing ended.');
};
