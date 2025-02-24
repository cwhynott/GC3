import './App.css';
import FileHandle from './components/FileHandle';
import BasicTabs from './components/Tabs';

function App() {
  return (
    <>
      <header className="app-header"><h1>GC<sup>3</sup></h1></header>
      {/* <BasicTabs /> */}
      <FileHandle />
    </>
  )
}



export default App;