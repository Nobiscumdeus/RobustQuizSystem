import  { useReducer } from 'react';

// Reducer function that defines how state transitions happen
const reducer = (state, action) => {
  switch (action.type) {
    case 'add':
      return {
        todos: [...state.todos, { id: Date.now(), text: action.text, completed: false }]
      };
    case 'toggle':
      return {
        todos: state.todos.map(todo =>
          todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
        )
      };
    case 'delete':
      return {
        todos: state.todos.filter(todo => todo.id !== action.id)
      };
    default:
      throw new Error();
  }
};

const TodoList = () => {
  // useReducer hook with initial state and the reducer function
  const [state, dispatch] = useReducer(reducer, { todos: [] });

  const handleSubmit = e => {
    e.preventDefault();
    const text = e.target.elements.todo.value.trim();
    if (text) {
      dispatch({ type: 'add', text });
      e.target.reset();
    }
  };

  return (
    <div className="App">
      <h1>Todo List</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="todo" placeholder="Enter a todo" />
        <button type="submit">Add Todo</button>
      </form>
      <ul>
        {state.todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <span onClick={() => dispatch({ type: 'toggle', id: todo.id })}>
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'delete', id: todo.id })}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
