import React from "react";
import PropTypes from "prop-types";
import Seed from "../Seed/Seed";
import styles from "./GameHole.module.css";

const Hole = ({ seedsCount, onClick, displayCount, isSelected }) => {
  const seedsArray = Array.from({ length: seedsCount });

  return (
    <div
      className={`${styles.hole} ${isSelected ? styles.selectedHole : ""}`}
      onClick={onClick}
    >
      <div className={styles.seedsContainer}>
        {seedsCount < 8
          ? seedsArray.map((_, index) => <Seed key={index} />)
          : null}
      </div>

      {displayCount && seedsCount >= 8 && (
        <span className={styles.seedsCount}>{seedsCount}</span>
      )}
    </div>
  );
};

Hole.propTypes = {
  seedsCount: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  displayCount: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

export default Hole;
