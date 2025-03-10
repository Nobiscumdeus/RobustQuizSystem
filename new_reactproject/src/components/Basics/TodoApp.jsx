import { useState } from 'react'

function TodoApp() {
    //state to hold the list of todos
    const [todos,setTodos]=useState([])
    const [input,setInput] =useState('')

    //function to add a new todo 
    const addTodo=()=>{
        if(input){
            setTodos([...todos,input]); //Add the new todo to the list 
            setInput('') //Clear the input field 
        }
    }

    //Function to remove a todo by index
    const removeTodo=(index)=>{
        const newTodos=todos.filter((_,i)=> i !== index) ; //Filter out the removed todo 
        setTodos(newTodos)
    }
 
  return (
    <div className='antiinitialised mx-auto '>
        <h1> Simple Todo List </h1>
        <input type='text' 
        value={input}
        onChange={(e)=>setInput(e.target.value)} //Update input state on change 
        />

        <button onClick={addTodo}> Add Todo </button>
        <ul>
            {
                todos.map((todo,index)=>(
                    <li key={index}>
                        { todo }
                        <button onClick={()=>removeTodo(index)}> Remove </button>
                    </li>
                ))
            }
        </ul>
      
    </div>
  )
}

export default TodoApp
