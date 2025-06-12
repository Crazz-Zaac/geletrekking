// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/Admin/AdminLogin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
