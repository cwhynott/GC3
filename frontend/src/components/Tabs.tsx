import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FileHandle from './FileHandle';
import Statistics from './Statistics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface DisplayTabsProps {
  plot: string | null; // Accept the plot prop
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DisplayTabs: React.FC<DisplayTabsProps> = ({ plot }) => {
  const [value, setValue] = useState(0);
  const [tabs, setTabs] = useState<{ id: number; label: string; fileId: string | null }[]>([
    { id: 0, label: 'Tab 1', fileId: null },
  ]);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleAdd = () => {
    const newId = tabs.length > 0 ? Math.max(...tabs.map((tab) => tab.id)) + 1 : 0;
    setTabs([...tabs, { id: newId, label: `Tab ${tabs.length + 1}`, fileId: null }]);
  };

  const handleDelete = (indexToDelete: number) => {
    setTabs((prevTabs) => prevTabs.filter((_, index) => index !== indexToDelete));
    if (indexToDelete <= value) {
      setValue((prev) => Math.max(0, prev - 1));
    }
  };

  const updateFileId = (tabId: number, newFileId: string) => {
    setTabs((prevTabs) => prevTabs.map((tab) => (tab.id === tabId ? { ...tab, fileId: newFileId } : tab)));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" sx={{ height: '30px' }}>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
              iconPosition="end"
            />
          ))}
          <Button variant="contained" onClick={handleAdd}>
            Add Tab
          </Button>
        </Tabs>
      </Box>

      {tabs.map((tab, index) => (
        <CustomTabPanel key={index} value={value} index={index}>
          <div className="tab-content">
            <div className="statistics-container">
              <Statistics fileId={tab.fileId} />
            </div>
            <div className="file-handle-container">
              <FileHandle fileId={tab.fileId} onFileSelect={(fileId) => updateFileId(tab.id, fileId)} />
            </div>
            {/* Render the spectrogram if the plot exists */}
            {plot && (
              <div className="spectrogram-container">
                <img src={`data:image/png;base64,${plot}`} alt="Generated Spectrogram" />
              </div>
            )}
          </div>
        </CustomTabPanel>
      ))}
    </Box>
  );
};

export default DisplayTabs;