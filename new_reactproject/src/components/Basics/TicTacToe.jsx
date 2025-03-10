import { useState, useEffect } from 'react';
import Square from './Basics/Square';
import { Patterns } from './Basics/Patterns';

function TicTacToe() {
    const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
    const [player, setPlayer] = useState("X"); // Start with player X
    const [result, setResult] = useState({ winner: "none", state: "none" });

    useEffect(() => {
        checkWinner();
        checkIfTie();
    }, [board]); // Check for winner or tie whenever the board changes

    // Reset the game
    const resetGame = () => {
        setBoard(["", "", "", "", "", "", "", "", ""]);
        setPlayer("X"); // Reset to player X
        setResult({ winner: "none", state: "none" }); // Reset result
    };

    useEffect(() => {
        if (result.state !== "none") { // Check if the game has finished
            alert(`Game finished!!! Winning player: ${result.winner}`);
        }
    }, [result]);

    const chooseSquare = (square) => {
        // Update the board only if the selected square is empty
        if (board[square] === "") {
            setBoard(board.map((val, idx) => (idx === square ? player : val)));
            setPlayer((prevPlayer) => (prevPlayer === "X" ? "O" : "X")); // Switch player
        }
    };

    const checkWinner = () => {
        Patterns.forEach((currPattern) => {
            const firstPlayer = board[currPattern[0]];
            if (firstPlayer === "") return; // Skip if the first position is empty

            let foundWinningPattern = true;
            currPattern.forEach((idx) => {
                if (board[idx] !== firstPlayer) {
                    foundWinningPattern = false; // Not a winning pattern
                }
            });

            if (foundWinningPattern) {
                setResult({ winner: firstPlayer, state: "Won!!!" });
            }
        });
    };

    const checkIfTie = () => {
        if (board.every(square => square !== "")) {
            setResult({ winner: "No One", state: "Tie" });
        }
    };

    return (
        <>
            <button onClick={resetGame}>Reset all</button>
            <div className='flex flex-row flex-wrap bg-slate-800 font-bold text-white text-2xl w-[400px] h-[400px]'>
                {board.map((val, idx) => (
                    <div key={idx} className="row border-2 w-1/3 h-1/3 flex justify-center items-center">
                        <Square val={val} chooseSquare={() => chooseSquare(idx)} />
                    </div>
                ))}
            </div>
        </>
    );
}

export default TicTacToe;
