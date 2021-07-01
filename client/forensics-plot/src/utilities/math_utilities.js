/**
 * @file math_utilities.js
 * @fileOverview Math utilities
 * @author Sacha Morin
 */

/**
 * @namespace math
 */

/**
 * @typedef {Array.<Array.<number>>} Matrix
 */

/**
 * Filters out NaNs from array.
 * @param {number[]} series
 * @returns {number[]}
 * @memberOf math#
 */
module.exports.stripNan = function (series) {
  return series.filter(value => !Number.isNaN(value));
};

/**
 * Strip NaNs in references and all values in other arrays sharing same index
 * @param {Array} reference - Array to use as reference for NaNs
 * will be sorted following the same order.
 * @param {...Array} rest
 * @returns {Array.<Array.<number>>}
 * @memberOf math#
 */
module.exports.paraStripNan = function (reference, ...rest) {
  if (!rest.every(x => x.length === reference.length)) {
    throw new Error("Can't strip NaNs in parallel arrays of unequal length.");
  }

  // Get all elements on same index level in same array
  const sortObject = reference
    .map((x, i) => [x, ...rest.map(y => y[i])]);

  // Remove lines where reference is NaN
  // Transpose and return
  return module.exports
    .transpose(sortObject.filter(line => !Number.isNan(line[0])));
};

/**
 * Checks if two matrices are equal. IMPORTANT: NaNs === NaNs returns true
 * in the context of this function.
 * @param {Matrix} mx1
 * @param {Matrix} mx2
 * @returns {boolean}
 * @memberOf math#
 */
module.exports.matrixEquals = function (mx1, mx2) {
  if (mx1 === undefined || mx2 === undefined) return false;

  if (mx1.length === 0 || mx2.length === 0) {
    return mx1.length === 0 && mx2.length === 0;
  }

  if (mx1.length !== mx2.length) return false;

  return mx1.every((x, i) => module.exports.arrayEquals(x, mx2[i]));
};

/**
 * Checks if two arrays are equal. IMPORTANT: NaNs === NaNs returns true
 * in the context of this function.
 * @param {number[]} arr1
 * @param {number[]} arr2
 * @returns {boolean}
 * @memberOf math#
 */
module.exports.arrayEquals = function (arr1, arr2) {
  if (arr1 === undefined || arr2 === undefined) return false;

  if (arr1.length === 0 || arr2.length === 0) {
    return arr1.length === 0 && arr2.length === 0;
  }

  if (arr1.length !== arr2.length) return false;

  // Element by element comparison
  for (let i = 0; i < arr1.length; i += 1) {
    if (arr1[i] !== arr2[i]
      && !(Number.isNaN(arr1[i])
        && Number.isNaN(arr2[i]))) {
      return false;
    }
  }

  return true;
};

/**
 * Returns array mean. Ignores NaNs.
 * @param {number[]} arr
 * @returns {number}
 * @memberOf math#
 */
module.exports.mean = function (arr) {
  const arrayStripped = module.exports.stripNan(arr);
  if (arrayStripped.length === 0) return NaN;
  return arrayStripped.reduce((total, e) => total + e) / arrayStripped.length;
};

/**
 * Computes square root of averaged variance from an array of standard
 * deviations. Used to reduce standard deviation arrays
 * Function assumes that random variables are uncorrelated, hence the lack
 * of added covariance
 * @param {number[]} sd - Standard Deviations
 * @returns {number}
 * @memberOf math#
 */
module.exports.standardDeviation = function (sd) {
  const sdStripped = module.exports.stripNan(sd);

  if (sdStripped.length === 0) return NaN;

  const variance = sdStripped.map(s => s ** 2);

  return Math.sqrt(variance.reduce((total, e) => total + e))
    / sdStripped.length;
};

/**
 * Performs reduce computation on a matrix
 * @param {Matrix} mx
 * @param {number} axis - Axis used for reduction. 0 for lines and 1 for
 * columns.
 * @param reducer - Function used to reduce an array (series) to a single float
 * @returns {number[]}
 * @memberOf math#
 */
module.exports.mxReduce = function (mx, axis, reducer) {
  if (axis !== 0 && axis !== 1) {
    throw new Error('Please choose the first or second axis to reduce matrix.');
  }

  let mxCopy;

  if (axis === 0) {
    mxCopy = module.exports.transpose(mx);
  } else {
    mxCopy = mx;
  }


  return mxCopy.map(line => reducer(line));
};

/**
 * Returns matrix mean along one of its axes
 * @param {Matrix} mx
 * @param {number} axis
 * @returns {number[]}
 * @memberOf math#
 */
