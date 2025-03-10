
{/* //This is to represent each of the squares we can pick in the tictactoe game eg X, O or '' */}
function Square({ val, chooseSquare }) {
    //1. This val refers to the value received from the parent to be displayed
    //2. Choose square is a method executed when a square is selected 
  return (
        <div onClick={chooseSquare} className="square w-full h-full flex justify-center items-center">
            { val }
        </div>
  )
}

export default Square
