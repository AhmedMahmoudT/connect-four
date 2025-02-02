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

// Ajouter ces nouvelles fonctions avant getBestMove:

const evaluateWindow = (window, player) => {
  const opponent = player === 'O' ? 'X' : 'O';
  let score = 0;
  
  if (window.filter(cell => cell === player).length === 4) score += 100;
  else if (window.filter(cell => cell === player).length === 3 && window.filter(cell => cell === "").length === 1) score += 5;
  else if (window.filter(cell => cell === player).length === 2 && window.filter(cell => cell === "").length === 2) score += 2;
  
  if (window.filter(cell => cell === opponent).length === 3 && window.filter(cell => cell === "").length === 1) score -= 4;
  
  return score;
};

const evaluateBoard = (board, player) => {
  let score = 0;
  
  // Horizontal
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const window = board[row].slice(col, col + 4);
      score += evaluateWindow(window, player);
    }
  }
  
  // Vertical
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row < 3; row++) {
      const window = [board[row][col], board[row+1][col], board[row+2][col], board[row+3][col]];
      score += evaluateWindow(window, player);
    }
  }
  
  // Diagonales
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const window1 = [board[row][col], board[row+1][col+1], board[row+2][col+2], board[row+3][col+3]];
      const window2 = [board[row+3][col], board[row+2][col+1], board[row+1][col+2], board[row][col+3]];
      score += evaluateWindow(window1, player);
      score += evaluateWindow(window2, player);
    }
  }
  
  return score;
};

const minimax = (board, depth, alpha, beta, maximizingPlayer) => {
  if (depth === 0) return evaluateBoard(board, 'O');
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (let col = 0; col < 7; col++) {
      const row = getRowForColumn(board, col);
      if (row === -1) continue;
      
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = 'O';
      
      if (checkWin(newBoard, row, col, 'O')) return 10000;
      
      const evl= minimax(newBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evl);
      alpha = Math.max(alpha, evl);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let col = 0; col < 7; col++) {
      const row = getRowForColumn(board, col);
      if (row === -1) continue;
      
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = 'X';
      
      if (checkWin(newBoard, row, col, 'X')) return -10000;
      
      const evl = minimax(newBoard, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evl);
      beta = Math.min(beta, evl);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

// Remplacer getBestMove par:
const getBestMove = (board) => {
  let bestScore = -Infinity;
  let bestMove = 3;
  
  for (let col = 0; col < 7; col++) {
    const row = getRowForColumn(board, col);
    if (row === -1) continue;
    
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = 'O';
    
    if (checkWin(newBoard, row, col, 'O')) return col;
    
    const score = minimax(newBoard, 4, -Infinity, Infinity, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = col;
    }
  }
  
  return bestMove;
};

export default function App() {
  const [board, setBoard] = useState(Array(6).fill().map(() => Array(7).fill("")));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [isWinner, setIsWinner] = useState(false);
  const [nextStarter, setNextStarter] = useState("O"); // Start with AI first to alternate immediately

  const handleNewGame = () => {
    // Alternate starting player
    const newStarter = nextStarter === "X" ? "O" : "X";
    setCurrentPlayer(newStarter);
    setNextStarter(newStarter);
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
    if (currentPlayer === "O" && !isWinner) {
      const timeout = setTimeout(() => {
        const bestCol = getBestMove(board);
        handleDrop(bestCol);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentPlayer, board, isWinner, handleDrop]);

  const fullBoard = board.map((row, rowIdx) => {
    return row.map((_, colIdx) => (
      <Square
        key={colIdx + "" + rowIdx}
        handleDrop={handleDrop}
        colIdx={colIdx}
        rowIdx={rowIdx}
        board={board}
        isWinner={isWinner}
        isHumanTurn={currentPlayer === "X"}
      />
    ));
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
          <button onClick={handleNewGame} className="border-2 rounded-lg p-3 bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:from-white hover:to-white hover:text-blue-500 transition-all cursor-pointer">
            New Game
          </button>
        </div>
      </div>
    </main>
  );
}