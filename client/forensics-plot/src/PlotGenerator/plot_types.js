/**
 * @file plot_types.js
 * @fileOverview Provides functions to return plotly objects
 * @author Sacha Morin
 */

/**
 * @namespace plot_figures
 */

/**
 * @typedef {Object} PlotlyFigure - Object describing format as per Plotly
 * specs
 * @property {Object} data - Data to be displayed on plot
 * @property {Object} layout - Object describing plot format as per Plotly
 * specs
 */

const mathUtil = require('../utilities/math_utilities.js');
const pretty = require('./string_format');

/**
 * Precision to be used in labels
 * @constant
 * @type {number}
 */
const PRECISION = 4;

/**
 * Array to declare plot type names
 * To add plot type, add name to PLOTTYPES, add lock policy to LOCKPOLICY,
 * write a function returning desired plotly figure and bind it to the name
 * in the switch at the end of plot_types.js
 * @constant
 * @type {Array}
 */
module.exports.PLOTTYPES = [
  'line plot',
  'bar chart',
  'standard deviation',
  'ordered bars',
  'comparator',
  'head',
  'tail',
  'all systems',
];

/**
 * Array to declare lock policy. Should be declared in the same
 * order as PLOTTYPES, with an object describing lock policy for the
 * associated plot type. PlotGenerator will lock settings in settinNames to
 * the options declared in options. Used when some settings are
 * incompatible with a given plot type or when some interaction is not
 * implemented in PlotGenerator.getFigure(). null indicates that plot type
 * is compatible with all plot settings
 * @constant
 * @type {Array}
 */
module.exports.LOCKPOLICY = [
  null,
  { settingNames: ['toZero'], options: ['no'] },
  null,
  { settingNames: ['toZero'], options: ['no'] },
  {
    settingNames: ['toZero', 'mean', 'norm'],
    options: ['no', 'yes', 'none', 'auto'],
  },
  {
    settingNames: ['toZero', 'mean', 'norm', 'yScale', 'sortX'],
    options: ['no', 'yes', 'none', 'auto', 'yes'],
  },
  {
    settingNames: ['toZero', 'mean', 'norm', 'yScale', 'sortX'],
    options: ['no', 'yes', 'none', 'auto', 'yes'],
  },
  {
    settingNames: ['x', 'series', 'mean'],
    options: ['gambit-version', 'dataset', 'no'],
  },
];

// Helper function to get template plotly data object
const plotlyData = function (x, y, traces, color) {
  // Hover content will display y by default or default to
  // x if y is not continuous
  let hoverContent = y;

  if (y.length >= 1 && typeof y[0] === 'number') {
    hoverContent = y.map(e => e.toFixed(PRECISION));
  }

  return {
    x,
    y,
    hoverinfo: `${traces.length === 1 ? '' : 'name'}+text`,
    text: hoverContent,
    line: { color },
  };
};

// Helper function to get default plotly layout
const defLayout = function (title, xName, yName, traces) {
  let titleCopy = title;

  // Title formatting
  // Use trace name as title if only one trace and no specified title
  let marginLayout = {};
  if (title === '' || title === null) {
    if (traces.length === 1 && title === '') {
      [titleCopy] = traces;
    } else {
      // Remove title space if no title is specified
      const margin = 80;
      marginLayout = {
        l: margin,
        r: margin,
        b: margin,
        t: margin - 40,
        pad: 0,
      };
    }
  }

  return {
    title: titleCopy,
    titlefont: {
      size: 24,
    },
    xaxis: {
      title: { text: pretty.stringFormat(xName), font: {} },
      automargin: true,
    },
    yaxis: {
      title: { text: pretty.stringFormat(yName), font: {} },
      automargin: true,
      // Specifies tick format by zoom level (see d3 formatting mini-language)
      tickformatstops: [
        {
          dtickrange: [null, 0.00009],
          value: '', // Default Plotly formatting
        },
        {
          dtickrange: [0.0001, 0.0009],
          value: '.4f',
        },
        {
          dtickrange: [0.001, 0.009],
          value: '.3f',
        },
        {
          dtickrange: [0.01, 0.09],
          value: '.2f',
        },
        {
          dtickrange: [0.1, 1],
          value: '.1f',
        },
        {
          dtickrange: [1, null],
          value: '', // Default Plotly formatting
        }],
    },
    showlegend: !(traces.length === 1),
    margin: marginLayout,
    annotations: [],
  };
};

