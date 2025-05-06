import { useQuery, useMutation, gql } from "@apollo/client";

const GET_TASKS = gql`
  query {
    tasks {
      id
      title
      completed
    }
  }
`;

const TOGGLE_TASK = gql`
  mutation ToggleTask($id: ID!) {
    toggleTask(id: $id) {
      id
      completed
    }
  }
`;

const ADD_TASK = gql`
  mutation CreateTask($title: String!) {
    createTask(title: $title) {
      id
      title
    }
  }
`;

function GraphqlApp() {
  const { loading, error, data } = useQuery(GET_TASKS);
  const [toggleTask] = useMutation(TOGGLE_TASK);
  const [createTask] = useMutation(ADD_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  });

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
      <p className="font-bold">Error</p>
      <p>{error.message}</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Task Manager</h1>
        
        <div className="mb-6">
          <button
            onClick={() => createTask({ variables: { title: "New Task" }})}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Task
          </button>
        </div>

        <ul className="space-y-2">
          {data.tasks.map((task) => (
            <li
              key={task.id}
              onClick={() => toggleTask({ variables: { id: task.id } })}
              className={`p-4 rounded-lg cursor-pointer transition duration-200 flex items-center justify-between ${
                task.completed 
                  ? "bg-green-50 text-green-800 line-through" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-800"
              }`}
            >
              <span className="font-medium">{task.title}</span>
              <div className="flex items-center">
                {task.completed ? (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Completed
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Pending
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        {data.tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No tasks yet. Add your first task!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GraphqlApp;