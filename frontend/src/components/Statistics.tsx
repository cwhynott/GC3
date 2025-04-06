/**
 * CS-410: Statistics Bar Component.
 * @file Statistics.tsx
 * @authors Jun Cho, Will Cho, Grace Johnson, Connor Whynott
 * @collaborators None
 */

import React, { useState, useEffect } from 'react';

interface StatisticsProps {
  fileId: string | null;
}

interface MetadataType {
  sample_rate?: number;
  center_frequency?: number;
  datatype?: string;
  sample_start?: number;
  offset?: number;
  author?: string;
  hardware?: string;
  recorder?: string;
  datetime?: string;
}

const MetadataSection: React.FC<{ title: string; items: [string, any][] }> = ({ title, items }) => (
  <div className="metadata-section">
    <h3 className="section-title">{title}</h3>
    <div className="metadata-grid">
      {items.map(([key, value]) => (
        <div className="metadata-item" key={key}>
          <span className="metadata-key">{key}:</span>
          <span className="metadata-value">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const Statistics: React.FC<StatisticsProps> = ({ fileId }) => {
  const [metadata, setMetadata] = useState<MetadataType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const formatMetadata = (data: MetadataType) => {
    const administrativeFields: [string, any][] = [
      ['Author', data.author],
      ['Hardware', data.hardware],
      ['Recorder', data.recorder],
      ['Date/Time', data.datetime ? new Date(data.datetime).toLocaleString() : 'N/A'],
    ];

    const technicalFields: [string, any][] = [
      ['Sample Rate', `${Number(data.sample_rate).toLocaleString()} Hz`],
      ['Center Frequency', `${Number(data.center_frequency).toLocaleString()} Hz`],
      ['Data Type', data.datatype],
      ['Sample Start', data.sample_start],
      ['Offset', data.offset],
    ];

    return (
      <div className="metadata-container">
        <MetadataSection title="General Information" items={administrativeFields} />
        <MetadataSection title="Statistics" items={technicalFields} />
      </div>
    );
  };

  return (
    <div className="statistics-container">
      <h2 className="statistics-header">Metadata Information</h2>
      {loading ? (
        <p className="loading-message">Loading metadata...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : metadata ? (
        formatMetadata(metadata)
      ) : (
        <p className="no-file-message">No file selected</p>
      )}
    </div>
  );
};

export default Statistics;