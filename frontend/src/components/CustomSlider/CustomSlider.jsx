import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './CustomSlider.module.css';

const CustomSlider = ({ min, max, label, step }) => {
  const [value, setValue] = useState(min);

  const handleChange = (e) => {
    setValue(Number(e.target.value));
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderLabel}>
        {label} <span className={styles.sliderValue}>{value}</span>
      </div>
      <div className={styles.rangeWrapper}>
        <span className={styles.rangeMin}>{min}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className={styles.sliderInput}
        />
        <span className={styles.rangeMax}>{max}</span>
      </div>
    </div>
  );
};

CustomSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

export default CustomSlider;