// Returns -1 if more than one non-NaN value. Otherwise returns the index
// of the non-NaN value
const hasUniqueNonNan = function (arr) {
  let flag = -1;
  for (let i = 0; i < arr.length; i += 1) {
    if (!Number.isNaN(arr[i])) {
      if (flag === -1) {
        flag = i;
      } else {
        return -1;
      }
    }
  }
  return flag;
};

/**
 * Standard scatter plot
 * @param {string} title - Plot title
 * @param {string} xName - X axis name
 * @param {Array} xSerie - Labels to be displayed on the x axis
 * @param {string} yName - Y axis name
 * @param {Matrix} ySeries - Data to be displayed
 * @param {Array} traces - Trace labels
 * @param {boolean} horizMode - Special mode when x is set to
 * gambit-version, but one point from other compilers should also be
 * displayed. If only one point is available, plot will display a dashed line
 * instead of a point
 * @param {string[]} colors
 * @returns {PlotlyFigure}
 * @memberOf plot_figures#
 */
const linePlot = function (title, xName, xSerie,
  yName, ySeries, traces, horizMode, colors) {
  const layout = defLayout(title, xName, yName, traces, xSerie);

  const dataGraph = ySeries.map((e, i) => {
    const dataTemp = plotlyData(xSerie, e, traces, colors[i]);
    dataTemp.name = traces[i];
    dataTemp.mode = 'lines+markers';
    dataTemp.hoverinfo += '+x';

    // Horizontal line mode
    // If only one point is not a NaN, use said point to draw a horizontal
    // line on plot
    if (horizMode) {
      const nonNaNIdx = hasUniqueNonNan(e);
      if (nonNaNIdx !== -1) {
        // Clone non-NaN point
        dataTemp.y = e.map((w, j, a) => a[nonNaNIdx]);
        // Add a marker to the point that was used to draw the line
        dataTemp.text = e[nonNaNIdx].toFixed(PRECISION);
        dataTemp.line.width = 1;
        dataTemp.line.dash = '5px,1px';
        dataTemp.mode = 'lines';
      }
    }

    return dataTemp;
  });

  return {
    data: dataGraph,
    layout,
  };
};

const prettyHover = (i, j, t, errors) => `${t} ± ${
  (errors[i][j]).toFixed(PRECISION)}`;

const percentAndFactorFromPercent = function (percent) {
    percent = parseFloat(percent);
    var div = 1 + percent/100;
    if (div === 0.0) {
        return '';
    } else {
        var factor = 1/div;
        var precision1 = (percent<-99) ? 1 : 0;
        var precision2 = (factor<=0.03) ? 3 : (factor<=0.3) ? 2 : 1;
        return ((percent>=0) ? '+' : '') + percent.toFixed(precision1) + '% (' + factor.toFixed(precision2) + 'x)';
    }
}

const percentAndFactorFromRatio = function (value, reference) {
    if (reference === 0.0) {
        return '';
    } else {
        return percentAndFactorFromPercent((value / reference - 1) * 100);
    }
}

const errorFormat = function (dataTemp, errors, traces, traceIdx, ySeries, main) {
  dataTemp.name = traces[traceIdx];
  dataTemp.type = 'scatter';
  if (main) {
    dataTemp.hoverinfo = 'text+name';
    dataTemp.mode = 'lines';
    dataTemp.text = dataTemp.text.map((t, j) => prettyHover(traceIdx, j, t, errors));
    dataTemp.showlegend = true;
  } else {
    dataTemp.hoverinfo = 'skip';
    dataTemp.mode = 'lines';
    dataTemp.text = null;
    dataTemp.showlegend = false;
    dataTemp.fill = 'tozerox';
    dataTemp.line.width = 0;
  }


  return dataTemp;
};


/**
 * Standard scatter plot with error bars. Currently, app uses standard
 * deviation as the error measure
 * @param {string} title - Plot title
 * @param {string} xName - X axis name
 * @param {Array} xSerie - Labels to be displayed on the x axis
 * @param {string} yName - Y axis name
 * @param {Matrix} ySeries - Data to be displayed
 * @param {Array} traces - Trace labels
 * @param {Matrix} errors - Error values
 * @param {boolean} horizMode - Special mode when x is set to
 * gambit-version, but one point from other compilers should also be
 * displayed. If only one point is available, plot will display a dashed line
 * instead of a point
 * @param {string[]} colors
 * @returns {PlotlyFigure}
 * @memberOf plot_figures#
 */
