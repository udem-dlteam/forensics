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
    pg.setParameter('x', 'zipi-version');
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
  commit = pg.datasets.get('zipi').getLastOption('zipi-version')) {
  
    try {
      pg.setParameter('x', 'benchmarks');
      pg.setParameter('type', 'comparator');
      pg.setParameter('measure', 'real time');
      pg.setParameter('series', 'zipi-version');
      pg.setParameter('sortX', 'yes');
      pg.all();

      pg.setParameter('zipi-version', commit);
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
  commit = pg.datasets.get('zipi').getLastOption('zipi-version')

  let commit_cpython = pg.datasets.get('cpython').cat[0].filter(x => !x.startsWith("XX "))
  console.log(pg)
  console.log(commit_cpython)
  if (commit_cpython.includes("2105082220 v3.10")){
    commit_cpython = "2105082220 v3.10"
  }
  else{
    commit_cpython = commit_cpython[0]
  }

  console.log(commit_cpython)
  zipi_commit = pg.datasets.get('zipi').cat[0].filter(x => !x.startsWith("XX "))[0]
  zipi_setting = pg.datasets.get('zipi').getLastOption('zipi-settings')

  try {
    pg.setParameter('x', 'benchmarks');
    pg.setParameter('type', 'comparator');
    pg.setParameter('measure', 'real time');
    pg.setParameter('series', 'dataset');
    pg.setParameter('sortX', 'yes');
    pg.all();

    pg.setParameter('zipi-version', commit);
    pg.setParameter('zipi-settings', zipi_setting)
    pg.setParameter('cpython-version', commit_cpython)
    pg.setParameter('yScale', 'log')
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
 const commitComparator = function (pg, presetName) {
  let commit_cpython = pg.datasets.get('cpython').cat[0].filter(x => !x.startsWith("XX -"))
  console.log(pg)
  if (commit_cpython.includes("2105082220 v3.10")){
    commit_cpython = "2105082220 v3.10"
  }
  else{
    commit_cpython = commit_cpython[0]
  }
  zipi_commit = pg.datasets.get('zipi').cat[0].filter(x => !x.startsWith("XX -"))[0]
  zipi_setting = pg.datasets.get('zipi').getLastOption('zipi-settings')
  try {
    pg.setParameter('x', 'benchmarks');
    pg.setParameter('type', 'comparator');
    pg.setParameter('measure', 'real time');
    pg.setParameter('series', 'zipi-version');
    pg.setParameter('sortX', 'yes');
    pg.all();

    pg.setParameter('zipi-version', commit);
    pg.setParameter('zipi-settings', zipi_setting)
    pg.setParameter('cpython-version', commit_cpython)
    pg.setParameter('yScale', 'log')

  } catch (e) {
    presetError(presetName, e);
  }
};

// Bind presetName to function
const presetMap = new Map();
presetMap.set('AvgBenchAllVersion', avgBenchAllVersion);
presetMap.set('benchAllVersion', benchAllVersion);
presetMap.set('SystemComparator', systemComparator);
presetMap.set('CommitComparator', commitComparator);
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
