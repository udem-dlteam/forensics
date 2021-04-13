import React, { Component } from 'react';
import { toast } from 'react-toastify';

class PresetManager extends Component {
  constructor(props) {
    super(props);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.flushAndKill = this.flushAndKill.bind(this);
  }

  handleKeyPress(event) {
    if (event.charCode === 13) {
      this.handleSubmit(event);
    }
  }

  handleChange(event) {
    const { mainApp } = this.props;

    // Input validation
    this.input = event.target.value;
    mainApp.validateSaveName(event.target.value);
  }

  handleSubmit() {
    const { saveNameValid, mainApp } = this.props;
    if (saveNameValid && this.input) { // verify also if this.input is not empty
        toast.success('The preset "'+this.input+'" has been saved successfully!');
        mainApp.saveParam(this.input)
    }
    this.input = ''; // important so you cannot spam save button with empty buffer
    this.mainInput.value = '';
  }

  flushAndKill() {
    const { mainApp } = this.props;
    mainApp.flushLocal();
    mainApp.validateSaveName(this.input);
  }

  render() {
    const { saveNameValid } = this.props;

    return (
      <div className={`form-group ${saveNameValid ? '' : 'has-danger '}`}>
        <input
          ref={(r) => { this.mainInput = r; }}
          onChange={this.handleChange}
          type="text"
          className={
                        `${'form-control '
                        + 'rounded-0 '
                        + 'w-100 '}${
                          saveNameValid ? '' : 'is-invalid'}`
                    }
          id="saveName"
          placeholder="Save name"
          onKeyPress={this.handleKeyPress}
        />
        <div className="invalid-feedback">
          {'Sorry, that preset'
                + " name's taken. Try another?"}
        </div>
        <button
          type="submit"
          className="btn btn-success rounded-0 mt20 w-100"
          onClick={this.handleSubmit}
        >
                Save current preset
        </button>
        <button
          type="button"
          className="btn btn-danger rounded-0 mt20 w-100"
          onClick={this.flushAndKill}
        >
                Clear all saves
        </button>
      </div>
    );
  }
}

export default PresetManager;
