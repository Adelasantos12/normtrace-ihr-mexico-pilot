
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { MappingExplorer } from './pages/MappingExplorer';
import { ProvisionsExplorer } from './pages/ProvisionsExplorer';
import { ActorsExplorer } from './pages/ActorsExplorer';
import { GapMap } from './pages/GapMap';
import { Instruments } from './pages/Instruments';
import { MarkdownPage } from './pages/MarkdownPage';
import { Methodology } from './pages/Methodology';
import { Downloads } from './pages/Downloads';

// Placeholder components - will be replaced in next steps







const Snapshot = () => <MarkdownPage title="Mexico Legal Internalisation Snapshot" fileName="mexico_legal_internalisation_snapshot.md" />;
const EntryPoints = () => <MarkdownPage title="Capacity-Building Entry Points" fileName="mexico_capacity_building_entry_points.md" />;



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mapping" element={<MappingExplorer />} />
          <Route path="provisions" element={<ProvisionsExplorer />} />
          <Route path="actors" element={<ActorsExplorer />} />
          <Route path="gap-map" element={<GapMap />} />
          <Route path="instruments" element={<Instruments />} />
          <Route path="snapshot" element={<Snapshot />} />
          <Route path="entry-points" element={<EntryPoints />} />
          <Route path="methodology" element={<Methodology />} />
          <Route path="downloads" element={<Downloads />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
