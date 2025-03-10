import { useState } from 'react'

function Counter() {

    const [ count,setCount ] = useState(0);

    //Action code that causes an update to the state when something happens 
    const increment=()=>{
        setCount(prevCount=>prevCount + 1);
    }
  return (
    <div>
      <h1> Simple Counter Application </h1>
      Value : {count } <button onClick={increment}> Increment </button>
    </div>
  )
}

export default Counter
