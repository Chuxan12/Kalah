import React from "react";
import PropTypes from "prop-types";
import styles from "./KalahButton.module.css";

const KalahButton = ({ topText, centerText, onClick }) => {
    return (
      <div className={styles.button} onClick={onClick}>
        <div className={styles.topText}>{topText}</div>
        <div className={styles.centerText}>{centerText}</div>
      </div>
    );
  };

export default KalahButton;
