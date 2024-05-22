import "./App.css";
import { ClientContextProvider } from "./context/clientContextProvider";
import { WebSocketContextProvider } from "./context/webSocketContextProvider";
import { GamePageUrlView } from "./views/GamePageURLView/gamePageUrlView";
import { HomeScreenView } from "./views/HomeScreenView/homeScreenView";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
  return (
    <ClientContextProvider>
      <WebSocketContextProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomeScreenView />} />
            <Route
              path="/game-page-url/:lobbyId"
              element={<GamePageUrlView />}
            />
          </Routes>
        </Router>
      </WebSocketContextProvider>
    </ClientContextProvider>
  );
}

export default App;
