import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import AIDesign from './pages/AIDesign';
import VideoArchive from './pages/VideoArchive';
import Community from './pages/Community';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { AdminLayout } from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import KnowledgeBase from './pages/admin/KnowledgeBase';
import HeritageProjectManagement from './pages/admin/HeritageProjectManagement';
import SuccessorManagement from './pages/admin/SuccessorManagement';

function App() {
  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/ai-design" element={<AIDesign />} />
        <Route path="/video-archive" element={<VideoArchive />} />
        <Route path="/community" element={<Community />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        {/* 管理后台路由 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="heritage-projects" element={<HeritageProjectManagement />} />
          <Route path="successors" element={<SuccessorManagement />} />
          <Route path="knowledge-base" element={<KnowledgeBase />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
