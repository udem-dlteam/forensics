import getLayout from './getLayout';

const formatSave = function (title, param, tabs, activeTab, presetName) {
  return {
    tabs,
    param,
    activeTab,
    presetName, // As defined in PlotGenerator
  };
};

const formatTab = function (presetName, param) {
  const vanillaTabs = getLayout(param);
  let baseIdx;
  let base;
  let mainIdx;

  switch (presetName) {
    case 'AvgBenchAllVersion':
      // Unfold bench section
      baseIdx = vanillaTabs.tags.tags.indexOf('setting');
      vanillaTabs.tags.folded[baseIdx] = false;
      vanillaTabs.tags.active = baseIdx;
      return {
        title: 'Average Benchmark History',
        tabs: vanillaTabs,
        activeTab: 'tags',
      };
    case 'benchAllVersion':
      // Unfold bench section
      baseIdx = vanillaTabs.tags.tags.indexOf('bench');
      vanillaTabs.tags.folded[baseIdx] = false;
      vanillaTabs.tags.active = baseIdx;
      return {
        title: 'Benchmark History',
        tabs: vanillaTabs,
        activeTab: 'tags',
      };
    case 'SystemComparator':
      // Unfold bench section
      baseIdx = vanillaTabs.tags.tags.indexOf('bench');
      vanillaTabs.tags.folded[baseIdx] = false;
      vanillaTabs.tags.active = baseIdx;

      // Return result
      return {
        title: 'System Comparison',
        tabs: vanillaTabs,
        activeTab: 'tags',
      };
    case 'VersionComparator':
      // Unfold baseline and sibling
      baseIdx = vanillaTabs.tags.tags.indexOf('baselineMode');
      vanillaTabs.tags.folded[baseIdx] = false;
      mainIdx = baseIdx - 1;
      vanillaTabs.tags.folded[mainIdx] = false;
      vanillaTabs.tags.active = mainIdx;

      // Update anchors
      param['gambit-version'].anchor.from = param['gambit-version'].options.length - 1;
      param['gambit-version'].anchor.to = param['gambit-version'].options.length - 1;
      param.baseline.anchor.from = param.baseline.options.length - 2;
      param.baseline.anchor.to = param.baseline.options.length - 2;

      // Return result
      return {
        title: 'Latest Revision Comparison',
        tabs: vanillaTabs,
        activeTab: 'tags',
      };
    case 'head':
      base = formatTab('VersionComparator', param);
      base.title = 'Latest Top 10';
      return base;
    case 'tail':
      base = formatTab('VersionComparator', param);
      base.title = 'Latest Bottom 10';
      return base;
    default:
      return { title: 'Default', tabs: vanillaTabs, activeTab: 'tags' };
  }
};

const savePresets = function (mainApp, commit) {
  const savedPresets = [];
  mainApp.pg.listPresets().filter(x => x !== 'Default').forEach((x) => {
    try {
      const param = mainApp.getPresetParam(x, commit);
      const format = formatTab(x, param);
      const save = formatSave(format.title, param, format.tabs, format.activeTab, x);

      localStorage.setItem(format.title, JSON.stringify(save));

      savedPresets.push(format.title);
    } catch (e) {
      console.log(e);
    }
  });
  mainApp.pg.setDefault();
  return savedPresets;
};

export { savePresets, formatSave, formatTab };
