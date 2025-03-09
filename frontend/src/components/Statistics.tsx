import React, { useState, useEffect } from 'react';

interface StatisticsProps {
  fileId: string | null;  // ✅ Accept `fileId` as a prop
}

const Statistics: React.FC<StatisticsProps> = ({ fileId }) => {
  const [metadata, setMetadata] = useState<{ [key: string]: any } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);  // ✅ Handle errors better

  useEffect(() => {
    if (!fileId) {
      setMetadata(null);
      return;
    }

    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:5000/metadata/${fileId}`);
        const result = await response.json();

        if (result.error) {
          setError(result.error);
          setMetadata(null);
        } else {
          setMetadata(result);
        }
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setError('Failed to load metadata.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [fileId]);

  return (
    <div className="statistics-container">
      <h2 className="statistics-header">Metadata Information</h2>
      {loading ? (
        <p className="loading-message">Loading metadata...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : metadata ? (
        <pre className="metadata-display">{JSON.stringify(metadata, null, 2)}</pre>
      ) : (
        <p className="no-file-message">No file selected</p>
      )}
    </div>
  );
};

export default Statistics;
