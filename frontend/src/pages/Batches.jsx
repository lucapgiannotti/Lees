// src/pages/Batches.jsx
import React, { useState, useEffect } from 'react';

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
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [activeTab, setActiveTab] = useState('ACTIVE');

  // NEW: State to toggle between logging a reading vs logging an addition
  const [logType, setLogType] = useState('reading'); 
  const [logSg, setLogSg] = useState("");
  const [logTemp, setLogTemp] = useState("");
  const [logNote, setLogNote] = useState("");
  const [logHoney, setLogHoney] = useState(""); 

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", style: "", recipe: "", target_abv: "" });

  const fetchBatches = () => {
    fetch('http://localhost:8000/api/batches')
      .then(res => res.json())
      .then(data => setBatches(data))
      .catch(err => console.error("Error fetching batches:", err));
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const filteredBatches = batches.filter(batch => batch.status === activeTab);

  const handleSaveLog = async (e) => {
    e.preventDefault();
    const payload = {
      sg: logType === 'reading' && logSg ? parseFloat(logSg) : null,
      temp: logType === 'reading' && logTemp ? parseFloat(logTemp) : null,
      added_honey_g: logType === 'addition' && logHoney ? parseFloat(logHoney) : null,
      note: logNote || null
    };

    try {
      const response = await fetch(`http://localhost:8000/api/batches/${selectedBatch.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const newLog = await response.json();
        setSelectedBatch({
          ...selectedBatch,
          logs: [...(selectedBatch.logs || []), newLog]
        });
        setLogSg(""); setLogTemp(""); setLogNote(""); setLogHoney("");
        fetchBatches();
      }
    } catch (error) {
      console.error("Error saving log:", error);
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
        body: JSON.stringify({ status: newStatus, phase: newPhase })
      });

      if (response.ok) {
        const updatedBatch = await response.json();
        setSelectedBatch(updatedBatch);
        setActiveTab(newStatus); 
        fetchBatches();
      }
    } catch (error) {
      console.error("Error updating phase:", error);
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: selectedBatch.name || "",
      style: selectedBatch.style || "",
      recipe: selectedBatch.recipe || "",
      target_abv: selectedBatch.target_abv || "",
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
          name: editForm.name,
          style: editForm.style,
          recipe: editForm.recipe,
          target_abv: editForm.target_abv ? parseFloat(editForm.target_abv) : null
        })
      });

      if (response.ok) {
        const updatedBatch = await response.json();
        setSelectedBatch(updatedBatch); 
        setIsEditModalOpen(false); 
        fetchBatches(); 
      }
    } catch (error) {
      console.error("Error updating batch:", error);
    }
  };

  const handleDeleteBatch = async () => {
    const isConfirmed = window.confirm(
      `Are you absolutely sure you want to delete "${selectedBatch.name}"?\n\nThis will permanently delete the batch and all of its fermentation logs. This cannot be undone.`
    );

    if (isConfirmed) {
      try {
        const response = await fetch(`http://localhost:8000/api/batches/${selectedBatch.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsEditModalOpen(false);
          setSelectedBatch(null); 
          fetchBatches(); 
        }
      } catch (error) {
        console.error("Error deleting batch:", error);
      }
    }
  };

  // --- DETAIL VIEW ---
  if (selectedBatch) {
    const isBottled = selectedBatch.status === 'BOTTLED' || selectedBatch.status === 'ARCHIVED';
    
    // Find Actual OG (first reading) and Current SG (last reading)
    const firstSgLog = selectedBatch.logs?.find(log => log.sg != null);
    const actualOg = firstSgLog ? firstSgLog.sg : (selectedBatch.target_og || 1.000);
    
    const latestSgLog = selectedBatch.logs?.slice().reverse().find(log => log.sg != null);
    const currentSg = latestSgLog ? latestSgLog.sg : '--';

    // --- DYNAMIC ABV & BACKSWEETENING MATH ---
    let effectiveOg = actualOg;
    let measuredAbv = "0.0";
    let currentVolume = selectedBatch.volume_gal || 1.0;
    let totalAddedHoneyLbs = 0;

    if (selectedBatch.logs) {
      // 1. Sum all honey added
      const totalAddedGrams = selectedBatch.logs.reduce((sum, log) => sum + (log.added_honey_g || 0), 0);
      totalAddedHoneyLbs = totalAddedGrams / 453.592;
      
      // 2. Add new gravity points to Effective OG (35 PPG)
      if (totalAddedHoneyLbs > 0) {
        const addedPoints = (totalAddedHoneyLbs * 35) / currentVolume;
        effectiveOg += (addedPoints / 1000);
      }
    }

    // 3. Calculate Base ABV, then Dilute based on new volume
    if (currentSg !== '--') {
      let baseAbv = (effectiveOg - currentSg) * 131.25;
      
      if (totalAddedHoneyLbs > 0) {
        // Honey adds physical volume (~0.085 gallons per lb)
        const addedVolume = totalAddedHoneyLbs * 0.085;
        const newVolume = currentVolume + addedVolume;
        baseAbv = baseAbv * (currentVolume / newVolume); // Dilution calculation
      }
      measuredAbv = Math.max(0, baseAbv).toFixed(1);
    }

    // Determine if we should show the 3-column stats layout
    const showMeasuredAbv = selectedBatch.phase !== 'Primary' && !isBottled;

    return (
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 relative">
        <button 
          onClick={() => setSelectedBatch(null)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-label-sm uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Batches
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
            <button 
              onClick={openEditModal}
              className="bg-surface-container-lowest border border-outline text-on-surface px-4 py-2 rounded font-label-sm uppercase tracking-widest hover:bg-surface-container transition-colors"
            >
              Edit 
            </button>
            <div className="relative flex items-center">
              <select
                value={selectedBatch.phase || 'Primary'}
                onChange={handlePhaseChange}
                className="appearance-none bg-primary text-on-primary px-4 py-2 pr-10 rounded font-label-sm uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer border border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
                <option value="Bulk Aging">Bulk Aging</option>
                <option value="Bottled">Bottled</option>
                <option value="Archived">Archived</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 text-on-primary pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-8">
            
            {/* STATS CARD */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <h2 className="font-headline-md text-xl border-b border-surface-container pb-3 mb-4">
                {isBottled ? "Cellar Status" : "Current Status"}
              </h2>
              
              {/* Dynamic Grid: 2 cols for Primary, 3 cols for Secondary+ */}
              <div className={`grid ${showMeasuredAbv ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                {isBottled ? (
                  <>
                    <div className="col-span-2">
                      <p className="font-label-sm text-on-surface-variant mb-1">REMAINING</p>
                      <p className="font-metric-xl text-3xl">{selectedBatch.remaining || 0} <span className="text-lg text-on-surface-variant font-body-md">/ {selectedBatch.yield || 0}</span></p>
                    </div>
                    <div>
                      <p className="font-label-sm text-on-surface-variant mb-1">FINAL ABV</p>
                      <p className="font-metric-xl text-3xl">{selectedBatch.target_abv || '--'}%</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="font-label-sm text-on-surface-variant mb-1">CURRENT SG</p>
                      <p className="font-metric-xl text-3xl">{currentSg}</p>
                    </div>
                    {/* Only show Measured ABV if we are in Secondary or later */}
                    {showMeasuredAbv && (
                      <div>
                        <p className="font-label-sm text-primary mb-1">MEASURED ABV</p>
                        <p className="font-metric-xl text-3xl text-primary">{measuredAbv}%</p>
                      </div>
                    )}
                    <div>
                      <p className="font-label-sm text-on-surface-variant mb-1">TARGET ABV</p>
                      <p className="font-metric-xl text-3xl">{selectedBatch.target_abv || '--'}%</p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Backsweetening Helper Info */}
              {!isBottled && totalAddedHoneyLbs > 0 && (
                <div className="mt-4 pt-4 border-t border-surface-container text-sm text-on-surface-variant flex gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">info</span>
                  <p>Backsweetening raised effective OG to <strong>{effectiveOg.toFixed(3)}</strong>.</p>
                </div>
              )}
            </div>

            {/* LOGGING FORM */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                <h2 className="font-headline-md text-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    {isBottled ? "wine_bar" : "edit_document"}
                  </span>
                  {isBottled ? "Log Tasting" : "Update Log"}
                </h2>
              </div>
              
              <form onSubmit={handleSaveLog} className="flex flex-col gap-4">
                {isBottled ? (
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-on-surface-variant">RATING (1-5)</label>
                    <select className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer">
                      <option>5 - Excellent</option>
                      <option>4 - Very Good</option>
                      <option>3 - Good / Needs Time</option>
                      <option>2 - Flawed</option>
                      <option>1 - Dump It</option>
                    </select>
                  </div>
                ) : (
                  <>
                    {/* The Log Type Toggle Switch */}
                    <div className="flex bg-surface-container border border-outline-variant rounded-lg p-1 w-full">
                      <button 
                        type="button" 
                        onClick={() => setLogType('reading')} 
                        className={`flex-1 py-1.5 text-sm font-label-sm uppercase tracking-widest rounded-md transition-all ${
                          logType === 'reading' ? "bg-surface-container-lowest shadow-sm text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        Reading
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setLogType('addition')} 
                        className={`flex-1 py-1.5 text-sm font-label-sm uppercase tracking-widest rounded-md transition-all ${
                          logType === 'addition' ? "bg-surface-container-lowest shadow-sm text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        Addition
                      </button>
                    </div>

                    {/* Dynamic Form Fields */}
                    {logType === 'reading' ? (
                      <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        <div className="flex flex-col justify-end gap-1">
                          <label className="font-label-sm text-on-surface-variant">SPECIFIC GRAVITY</label>
                          <input type="number" step="0.001" value={logSg} onChange={(e) => setLogSg(e.target.value)} placeholder="1.000" className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                        </div>
                        <div className="flex flex-col justify-end gap-1">
                          <label className="font-label-sm text-on-surface-variant">TEMP (°F)</label>
                          <input type="number" value={logTemp} onChange={(e) => setLogTemp(e.target.value)} placeholder="68" className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 animate-fade-in">
                        <label className="font-label-sm text-tertiary">HONEY ADDED (GRAMS)</label>
                        <input type="number" value={logHoney} onChange={(e) => setLogHoney(e.target.value)} placeholder="e.g. 500" className="bg-surface-container-lowest border border-tertiary/50 rounded p-3 font-body-md focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all" required/>
                      </div>
                    )}
                  </>
                )}
                
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-on-surface-variant">NOTES</label>
                  <textarea rows="3" value={logNote} onChange={(e) => setLogNote(e.target.value)} placeholder={isBottled ? "Aroma, clarity, taste..." : "Observations..."} className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"></textarea>
                </div>
                
                <button type="submit" className="w-full bg-surface-container-highest border border-outline text-on-surface font-label-sm uppercase tracking-widest py-3 rounded hover:bg-surface-container transition-colors mt-2">
                  {isBottled ? "Save Tasting & Consume 1 Bottle" : "Save Entry"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="p-6 border-b border-surface-container flex justify-between items-center">
                <h2 className="font-headline-md text-xl">{isBottled ? "Tasting History" : "Fermentation Log"}</h2>
              </div>
              <div className="divide-y divide-surface-container">
                {selectedBatch.logs?.slice().reverse().map((log) => (
                  <div key={log.id} className="p-6 hover:bg-surface-container-low transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-label-sm text-on-surface-variant w-24">
                          {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        
                        {log.sg && (
                          <span className="font-body-md font-bold text-lg bg-surface-container-high px-2 rounded">{log.sg}</span>
                        )}
                        
                        {/* Highlights honey additions clearly in the timeline */}
                        {log.added_honey_g && (
                          <span className="font-label-sm text-tertiary border border-tertiary px-2 py-0.5 rounded uppercase tracking-widest bg-tertiary/10">
                            +{log.added_honey_g}g Honey
                          </span>
                        )}
                        
                        {log.rating && (
                          <span className="font-label-sm text-primary border border-primary px-2 py-0.5 rounded uppercase tracking-widest bg-primary/10">Score: {log.rating}</span>
                        )}

                        {log.temp && (
                          <span className="font-body-md text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">thermostat</span>
                            {log.temp}°F
                          </span>
                        )}
                      </div>
                    </div>
                    {log.note && <p className="text-on-surface-variant pl-28">{log.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Batch Modal (Retained exactly as built previously) */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/20 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
              
              <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low">
                <h3 className="font-headline-md text-xl text-on-surface">Edit Batch Settings</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-5">
                
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-on-surface-variant">BATCH NAME</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-on-surface-variant">MEAD STYLE</label>
                    <input 
                      type="text" 
                      value={editForm.style}
                      onChange={(e) => setEditForm({...editForm, style: e.target.value})}
                      className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-on-surface-variant">RECIPE / BASE</label>
                    <input 
                      type="text" 
                      value={editForm.recipe}
                      onChange={(e) => setEditForm({...editForm, recipe: e.target.value})}
                      className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-on-surface-variant">TARGET ABV (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={editForm.target_abv}
                    onChange={(e) => setEditForm({...editForm, target_abv: e.target.value})}
                    className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-surface-container gap-4">
                  <button 
                    type="button" 
                    onClick={handleDeleteBatch} 
                    className="text-error hover:bg-error-container hover:text-on-error-container font-label-sm uppercase tracking-widest px-4 py-2 rounded transition-colors flex items-center gap-1 w-full sm:w-auto justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Delete Batch
                  </button>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      type="button" 
                      onClick={() => setIsEditModalOpen(false)} 
                      className="flex-1 sm:flex-none bg-surface-container-lowest border border-outline text-on-surface font-label-sm uppercase tracking-widest px-6 py-3 rounded hover:bg-surface-container transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 sm:flex-none bg-primary text-on-primary font-label-sm uppercase tracking-widest px-6 py-3 rounded hover:opacity-90 transition-opacity"
                    >
                      Save Changes
                    </button>
                  </div>
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
        <div>
          <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Batches</h2>
          <p className="font-body-lg text-lg text-on-surface-variant mt-1">Manage and log your operations.</p>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded font-label-sm uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2 w-fit">
          <span className="material-symbols-outlined text-sm">add</span>
          New
        </button>
      </header>

      <div className="flex gap-2 border-b border-outline-variant mb-6 no-scrollbar overflow-x-auto">
        {['ACTIVE', 'BULK AGING', 'BOTTLED', 'ARCHIVED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-label-sm uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-surface-container bg-surface-container-low font-label-sm text-on-surface-variant uppercase tracking-widest">
          <div className="col-span-1">ID</div>
          <div className="col-span-4">Batch Name</div>
          <div className="col-span-2">Phase</div>
          <div className="col-span-2">{activeTab === 'BOTTLED' ? 'Inventory' : 'Current SG'}</div>
          <div className="col-span-2">{activeTab === 'BOTTLED' ? 'Final ABV' : 'Active Time'}</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="divide-y divide-surface-container">
          {filteredBatches.length > 0 ? (
            filteredBatches.map((batch) => {
              const latestLog = batch.logs?.length > 0 ? batch.logs[batch.logs.length - 1] : null;
              const daysActive = getDaysActive(batch.start_date);

              return (
                <div 
                  key={batch.id} 
                  onClick={() => setSelectedBatch(batch)}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-surface-container transition-colors cursor-pointer group"
                >
                  <div className="col-span-1 font-label-sm text-on-surface-variant">
                    <span className="md:hidden">ID: </span>#{batch.id}
                  </div>
                  <div className="col-span-4">
                    <p className="font-headline-md text-lg text-on-surface group-hover:text-primary transition-colors">{batch.name}</p>
                    <p className="font-body-md text-sm text-on-surface-variant">{batch.recipe || batch.style}</p>
                  </div>
                  <div className="col-span-2">
                    <span className={`px-2 py-0.5 font-label-sm text-[10px] rounded ${getPhaseColor(batch.phase)} whitespace-nowrap`}>
                      {batch.phase || 'Primary'}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    {activeTab === 'BOTTLED' ? (
                      <span className="font-body-md font-medium text-on-surface">{batch.remaining || 0} bottles</span>
                    ) : (
                      <>
                        <span className="font-body-md font-medium text-on-surface">{latestLog?.sg || '--'}</span>
                        <span className="text-on-surface-variant text-sm">
                          ({latestLog?.temp ? `${latestLog.temp}°F` : 'No temp'})
                        </span>
                      </>
                    )}
                  </div>
                  <div className="col-span-2 font-body-md text-on-surface-variant">
                    {activeTab === 'BOTTLED' ? `${batch.target_abv || '--'}%` : `Day ${daysActive}`}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                      chevron_right
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-on-surface-variant font-body-md">
              No batches found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}