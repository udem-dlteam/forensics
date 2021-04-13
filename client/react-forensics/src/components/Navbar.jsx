import React from 'react';
import Navbar from 'react-bootstrap/Navbar';

const logo = require('../../public/forensics-logo-white.png');
const help = require('../../public/help.png');

const NavBar = function (props) {
  const { mainApp } = props;
  return (
    <Navbar
      bg="dark"
      variant="dark"
      className={'w-100 flex-row-reverse'
      + ' justify-content-between'}
    >
      <Navbar.Brand>
        <p className="mainTitle">FORENSICS</p>
        <img
          src={logo}
            // width="102"
          height="28"
            // className="d-inline-block align-top"
          alt="Forensics logo"
          className="mainLogo"
        />
      </Navbar.Brand>
      <img
        src={help}
          // width="102"
        height="28"
          // className="d-inline-block align-top"
        alt="Help icon"
        className="help"
        onClick={mainApp.goToHelp}
      />
    </Navbar>
  );
};

export default NavBar;