const errorBar = function (title, xName, xSerie,
  yName, ySeries, traces, errors, horizMode, colors) {
  const dataGraph = [];

  const layout = defLayout(title, xName, yName, traces, xSerie);
  layout.xaxis.zeroline = false;
  layout.xaxis.showline = false;
  layout.yaxis.zeroline = false;
  layout.yaxis.showline = false;

  for (let i = 0; i < ySeries.length; i += 1) {
    const nonNaNIdx = hasUniqueNonNan(ySeries[i]);
    const hori = horizMode && nonNaNIdx !== -1;
    let dataTrace;
    let errorTrace;
    if (hori) {
      // Horizontal line mode
      // If only one point is not a NaN, use said point to draw a horizontal
      // line on plot
      // Clone non-NaN point
      dataTrace = ySeries[i].map((w, j, a) => a[nonNaNIdx]);

      const errorTop = ySeries[i][nonNaNIdx] + errors[i][nonNaNIdx];
      const errorBottom = ySeries[i][nonNaNIdx] - errors[i][nonNaNIdx];

      errorTrace = new Array(ySeries[i].length)
        .fill(errorTop).concat(new Array(ySeries[i].length).fill(errorBottom));
    } else {
      // Standard mode
      dataTrace = ySeries[i];
      errorTrace = ySeries[i]
        .map((y, j) => y + errors[i][j])
        .concat(ySeries[i]
          .map((y, j) => y - errors[i][j]).slice().reverse());
    }
    // Error trace format is weird. See plotly doc for continuous error bars
    let mainLine = plotlyData(xSerie, dataTrace, traces, colors[i]);
    let topLine = plotlyData(
      xSerie.concat(xSerie.slice().reverse()),
      errorTrace,
      traces,
      colors[i],
    );
    mainLine = errorFormat(mainLine, errors, traces, i, ySeries, true);
    topLine = errorFormat(topLine, errors, traces, i, ySeries, false);

    if (hori) {
      // Hori mode post processing
      const hover = prettyHover(
        i,
        nonNaNIdx,
        ySeries[i][nonNaNIdx].toFixed(PRECISION),
        errors,
      );
      mainLine.text = mainLine.y.map(() => hover);
      mainLine.line.dash = '5px,1px';
    }

    dataGraph.push(topLine, mainLine);
  }

  return {
    data: dataGraph,
    layout,
  };
};

/**
 * Provides a standard bar chart for other plot types with annotations and
 * custom colors
 * @param {string} title - Plot title
 * @param {string} xName - X axis name
 * @param {Array} xSerie - Labels to be displayed on the x axis
 * @param {string} yName - Y axis name
 * @param {Matrix} ySeries - Data to be displayed
 * @param {Array} traces - Trace labels
 * @param {Matrix} errors - Error values to be displayed
 * @param {string[]} colors
 * @param {Array.<string>} [labels=false] - Annotations to be displayed on
 * top or beside bars. Set to false for no annotations
 * @param {boolean} [horizontal=true]
 * @returns {PlotlyFigure}
 * @memberOf plot_figures#
 */
const performanceBars = function (title, xName, xSerie,
  yName, ySeries, traces,
  errors, colors, labels = false, horizontal = true) {
  const dataGraph = [];

  // Default layout while switching y and x
  const layout = defLayout(title, xName, yName, traces, xSerie);

  // Switch formatting from y-axis to x-axis (bars are horizontal)
  if (horizontal) {
    const xCopy = { ...layout.xaxis };
    layout.xaxis = { ...layout.yaxis };
    layout.yaxis = xCopy;
  }

  // Specific layout
  layout.barmode = 'group';
  layout.yaxis.ticklen = 15; // Increase distance between labels and axis
  layout.yaxis.tickcolor = 'white';
  layout.xaxis.zeroline = false;
  layout.xaxis.gridwidth = 2;

  for (let i = 0; i < ySeries.length; i += 1) {
    let dataTemp;
    if (horizontal) {
      dataTemp = plotlyData(ySeries[i], xSerie, traces, colors[i]);
      if (errors) {
        dataTemp.error_x = {
          type: 'data',
          array: errors[i],
          visible: true,
        };
      }
    } else {
      dataTemp = plotlyData(xSerie, ySeries[i], traces, colors[i]);
      if (errors) {
        dataTemp.error_y = {
          type: 'data',
          array: errors[i],
          visible: true,
        };
      }
    }
    if (ySeries.length === 1) {
      dataTemp.marker = { color: colors };
    } else {
      dataTemp.marker = { color: colors[i] };
    }
    dataTemp.text = ySeries[i].map(x => x.toFixed(PRECISION));
    dataTemp.name = traces[i];
    dataTemp.type = 'bar';
    if (horizontal) dataTemp.orientation = 'h';
    dataTemp.opacity = 0.7;
    dataGraph.push(dataTemp);

    // Push annotations. Annotations are only displayed if only on series
    // is given to plot
    if (ySeries.length === 1 && labels !== false) {
      ySeries[0].forEach((e, j, a) => {
        if (!Number.isNaN(e) && e !== null) {
          layout.annotations.push(
            {
              x: e + (errors ? errors[0][j] : 0),
              y: xSerie[j],
              align: e >= 0 ? 'left' : 'right',
              xanchor: e >= 0 ? 'left' : 'right',
              text: labels[j],
              showarrow: false,
              font: { color: colors[j], size: 110 / a.length },
            },
          );
        }
      });
    }
  }

  return {
    data: dataGraph,
    layout,
  };
};

