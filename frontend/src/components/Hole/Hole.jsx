import React from 'react';
import Seed from '../Seed/Seed';
import styles from './Hole.module.css';

const Hole = ({ seedsCount, onClick }) => {
  return (
    <div className={styles.hole} onClick={onClick}>
      {Array.from({ length: seedsCount }, (_, index) => (
        <Seed key={index} />
      ))}
    </div>
  );
};

export default Hole;
