import React, { useState } from 'react';

interface SavedFile {
  _id: string;
  filename: string;
}

interface SavedFilesProps {
  savedFiles: SavedFile[];
  onDelete: (fileId: string) => void;
  onLoad: (fileId: string) => void;
}

const SavedFiles: React.FC<SavedFilesProps> = ({ savedFiles, onDelete, onLoad }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter saved files based on the search term
  const filteredFiles = savedFiles.filter((file) =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="saved-files">
      <h2 style={{ color: '#2c3e50' }}>Saved Files</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search files..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <ul>
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <li key={file._id} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => onDelete(file._id)}
                className="delete-btn"
                title="Delete file"
              >
                <img src="/src/assets/trash-icon.png" alt="Delete" className="trash-icon" />
              </button>
              <span className="file-name">{file.filename}</span>
              <button onClick={() => onLoad(file._id)}>Load</button>
            </li>
          ))
        ) : (
          <li>No files match your search.</li>
        )}
      </ul>
    </div>
  );
};

export default SavedFiles;