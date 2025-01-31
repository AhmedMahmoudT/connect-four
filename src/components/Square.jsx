/* eslint-disable react/prop-types */
export default function Square({ handleDrop, colIdx, rowIdx, board, isWinner, isHumanTurn }) {
  const isFilled = board[rowIdx][colIdx] !== "";
  
  return (
    <div 
      className="flex items-center justify-center cursor-pointer" 
      onClick={() => isHumanTurn && !isFilled && !isWinner && handleDrop(colIdx)}
    >
      {board[rowIdx][colIdx] === "X" ? (
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-full w-[80px] h-[80px]"></div>
      ) : board[rowIdx][colIdx] === "O" ? (
        <div className="bg-gradient-to-br from-amber-300 to-amber-500 rounded-full w-[80px] h-[80px]"></div>
      ) : (
        <div className="bg-white/20 rounded-full w-[80px] h-[80px] hover:bg-white/30 transition-colors"></div>
      )}
    </div>
  );
}