import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MappingExplorer from './pages/MappingExplorer';
import ProvisionsExplorer from './pages/ProvisionsExplorer';
import ActorsExplorer from './pages/ActorsExplorer';
import GapMap from './pages/GapMap';
import CountrySnapshot from './pages/CountrySnapshot';
import Instruments from './pages/Instruments';
import Methodology from './pages/Methodology';
import ReportBuilder from './pages/ReportBuilder';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mapping" element={<MappingExplorer />} />
          <Route path="/provisions" element={<ProvisionsExplorer />} />
          <Route path="/actors" element={<ActorsExplorer />} />
          <Route path="/gap-map" element={<GapMap />} />
          <Route path="/snapshot" element={<CountrySnapshot />} />
          <Route path="/international" element={<Instruments />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/report" element={<ReportBuilder />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
