import './App.css';
import FileHandle from './components/FileHandle';
import DisplayTabs from './components/Tabs';

function App() {
  return (
    <>
      <header className="app-header"><h1>GC<sup>3</sup></h1></header>
      <DisplayTabs />
      {/* <FileHandle /> */}
    </>
  )
}



export default App;