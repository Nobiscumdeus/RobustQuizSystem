import { createSlice } from "@reduxjs/toolkit";

//Create a slice for todos
const todosSlice=createSlice({
    name:'todos', //Name of the slice 
    initialState:[], //Initial state is an empty array 
    reducers:{
        //Action to add a new todo 
        addTodo:(state,action)=>{
            const newTodo={
                id:Date.now(), //Generate a unique ID 
                text:action.payload.text, //Todo text from the action payload 
                color:action.payload.color, //Todo color from the action payload 
                completed:false, //Default completed status 
            }
            state.push(newTodo) //Add a new todo to the state 
        },
        //Action to toggle the completed status of a todo 
        toggleTodo:(state,action)=>{
            const todo=state.find((todo)=> todo.id  === action.payload );
            if(todo){
                todo.completed  = !todo.completed; //Toggle completed status 
            }
        },
        //Action to delete a todo 
        deleteTodo:(state,action)=>{
            return state.filter((todo)=>todo.id !== action.payload) //Remove Todo by ID 

        },
        //Action to mark all todos as completed 
        markAllCompleted:(state)=>{
            state.forEach((todo)=>{
                todo.completed=true //Set all todos to true
            })
        },
        //Action to clear completed todos
        clearCompleted:(state)=>{
            return state.filter((todo) => !todo.completed ); //keep only non-completed todos
        }

    }

})

//Export actions and reducers 
export const { addTodo,toggleTodo,deleteTodo,markAllCompleted,clearCompleted}=todosSlice.actions
export default todosSlice.reducer 
