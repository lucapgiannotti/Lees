// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import Inventory from './pages/Inventory';
import NewBatch from './pages/NewBatch';

export default function App() {
  return (
    <div className="bg-background text-on-background font-body-md h-screen flex overflow-hidden">
      
      <Sidebar />

      {/* FIX: Added md:ml-64 right after w-full */}
      <main className="flex-1 w-full md:ml-64 pt-14 md:pt-0 overflow-y-auto pb-24 md:pb-0">
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/batches" element={<Batches />} />
          <Route path="/recipes" element={<div className="p-8 font-headline-md text-2xl text-on-surface">Recipes Page Coming Soon</div>} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/new-batch" element={<NewBatch />} />
        </Routes>

      </main>
      
    </div>
  );
}