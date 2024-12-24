import React, { useState, useEffect } from "react";
import Kalah from "../Kalah/Kalah";
import Hole from "../GameHole/GameHole";
import styles from "./GameBoard.module.css";

const GameBoard = () => {
  const [boardState, setBoardState] = useState({
    holes: new Map([]),
    kalahs: new Map([]),
    selectedHole: null,
  });

  const [showFinishButton, setShowFinishButton] = useState(false);
  const [webSocket, setWebSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("id");
    if (!token) {
      console.error("Token not found in localStorage");
      return;
    }

    const ws = new WebSocket(`ws://localhost:8000/games/ws/${token}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message from server:", data);

      if (data.type === "game_update") {
        const { holes, kalahs } = data.game;
        console.log("get message");
        setBoardState({
          holes: new Map(holes.entries()),
          kalahs: new Map(kalahs.entries()),
          selectedHole: null,
        });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    setWebSocket(ws);

    return () => {
      ws.close();
    };
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

  const handleFinishTurn = () => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(
        JSON.stringify({
          action: "move",
          payload: {
            selectedHole: boardState.selectedHole,
          },
        })
      );
      setShowFinishButton(false);
    } else {
      console.error("WebSocket is not open");
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
