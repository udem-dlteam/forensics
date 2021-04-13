// Handy loader to load all datasets in a PlotGenerator instance and export it
const main = require('./gambit-data.js');
const chez = require('./chez-data.js');

const dataMap = new Map();
dataMap.set(main.TREE.name, main.TREE);
dataMap.set(chez.TREE.name, chez.TREE);

// Load all datasets in others
module.exports.data = dataMap;
