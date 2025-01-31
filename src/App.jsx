import { useCallback, useEffect, useState } from "react";
import Square from "./components/Square";

const checkWin = (board, row, col, player) => {
  const directions = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [1, 0],
    [-1, 0],
    [0, 1],
    [1, 1],
    [-1, 1],
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    let x = row + dx,
      y = col + dy;
    while (x >= 0 && x < 6 && y >= 0 && y < 7 && board[x][y] === player) {
      count++;
      x += dx;
      y += dy;
    }
    x = row - dx;
    y = col - dy;
    while (x >= 0 && x < 6 && y >= 0 && y < 7 && board[x][y] === player) {
      count++;
      x -= dx;
      y -= dy;
    }
    if (count >= 4) return true;
  }
  return false;
};

const getRowForColumn = (board, col) => {
  for (let row = 5; row >= 0; row--) {
    if (board[row][col] === "") return row;
  }
  return -1;
};

const getBestMove = (board) => {
  for (let col = 0; col < 7; col++) {
    const row = getRowForColumn(board, col);
    if (row === -1) continue;
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = "O";
    if (checkWin(newBoard, row, col, "O")) return col;
  }

  for (let col = 0; col < 7; col++) {
    const row = getRowForColumn(board, col);
    if (row === -1) continue;
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = "X";
    if (checkWin(newBoard, row, col, "X")) return col;
  }

  const preferredCols = [3, 2, 4, 1, 5, 0, 6];
  for (const col of preferredCols) {
    if (getRowForColumn(board, col) !== -1) return col;
  }
  return 0;
};

export default function App() {
  const [board, setBoard] = useState(Array(6).fill().map(() => Array(7).fill("")));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [isWinner, setIsWinner] = useState(false);
  const [isPlayerX, setIsPlayerX] = useState(true);

  const handleNewGame = () => {
    const newIsPlayerX = !isPlayerX;
    setIsPlayerX(newIsPlayerX);
    setCurrentPlayer(newIsPlayerX ? "X" : "O");
    setBoard(Array(6).fill().map(() => Array(7).fill("")));
    setIsWinner(false);
  };

  const handleDrop = useCallback((col) => {
    if (isWinner) return;
    const newBoard = board.map(row => [...row]);
    const row = getRowForColumn(newBoard, col);
    
    if (row === -1) return;
    newBoard[row][col] = currentPlayer;
    
    const isWinningMove = checkWin(newBoard, row, col, currentPlayer);
    setBoard(newBoard);
    
    if (isWinningMove) {
      setIsWinner(true);
    } else {
      setCurrentPlayer(prev => prev === "X" ? "O" : "X");
    }
  }, [board, currentPlayer, isWinner]);

  useEffect(() => {
    const aiSymbol = isPlayerX ? "O" : "X";
    const playerSymbol = isPlayerX ? "X" : "O";
    
    if (currentPlayer === aiSymbol && !isWinner) {
      const timeout = setTimeout(() => {
        const bestCol = getBestMove(board, aiSymbol, playerSymbol);
        handleDrop(bestCol);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentPlayer, board, isWinner, handleDrop, isPlayerX]);

  const fullBoard = board.map((row, rowIdx) => {
    return row.map((_, colIdx) => {
      return (
        <Square
          key={colIdx + "" + rowIdx}
          handleDrop={handleDrop}
          colIdx={colIdx}
          rowIdx={rowIdx}
          board={board}
          isWinner={isWinner}
          isPlayerX={isPlayerX}
        />
      );
    });
  });

  return (
    <main className="h-screen flex text-3xl text-blue-500">
      <div className="m-auto flex flex-col gap-8 items-center justify-center">
        <div className="flex items-center justify-center gap-10 mb-10">
          <h1>Current Player is</h1>
          {currentPlayer === "X" ? (
            <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-full w-[80px] h-[80px]"></div>
          ) : (
            <div className="bg-gradient-to-br from-amber-300 to-amber-500 rounded-full w-[80px] h-[80px]"></div>
          )}
        </div>
        <div className="w-[700px] h-[600px] outline-8 outline-blue-600 rounded bg-gradient-to-br from-blue-500 to-blue-700 grid grid-cols-7 grid-rows-6">
          {fullBoard}
        </div>
        <div className="mt-10 w-[700px] flex items-center justify-between">
        {isWinner ? (
          <div className="flex items-center justify-center gap-10">
            <h1>The Winner is</h1>
            {currentPlayer === "X" ? (
              <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-full w-[80px] h-[80px]"></div>
            ) : (
              <div className="bg-gradient-to-br from-amber-300 to-amber-500 rounded-full w-[80px] h-[80px]"></div>
            )}
          </div>
        ) : (
          <div className="h-[80px]"></div>
        )}
        <button onClick={handleNewGame} className="border-2 rounded-lg p-3 bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:from-white hover:to-white hover:text-blue-500 transition-all cursor-pointer">New Game</button>
        </div>
      </div>
    </main>
  );
}
