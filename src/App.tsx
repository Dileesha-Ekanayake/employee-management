import './App.css'
import {EmployeeComponent} from "./component/EmployeeComponent.tsx";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<EmployeeComponent />} />
            </Routes>
        </Router>
    );
}

export default App