module.exports.mxMean = function (mx, axis) {
  return module.exports.mxReduce(mx, axis, module.exports.mean);
};

/**
 * Returns matrix standard deviation along one of its axes, assuming random
 * variables were averaged
 * @param {Matrix} mx
 * @param {number} axis
 * @returns {number[]}
 * @memberOf math#
 */
module.exports.mxAverageSD = function (mx, axis) {
  return module.exports.mxReduce(mx, axis, module.exports.standardDeviation);
};

/**
 * Transpose matrix
 * @param {Matrix} mx
 * @returns {Matrix}
 * @memberOf math#
 */
module.exports.transpose = function (mx) {
  if (mx.length === 0) return [];

  if (!mx.every((x, i, a) => x.length === a[0].length)) {
    throw new Error("Can't transpose matrix with unequal lines.");
  }

  return mx[0].map((x, i) => mx.map(y => y[i]));
};

/**
 * Returns by element mean of input matrices.
 * @param {...Matrix} mx
 * @returns {Matrix}
 * @memberOf math#
 */
module.exports.byElementMean = function (...mx) {
  return mx[0]
    // Iterate on lines
    .map((l, i) => l
      // Iterate on columns
      .map((c, j) => module.exports.mean(mx
        // Average of extracted elements sharing the same position in all
        // matrices
        .map(m => m[i][j]))));
};

/**
 * Returns by element standard deviation of input matrices.
 * @param {...Matrix} mx
 * @returns {Matrix}
 * @memberOf math#
 */
module.exports.byElementSd = function (...mx) {
  return mx[0]
  // Iterate on lines
    .map((l, i) => l
      // Iterate on columns
      .map((c, j) => module.exports.standardDeviation(mx
        // Standard deviation of extracted elements sharing the same position
        // in all matrices
        .map(m => m[i][j]))));
};

/**
 * Returns by element difference of two arrays
 * @param {number[]} arr1
 * @param {number[]} arr2
 * @returns {number[]}
 * @memberOf math#
 */
module.exports.meanDiff = function (arr1, arr2) {
  if (arr1.length === 0 || arr2.length === 0) {
    throw new Error("Can't compute difference of two arrays when one is empty");
  }

  if (arr1.length !== arr2.length) {
    throw new Error("Can't compute difference of arrays of unequal length");
  }

  // Return NaN if one is NaN, otherwise return difference
  return arr1.map((x, i) => ((Number.isNaN(x)
    || Number.isNaN(arr2[i])) ? NaN : x - arr2[i]));
};

/**
 * Returns standard deviation of the difference of two set of random
 * variables (see meanDiff)
 * @param {number[]} sd1
 * @param {number[]} sd2
 * @returns {number[]}
 * @memberOf math#
 */
module.exports.sdDiff = function (sd1, sd2) {
  if (sd1.length === 0 || sd2.length === 0) {
    throw new Error("Can't compute standard deviation of difference of two arrays when one is empty");
  }

  if (sd1.length !== sd2.length) {
    throw new Error("Can't compute pairwise standard deviation of difference of arrays of unequal length");
  }

  // Return NaN if one is NaN, otherwise return square root of the sum of
  // variances
  return sd1.map((x, i) => ((Number.isNaN(x)
    || Number.isNaN(sd2[i])) ? NaN : Math.sqrt((x ** 2) + (sd2[i] ** 2))));
};

/**
 * Returns array minimum (ignoring NaNs)
 * @param {Number[]} array
 * @returns {number}
 * @memberOf math#
 */
module.exports.minimum = array => Math.min(...module.exports.stripNan(array));

/**
 * Returns array maximum (ignoring NaNs)
 * @param {Number[]} array
 * @returns {number}
 * @memberOf math#
 */
module.exports.maximum = array => Math.max(...module.exports.stripNan(array));

/**
 * Returns matrix minimum (ignoring NaNs)
 * @param {Matrix} mx
 * @returns {number}
 * @memberOf math#
 */
module.exports.minMatrix = function (mx) {
  const mins = mx.map(module.exports.minimum);
  return Math.min(...mins);
};

/**
 * Returns matrix maximum (ignoring NaNs)
 * @param {Matrix} mx
 * @returns {number}
 * @memberOf math#
 */
module.exports.maxMatrix = function (mx) {
  const maxs = mx.map(module.exports.maximum);
  return Math.max(...maxs);
};

module.exports.range = series => module.exports.maximum(series)
  - module.exports.minimum(series);

/**
 * Find median of an array using the quickselect algorithm
 * @param {Array} arr
 * @returns {number}
 * @memberOf math#
 */
