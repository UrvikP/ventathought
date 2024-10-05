// src/CustomButton.js
import React from 'react';
import PropTypes from 'prop-types';
import './CustomButton.css';
import { Button } from '@mui/material';

const CustomButton = ({ id, label, onClick, style }) => {
  return (
    <Button className="custom-button" onClick={onClick} style={style} id={id}>
      {label}
    </Button>
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