
import { Provider } from 'react-redux'; // Provider to give the store to components
import { store } from '../../app/store'; // Import the store
import Counter from './Counter'; // Import Counter component
import CounterControls from './CounterControls'; // Import Controls component

const Output = () => {
  return (
    <Provider store={store}> {/* Wrap the app in the Provider */}
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Counter App</h1>
        <Counter /> {/* Render the Counter */}
        <CounterControls /> {/* Render the controls */}
      </div>
    </Provider>
  );
};

export default Output;
