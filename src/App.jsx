import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import CallRider from './pages/CallRider';
import RiderComing from './pages/RiderComing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/call-rider" element={<CallRider />} />
        <Route path="/rider-coming" element={<RiderComing />} />
      </Routes>
    </Router>
  );
}

export default App;