/**
 * Horizontal bar plot with annotations displaying relative difference with
 * minimum bar on plot
 * @param {string} title - Plot title
 * @param {string} xName - X axis name
 * @param {Array} xSerie - Labels to be displayed on the x axis
 * @param {string} yName - Y axis name
 * @param {Matrix} ySeries - Data to be displayed
 * @param {Array} traces - Trace labels
 * @param {boolean} labels - Annotations to be displayed beside bars
 * @param {Matrix} errors - Error values to be displayed
 * @param {string[]} colors
 * @returns {PlotlyFigure}
 * @memberOf plot_figures#
 */
const barAnnotatedHor = function (title, xName, xSerie,
  yName, ySeries, traces, labels, errors, colors) {
  let labelsCopy = labels;

  if (ySeries.length === 1 && labels) {
    // Generate labels if required
    // Find series min
    const min = mathUtil.minimum(ySeries[0]);

    // Compute labels relative to series minimum
    labelsCopy = ySeries[0].map(e => percentAndFactorFromRatio(e, min));
  }


  // Get side bar plot with labels and colors
  const plot = performanceBars(title, xName, xSerie, yName,
    ySeries, traces, errors, colors, labelsCopy);

  plot.data.forEach((x) => { x.hoverinfo = 'text'; });
  plot.data.forEach((x, j) => {
    x.text = x.text
      .map((y, i) => `${xSerie[i]} : ${y} ± ${
        errors[j][i].toFixed(PRECISION)}`);
  });

  return plot;
};

/**
 * Comparator plot type (bar chart) with colors to signal how far from 0 the
 * measure is. Also supports annotations
 * @param {string} title - Plot title
 * @param {string} xName - X axis name
 * @param {Array} xSerie - Labels to be displayed on the x axis
 * @param {string} yName - Y axis name
 * @param {Matrix} ySeries - Data to be displayed
 * @param {Array} traces - Trace labels
 * @param {boolean} labels - Show relative difference as plot annotations
 * @param {number} tolerance - Bars within ± tolerance will be yellow. <
 * tolerance will be green (faster) and > tolerance will be red (slower).
 * This behavior can be adjusted in the colorSwitch method
 * @param {boolean} autorange - Whether default ploty axis range should be
 * used. Otherwise, plot will display at least - tolerance to + tolerance
 * to avoid deceptive scaling
 * @param {Matrix} errors - Error values to be displayed
 * @param {string[]} colors
 * @param {boolean} [horizontal = false]
 * @returns {PlotlyFigure}
 * @memberOf plot_figures#
 */
const comparator = function (title, xName, xSerie,
  yName, ySeries, traces, labels, tolerance,
  autorange, errors, colors, horizontal = false) {
  let labelsCopy = labels;

  // Range
  let range = null;

  if (ySeries.length === 1) {
    // Add annotations
    if (labels && ySeries.length === 1) {
      // Displays percentage
      labelsCopy = ySeries[0].map(x => percentAndFactorFromPercent(x) + ' ');
    }

    // Compute range
    const min = mathUtil.minimum(ySeries[0]);
    const max = mathUtil.maximum(ySeries[0]);

    if (autorange || min < -tolerance || max > tolerance) {
      // If significant change exists, range can fit data.
      // null will default to plotly default range, which fits data and
      // labels nicely, but can display a deceptive scale.
      range = null;
    } else {
      // To show that bars are smaller than given tolerance
      range = [-tolerance * 1.1, tolerance * 1.1];
    }
  }

  // Get default side bar plot
  const horiz = performanceBars(title, xName, xSerie, yName,
    ySeries, traces, errors, colors, labelsCopy, horizontal);

  const target = horizontal ? 'xaxis' : 'yaxis';

  horiz.layout[target].ticksuffix = '%';
  horiz.layout[target].range = range;
  horiz.data.forEach((x) => { x.hoverinfo = 'text'; });
  horiz.data.forEach((x, j) => {
    x.text = x.text
      .map((y, i) => (`${xSerie[i]} : ${percentAndFactorFromPercent(y)}${errors ? ` ± ${errors[j][i].toFixed(PRECISION)} %` : ''}`));
  });

  return horiz;
};

