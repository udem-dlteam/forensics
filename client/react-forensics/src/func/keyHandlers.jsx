const handleShift = (name, id, mainApp) => {
  const { param } = mainApp.state;
  const target = param[name];
  const { anchor } = target;
  let min = Math.min(anchor.from, anchor.to);
  let max = Math.max(anchor.from, anchor.to);

  const active = target.active.slice();

  // Erase former range selection
  for (let i = min; i < max + 1; i += 1) active[i] = false;

  // Set new anchor
  mainApp.updateAnchors(name, anchor.from, id);

  min = Math.min(anchor.from, id);
  max = Math.max(anchor.from, id);

  // Handle meta display
  mainApp.setMeta(name, id);

  // Select new range
  // Erase former range selection
  for (let i = min; i < max + 1; i += 1) active[i] = true;

  target.active = active;

  mainApp.setParam(name, param);
};

const cycleIncrement = (index, length) => {
  if (index < 0) {
    return length - 1;
  }
  return index % length;
};

const onKeyUp = (event, mainApp) => {
  mainApp.ctrl = event.ctrlKey;
  mainApp.shift = event.shiftKey;
};

const handleArrow = (name, value, mainApp) => {
  const { param } = mainApp.state;
  const target = param[name];
  const { anchor } = target;

  let prev;

  // Find previous
  if (target.multiOption) {
    prev = anchor.to;
  } else {
    prev = target.active;
  }

  // Compute new index
  const newId = cycleIncrement((prev + value), target.options.length);

  if (target.multiOption) {
    if (mainApp.shift) {
      // Classic shift
      handleShift(name, newId, mainApp);
      return;
    }
    // Increment or decrement position of all true values in array
    // If shift or ctrl is held, do not erase previous selection
    const copy = mainApp.ctrl
      ? target.active.slice()
      : new Array(target.active.length).fill(false);

    target.active.forEach((x, i, a) => {
      if (x) copy[cycleIncrement(i + value, a.length)] = true;
    });
    target.active = copy;

    // Update metas
    mainApp.setMeta(name, newId);
  } else {
    target.active = newId;

    // Update metas
    mainApp.setMeta(name, newId);
  }


  // Update anchors
  if (mainApp.shift) {
    mainApp.updateAnchors(name, anchor.from, newId);
  } else {
    mainApp.updateAnchors(name, newId, newId);
  }

  mainApp.setParam(name, param);
};

const onKeyDown = (event, mainApp) => {
  if (event.target.type === 'text') {
    // Escape event handler if user is
    // typing in an input element
    return;
  }

  // 'More' tab has special containers where many hotkeys do not work
  const isMore = mainApp.state.activeTab === 'load';

  mainApp.ctrl = event.ctrlKey;
  mainApp.shift = event.shiftKey;

  // Select all of focused container
  const focus = mainApp.getCurrentFocus();

  switch (event.key) {
    case 'ArrowRight':
      if (isMore) return;
      event.preventDefault();
      handleArrow(mainApp.getCurrentFocus(), 1, mainApp);
      break;
    case 'ArrowLeft':
      if (isMore) return;
      event.preventDefault();
      handleArrow(mainApp.getCurrentFocus(), -1, mainApp);
      break;
    case 'a':
      if (isMore) return;
      event.preventDefault();
      if (mainApp.state.param[focus].multiOption) mainApp.selectAll(focus);

      break;
    case 'e':
      event.preventDefault();
      // Unfold all containers
      if (mainApp.ctrl) {
        mainApp.setAllFold(false);
      } else {
        // Fold/Unfold focused container
        const containerIdx1 = mainApp.state.tabs[mainApp.state.activeTab].tags.indexOf(focus);
        mainApp.setFold(mainApp.state.activeTab, containerIdx1);
      }
      break;
    case 'r':
      event.preventDefault();
      // Fold all containers
      if (mainApp.ctrl) {
        mainApp.setAllFold(true);
        break;
      } else {
        // Fold/Unfold focused container
        const containerIdx2 = mainApp.state.tabs[mainApp.state.activeTab].tags.indexOf(focus);
        mainApp.setFold(mainApp.state.activeTab, containerIdx2);
      }
      break;
    case 'h':
      event.preventDefault();
      mainApp.goToHelp();
      break;
    default:
      break;
  }
};

export { onKeyDown, onKeyUp, handleShift };
