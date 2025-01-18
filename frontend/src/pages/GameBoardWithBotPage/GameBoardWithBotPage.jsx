import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Kalah from "../../components/Kalah/Kalah";
import Hole from "../../components/GameHole/GameHole";
import styles from "./GameBoardWithBotPage.module.css";

const GameBoardPageWithBot = () => {
  const [boardState, setBoardState] = useState({
    upperRow: [],
    lowerRow: [],
    kalahs: { left: 0, right: 0 },
    selectedHole: null,
    idTurn: null,
  });

  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const location = useLocation();
  const [showFinishButton, setShowFinishButton] = useState(false);
  const [isFirstPlayer, setIsFirstPlayer] = useState(false);
  const [winnerName, setWinnerName] = useState(null);
  const [canDoTurn, setCanDoTurn] = useState(null);
  const [firstPlayerInfo, setFirstPlayerInfo] = useState({
    first_name: null,
    id: null,
    avatar: null,
  });

  useEffect(() => {
    const fetchPlayerIdAndStartGame = async () => {
      try {
        const temp = localStorage.getItem("id");
        setToken(temp);
        if (!temp) {
          console.error("Token not found in localStorage");
          return;
        }
        const authResponse = await axios.get("/api/auth/me/", {
          withCredentials: true,
        });
        const id = await authResponse.data.id.toString();
        setFirstPlayerInfo({
          first_name: authResponse.data.first_name,
          id: authResponse.data.id,
          avatar: authResponse.data.avatar,
        });
        await axios.post("/api/games/set_players_bot/", {
          game_id: temp,
          id1: id,
          id2: -1,
        });

        const response = await axios.get(`/api/games/${temp}/`);
        const { board, current_turn, winner } = response.data;
        const rowLength = (board.length - 2) / 2;
        const lowerRow = isFirstPlayer
          ? board.slice(1, rowLength + 1)
          : board.slice(rowLength + 2, rowLength * 2 + 2);
        const upperRow = isFirstPlayer
          ? board.slice(rowLength + 2, rowLength * 2 + 2).reverse()
          : board.slice(1, rowLength + 1).reverse();
        const kalahs = isFirstPlayer
          ? { left: board[0], right: board[rowLength + 1] }
          : { left: board[rowLength + 1], right: board[0] };

        setBoardState({
          upperRow,
          lowerRow,
          kalahs,
          selectedHole: null,
          idTurn: current_turn,
        });
        setCanDoTurn(true);
        setIsFirstPlayer(true);
      } catch (error) {
        console.error("Error during game setup:", error);
      }
    };

    fetchPlayerIdAndStartGame();
  }, [location]);

  const handleHoleClick = (index) => {
    if (canDoTurn) {
      const selectedSeeds = boardState.lowerRow[index];
      if (selectedSeeds === 0) return;

      setBoardState((prevState) => ({
        ...prevState,
        selectedHole: index,
      }));

      setShowFinishButton(true);
    }
  };

  const handleFinishTurn = async () => {
    try {
      setShowFinishButton(false);

      let isPlayerTurn = true; // Флаг, определяющий, продолжает ли игрок ходить
      while (isPlayerTurn) {
        const selectedHoleIndex = boardState.selectedHole + 1;
        console.log("Sending move:", selectedHoleIndex);

        // Ход игрока
        const moveResponse = await axios.post(
          `/api/games/move_bot/${token}/${selectedHoleIndex}/`,
          { player: firstPlayerInfo.id },
          { withCredentials: true }
        );

        const { board, current_turn, winner } = moveResponse.data;
        const rowLength = (board.length - 2) / 2;
        const lowerRow = isFirstPlayer
          ? board.slice(1, rowLength + 1)
          : board.slice(rowLength + 2, rowLength * 2 + 2);
        const upperRow = isFirstPlayer
          ? board.slice(rowLength + 2, rowLength * 2 + 2).reverse()
          : board.slice(1, rowLength + 1).reverse();
        const kalahs = isFirstPlayer
          ? { left: board[0], right: board[rowLength + 1] }
          : { left: board[rowLength + 1], right: board[0] };

        setBoardState({
          upperRow,
          lowerRow,
          kalahs,
          selectedHole: null,
          idTurn: current_turn,
        });

        if (winner != null) {
          if(winner === "draw"){
            setWinnerName("НИЧЬЯ!");
          }
          else if(winner === "-1"){
            setWinnerName("БОТ");
          }
          else{
            setWinnerName("ВЫ ПОБЕДИЛИ!");
          }
          //
          break; // Завершаем игру
        }

        // Проверяем, если ход ещё у игрока, иначе передаём ход боту
        isPlayerTurn = await (current_turn === firstPlayerInfo.id);

        if (!isPlayerTurn) {
          console.log("Turn passed to bot");

          // Ход бота
          const bot = localStorage.getItem("bot");
          const botResponse = await axios.post(
            `/api/games/play_bot/${token}/${bot}/`
          );

          const { board, current_turn, winner } = botResponse.data;

          const botLowerRow = isFirstPlayer
            ? board.slice(1, rowLength + 1)
            : board.slice(rowLength + 2, rowLength * 2 + 2);
          const botUpperRow = isFirstPlayer
            ? board.slice(rowLength + 2, rowLength * 2 + 2).reverse()
            : board.slice(1, rowLength + 1).reverse();
          const botKalahs = isFirstPlayer
            ? { left: board[0], right: board[rowLength + 1] }
            : { left: board[rowLength + 1], right: board[0] };

          setBoardState({
            upperRow: botUpperRow,
            lowerRow: botLowerRow,
            kalahs: botKalahs,
            selectedHole: null,
            idTurn: current_turn,
          });

          if (winner != null) {
            if(winner === "draw"){
              setWinnerName("НИЧЬЯ!");
            }
            else if(winner === "-1"){
              setWinnerName("БОТ");
            }
            else{
              setWinnerName("ВЫ ПОБЕДИЛИ!");
            }
            //
            break; // Завершаем игру
          }

        } else {
          setCanDoTurn(true); // Игрок продолжает ходить
        }
      }
    } catch (error) {
      console.error("Error finishing turn:", error);
    }
  };

  const handleCloseModal = () => {
    setWinnerName(null);
    navigate("/");
  };

  return (
    <div>
      <div className={styles.currentTurnContainer}>
        <p>Сейчас ход {canDoTurn ? firstPlayerInfo.first_name : "бота"}</p>
      </div>
      <div className={styles.playerContainerLeft}>
        Ваше имя: {firstPlayerInfo.first_name}
        <div className={styles.avatarContainer}>
          <img src={firstPlayerInfo.avatar} className={styles.profileAvatar} />
        </div>
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
        {winnerName !== null && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Результат игры</h2>
              <p>
                {winnerName === "НИЧЬЯ!" ? "НИЧЬЯ!" : `Победил ${winnerName}`}
              </p>
              <button onClick={handleCloseModal}>Закрыть</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoardPageWithBot;
