import "./App.css";
import { WebSocketContextProvider } from "./context/webSocketContextProvider";
import { GamePageUrlView } from "./views/GamePageURLView/gamePageUrlView";
import { HomeScreenView } from "./views/HomeScreenView/homeScreenView";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
  return (
    <WebSocketContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomeScreenView />} />
          <Route path="/game-page-url/:lobbyId" element={<GamePageUrlView />} />
        </Routes>
      </Router>
    </WebSocketContextProvider>
  );
}

export default App;
