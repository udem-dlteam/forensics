/**
 * @file plot_setting.js
 * @fileOverview Declare implemented plot settings
 * @author Sacha Morin
 */

/**
 * Declare plot settings and possible options
 * @type {Array.<Object>}
 * @constant
 */
module.exports.PLOTSETTINGS = [
  // The dataset variable is a meta variable to allow user to compare
  // different trees. As opposed, to other variables, it is not read from
  // trees and will always be available. Handled in the PlotGenerator
  // class
  {
    name: 'dataset',
    options: null,
    multiOption: true,
    isVariable: true,
  },
  {
    name: 'title',
    options: [''],
    multiOption: false,
    isVariable: false,
  },
  {
    name: 'type', // Plot type. See plot_types.js
    options: null,
    multiOption: false,
    isVariable: false,
  },
  {
    name: 'x', // Variable on the x axis
    options: null,
    multiOption: false,
    isVariable: false,
  },
  {
    name: 'series', // Variable on the series (z) axis
    options: null,
    multiOption: false,
    isVariable: false,
  },
  {
    name: 'mean', // Will average all series to output only one
    options: ['yes', 'no'],
    multiOption: false,
    isVariable: false,
  },
  // Forces plot to display 0 on the axis. Prevents deceptive scaling
  {
    name: 'toZero',
    options: ['yes', 'no'],
    multiOption: false,
    isVariable: false,
  },
  {
    name: 'norm', // Normalize data
    options: ['none', 'minimum', 'median', 'maximum'],
    multiOption: false,
    isVariable: false,
  },
  {
    name: 'yScale', // Y axis scale
    options: ['auto', 'linear', 'log'],
    multiOption: false,
    isVariable: false,
  },
  // Baseline allows to 'clone' a variable and compare two groups of said
  // variable, all else being equals (ex: two versions or two systems)
  {
    name: 'baseline',
    options: [],
    multiOption: false,
    isVariable: false,
  },
  {
    name: 'sortX', // Sort x axis using average performance
    options: ['yes', 'no'],
    multiOption: false,
    isVariable: false,
  },
  // Auto will select option previous to the one selected in main variable
  {
    name: 'baselineMode',
    options: ['auto', 'manual'],
    multiOption: false,
    isVariable: false,
  },
];
