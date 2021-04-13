/**
 * @file presets.js
 * @fileOverview To add new preset, write a function setting the right
 * parameters for plot generator (see examples) and bind it to a preset
 * name in the Map at the end of this file. Look at data structure and
 * plot_settings.js for parameter names and available options.
 * @author Sacha Morin
 */

/**
 * @namespace preset
 */

const presetError = function (presetName, error) {
  console.log(`Could not set config ${presetName} because of following error:`);
  throw error;
};

/**
 * Real time average of all benchmarks over all gambit versions
 * @param {PlotGenerator} pg
 * @param {string} presetName
 * @memberOf preset
 */
const avgBenchAllVersion = function (pg, presetName) {
  try {
    pg.setParameter('x', 'gambit-version');
    pg.setParameter('type', 'all systems');
    pg.setParameter('measure', 'real time');
    pg.setParameter('toZero', 'yes');
    pg.setParameter('dataset', 'all');
    pg.all();
    pg.setParameter('setting', 0);
  } catch (e) {
    presetError(presetName, e);
  }
};

/**
 * Real time of one benchmarks over all gambit versions
 * @param {PlotGenerator} pg
 * @param {string} presetName
 * @memberOf preset
 */
const benchAllVersion = function (pg, presetName) {
  try {
    pg.setParameter('x', 'gambit-version');
    pg.setParameter('type', 'all systems');
    pg.setParameter('measure', 'real time');
    pg.setParameter('toZero', 'yes');
    pg.setParameter('dataset', 'all');
    pg.all();
    pg.setParameter('bench', 0);
    pg.setParameter('setting', 0);
  } catch (e) {
    presetError(presetName, e);
  }
};

/**
 * Compares two versions' real time performance over all benchmarks
 * @param {PlotGenerator} pg
 * @param {string} presetName
 * @param {string} [commit=last commit] - Will default to last commit
 * @memberOf preset
 */
const versionComparator = function (pg, presetName,
  commit = pg.datasets.get('gambit').getLastOption('gambit-version')) {
  try {
    pg.setParameter('x', 'bench');
    pg.setParameter('type', 'comparator');
    pg.setParameter('measure', 'real time');
    pg.setParameter('series', 'gambit-version');
    pg.setParameter('sortX', 'yes');
    pg.all();

    pg.setParameter('gambit-version', commit);
  } catch (e) {
    presetError(presetName, e);
  }
};

/**
 * Compares two versions' real time performance over all benchmarks.
 * Displays top 10 benchmarks with annotations
 * @param {PlotGenerator} pg
 * @param {string} presetName
 * @param {string} commit - Will default to last commit
 * @memberOf preset
 */
const head = function (pg, presetName, commit) {
  try {
    versionComparator(pg, presetName, commit);
    pg.setParameter('type', 'head');
  } catch (e) {
    presetError(presetName, e);
  }
};

/**
 * Compares two versions' real time performance over all benchmarks.
 * Displays bottom 10 benchmarks with annotations
 * @param {PlotGenerator} pg
 * @param {string} presetName
 * @param {string} commit - Will default to last commit
 * @memberOf preset
 */
const tail = function (pg, presetName, commit) {
  try {
    versionComparator(pg, presetName, commit);
    pg.setParameter('type', 'tail');
  } catch (e) {
    presetError(presetName, e);
  }
};

/**
 * Comparison of all systems over all versions and one benchmark
 * @param {PlotGenerator} pg
 * @param {string} presetName
 * @memberOf preset
 */
const systemComparator = function (pg, presetName) {
  try {
    pg.setParameter('x', 'dataset');
    pg.setParameter('type', 'ordered bars');
    pg.setParameter('measure', 'real time');
    pg.setParameter('series', 'bench');
    pg.setParameter('sortX', 'yes');
    pg.all();
    pg.setParameter('dataset', 'all');
    pg.setParameter('bench', 0);
  } catch (e) {
    presetError(presetName, e);
  }
};

// Bind presetName to function
const presetMap = new Map();
presetMap.set('AvgBenchAllVersion', avgBenchAllVersion);
presetMap.set('benchAllVersion', benchAllVersion);
presetMap.set('SystemComparator', systemComparator);
presetMap.set('VersionComparator', versionComparator);
presetMap.set('head', head);
presetMap.set('tail', tail);

/**
 * Takes in a preset name and sets PlotGenerator accordingly
 * @param {PlotGenerator} pg
 * @param {string} presetName
 * @param {string} commit - Used by some preset to set a specific value on
 * the x axis
 * @memberOf preset#
 */
module.exports.presetRouter = function (pg, presetName, commit) {
  // Start from default
  pg.setDefault();

  if (presetName === 'Default') return;

  const func = presetMap.get(presetName);

  if (func === undefined) {
    throw new Error('Please enter a valid preset name for PlotGenerator.');
  }

  func(pg, presetName, commit);
};

/**
 * Returns available presets
 * @returns {Array.<string>}
 */
module.exports.presetNames = function () {
  return Array.from(presetMap.keys());
};
