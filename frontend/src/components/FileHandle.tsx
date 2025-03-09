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
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Please upload a .cfile and .sigmf-meta file');
  const [selectedCFileName, setSelectedCFileName] = useState<string | null>(null);
  const [selectedMetaFileName, setSelectedMetaFileName] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [dots, setDots] = useState<string>(''); // Track the dots


  // State for tab switching
  const [activeTab, setActiveTab] = useState<string>('spectrogram');
  const [plotImages, setPlotImages] = useState<{ [key: string]: string | null }>({
    spectrogram: null,
    time_domain: null,
    freq_domain: null,
    iq_plot: null,
  });

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

    setStatusMessage(selectedMetaFile ? 'Ready to upload both files.' : 'Now select and upload a .sigmf-meta file.');
  };

  // Handle .sigmf-meta file selection
  const handleMetaFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file || !file.name.endsWith('.sigmf-meta')) {
      setStatusMessage('Invalid file type. Please select a .sigmf file.');
      setSelectedMetaFile(null);
      setSelectedMetaFileName(null);
      event.target.value = ''; // Reset file input
      return;
    }

    setSelectedMetaFile(file);
    setSelectedMetaFileName(file.name);

    setStatusMessage(selectedCFile ? 'Ready to upload both files.' : 'Now select and upload a .cfile.');

  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedCFile || !selectedMetaFile) {
      return setStatusMessage('Both .cfile and .sigmf-meta files are required.');
    }

    updateStatusMessage('Uploading files');
    try {
      const formData = new FormData();
      formData.append('cfile', selectedCFile);
      formData.append('metaFile', selectedMetaFile);

      const response = await fetch('http://127.0.0.1:5000/upload', { method: 'POST', body: formData });
      const result = await response.json();

      if (result.error) return setStatusMessage(`Error: ${result.error}`);

      console.log("Upload Response:", result); // ✅ Debugging log

      setFileId(result.file_id);

      // ✅ Immediately add uploaded file to saved list
      setSavedFiles((prevFiles) => [
        ...prevFiles,
        { _id: result.file_id, filename: selectedCFile.name }
      ]);

      // ✅ Immediately set spectrogram image
      if (result.spectrogram) {
        setPlotImages((prevImages) => ({ ...prevImages, spectrogram: result.spectrogram }));
        setActiveTab('spectrogram'); // ✅ Ensure spectrogram is shown first
      }

      fetchPlots(result.file_id);
      setStatusMessage(result.message);
    } catch (error) {
      setStatusMessage('Upload failed. Please try again.');
    }
  };
  
  
  // **Handle clearing only selected files**
  const handleClearSelectedFiles = () => {
    setSelectedCFile(null);
    setSelectedMetaFile(null);
    setSelectedCFileName(null);
    setSelectedMetaFileName(null);
    setFileId(null);
    setPlotImages({
      spectrogram: null,
      time_domain: null,
      freq_domain: null,
      iq_plot: null,
    });
    setStatusMessage('File selection cleared. Please upload new files.');
  };
  
  // Fetch and store images dynamically
  const fetchPlots = async (fileId: string) => {
    const plotTypes = ['spectrogram', 'time_domain', 'freq_domain', 'iq_plot'];
  
    for (const plot of plotTypes) {
      try {
        console.log(`Fetching ${plot}...`); // ✅ Debugging log
  
        const response = await fetch(`http://127.0.0.1:5000/file/${fileId}/${plot}`);
        const result = await response.json();
  
        if (result.error) {
          console.error(`Error fetching ${plot}:`, result.error);
          continue;
        }
  
        console.log(`Fetched ${plot}: ✅ Success`); // ✅ Debugging log
  
        // Ensure the spectrogram is set first
        setPlotImages((prevImages) => ({ ...prevImages, [plot]: result.image }));
  
        if (plot === 'spectrogram') {
          setActiveTab('spectrogram');  // ✅ Ensure spectrogram is shown first
        }
  
      } catch (error) {
        console.error(`Error fetching ${plot}:`, error);
      }
    }
  };

  const handleClearFiles = async () => {
    updateStatusMessage("Clearing all saved files");
    try {
      const response = await fetch('http://127.0.0.1:5000/refresh', { method: 'POST' });
  
      if (!response.ok) {
        throw new Error('Failed to clear files from backend.');
      }
  
      const result = await response.json();
      console.log("Clear response:", result); // ✅ Debugging log
  
      // Delay to ensure backend clears before fetching updated list
      setTimeout(() => {
        fetchSavedFiles();
        setStatusMessage('All files cleared.');
      }, 500); // Adjust delay if necessary
  
    } catch (error) {
      console.error("Error clearing files:", error);
      setStatusMessage('Failed to clear saved files.');
    }
  };

  // Handle loading a saved file
  const handleLoadFile = async (fileId: string) => {
    setFileId(fileId);
    setActiveTab('spectrogram');  // ✅ Ensure spectrogram is shown first
    setStatusMessage('Loading file...');
    fetchPlots(fileId);
    setStatusMessage('Files loaded successfully');
  };  

  // Fetch saved files from the database
  const fetchSavedFiles = async () => {
    try {  
      const response = await fetch('http://127.0.0.1:5000/files');
      const result = await response.json();
  
      if (result.error) {
        console.error("Error fetching saved files:", result.error);
        setStatusMessage(`Error: ${result.error}`);
        return;
      }  
      if (Array.isArray(result.files)) {
        setSavedFiles(result.files);
      } else {
        console.error("Unexpected response format:", result);
        setSavedFiles([]);
      }
    } catch (error) {
      console.error("Error fetching saved files:", error);
      setStatusMessage('Error fetching saved files');
    }
  };
  
  // Fetch saved files on component mount
  useEffect(() => {
    fetchSavedFiles();
    setStatusMessage('Please upload a .cfile and .sigmf file');
  }, []);

  // Dot Animation Effect: Runs whenever statusMessage changes
  useEffect(() => {
    if (statusMessage === "Uploading files" || statusMessage === "Clearing all saved files...") {
      setDots(""); // Reset dots when statusMessage starts
  
      const interval = setInterval(() => {
        setDots((prevDots) => (prevDots.length === 3 ? "" : prevDots + ".")); // Cycle . → .. → ... → .
      }, 500);
  
      return () => clearInterval(interval); // Cleanup on unmount or message change
    } else {
      setDots(""); // Ensure no dots for other messages
    }
  }, [statusMessage]);
  
  const updateStatusMessage = (message: string) => {
    setStatusMessage(message);
    if (message !== "Uploading files" && message !== "Clearing all saved files...") {
      setDots(""); // Stop dots animation for other messages
    }
  };
  
  

  return (
    <main className="enhanced-app-container">
      <p className="status-banner">{statusMessage}{dots}</p>


      {/* File Selection - Stacked vertically */}
      <div className="file-selection">
        {/* Custom Button for CFile */}
        <div className="file-row">
          <label htmlFor="cfile-upload" className="custom-file-upload">Choose .cfile</label>
          <input id="cfile-upload" type="file" accept=".cfile" onChange={handleCFileChange} className="file-input" />
          <span className="file-name">{selectedCFileName || "No file selected"}</span>
        </div>

        <div className="file-row">
          <label htmlFor="meta-upload" className="custom-file-upload">Choose .sigmf</label>
          <input id="meta-upload" type="file" accept=".sigmf-meta" onChange={handleMetaFileChange} className="file-input" />
          <span className="file-name">{selectedMetaFileName || "No file selected"}</span>

        </div>
      </div>

      {/* File Actions - Centered horizontally */}
      <div className="file-actions">
        <button onClick={handleUpload} className="btn upload-btn" disabled={!selectedCFile || !selectedMetaFile}>
          Upload
        </button>
        <button onClick={handleClearSelectedFiles} className="btn clear-files-btn" disabled={!selectedCFile && !selectedMetaFile}>
          Clear Selected Files
        </button>
        <button onClick={handleClearFiles} className="btn clear-btn">Clear All Files</button>
      </div>
      {/* Tabbed Interface for Plots */}
      {fileId && (
        <div className="plot-container">
          <div className="tabs">
            {['spectrogram', 'time_domain', 'freq_domain', 'iq_plot'].map((tab) => (
              <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                {tab.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
      
        {/* Display Selected Plot */}
        {plotImages[activeTab] ? (
          <img src={`data:image/png;base64,${plotImages[activeTab]}`} alt={activeTab} className="plot-image" />
        ) : (
          <p className="status-banner">Loading {activeTab}...</p>
        )}
        </div>
      )}

      {/* Saved Files Section */}
      <div className="saved-files">
        <h2 style={{ color: '#2c3e50' }}>All Files</h2>
        <ul>
          {savedFiles.length > 0 ? (
            savedFiles.map((file) => (
              <li key={file._id}>
                <span className="file-name">{file.filename}</span> {/* ✅ Ensures filename uses updated styles */}
                <button onClick={() => handleLoadFile(file._id)}>Load</button>
              </li>
            ))
          ) : (
            <li>No files saved.</li>
          )}
        </ul>
      </div>

    </main>
  );
}

export default FileHandle;