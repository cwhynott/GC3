import { useState, useEffect, ChangeEvent } from 'react';
import '../App.css';

interface SavedFile {
  _id: string;
  filename: string;
}

function FileHandle() {
  // State variables
  const [selectedCFile, setSelectedCFile] = useState<File | null>(null);
  const [selectedMetaFile, setSelectedMetaFile] = useState<File | null>(null);
  const [spectrogram, setSpectrogram] = useState<string | null>(null);
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Please upload a .cfile and .sigmf-meta');
  const [selectedCFileName, setSelectedCFileName] = useState<string | null>(null);
  const [selectedMetaFileName, setSelectedMetaFileName] = useState<string | null>(null);

  // Handle .cfile selection
  const handleCFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file || !file.name.endsWith('.cfile')) {
      setStatusMessage('Invalid file type. Please select a .cfile.');
      setSelectedCFile(null);
      setSelectedCFileName(null);
      event.target.value = ''; // Reset file input
      return;
    }

    setSelectedCFile(file);
    setSelectedCFileName(file.name);
    setStatusMessage('Now select and upload a corresponding .sigmf-meta file.');
  };

  // Handle .sigmf-meta file selection
  const handleMetaFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!selectedCFile) {
      setStatusMessage('Please upload a .cfile first.');
      event.target.value = ''; // Reset file input
      return;
    }

    if (!file || !file.name.endsWith('.sigmf-meta')) {
      setStatusMessage('Invalid file type. Please select a .sigmf-meta file.');
      setSelectedMetaFile(null);
      setSelectedMetaFileName(null);
      event.target.value = ''; // Reset file input
      return;
    }

    setSelectedMetaFile(file);
    setSelectedMetaFileName(file.name);
    setStatusMessage('Ready to upload both files');
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedCFile || !selectedMetaFile) {
      return setStatusMessage('Both .cfile and .sigmf-meta files are required.');
    }
  
    setStatusMessage('Uploading files...');
    try {
      const formData = new FormData();
      formData.append('cfile', selectedCFile);
      formData.append('metaFile', selectedMetaFile);
  
      const response = await fetch('http://127.0.0.1:5000/upload', { method: 'POST', body: formData });
      const result = await response.json();
  
      console.log("Backend response:", result); // ✅ Debugging log
  
      if (result.error) return setStatusMessage(`Error: ${result.error}`);
  
      setSpectrogram(result.spectrogram);
      setStatusMessage(result.message);
    } catch (error) {
      setStatusMessage('Upload failed. Please try again.');
    }
  };
  

  // Handle file save to database
  const handleSave = async () => {
    if (!selectedCFile || !selectedMetaFile) {
      return setStatusMessage('Both .cfile and .sigmf-meta files must be selected before saving.');
    }

    setStatusMessage('Saving files...');
    try {
      const formData = new FormData();
      formData.append('cfile', selectedCFile);
      formData.append('metaFile', selectedMetaFile);

      await fetch('http://127.0.0.1:5000/save', { method: 'POST', body: formData });

      fetchSavedFiles();
      setStatusMessage('Files saved to database successfully.');
    } catch (error) {
      setStatusMessage('Failed to save files.');
    }
  };


  // Handle clearing all saved files
  const handleClearFiles = async () => {
    setStatusMessage('Clearing all saved files...');
    try {
      await fetch('http://127.0.0.1:5000/refresh', { method: 'POST' });
      fetchSavedFiles();
      setStatusMessage('All saved files cleared.');
    } catch (error) {
      setStatusMessage('Failed to clear saved files.');
    }
  };

  // Handle loading a saved file
  const handleLoadFile = async (fileId: string) => {
    setStatusMessage('Loading file...');
    try {
      const response = await fetch(`http://127.0.0.1:5000/file/${fileId}/spectrogram`);
      const result = await response.json();
      if (result.error) return setStatusMessage(`Error: ${result.error}`);
      setSpectrogram(result.spectrogram);
      setStatusMessage('File loaded successfully.');
    } catch (error) {
      setStatusMessage('Failed to load file.');
    }
  };

  // Fetch saved files from the database
  const fetchSavedFiles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/files');
      const result = await response.json();
      setSavedFiles(result.files);
    } catch (error) {
      setStatusMessage('');
    }
  };

  // Fetch saved files on component mount
  useEffect(() => {
    fetchSavedFiles();
    setStatusMessage('Please upload a .cfile');
  }, []);

  return (
    <main className="enhanced-app-container">
      {statusMessage && <p className="status-banner">{statusMessage}</p>}

      {/* File Selection - Stacked vertically */}
      <div className="file-selection">
        <div className="file-row">
          <input 
            type="file" 
            accept=".cfile" 
            onChange={handleCFileChange} 
            className="file-input" 
          />
          {selectedCFileName && <span className="selected-file">{selectedCFileName}</span>}
        </div>

        <div className="file-row">
          <input 
            type="file" 
            accept=".sigmf-meta" 
            onChange={handleMetaFileChange} 
            className="file-input" 
            disabled={!selectedCFile} 
          />
          {selectedMetaFileName && <span className="selected-file">{selectedMetaFileName}</span>}
        </div>
      </div>

      {/* File Actions - Centered horizontally */}
      <div className="file-actions">
        <button onClick={handleUpload} className="btn upload-btn" disabled={!selectedCFile || !selectedMetaFile}>
          Upload
        </button>
        <button onClick={handleSave} className="btn save-btn">Save to Database</button>
        <button onClick={handleClearFiles} className="btn clear-btn">Clear All Saved Files</button>
      </div>

      {/* Display Spectrogram */}
      {spectrogram && <img src={`data:image/png;base64,${spectrogram}`} alt="Spectrogram" className="spectrogram-img" />}

      {/* Saved Files Section */}
      <div className="saved-files">
        <h2 style={{ color: '#2c3e50' }}>Saved Files</h2>
        <ul className="file-list">
          {savedFiles.map(file => (
            <li key={file._id} className="file-item">
              {file.filename}
              <button onClick={() => handleLoadFile(file._id)} className="btn load-btn">Load</button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default FileHandle;