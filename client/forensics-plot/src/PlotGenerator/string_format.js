/**
 * @file stringFormat.js
 * @fileOverview Defines how string should be formatted
 * @author Sacha Morin
 */

// Returns string that should be displayed for a given option
// Map string to formatted string
const stringMap = new Map();
stringMap.set('bench', 'Benchmarks');
stringMap.set('gambit-version', 'Gambit Revisions');
stringMap.set('chez-version', 'Chez Revisions');
stringMap.set('type', 'Plot Type');
stringMap.set('x', 'X axis');
stringMap.set('measure', 'Y axis');
stringMap.set('series', 'Z axis (traces)');
stringMap.set('toZero', 'Sticky Zero');
stringMap.set('norm', 'Normalization');
stringMap.set('yScale', 'Y axis Scale');
stringMap.set('sortX', 'Sort X axis');
stringMap.set('dataset', 'System');
stringMap.set('baselineMode', 'Baseline Mode');

const capWord = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Table of groups whose member strings should not be formatted
const DONOTFORMAT = ['gambit-version', 'setting', 'bench'];

/**
 * Global string formatter
 * @param {string} str - String to be formatted
 * @param {string} group - String's family. str will usually be a variable
 * category and group will be variable's name. Can be used with DONOFORMAT
 * to avoid formatting for some groups
 * @returns {string}
 */
module.exports.stringFormat = function (str, group) {
  // Check if group prevents formatting
  if (DONOTFORMAT.includes(group)) return str;

  // Retrieve formatted string or, if undefined, default to capitalized string
  const formattedStr = stringMap.get(str);

  if (formattedStr === undefined) {
    return str.split(/[- _]/).map(x => capWord(x)).join(' ');
  }

  return formattedStr;
};
