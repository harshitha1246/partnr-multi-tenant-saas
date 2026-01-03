import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />   {/* ✅ ADD THIS */}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
