import React, { useState } from 'react';

interface GeneratePopupProps {
  onClose: () => void;
  onGenerate: (data: {
    rows: number | null;
    cols: number | null;
    numTransmitters: number | null;
    transmitterMean: number | null;
    transmitterSd: number | null;
    noiseMean: number | null;
    noiseSd: number | null;
    bandwidth: number | null;
    activeTime: number | null;
    matrixFilename: string;
    transmittersFilename: string;
    placementMethod: string;
  }) => void;
}

const GeneratePopup: React.FC<GeneratePopupProps> = ({ onClose, onGenerate }) => {
  const [rows, setRows] = useState<number | null>(1000);
  const [cols, setCols] = useState<number | null>(1024);
  const [numTransmitters, setNumTransmitters] = useState<number | null>(5);
  const [transmitterMean, setTransmitterMean] = useState<number | null>(-75);
  const [transmitterSd, setTransmitterSd] = useState<number | null>(2);
  const [noiseMean, setNoiseMean] = useState<number | null>(-109);
  const [noiseSd, setNoiseSd] = useState<number | null>(10);
  const [bandwidth, setBandwidth] = useState<number | null>(200);
  const [activeTime, setActiveTime] = useState<number | null>(10);
  const [placementMethod, setPlacementMethod] = useState<string>('equally_spaced');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      rows,
      cols,
      numTransmitters,
      transmitterMean,
      transmitterSd,
      noiseMean,
      noiseSd,
      bandwidth,
      activeTime,
      matrixFilename: 'output_matrix.csv',
      transmittersFilename: 'output_transmitters.csv',
      placementMethod,
    });
  };

  return (
    <div className="popup-content">
      <div className="popup-header">
        <h4>Generate Data</h4>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <form onSubmit={handleSubmit}>
      <fieldset>
          <legend>Placement Method</legend>
          <label>
            <input
              type="radio"
              value="equally_spaced"
              checked={placementMethod === 'equally_spaced'}
              onChange={(e) => setPlacementMethod(e.target.value)}
            />
            Equally Spaced
          </label>
          <label>
            <input
              type="radio"
              value="random"
              checked={placementMethod === 'random'}
              onChange={(e) => setPlacementMethod(e.target.value)}
            />
            Random
          </label>
        </fieldset>
        <label>
          Rows:
          <input type="number" value={rows ?? ''} onChange={(e) => setRows(Number(e.target.value))} />
        </label>
        <label>
          Columns:
          <input type="number" value={cols ?? ''} onChange={(e) => setCols(Number(e.target.value))} />
        </label>
        <label>
          Number of Transmitters:
          <input type="number" value={numTransmitters ?? ''} onChange={(e) => setNumTransmitters(Number(e.target.value))} />
        </label>
        <label>
          Transmitter Mean:
          <input type="number" value={transmitterMean ?? ''} onChange={(e) => setTransmitterMean(Number(e.target.value))} />
        </label>
        <label>
          Transmitter Standard Deviation:
          <input type="number" value={transmitterSd ?? ''} onChange={(e) => setTransmitterSd(Number(e.target.value))} />
        </label>
        <label>
          Noise Mean:
          <input type="number" value={noiseMean ?? ''} onChange={(e) => setNoiseMean(Number(e.target.value))} />
        </label>
        <label>
          Noise Standard Deviation:
          <input type="number" value={noiseSd ?? ''} onChange={(e) => setNoiseSd(Number(e.target.value))} />
        </label>
        <label>
          Bandwidth:
          <input type="number" value={bandwidth ?? ''} onChange={(e) => setBandwidth(Number(e.target.value))} />
        </label>
        <label>
          Active Time:
          <input type="number" value={activeTime ?? ''} onChange={(e) => setActiveTime(Number(e.target.value))} />
        </label>
        <button type="submit">Generate</button>
      </form>
    </div>
  );
};

export default GeneratePopup;