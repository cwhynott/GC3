/** 
 * CS-410: Frontend for uploading files, generating spectrograms, and interacting with MongoDB
 * @file app.tsx
 * @authors Jun Cho, Will Cho, Grace Johnson, Connor Whynott
 * @collaborators None
 */

import { useState, useRef } from 'react';
import './App.css';
import './EnhancedApp.css';
import DisplayTabs from './components/Tabs';
import Menu from './components/Menu';

function App() {
  return (
    <main className="enhanced-app-container">
      <header className="app-header">
        <Menu />
        <img src="/images/GC3 Logo.png" alt="GC3 Logo" className="app-logo" />
      </header>
      <DisplayTabs />
    </main>
  );
}

export default App;