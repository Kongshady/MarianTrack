import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/routes.jsx";

function App() {
  return(
    <Router basename="/MarianTrack">
      <AppRoutes />
    </Router>
  );
}

export default App
