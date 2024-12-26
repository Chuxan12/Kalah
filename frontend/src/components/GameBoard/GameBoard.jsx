import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Kalah from "../Kalah/Kalah";
import Hole from "../GameHole/GameHole";
import styles from "./GameBoard.module.css";

const GameBoard = () => {
  const [boardState, setBoardState] = useState({
    upperRow: [],
    lowerRow: [],
    kalahs: { left: 0, right: 0 },
    selectedHole: null,
    idTurn: null,
  });

  const [token, setToken] = useState("");
  const [idPlayer, setIdPlayer] = useState(null);
  const location = useLocation();
  const [showFinishButton, setShowFinishButton] = useState(false);
  const [webSocket, setWebSocket] = useState(null);
  const [isFirstPlayer, setIsFirstPlayer] = useState(false);
  const [winnerId, setWinnerId] = useState(null);

  useEffect(() => {
    const fetchPlayerIdAndSetPlayers = async () => {
      try {
        const temp = localStorage.getItem("id");
        setToken(temp);
        if (!temp) {
          console.error("Token not found in localStorage");
          return;
        }

        const ws = new WebSocket(`ws://localhost:8000/games/ws/${temp}`);

        ws.onopen = async () => {
          try {
            const authResponse = await axios.get("/api/auth/me/", {
              withCredentials: true,
            });
            const id = authResponse.data.id;
            setIdPlayer(id);

            await axios.post("/api/games/set_players/", {
              game_id: temp,
              id1: id,
              id2: -1,
            });

            console.log("WebSocket connected");
          } catch (error) {
            console.error("Error during WebSocket connection setup:", error);
          }
        };

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Message received:", data);

            if (data.type === "game_update") {
              const { board, player1, player2, current_turn } = data.game;
              const authResponse = await axios.get("/api/auth/me/", {
                withCredentials: true,
              });
              const currentPlayerId = authResponse.data.id.toString();

              const isFirst = player1 === currentPlayerId;
              setIsFirstPlayer(isFirst);

              // Extract board information
              const rowLength = (board.length - 2) / 2;

              const lowerRow = isFirst
                ? board.slice(1, rowLength + 1)
                : board.slice(rowLength + 2, rowLength * 2 + 2);

              const upperRow = isFirst
                ? board.slice(rowLength + 2, rowLength * 2 + 2).reverse()
                : board.slice(1, rowLength + 1).reverse();

              const kalahs = isFirst
                ? { left: board[0], right: board[rowLength + 1] }
                : { left: board[rowLength + 1], right: board[0] };

              setBoardState({
                upperRow,
                lowerRow,
                kalahs,
                selectedHole: null,
                idTurn: current_turn,
              });
            } else if (data.type === "winner") {
              setWinnerId(data.winner_id);
            }
          } catch (error) {
            console.error("Error processing message:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
          console.log("WebSocket closed");
        };

        setWebSocket(ws);
      } catch (error) {
        console.error("Error during setup:", error);
      }

      return () => {
        ws.close();
      };
    };

    fetchPlayerIdAndSetPlayers();
  }, [location]);

  const handleHoleClick = (index) => {
    const selectedSeeds = boardState.lowerRow[index];
    if (selectedSeeds === 0) return;

    setBoardState((prevState) => ({
      ...prevState,
      selectedHole: index,
    }));

    setShowFinishButton(true);
  };

  const handleFinishTurn = async () => {
    try {
      const authResponse = await axios.get("/api/auth/me/", {
        withCredentials: true,
      });
      const idPlayer = authResponse.data.id.toString();
      const tok = localStorage.getItem("id");

      const selectedHoleIndex = isFirstPlayer
        ? boardState.selectedHole + 1 // Индексы для первого игрока начинаются с 1
        : boardState.selectedHole + boardState.upperRow.length + 2; // Индексы для второго игрока смещены

      console.log("Sending move:", selectedHoleIndex);

      await axios.post(
        `api/games/move/${tok}/${selectedHoleIndex}/`,
        { player: idPlayer },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error finishing turn:", error);
    }
  };

  const handleCloseModal = () => {
    setWinnerId(null);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    alert("Token скопирован в буфер обмена!");
  };

  return (
    <div>
      <div className={styles.currentTurnContainer}>
        <p>Сейчас ход игрока: {boardState.idTurn}</p>
      </div>
      <div className={styles.board}>
        <Kalah seedsCount={boardState.kalahs.left} />
        <div className={styles.holesContainer}>
          <div className={styles.row}>
            {boardState.upperRow.map((seeds, index) => (
              <Hole
                key={index}
                seedsCount={seeds}
                onClick={null}
                displayCount={seeds >= 8}
                isSelected={false}
              />
            ))}
          </div>
          <div className={styles.row}>
            {boardState.lowerRow.map((seeds, index) => (
              <Hole
                key={index}
                seedsCount={seeds}
                onClick={() => handleHoleClick(index)}
                displayCount={seeds >= 8}
                isSelected={boardState.selectedHole === index}
              />
            ))}
          </div>
        </div>
        <Kalah seedsCount={boardState.kalahs.right} />
        {showFinishButton && (
          <button onClick={handleFinishTurn} className={styles.finishButton}>
            Завершить ход
          </button>
        )}
        {winnerId !== null && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Победитель</h2>
              <p>ID Победителя: {winnerId}</p>
              <button onClick={handleCloseModal}>Закрыть</button>
            </div>
          </div>
        )}
      </div>
      <div className={styles.tokenContainer}>
        <p>Token игры: {token}</p>
        <button onClick={handleCopyToken}>Скопировать</button>
      </div>
    </div>
  );
};

export default GameBoard;
