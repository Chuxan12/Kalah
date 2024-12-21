import React from "react";
import PropTypes from "prop-types";
import Seed from "../Seed/Seed"; // Импорт компонента Seed
import styles from "./Kalah.module.css";

const Kalaha = ({ seedsCount }) => {
  return (
    <div className={styles.kalah}>
      {/* Создаем столько зерен, сколько указано в seedsCount */}
      {Array.from({ length: seedsCount }).map((_, index) => (
        <Seed key={index} />
      ))}
    </div>
  );
};

Kalaha.propTypes = {
  seedsCount: PropTypes.number.isRequired,
};

export default Kalaha;
