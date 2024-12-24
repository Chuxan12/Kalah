import React, { useState, useEffect } from "react";
import axios from "axios";
import Kalah from "../Kalah/Kalah";
import Hole from "../GameHole/GameHole";
import styles from "./GameBoard.module.css";

const GameBoard = () => {
  const [boardState, setBoardState] = useState({
    holes: new Map([]),
    kalahs: new Map([]),
    selectedHole: null,
    idTurn: null,
  });

  const [token, setToken] = useState({
    token: "",
  });

  const [showFinishButton, setShowFinishButton] = useState(false);
  const [webSocket, setWebSocket] = useState(null);

  useEffect(() => {
    const fetchPlayerIdAndSetPlayers = async () => {
      try {
        const temp = localStorage.getItem("id");
        setToken(temp);

        if (!token) {
          console.error("Token not found in localStorage");
          return;
        }
        const ws = new WebSocket(`ws://localhost:8000/games/ws/${temp}`);

        ws.onopen = async () => {
          // Запрос на получение ID пользователя
          const authResponse = await axios.get("/api/auth/me/", {
            withCredentials: true,
          });
          const idPlayer = authResponse.data.id;
          //console.log(token);
          const setPlayersResponse = await axios.post(
            "/api/games/set_players/",
            {
              game_id: temp,
              id1: idPlayer,
              id2: -1,
            }
          );
          console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Message received:", data);

            if (data.type === "game_update") {
              const { board } = data.game;
              console.log("Updating board state with board:", board);

              // Преобразование board
              const { current_turn } = data.game;
              const kalah1 = board[0]; // Количество зерен в первом калахе
              const kalah2 = board[board.length - 1]; // Количество зерен во втором калахе
              const holes = new Map(
                board.slice(1, -1).map((seeds, index) => [index, seeds]) // Создание Map для лунок
              );

              console.log("Holes:", holes);
              console.log("Kalahs:", { kalah1, kalah2 });

              setBoardState({
                holes,
                kalahs: new Map([
                  [0, kalah1],
                  [1, kalah2],
                ]),
                selectedHole: null,
                idTurn: current_turn,
              });
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

        return () => {
          ws.close();
        };
      } catch (error) {
        console.error("Error during setup:", error);
      }
    };

    fetchPlayerIdAndSetPlayers();
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
    try {
      const authResponse = await axios.get("/api/auth/me/", {
        withCredentials: true,
      });
      const idPlayer = authResponse.data.id.toString();
      const tok = localStorage.getItem("id");
      console.log(tok);
      const response = await axios.post(
        `api/games/${tok}/move`,
        {
          game_id: tok,
          pit_index: boardState.selectedHole,
          player: idPlayer,
        },
        { withCredentials: true }
      );
      console.log("отправлен индекс");
    } catch (error) {}
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
