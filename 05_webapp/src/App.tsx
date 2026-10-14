import EvidenceReview from './pages/EvidenceReview';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import LandingPage from './pages/LandingPage';
import MappingExplorer from './pages/MappingExplorer';
import ProvisionsExplorer from './pages/ProvisionsExplorer';
import ActorsExplorer from './pages/ActorsExplorer';
import Instruments from './pages/Instruments';
import Methodology from './pages/Methodology';
import SparBridge from './pages/SparBridge';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/audit" element={<EvidenceReview />} />
          <Route path="/dashboard" element={<EvidenceReview />} />
          <Route path="/pipeline" element={<EvidenceReview />} />
          <Route path="/normative-hierarchy" element={<EvidenceReview />} />
          <Route path="/norm-diagnostic" element={<EvidenceReview />} />
          <Route path="/political-brain" element={<EvidenceReview />} />
          <Route path="/mapping" element={<MappingExplorer />} />
          <Route path="/provisions" element={<ProvisionsExplorer />} />
          <Route path="/actors" element={<ActorsExplorer />} />
          <Route path="/spar-bridge" element={<SparBridge />} />
          <Route path="/gap-map" element={<EvidenceReview />} />
          <Route path="/snapshot" element={<EvidenceReview />} />
          <Route path="/capacity" element={<EvidenceReview />} />
          <Route path="/international" element={<Instruments />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/report" element={<EvidenceReview />} />
          <Route path="/report/print" element={<EvidenceReview />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
