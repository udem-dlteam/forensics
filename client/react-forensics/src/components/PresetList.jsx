import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const PresetList = function (props) {
  const { presetList } = props;
  return (
    <DropdownButton
      id="dropdown-basic-button"
      className="side-border"
      variant="secondary"
      title="Presets"
    >
      {presetList.map(x => (x !== 'cache' ? (
        <Dropdown.Item key={x} onClick={() => props.loadSave(x)}>
          {x}
        </Dropdown.Item>
      ) : null))}
    </DropdownButton>
  );
};

export default PresetList;
