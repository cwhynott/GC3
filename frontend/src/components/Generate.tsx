import React, { useState } from 'react';
import GeneratePopup from './GeneratePopup';

const Generate: React.FC<{ onPlotGenerated: (plot: string | null) => void }> = ({ onPlotGenerated }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [generatedPlot, setGeneratedPlot] = useState<string | null>(null);

  const handleGenerateClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setGeneratedPlot(null); // Also clear the plot when closing popup
  };

  const handleClosePlot = () => {
    setGeneratedPlot(null);
  };

  const handleGenerateData = async (data: any) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedPlot(result.plot);
        onPlotGenerated(result.plot);
      } else {
        const error = await response.json();
        console.error('Backend error:', error.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <button className="generate-button" onClick={handleGenerateClick}>
        Generate
      </button>
      
      {showPopup && (
        <div className="dual-popup-overlay">
          <div className="dual-popup-container">
            <div className="generate-popup-section">
              <GeneratePopup 
                onClose={handleClosePopup} 
                onGenerate={handleGenerateData} 
              />
            </div>
            
            {generatedPlot && (
              <div className="spectrogram-popup-section">
                <div className="spectrogram-popup-content">
                  <div className="spectrogram-header">
                    <h4>Generated Spectrogram</h4>
                    <button className="close-button" onClick={handleClosePlot}>×</button>
                  </div>
                  <div className="spectrogram-image-container">
                    <img 
                      src={`data:image/png;base64,${generatedPlot}`} 
                      alt="Generated Spectrogram" 
                      className="spectrogram-image"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Generate;