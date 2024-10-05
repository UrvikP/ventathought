// src/CustomButton.js
import React from 'react';
import PropTypes from 'prop-types';
import './CustomButton.css';

const CustomButton = ({ label, onClick, style }) => {
  return (
    <button className="custom-button" onClick={onClick} style={style}>
      {label}
    </button>
  );
};

CustomButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  style: PropTypes.object,
};

CustomButton.defaultProps = {
  onClick: () => {},
  style: {},
};

export default CustomButton;