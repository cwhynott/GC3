/** 
 * CS-410: Frontend for uploading files, generating spectrograms, and interacting with MongoDB
 * @file app.tsx
 * @authors Jun Cho, Will Cho, Grace Johnson, Connor Whynott
 * @collaborators None
 */

import { useState, useRef } from 'react';
import './App.css';
import DisplayTabs from './components/Tabs';

function App() {
  // State variables
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Toggle dropdown menu
  const toggleDropdown = (menu: string) => {
    setDropdownOpen(dropdownOpen === menu ? null : menu);
  };

  return (
    <main className="enhanced-app-container">
      <header className="app-header">
        <nav className="menu-bar">
          <div className="menu-item" ref={dropdownRef}>
            <button className="menu-button" onClick={() => toggleDropdown('file')}>File</button>
            {dropdownOpen === 'file' && (
              <div className="dropdown-menu">
                <button className="dropdown-item">New</button>
                <button className="dropdown-item">Open</button>
                <button className="dropdown-item">Save</button>
                <button className="dropdown-item">Save As</button>
              </div>
            )}
          </div>
          <div className="menu-item" ref={dropdownRef}>
            <button className="menu-button" onClick={() => toggleDropdown('edit')}>Edit</button>
            {dropdownOpen === 'edit' && (
              <div className="dropdown-menu">
                <button className="dropdown-item">Undo</button>
                <button className="dropdown-item">Redo</button>
                <button className="dropdown-item">Cut</button>
                <button className="dropdown-item">Copy</button>
                <button className="dropdown-item">Paste</button>
              </div>
            )}
          </div>
          <div className="menu-item" ref={dropdownRef}>
            <button className="menu-button" onClick={() => toggleDropdown('view')}>View</button>
            {dropdownOpen === 'view' && (
              <div className="dropdown-menu">
                <button className="dropdown-item">Zoom In</button>
                <button className="dropdown-item">Zoom Out</button>
                <button className="dropdown-item">Full Screen</button>
              </div>
            )}
          </div>
          <div className="menu-item" ref={dropdownRef}>
            <button className="menu-button" onClick={() => toggleDropdown('help')}>Help</button>
            {dropdownOpen === 'help' && (
              <div className="dropdown-menu">
                <button className="dropdown-item">Documentation</button>
                <button className="dropdown-item">About</button>
              </div>
            )}
          </div>
        </nav>
        <img src="/images/GC3 Logo.png" alt="GC3 Logo" className="app-logo" />
      </header>
      <DisplayTabs />

    </main>
  );
}

export default App;