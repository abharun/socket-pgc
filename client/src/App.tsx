import "./App.css";
import { Dashboard, LoginPage } from "./pages";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PATH } from "./consts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={PATH.INTERFACE} element={<Navigate to={PATH.LOGIN} />} />
        <Route path={PATH.LOGIN} element={<LoginPage />} />
        <Route path={PATH.DASHBOARD} element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
