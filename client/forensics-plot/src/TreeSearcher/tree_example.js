/**
 * @file tree_example.js
 * @fileOverview Shows example of tree format expected by the TreeSearcher
 * class. Tree should have a variable stat with categories 'mean' and 'sd'
 * available.
 * @author Sacha Morin
 */

const MEASURES = ['real time', 'cpu time'];

module.exports.TREE = {
  // Fake tree for unit testing and development
  measures: MEASURES.slice(),
  tags: ['Compiler', 'gambit-version', 'bench', 'measure', 'stat'],
  options: [
    ['Gambit'],
    ['V1', 'V2', 'V3'],
    ['pi', 'fib'],
    MEASURES.slice(),
    ['mean', 'sd', 'median'],
  ],
  metas: ["V1\nI'm a version\nno_link", "V2\nI'm a version\nno_link", "V3\nI'm"
  + ' a version\nno_link'],
  data: [
    // System
    [
      // Version
      [
        // Bench
        [
          // Measures then stat
          [10, 10.5, 1], [0.1, 0.11, 0.05],
        ],
        [
          [1, 0.9, 0.1], [0.5, 0.4, 0.25],
        ],
      ],
      [
        [
          [20, 20.5, 1], [0.2, 0.21, 0.05],
        ],
        [
          [2, 1.9, 0.1], [0.5, 0.4, 0.25],
        ],
      ],
      [
        [
          [30, 30.5, 1], [0.3, 0.31, 0.05],
        ],
        [
          [3, 2.9, 0.1], [0.5, 0.4, 0.25],
        ],
      ],
    ],

  ],
};
