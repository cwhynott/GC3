/**
 * CS-410: Component where user uploads, views and manages files.
 * @file FileHandle.tsx
 * @authors Jun Cho, Will Cho, Grace Johnson, Connor Whynott
 * @collaborators None
 * @description This component is used to upload, view and manage files.
 */

import { useState, useEffect, ChangeEvent } from 'react';
import '../App.css';
import SavedFiles from './SavedFiles';


interface SavedFile {
  _id: string;
  filename: string;
  annotations?: any[];
}

interface FileHandleProps {
  fileId: string | null;
  onFileSelect: (fileId: string | null, annotations?: any[]) => void;
}

const FileHandle: React.FC<FileHandleProps> = ({ fileId, onFileSelect }) => {
  // State variables
  const [currentFileId, setCurrentFileId] = useState<string | null>(fileId); // Track the currently selected file ID
  const [selectedCFile, setSelectedCFile] = useState<File | null>(null);
  const [selectedMetaFile, setSelectedMetaFile] = useState<File | null>(null);
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Please upload a .cfile and .sigmf-meta file');
  const [selectedCFileName, setSelectedCFileName] = useState<string | null>(null);
  const [selectedMetaFileName, setSelectedMetaFileName] = useState<string | null>(null);
  const [dots, setDots] = useState<string>(''); // Track the dots


  // State for tab switching
  const [activeTab, setActiveTab] = useState<string>('spectrogram');
  const [plotImages, setPlotImages] = useState<{ [key: string]: string | null }>({
    spectrogram: null,
    time_domain: null,
    freq_domain: null,
    iq_plot: null,
  });

  useEffect(() => {
    if (fileId) {
      fetchPlots(fileId);
    }
  }, [fileId]);

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

      console.log("Upload Response:", result);
      console.log("[Frontend] Received AirVIEW annotations:", result.annotations);

      if (result.annotations && Array.isArray(result.annotations)) {
        console.log("[Frontend] Upload received annotations:", result.annotations);
      }
      
      onFileSelect(result.file_id, result.annotations);  // ✅ Pass it up
      

      // Immediately add uploaded file to saved list
      setSavedFiles((prevFiles) => [
        ...prevFiles,
        { _id: result.file_id, filename: selectedCFile.name }
      ]);

      // Immediately set spectrogram image
      if (result.spectrogram) {
        setPlotImages((prevImages) => ({ ...prevImages, spectrogram: result.spectrogram }));
        setActiveTab('spectrogram'); // Ensure spectrogram is shown first
      }

      // update current file ID
      setCurrentFileId(result.file_id);
      fetchPlots(result.file_id);
      setStatusMessage(result.message);
    } catch (error) {
      setStatusMessage('Upload failed. Please try again.');
    }
  };
  
  
  // Handle clearing selected file
  const handleClearCurrentFile = () => {
    setSelectedCFile(null);
    setSelectedMetaFile(null);
    setSelectedCFileName(null);
    setSelectedMetaFileName(null);
    setCurrentFileId(null);
    setPlotImages({
      spectrogram: null,
      time_domain: null,
      freq_domain: null,
      iq_plot: null,
    });
    onFileSelect(null); // Notify parent component to reset fileId
    setStatusMessage('File cleared. Please upload new files.');
  };
  
  // Fetch and store images dynamically
  const fetchPlots = async (fileId: string) => {
    const plotTypes = ['spectrogram', 'time_domain', 'freq_domain', 'iq_plot'];
  
    for (const plot of plotTypes) {
      try {
        console.log(`Fetching ${plot}...`);
  
        const response = await fetch(`http://127.0.0.1:5000/file/${fileId}/${plot}`);
        const result = await response.json();
  
        if (result.error) {
          console.error(`Error fetching ${plot}:`, result.error);
          continue;
        }
  
        console.log(`Fetched ${plot}: ✅ Success`);
  
        // Ensure the spectrogram is set first
        setPlotImages((prevImages) => ({ ...prevImages, [plot]: result.image }));
  
        if (plot === 'spectrogram') {
          setActiveTab('spectrogram');  // Ensure spectrogram is shown first
        }
  
      } catch (error) {
        console.error(`Error fetching ${plot}:`, error);
      }
    }
  };

  // Handle single file deletion
  const handleSingleDelete = async (fileId: string) => {
    const userConfirmed = window.confirm(`Are you sure you want to delete this file?`);
    if (!userConfirmed) {
      return; // Exit if the user cancels
    }
  
    try {
      const response = await fetch(`http://127.0.0.1:5000/file/${fileId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete file.');
      }
  
      // If the deleted file is currently open, clear the graphs and reset the fileId
      if (fileId === currentFileId) {
        setActiveTab(''); // Reset the active tab
        setPlotImages({
          spectrogram: null,
          time_domain: null,
          freq_domain: null,
          iq_plot: null,
        });
        setCurrentFileId(null); // Reset the selected file
        onFileSelect(null); // Notify parent component to reset fileId

      }
  
      // Refresh the saved files list
      setTimeout(() => {
        fetchSavedFiles();
        setStatusMessage('File successfully deleted.');
      }, 500); // Adjust delay if necessary
    } catch (error) {
      console.error("Error deleting file:", error);
      setStatusMessage('Failed to delete file.');
    }
  };

  // Handle loading a saved file
  const handleLoadFile = async (fileId: string) => {
    setActiveTab('spectrogram');  
    setStatusMessage('Loading file...');
    fetchPlots(fileId);
  
    try {
      const response = await fetch(`http://127.0.0.1:5000/file/${fileId}/annotations`);
      const result = await response.json();
  
      if (result.error) {
        console.error("Error fetching annotations:", result.error);
        setStatusMessage("Failed to load annotations.");
        onFileSelect(fileId, []); // fallback to empty
      } else {
        console.log("[Frontend] Loaded annotations:", result.annotations);
        onFileSelect(fileId, result.annotations);
      }
    } catch (error) {
      console.error("Failed to fetch annotations:", error);
      onFileSelect(fileId, []); // fallback to empty
    }
  
    setStatusMessage('Files loaded successfully');
    setCurrentFileId(fileId);
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
      {/* Status Banner */}
      <p className="status-banner">{statusMessage}{dots}</p>
  
      {/* File Selection - Stacked vertically */}
      <div className="file-selection">
        {/* Custom Button for .cfile */}
        <div className="file-row">
          <label htmlFor="cfile-upload" className="custom-file-upload">Choose .cfile</label>
          <input
            id="cfile-upload"
            type="file"
            accept=".cfile"
            onChange={handleCFileChange}
            className="file-input"
          />
          <span className="file-name">{selectedCFileName || "No file selected"}</span>
        </div>
  
        {/* Custom Button for .sigmf-meta */}
        <div className="file-row">
          <label htmlFor="meta-upload" className="custom-file-upload">Choose .sigmf</label>
          <input
            id="meta-upload"
            type="file"
            accept=".sigmf-meta"
            onChange={handleMetaFileChange}
            className="file-input"
          />
          <span className="file-name">{selectedMetaFileName || "No file selected"}</span>
        </div>
      </div>
  
      {/* File Actions - Centered horizontally */}
      <div className="file-actions">
        <button
          onClick={handleUpload}
          className="btn upload-btn"
          disabled={!selectedCFile || !selectedMetaFile}
        >
          Upload
        </button>
        <button
          onClick={handleClearCurrentFile}
          className="btn clear-files-btn"
        >
          Clear Current File
        </button>
      </div>
  
      {/* Tabbed Interface for Plots */}
      { currentFileId ? (
        <div className="plot-container">
          <div className="tabs">
            {['spectrogram', 'time_domain', 'freq_domain', 'iq_plot'].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
  
          {/* Display Selected Plot */}
          {plotImages[activeTab] ? (
            <img
              src={`data:image/png;base64,${plotImages[activeTab]}`}
              alt={activeTab}
              className="plot-image"
            />
          ) : (
            <p className="status-banner">Loading {activeTab}...</p>
          )}
        </div>
      ) : null}
  
      {/* Saved Files Section */}
      <SavedFiles
        savedFiles={savedFiles}
        onDelete={handleSingleDelete}
        onLoad={handleLoadFile}
      />
    </main>
  );
}

export default FileHandle;