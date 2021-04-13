import getLayout from './getLayout';
import { savePresets, formatSave, formatTab } from './savePresets';

// Arrays defining distribution of parameters in tabs and orders
const compareKeys = function (obj1, obj2) {
  const obj1Keys = Object.keys(obj1).sort();
  const obj2Keys = Object.keys(obj2).sort();
  return obj1Keys.length === obj2Keys.length
    && obj1Keys.every((x, i) => {
      if (!(x === obj2Keys[i])) {
        console.log(`Keys ${x} and ${obj2Keys[i]} are different.`);
        return false;
      }
      return true;
    });
};

const compareOptions = function (obj1, obj2, optionName) {
  return obj1[optionName].length === obj2[optionName].length
    && obj1[optionName].every((x, i) => {
      if (!(x === obj2[optionName][i])) {
        console.log(`${optionName} has a conflict: ${x} is not the same as ${obj2[optionName][i]}`);
        return false;
      }
      return true;
    });
};

const clone = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};

const stripBaseline = function (save) {
  const copy = clone(save);
  // Remove from param
  delete copy.param.baseline;
  delete copy.param.baselineMode;

  // Remove from tabs
  const baseIdx = copy.tabs.tags.tags.indexOf('baseline');

  // Delete baseline and baselineMode
  copy.tabs.tags.tags.splice(baseIdx - 1, 2);
  copy.tabs.tags.title.splice(baseIdx - 1, 2);

  return copy;
};

const compatibleWithCurrent = function (save, def) {
  // Strip baseline references from tested copies because it does not affect
  // compatibility
  const saveCopy = stripBaseline(save);
  const defCopy = stripBaseline(def);

  // Share same formatSave keys
  if (!compareKeys(saveCopy, defCopy)) {
    console.log('Saves do not share same keys.');
    return false;
  }

  // Share same params
  if (!compareKeys(saveCopy.param, defCopy.param)) {
    console.log('Saves do not share same parameters.');
    return false;
  }

  // Share same tabs
  if (!compareKeys(saveCopy.tabs, defCopy.tabs)) {
    console.log('Saves do not share same tabs.');
    return false;
  }

  // Share same param options
  // Ignore x and series parameters at this point, because they are set
  // dynamically and depend on other parameters.
  if (!Object.keys(defCopy.param)
    .filter(x => x !== 'x' && x !== 'series')
    .every(x => compareOptions(saveCopy.param[x], defCopy.param[x], 'options'))) {
    console.log('Incompatible saves, some parameters do not share same'
      + ' options.');
    return false;
  }

  // Share same tabs tags
  if (!Object.keys(defCopy.tabs).every(x => compareOptions(saveCopy.tabs[x], defCopy.tabs[x], 'tags'))) {
    console.log('Incompatible saves, some tabs do not share same tags.');
    return false;
  }

  // Share same tabs title
  if (!Object.keys(defCopy.tabs).every(x => compareOptions(saveCopy.tabs[x], defCopy.tabs[x], 'title'))) {
    console.log('Incompatible saves, some tabs do not share same titles.');
    return false;
  }

  return true;
};

const defaultSave = function (defParam) {
  const tabs = getLayout(defParam);

  return {
    tabs,
    param: defParam,
    activeTab: Object.keys(tabs)[0],
    presetName: null,
  };
};

const getFirstSave = function (mainApp, saveName, commit) {
  // If saveName is null, get cache.
  if (saveName === null) saveName = 'cache';

  const defParam = mainApp.getPresetParam();
  const defSave = defaultSave(defParam);

  // If no presets, formatSave presets
  if (Object.keys(localStorage).length === 0) savePresets(mainApp);

  // If commit is specified,try to load
  if (commit !== null) {
    try {
      const targetPreset = JSON.parse(localStorage.getItem(saveName)).presetName;
      const param = mainApp.getPresetParam(targetPreset, commit);
      const format = formatTab(targetPreset, param);
      return formatSave(format.title, param, format.tabs, format.activeTab, targetPreset);
    } catch (e) {
      console.log(e);
    }
  }

  // Else try to load preset
  const ls = JSON.parse(localStorage.getItem(saveName));

  if (ls === null) {
    // Preset does not exist, return default
    return defSave;
  } if (compatibleWithCurrent(ls, defSave)) {
    // Preset exists and is compatible
    return ls;
  }

  // Else preset is incompatible
  // Clear saved presets if parameter structure has changed
  localStorage.clear();

  // Generate presets
  savePresets(mainApp);

  return defSave;
};

export { defaultSave, getFirstSave, compatibleWithCurrent };
