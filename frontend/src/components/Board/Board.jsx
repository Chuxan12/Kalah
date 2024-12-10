import React from 'react';
import Kalaha from '../KalahButton/KalahButton';
import Hole from '../Hole/Hole';
import styles from './Board.module.css';

const Board = () => {
  return (
    <div className={styles.board}>
      <Kalaha topText="Сразиться онлайн" centerText="Сразитесь с игроками со всего света за звание мастера"/>
      <div className={styles.holesContainer}>
        <div className={styles.row}>
          <Hole />
          <Hole />
          <Hole />
          <Hole />
          <Hole />
          <Hole />  
        </div>
        <div className={styles.row}>
          <Hole />
          <Hole />
          <Hole />
          <Hole />
          <Hole />
          <Hole />
        </div>
      </div>
      <Kalaha topText="Сразиться с ИИ" centerText="Отточите свои навыки в битве с искусственым интеллектом" />
    </div>
  );
};

export default Board;
