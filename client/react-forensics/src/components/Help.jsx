import React from 'react';

const Help = function () {
  return (
    <React.Fragment>
      <span className="white">
        <h4>Plot</h4>
        <p>
            Variable selection and plot configuration are handled
            respectively under the &apos;Variables&apos; and &apos;Plot&apos; tabs.
        </p>
        <p>
          Holding click and selecting part of the plot will zoom in.
          Double click will zoom out.
        </p>
        <p>
          Current plot can be saved as png by clicking on the camera at the
          top right-corner of the plot.
        </p>
        <hr />
        <h4>Hotkeys</h4>
        <p>Press &apos;h&apos; to come back to the help pane.</p>
        <p>
          Most hotkeys will work on the focused menu. The title of the
          focused menu is underlined:
        </p>
        <ul>
          <li>Left/Right Arrow : cycle through options;</li>
          <li>e or r : fold or unfold menu;</li>
        </ul>
        <p>
          Some hotkeys will only work if selected menu
          allows multiple options:
        </p>
        <ul>
          <li>Shift : allows range selection, works with arrows and click;</li>
          <li>
            Ctrl : allows selection without clearing previous selection,
            works with arrows and click;
          </li>
          <li>a : select all options;</li>
        </ul>
        <p>Some hotkeys will affect all menus:</p>
        <ul>
          <li>Ctrl + e : unfold all menus;</li>
          <li>Ctrl + r : fold all menus.</li>
        </ul>
        <hr />
        <h4>Go to Commit Page</h4>
        <p>
          If the x axis is set to &apos;gambit-version&apos;, commit page can be accessed
          by clicking on the information window&apos;s title or by clicking on the
          plot while holding the ctrl key.
        </p>
        <hr />
        <h4>Presets</h4>
        <p>
          You can save your current configuration as a preset using the
          &apos;Manage Presets&apos; section under the &apos;More&apos; tab. Presets can then
          be loaded using the rightmost tab. Default presets are available.
        </p>
      </span>
    </React.Fragment>
  );
};

export default Help;
