import  { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTodo, toggleTodo, deleteTodo, clearCompleted, markAllCompleted } from '../../features/todos/todosSlice';

const TodoList = () => {
  const dispatch = useDispatch();
  const todos = useSelector((state) => state.todos);
  const status = useSelector((state) => state.filters.status);
  const [inputText, setInputText] = useState('');
  const [inputColor, setInputColor] = useState('');

  const handleAddTodo = () => {
    if (inputText) {
      dispatch(addTodo({ text: inputText, color: inputColor }));
      setInputText('');
      setInputColor('');
    }
  };

  const visibleTodos = todos.filter((todo) => {
    if (status === 'All') return true;
    if (status === 'Active') return !todo.completed;
    if (status === 'Completed') return todo.completed;
    return false;
  });

  return (
    <div className="flex flex-col items-center">
      <div className="flex mb-4">
        <input 
          type="text" 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)} 
          placeholder="Add a new todo" 
          className="border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:border-blue-500"
        />
        <input 
          type="text" 
          value={inputColor} 
          onChange={(e) => setInputColor(e.target.value)} 
          placeholder="Color" 
          className="border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:border-blue-500"
        />
        <button onClick={handleAddTodo} className="bg-blue-500 text-white rounded-r-lg px-4 py-2 hover:bg-blue-600">Add Todo</button>
      </div>

      <ul className="w-full space-y-2">
        {visibleTodos.map((todo) => (
          <li key={todo.id} className={`flex justify-between items-center p-2 border rounded-lg ${todo.completed ? 'bg-green-200' : 'bg-white'} shadow`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch(toggleTodo(todo.id))}
              className="mr-2"
            />
            <span className={`${todo.completed ? 'line-through text-gray-500' : ''}`}>
              {todo.text} ({todo.color})
            </span>
            <button onClick={() => dispatch(deleteTodo(todo.id))} className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600">Delete</button>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <button onClick={() => dispatch(markAllCompleted())} className="bg-yellow-500 text-white rounded px-4 py-2 hover:bg-yellow-600 mr-2">Mark All Completed</button>
        <button onClick={() => dispatch(clearCompleted())} className="bg-gray-500 text-white rounded px-4 py-2 hover:bg-gray-600">Clear Completed</button>
      </div>
    </div>
  );
};

export default TodoList;
