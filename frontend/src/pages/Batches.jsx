import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// --- HELPERS ---

const calculateMeasuredAbv = (batch) => {
  const logs = batch.logs || [];
  if (logs.length === 0) return '0.0';

  const readingsBeforeHoney = [];
  let honeyWasAdded = false;
  logs.forEach((log) => {
    if (log.added_honey_g > 0) honeyWasAdded = true;
    if (!honeyWasAdded && log.sg != null) readingsBeforeHoney.push(log.sg);
  });

  const og = readingsBeforeHoney[0] || batch.target_og || 1.0;
  const terminalFg = readingsBeforeHoney.length > 0 ? Math.min(...readingsBeforeHoney) : og;
  const peakAbv = (og - terminalFg) * 131.25;

  const totalHoneyG = logs.reduce((sum, l) => sum + (l.added_honey_g || 0), 0);
  const honeyVolGal = (totalHoneyG / 453.592) * 0.085;
  const baseVol = batch.volume_gal || 1.0;

  const dilutedAbv = (peakAbv * baseVol) / (baseVol + honeyVolGal);
  return Math.max(0, dilutedAbv).toFixed(1);
};

const getPhaseColor = (phase) => {
  if (phase?.includes('Primary')) return 'bg-primary-container text-on-primary-container';
  if (phase?.includes('Secondary')) return 'bg-secondary-container text-on-secondary-container';
  return 'bg-surface-container-highest text-on-surface';
};

const getDaysActive = (startDate) => {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
};