module.exports.findMedian = function (arr) {
  // Copy without NaNs
  const arrStripped = module.exports.stripNan(arr);

  // Quickselect recursively
  const medianIndex = Math.floor(arrStripped.length / 2);
  let m = module.exports.quickSelect(
    arrStripped,
    0,
    arrStripped.length - 1,
    medianIndex,
  );

  if (arrStripped.length % 2 === 0) {
    const m2 = module.exports.quickSelect(
      arrStripped,
      0,
      arrStripped.length - 1,
      medianIndex - 1,
    );
    m = (m + m2) / 2;
  }

  return m;
};

/**
 * Quickselect algorithm to find median
 * @param {Array} series
 * @param {number} left - Left limit of searched range
 * @param {number} right - Right limit of searched range
 * @param {number} targetIndex - Expected median position
 * @returns {number}
 * @memberOf math#
 */
module.exports.quickSelect = function (series, left, right, targetIndex) {
  if (left === right) return series[left];

  let pivotIndex = right;
  pivotIndex = module.exports.partition(series, left, right, pivotIndex);

  if (targetIndex === pivotIndex) {
    return series[targetIndex];
  }
  if (targetIndex < pivotIndex) {
    return module.exports.quickSelect(
      series,
      left,
      pivotIndex - 1,
      targetIndex,
    );
  }
  return module.exports.quickSelect(
    series,
    pivotIndex + 1,
    right,
    targetIndex,
  );
};

module.exports.partition = function (series, left, right, pivotIndex) {
  let storeIndex = left;
  const pivot = series[pivotIndex];
  module.exports.swap(series, pivotIndex, right);
  for (let i = left; i < right; i += 1) {
    if (series[i] < pivot) {
      module.exports.swap(series, i, storeIndex);
      storeIndex += 1;
    }
  }
  module.exports.swap(series, storeIndex, right);
  return storeIndex;
};

module.exports.swap = function (series, i, j) {
  const temp = series[i];
  // eslint-disable-next-line no-param-reassign
  series[i] = series[j];
  // eslint-disable-next-line no-param-reassign
  series[j] = temp;
};

/**
 * Parallel sort arrays following the sort order of only one array.
 * @param {Array} sortBy - Array to use as reference to find order. All other
 * arrays
 * will be sorted following the same order.
 * @param {...Array} rest
 * @returns {Array<Array<number>>}
 * @memberOf math#
 */
module.exports.paraSort = function (sortBy, ...rest) {
  if (!rest.every(x => x.length === sortBy.length)) {
    throw new Error("Can't parallel sort arrays of unequal length.");
  }

  // Get all elements on same index level in same array
  const sortObject = sortBy
    .map((x, i) => [x, ...rest.map(y => y[i])]);

  // Sort following sortBy value. Sort a first time to but the NaN at the end
  sortObject.sort().sort((a, b) => {
    return a[0] - b[0]
  });

  // Transpose and return
  return module.exports.transpose(sortObject);
};

/**
 * Returns NaN matrix following given dimensions
 * @param {number} rows
 * @param {number} cols
 * @returns {Matrix}
 * @memberOf math#
 */
module.exports.NaNmx = function (rows, cols) {
  return new Array(rows).fill(new Array(cols).fill(NaN));
};


module.exports.normalize = function (mx, minusFunc, divideFunc) {
  const mxCopy = mx;
  try {
    for (let i = 0; i < mxCopy.length; i += 1) {
      const minus = minusFunc(mxCopy[i]);
      const divide = divideFunc(mxCopy[i]);

      for (let j = 0; j < mxCopy[0].length; j += 1) {
        mxCopy[i][j] = (mxCopy[i][j] - minus) / divide;
      }
    }
  } catch (err) {
    throw err;
  }
};

module.exports.zeroFunc = () => 0;

/**
 * Normalizes matrix by minimum following the line axis
 * @param {Matrix} mx
 * @memberOf math#
 */
module.exports.byMin = mx => module.exports.normalize(
  mx,
  module.exports.zeroFunc,
  module.exports.minimum,
);

/**
 * Normalizes matrix by maximum following the line axis
 * @param {Matrix} mx
 * @memberOf math#
 */
module.exports.byMax = mx => module.exports.normalize(
  mx,
  module.exports.zeroFunc,
  module.exports.maximum,
);

/**
 * Normalizes matrix by median following the line axis
 * @param {Matrix} mx
 * @memberOf math#
 */
module.exports.byMedian = mx => module.exports.normalize(
  mx,
  module.exports.zeroFunc,
  module.exports.findMedian,
);
