/** 
 * CS-410: Frontend for uploading files, generating spectrograms, and interacting with MongoDB
 * @file app.tsx
 */

import { useState } from 'react';
import './App.css';
import DisplayTabs from './components/Tabs';
import Menu from './components/Menu';
import Generate from './components/Generate';

function App() {
  const [plot, setPlot] = useState<string | null>(null);

  const handlePlotGenerated = (plot: string | null) => {
    setPlot(plot);
  };

  return (
    <main className="enhanced-app-container">
      {/* ✅ Application Header */}
      <header className="app-header">
        <Menu />
        <img src="/images/GC3 Logo.png" alt="GC3 Logo" className="app-logo" />
        <Generate onPlotGenerated={handlePlotGenerated} />
      </header>

      {/* ✅ Main Layout: Upload Controls + Metadata + Tabs */}
      <div className="upload-metadata-wrapper">
        <DisplayTabs plot={null} /> {/* We're no longer passing the plot to tabs */}
      </div>
    </main>
  );
}

export default App;