export default function Batches() {
  const location = useLocation();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [activeTab, setActiveTab] = useState('ACTIVE');

  // Log Form State
  const [logType, setLogType] = useState('reading');
  const [logSg, setLogSg] = useState('');
  const [logTemp, setLogTemp] = useState('');
  const [logNote, setLogNote] = useState('');
  const [logHoney, setLogHoney] = useState('');
  const [logRating, setLogRating] = useState('5 - Excellent');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', style: '', recipe: '', target_abv: '', yield_bottles: 0, remaining_bottles: 0,
  });

  // NEW: New Batch Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newBatchForm, setNewBatchForm] = useState({
    name: '', style: '', volume_gal: 1.0, target_og: '', recipe: ''
  });

  const fetchBatches = () => {
    fetch('http://localhost:8000/api/batches')
      .then((res) => res.json())
      .then((data) => setBatches(data))
      .catch((err) => console.error('Error fetching batches:', err));
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // --- BREW THIS INTEGRATION ---
  useEffect(() => {
    if (location.state?.autoOpen && location.state?.prefill) {
      setNewBatchForm((prev) => ({
        ...prev,
        ...location.state.prefill
      }));
      setIsNewModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBatchForm,
          target_og: parseFloat(newBatchForm.target_og) || null,
          volume_gal: parseFloat(newBatchForm.volume_gal)
        })
      });
      if (response.ok) {
        setIsNewModalOpen(false);
        setNewBatchForm({ name: '', style: '', volume_gal: 1.0, target_og: '', recipe: '' });
        fetchBatches();
      }
    } catch (err) {
      console.error('Failed to launch batch:', err);
    }
  };

  const filteredBatches = batches.filter((batch) => batch.status === activeTab);

  const handleSaveLog = async (e) => {
    e.preventDefault();
    const isBottled = selectedBatch.status === 'BOTTLED' || selectedBatch.status === 'ARCHIVED';

    const payload = {
      sg: logType === 'reading' && logSg ? parseFloat(logSg) : null,
      temp: logType === 'reading' && logTemp ? parseFloat(logTemp) : null,
      added_honey_g: logType === 'addition' && logHoney ? parseFloat(logHoney) : null,
      rating: isBottled ? parseInt(logRating.charAt(0)) : null,
      note: logNote || null,
    };

    try {
      const response = await fetch(`http://localhost:8000/api/batches/${selectedBatch.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newLog = await response.json();
        let updatedBatch = { ...selectedBatch, logs: [...(selectedBatch.logs || []), newLog] };

        if (isBottled && selectedBatch.remaining_bottles > 0) {
          const newCount = selectedBatch.remaining_bottles - 1;
          await fetch(`http://localhost:8000/api/batches/${selectedBatch.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ remaining_bottles: newCount }),
          });
          updatedBatch.remaining_bottles = newCount;
        }

        setSelectedBatch(updatedBatch);
        setLogSg(''); setLogTemp(''); setLogNote(''); setLogHoney('');
        fetchBatches();
      }
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  const handlePhaseChange = async (e) => {
    const newPhase = e.target.value;
    let newStatus = selectedBatch.status;

    if (newPhase === 'Primary' || newPhase === 'Secondary') newStatus = 'ACTIVE';
    else if (newPhase === 'Bulk Aging') newStatus = 'BULK AGING';
    else if (newPhase === 'Bottled') newStatus = 'BOTTLED';
    else if (newPhase === 'Archived') newStatus = 'ARCHIVED';

    try {
      const response = await fetch(`http://localhost:8000/api/batches/${selectedBatch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, phase: newPhase }),
      });

      if (response.ok) {
        const updatedBatch = await response.json();
        setSelectedBatch(updatedBatch);
        setActiveTab(newStatus);
        fetchBatches();
      }
    } catch (error) {
      console.error('Error updating phase:', error);
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: selectedBatch.name || '',
      style: selectedBatch.style || '',
      recipe: selectedBatch.recipe || '',
      target_abv: selectedBatch.target_abv || '',
      yield_bottles: selectedBatch.yield_bottles || 0,
      remaining_bottles: selectedBatch.remaining_bottles || 0,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/batches/${selectedBatch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          target_abv: editForm.target_abv ? parseFloat(editForm.target_abv) : null,
          yield_bottles: parseInt(editForm.yield_bottles),
          remaining_bottles: parseInt(editForm.remaining_bottles),
        }),
      });

      if (response.ok) {
        const updatedBatch = await response.json();
        setSelectedBatch(updatedBatch);
        setIsEditModalOpen(false);
        fetchBatches();
      }
    } catch (error) {
      console.error('Error updating batch:', error);
    }
  };

  const handleDeleteBatch = async () => {
    if (window.confirm(`Permanently delete "${selectedBatch.name}"?`)) {
      await fetch(`http://localhost:8000/api/batches/${selectedBatch.id}`, { method: 'DELETE' });
      setIsEditModalOpen(false);
      setSelectedBatch(null);
      fetchBatches();
    }
  };

  // --- DETAIL VIEW ---
  if (selectedBatch) {
    const isBottled = selectedBatch.status === 'BOTTLED' || selectedBatch.status === 'ARCHIVED';
    const logs = selectedBatch.logs || [];
    const currentSg = logs.slice().reverse().find((l) => l.sg != null)?.sg || '--';
    const measuredAbv = calculateMeasuredAbv(selectedBatch);
    const showMeasuredAbv = selectedBatch.phase !== 'Primary' && !isBottled;

    return (
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 relative">
        <button
          onClick={() => setSelectedBatch(null)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-label-sm uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Batches
        </button>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 font-label-sm text-xs rounded ${getPhaseColor(selectedBatch.phase)}`}>
                {selectedBatch.phase || 'Unknown Phase'}
              </span>
              <span className="font-label-sm text-on-surface-variant">Batch #{selectedBatch.id}</span>
            </div>
            <h1 className="font-headline-lg text-4xl">{selectedBatch.name}</h1>
            <p className="text-on-surface-variant mt-1 font-medium">{selectedBatch.recipe || selectedBatch.style}</p>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={openEditModal} className="bg-surface-container-lowest border border-outline text-on-surface px-4 py-2 rounded font-label-sm uppercase hover:bg-surface-container transition-colors">Edit</button>
            <div className="relative flex items-center">
              <select
                value={selectedBatch.phase || 'Primary'}
                onChange={handlePhaseChange}
                className="appearance-none bg-primary text-on-primary px-4 py-2 pr-10 rounded font-label-sm uppercase tracking-widest hover:opacity-90 cursor-pointer border border-transparent focus:outline-none"
              >
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
                <option value="Bulk Aging">Bulk Aging</option>
                <option value="Bottled">Bottled</option>
                <option value="Archived">Archived</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 text-on-primary pointer-events-none text-[20px]">expand_more</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <h2 className="font-headline-md text-xl border-b border-surface-container pb-3 mb-4">{isBottled ? 'Cellar Status' : 'Current Status'}</h2>
              <div className={`grid ${isBottled ? 'grid-cols-2' : showMeasuredAbv ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                {isBottled ? (
                  <>
                    <div className="flex flex-col"><p className="font-label-sm text-on-surface-variant mb-1 uppercase text-[10px]">Remaining</p><p className="font-metric-xl text-3xl">{selectedBatch.remaining_bottles} <span className="text-lg text-on-surface-variant font-body-md">/ {selectedBatch.yield_bottles}</span></p></div>
                    <div className="flex flex-col"><p className="font-label-sm text-primary mb-1 uppercase text-[10px]">Final ABV</p><p className="font-metric-xl text-3xl text-primary">{measuredAbv}%</p><p className="text-[10px] text-on-surface-variant mt-1 italic">Target: {selectedBatch.target_abv || '--'}%</p></div>
                  </>
                ) : (
                  <>
                    <div><p className="font-label-sm text-on-surface-variant mb-1 uppercase text-[10px]">Current SG</p><p className="font-metric-xl text-3xl">{currentSg}</p></div>
                    {showMeasuredAbv && <div><p className="font-label-sm text-primary mb-1 uppercase text-[10px]">Measured ABV</p><p className="font-metric-xl text-3xl text-primary">{measuredAbv}%</p></div>}
                    <div><p className="font-label-sm text-on-surface-variant mb-1 uppercase text-[10px]">Target ABV</p><p className="font-metric-xl text-3xl">{selectedBatch.target_abv || '--'}%</p></div>
                  </>
                )}
              </div>
            </div>

            {/* LOGGING FORM */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
              <h2 className="font-headline-md text-xl mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">{isBottled ? 'wine_bar' : 'edit_document'}</span>
                {isBottled ? 'Log Tasting' : 'Update Log'}
              </h2>
              <form onSubmit={handleSaveLog} className="flex flex-col gap-4">
                {isBottled ? (
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-on-surface-variant uppercase text-[10px]">Rating (1-5)</label>
                    <select value={logRating} onChange={(e) => setLogRating(e.target.value)} className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none">
                      <option>5 - Excellent</option><option>4 - Very Good</option><option>3 - Good / Needs Time</option><option>2 - Flawed</option><option>1 - Dump It</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex bg-surface-container border border-outline-variant rounded-lg p-1 w-full mb-2">
                    <button type="button" onClick={() => setLogType('reading')} className={`flex-1 py-1.5 text-xs font-label-sm uppercase tracking-widest rounded-md transition-all ${logType === 'reading' ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant'}`}>Reading</button>
                    <button type="button" onClick={() => setLogType('addition')} className={`flex-1 py-1.5 text-xs font-label-sm uppercase tracking-widest rounded-md transition-all ${logType === 'addition' ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant'}`}>Addition</button>
                  </div>
                )}
                {logType === 'reading' && !isBottled ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col justify-end gap-1"><label className="font-label-sm text-on-surface-variant uppercase text-[10px]">SG</label><input type="number" step="0.001" value={logSg} onChange={(e) => setLogSg(e.target.value)} className="bg-surface-container-lowest border border-outline-variant rounded p-3" /></div>
                    <div className="flex flex-col justify-end gap-1"><label className="font-label-sm text-on-surface-variant uppercase text-[10px]">Temp</label><input type="number" value={logTemp} onChange={(e) => setLogTemp(e.target.value)} className="bg-surface-container-lowest border border-outline-variant rounded p-3" /></div>
                  </div>
                ) : !isBottled && (
                  <div className="flex flex-col gap-1"><label className="font-label-sm text-tertiary uppercase text-[10px]">Honey (g)</label><input type="number" value={logHoney} onChange={(e) => setLogHoney(e.target.value)} className="bg-surface-container-lowest border border-tertiary/50 rounded p-3" required /></div>
                )}
                <div className="flex flex-col gap-1"><label className="font-label-sm text-on-surface-variant uppercase text-[10px]">Notes</label><textarea rows="3" value={logNote} onChange={(e) => setLogNote(e.target.value)} className="bg-surface-container-lowest border border-outline-variant rounded p-3 resize-none"></textarea></div>
                <button type="submit" className="w-full bg-surface-container-highest border border-outline text-on-surface font-label-sm uppercase tracking-widest py-3 rounded mt-2">{isBottled ? 'Save Tasting' : 'Save Entry'}</button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="p-6 border-b border-surface-container"><h2 className="font-headline-md text-xl">{isBottled ? 'Tasting History' : 'Fermentation Log'}</h2></div>
              <div className="divide-y divide-surface-container">
                {logs.slice().reverse().map((log) => (
                  <div key={log.id} className="p-6 hover:bg-surface-container-low transition-colors group">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-label-sm text-on-surface-variant w-24">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      {log.sg && <span className="font-body-md font-bold text-lg bg-surface-container-high px-2 rounded">{log.sg}</span>}
                      {log.added_honey_g && <span className="font-label-sm text-tertiary border border-tertiary px-2 py-0.5 rounded bg-tertiary/10">+{log.added_honey_g}g Honey</span>}
                      {log.rating && <span className="font-label-sm text-primary border border-primary px-2 py-0.5 rounded bg-primary/10">Score: {log.rating}/5</span>}
                      {log.temp && <span className="font-body-md text-on-surface-variant flex items-center gap-1">{log.temp}°F</span>}
                    </div>
                    {log.note && <p className="text-on-surface-variant pl-28 mt-2 text-sm">{log.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/20 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low"><h3 className="font-headline-md text-xl text-on-surface">Edit Batch Settings</h3><button onClick={() => setIsEditModalOpen(false)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined">close</span></button></div>
              <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-5 text-on-surface">
                <div className="flex flex-col gap-1"><label className="text-xs font-label-sm">Batch Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-surface-container-lowest border border-outline-variant rounded p-3" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs">Style</label><input type="text" value={editForm.style} onChange={(e) => setEditForm({ ...editForm, style: e.target.value })} className="bg-surface-container-lowest border border-outline-variant rounded p-3" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs">Recipe</label><input type="text" value={editForm.recipe} onChange={(e) => setEditForm({ ...editForm, recipe: e.target.value })} className="bg-surface-container-lowest border border-outline-variant rounded p-3" /></div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-surface-container gap-4">
                  <button type="button" onClick={handleDeleteBatch} className="text-error font-label-sm uppercase">Delete Batch</button>
                  <div className="flex gap-3 w-full sm:w-auto"><button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 border border-outline font-label-sm uppercase">Cancel</button><button type="submit" className="bg-primary text-on-primary font-label-sm uppercase px-6 py-3 rounded">Save</button></div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><h2 className="font-headline-lg text-3xl font-bold text-on-surface">Batches</h2><p className="font-body-lg text-lg text-on-surface-variant mt-1">Manage and log your operations.</p></div>
        <button onClick={() => setIsNewModalOpen(true)} className="bg-primary text-on-primary px-4 py-2 rounded font-label-sm uppercase tracking-widest flex items-center gap-2 w-fit">
          <span className="material-symbols-outlined text-sm">add</span> New
        </button>
      </header>

      <div className="flex gap-2 border-b border-outline-variant mb-6 no-scrollbar overflow-x-auto">
        {['ACTIVE', 'BULK AGING', 'BOTTLED', 'ARCHIVED'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 font-label-sm uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>{tab}</button>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="divide-y divide-surface-container">
          {filteredBatches.length > 0 ? (
            filteredBatches.map((batch) => {
              const latestLog = batch.logs?.length > 0 ? batch.logs[batch.logs.length - 1] : null;
              const finalAbv = calculateMeasuredAbv(batch);
              return (
                <div key={batch.id} onClick={() => setSelectedBatch(batch)} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-surface-container transition-colors cursor-pointer group">
                  <div className="col-span-1 font-label-sm text-on-surface-variant">#{batch.id}</div>
                  <div className="col-span-4"><p className="font-headline-md text-lg text-on-surface group-hover:text-primary transition-colors">{batch.name}</p><p className="font-body-md text-sm text-on-surface-variant">{batch.recipe || batch.style}</p></div>
                  <div className="col-span-2"><span className={`px-2 py-0.5 font-label-sm text-[10px] rounded ${getPhaseColor(batch.phase)} whitespace-nowrap`}>{batch.phase || 'Primary'}</span></div>
                  <div className="col-span-2 flex items-center gap-2">{activeTab === 'BOTTLED' ? <span className="font-body-md font-medium text-on-surface">{batch.remaining_bottles} bottles</span> : <><span className="font-body-md font-medium text-on-surface">{latestLog?.sg || '--'}</span><span className="text-on-surface-variant text-sm">({latestLog?.temp ? `${latestLog.temp}°F` : 'No temp'})</span></>}</div>
                  <div className="col-span-2 font-body-md text-on-surface-variant">{activeTab === 'BOTTLED' ? `${finalAbv}%` : `Day ${getDaysActive(batch.start_date)}`}</div>
                  <div className="col-span-1 flex justify-end"><span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span></div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-on-surface-variant font-body-md">No batches found in this category.</div>
          )}
        </div>
      </div>

      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/20 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low"><h3 className="font-headline-md text-xl text-on-surface">Pitch New Batch</h3><button onClick={() => setIsNewModalOpen(false)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined">close</span></button></div>
            <form onSubmit={handleCreateBatch} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-label-sm text-primary">Batch Name</label><input type="text" required value={newBatchForm.name} onChange={e => setNewBatchForm({...newBatchForm, name: e.target.value})} className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-label-sm text-on-surface-variant">Volume (Gal)</label><input type="number" step="0.1" value={newBatchForm.volume_gal} onChange={e => setNewBatchForm({...newBatchForm, volume_gal: e.target.value})} className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md" /></div>
                <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-label-sm text-on-surface-variant">Target OG</label><input type="number" step="0.001" value={newBatchForm.target_og} onChange={e => setNewBatchForm({...newBatchForm, target_og: e.target.value})} className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md" /></div>
              </div>
              <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-label-sm text-on-surface-variant">Recipe Source</label><input type="text" value={newBatchForm.recipe} onChange={e => setNewBatchForm({...newBatchForm, recipe: e.target.value})} className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md" /></div>
              <div className="pt-4 border-t border-surface-container flex gap-3"><button type="button" onClick={() => setIsNewModalOpen(false)} className="flex-1 px-4 py-3 border border-outline rounded-lg font-label-sm uppercase hover:bg-surface-container transition-colors">Cancel</button><button type="submit" className="flex-1 bg-primary text-on-primary rounded-lg font-label-sm uppercase tracking-widest hover:opacity-90 transition-opacity py-3">Launch</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}