/**
 * Vanilla bar chart
 * @param {string} title - Plot title
 * @param {string} xName - X axis name
 * @param {Array} xSerie - Labels to be displayed on the x axis
 * @param {string} yName - Y axis name
 * @param {Matrix} ySeries - Data to be displayed
 * @param {Array} traces - Trace labels
 * @param {string[]} colors
 * @returns {PlotlyFigure}
 * @memberOf plot_figures#
 */
const barChart = function (title, xName, xSerie,
  yName, ySeries, traces, colors) {
  const dataGraph = [];

  const layout = defLayout(title, xName, yName, traces, xSerie);
  layout.barmode = 'group';

  for (let i = 0; i < ySeries.length; i += 1) {
    const dataTemp = plotlyData(xSerie, ySeries[i], traces, colors[i]);
    dataTemp.name = traces[i];
    dataTemp.type = 'bar';
    if (ySeries.length === 1) {
      dataTemp.marker = { color: colors };
    } else {
      dataTemp.marker = { color: colors[i] };
    }
    dataGraph.push(dataTemp);
  }

  return {
    data: dataGraph,
    layout,
  };
};


/**
 * Binds right function call to plotName
 * @param {string} plotName
 * @param {string} title - Plot title
 * @param {string} xName - X axis name
 * @param {Array} xLabels - Labels to be displayed on the x axis
 * @param {string} measure - Current measure (will be displayed on the y axis)
 * @param {string} seriesName - Z axis
 * @param {Matrix} data - Data to be displayed on plot
 * @param {Array} seriesLabels - Series labels (will be used as trace names)
 * @param {number} tolerance - See comparator plot type
 * @param {PlotGenerator} pg - PlotGenerator Object
 * @param {Matrix} errors - Error values
 * @param {string[]} colors
 * @returns {PlotlyFigure}
 * @memberOf plot_figures#
 */
module.exports.plotTypeRouter = function (plotName, title, xName, xLabels,
  measure, seriesName, data,
  seriesLabels, tolerance, pg, errors, colors) {
  switch (plotName) {
    case 'line plot':
      return linePlot(
        title,
        xName,
        xLabels,
        measure,
        data,
        seriesLabels,
        false,
        colors,
      );

    case 'bar chart':

      return barChart(
        title,
        xName,
        xLabels,
        measure,
        data,
        seriesLabels,
        colors,
      );

    case 'standard deviation':

      return errorBar(
        title,
        xName,
        xLabels,
        measure,
        data,
        seriesLabels,
        errors,
        false,
        colors,
      );

    case 'ordered bars':

      return barAnnotatedHor(
        title,
        xName,
        xLabels,
        measure,
        data,
        seriesLabels,
        true,
        errors,
        colors,
      );

    case 'comparator':
      return comparator(
        title,
        xName,
        xLabels,
        measure,
        data,
        seriesLabels,
        false,
        tolerance * 100, // Comparator is coded on a percentage basis
        false,
        errors,
        colors,
      );

    case 'head':
      // Top 10 of comparator plot type with labels
      return comparator(
        title,
        xName,
        xLabels.slice(0, 20).reverse(),
        measure,
        [data[0].slice(0, 20).reverse()],
        seriesLabels,
        true,
        tolerance * 100,
        false,
        false,
        colors.slice(0, 20).reverse(),
        true,
      );

    case 'tail':
      // Bottom 10 of comparator plot type with labels
      return comparator(
        title,
        xName,
        xLabels.slice(-20).reverse(),
        measure,
        [data[0].slice(-20).reverse()],
        seriesLabels,
        true,
        tolerance * 100,
        false,
        false,
        colors.slice(-20).reverse(),
        true,
      );

    case 'all systems':
      return errorBar(
        title,
        xName,
        xLabels,
        measure,
        data,
        seriesLabels,
        errors,
        true,
        colors,
      );

    default:
      console.log('Please set a valid plot type.');
      return null;
  }
};
