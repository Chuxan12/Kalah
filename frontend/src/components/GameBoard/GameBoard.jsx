import React, { useState, useEffect } from "react";
import Kalah from "../Kalah/Kalah";
import Hole from "../GameHole/GameHole";
import styles from "./GameBoard.module.css";
import axios from "axios";

const GameBoard = () => {
  const [boardState, setBoardState] = useState({
    holes: new Map([
      [0, 8],
      [1, 7],
      [2, 4],
      [3, 3],
      [4, 4],
      [5, 4],
      [6, 4],
      [7, 2],
      [8, 12],
      [9, 4],
      [10, 4],
      [11, 7],
    ]),
    kalahs: new Map([
      [0, 10],
      [1, 0],
    ]),
    selectedHole: null,
  });

  const [showFinishButton, setShowFinishButton] = useState(false);

  useEffect(() => {
    async function getGameState() {
      axios
        .get("api/get_game") // получаем состояние игры
        .then((response) => {
          const holes = new Map(Object.entries(response.data.holes));
          const kalahs = new Map(Object.entries(response.data.kalahs));

          setBoardState({
            holes: holes,
            kalahs: kalahs,
            selectedHole: null,
          });
        })
        .catch((error) => {
          console.log("Data fetch with error:", error);
        });
    }
    getGameState();
  }, []);

  const handleHoleClick = (index) => {
    const selectedSeeds = boardState.holes.get(index);
    if (selectedSeeds === 0) return;

    setBoardState((prevState) => ({
      ...prevState,
      selectedHole: index,
    }));

    setShowFinishButton(true);
  };

  const handleFinishTurn = async () => {
    // по нажатии завершить ход отправляем ид лунки и ждем ответ
    try {
      const response = await axios.post("/api/turn_confirm", {
        holeId: boardState.selectedHole,
      });
      const data = response.data;

      const holes = data.holes;
      const kalahs = data.kalahs;

      setBoardState((prevState) => ({
        ...prevState,
        holes,
        kalahs,
        selectedHole: null,
      }));
      setShowFinishButton(false);
    } catch (error) {
      console.error("Error making move:", error);
    }
  };

  return (
    <div className={styles.board}>
      <Kalah seedsCount={boardState.kalahs.get(0)} />
      <div className={styles.holesContainer}>
        <div className={styles.row}>
          {Array.from(boardState.holes.entries())
            .slice(0, boardState.holes.size / 2)
            .map(([index, seeds]) => (
              <Hole
                key={index}
                seedsCount={seeds}
                onClick={() => handleHoleClick(index)}
                displayCount={seeds >= 8}
                isSelected={index === boardState.selectedHole}
              />
            ))}
        </div>
        <div className={styles.row}>
          {Array.from(boardState.holes.entries())
            .slice(boardState.holes.size / 2)
            .map(([index, seeds]) => (
              <Hole
                key={index}
                seedsCount={seeds}
                onClick={() => handleHoleClick(index)}
                displayCount={seeds >= 8}
                isSelected={index === boardState.selectedHole}
              />
            ))}
        </div>
      </div>
      <Kalah seedsCount={boardState.kalahs.get(1)} />
      {showFinishButton && (
        <button onClick={handleFinishTurn} className={styles.finishButton}>
          Завершить ход
        </button>
      )}
    </div>
  );
};

export default GameBoard;
