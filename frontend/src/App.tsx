import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Projects from './pages/Projects';
import AIDesign from './pages/AIDesign';
import VideoArchive from './pages/VideoArchive';
import Community from './pages/Community';

function App() {
  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/ai-design" element={<AIDesign />} />
        <Route path="/video-archive" element={<VideoArchive />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </div>
  );
}

export default App;
