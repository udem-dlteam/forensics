import { stringFormat } from '../../../forensics-plot/build/forensics-plot';

// Prefs states preferred order and tab choice
// Otherwise parameter layout will default to key order, with variables under
// the 'tags' tab and options under the 'options' tag
const preferences = {
  tags: ['dataset', 'bench', 'gambit-version', 'baselineMode', 'baseline'],
  options: ['type', 'x', 'measure', 'series'],
  hide: ['stat', 'title'],
};

const rectifyOrder = function (tabs, prefs, tabName) {
  prefs[tabName].forEach((x, i) => {
    const idx = tabs[tabName].indexOf(x);
    if (idx !== -1 && idx !== i) {
      // Swap to right index
      [tabs[tabName][i], tabs[tabName][idx]] = [tabs[tabName][idx], tabs[tabName][i]];
    }
  });
};

const getLayout = function (param) {
  const tabs = {
    tags: [],
    options: [],
  };

  // Add parameters
  Object.keys(param).forEach((key) => {
    // Check if parameter is hidden
    if (!preferences.hide.includes(key)) {
      if ((param[key].isVariable && !preferences.options.includes(key))
        || preferences.tags.includes(key)) {
        // In tags, include variables not included in options or any key
        // specifically stated as belonging to tags
        tabs.tags.push(key);
      } else if ((!param[key].isVariable && !preferences.tags.includes(key))
        || preferences.options.includes(key)) {
        // In tags, include options not included in tags or any key
        // specifically stated as belonging to options
        tabs.options.push(key);
      }
    }
  });

  // Rectify order
  rectifyOrder(tabs, preferences, 'tags');
  rectifyOrder(tabs, preferences, 'options');

  // Add load tab
  tabs.load = ['Help', 'Manage Presets'];

  // Add titles and control properties
  Object.keys(tabs).forEach((key) => {
    // Check if parameter is hidden
    tabs[key] = {
      name: key,
      tags: tabs[key],
      title: tabs[key].map(x => stringFormat(x)),
      active: 0,
      folded: new Array(tabs[key].length).fill(true),
    };
  });

  return tabs;
};

export default getLayout;
