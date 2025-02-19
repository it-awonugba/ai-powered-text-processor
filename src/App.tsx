import { Provider } from "react-redux";

import "./App.css";

import { store } from "./redux/store";
import Chat from "./components/Chat";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <header className="App-header">
        <h1>AI-Powered Text Processor</h1>
      </header>
      <Chat />
    </Provider>
  );
};

export default App;
