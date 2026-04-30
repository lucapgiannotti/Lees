import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import BatchList from '../components/batches/BatchList'
import BatchDetail from '../components/batches/BatchDetail'
import NewBatchModal from '../components/batches/NewBatchModal'
import EditBatchModal from '../components/batches/EditBatchModal'

export default function Batches() {
  const location = useLocation()
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [activeTab, setActiveTab] = useState('ACTIVE')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  const [prefillData, setPrefillData] = useState(null)

  const fetchBatches = () => {
    fetch('http://localhost:8000/api/batches')
      .then((res) => res.json())
      .then((data) => setBatches(data))
      .catch((err) => console.error('Error fetching batches:', err))
  }

  useEffect(() => {
    fetchBatches()
  }, [])

  // --- BREW THIS INTEGRATION ---
  useEffect(() => {
    if (location.state?.autoOpen && location.state?.prefill) {
      queueMicrotask(() => {
        setPrefillData(location.state.prefill)
        setIsNewModalOpen(true)
        window.history.replaceState({}, document.title)
      })
    }
  }, [location])

  const handleCreateBatch = async (newBatchForm) => {
    try {
      const response = await fetch('http://localhost:8000/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBatchForm,
          honey_varietal: newBatchForm.honey_varietal || null,
          nutrient_protocol: newBatchForm.nutrient_protocol || null,
          yeast: newBatchForm.yeast || null,
          target_og: parseFloat(newBatchForm.target_og) || null,
          volume_gal: parseFloat(newBatchForm.volume_gal),
        }),
      })
      if (response.ok) {
        setIsNewModalOpen(false)
        fetchBatches()
      }
    } catch (err) {
      console.error('Failed to launch batch:', err)
    }
  }

  const handleSaveLog = async (logData) => {
    const isBottled = selectedBatch.status === 'BOTTLED' || selectedBatch.status === 'ARCHIVED'
    const { type, sg, temp, honey, rating, note } = logData

    const payload = {
      sg: type === 'reading' && sg ? parseFloat(sg) : null,
      temp: type === 'reading' && temp ? parseFloat(temp) : null,
      added_honey_g: type === 'addition' && honey ? parseFloat(honey) : null,
      rating: isBottled ? parseInt(String(rating).charAt(0)) : null,
      note: note || null,
    }

    try {
      const response = await fetch(`http://localhost:8000/api/batches/${selectedBatch.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const newLog = await response.json()
        let updatedBatch = { ...selectedBatch, logs: [...(selectedBatch.logs || []), newLog] }

        if (isBottled && selectedBatch.remaining_bottles > 0) {
          const newCount = selectedBatch.remaining_bottles - 1
          await fetch(`http://localhost:8000/api/batches/${selectedBatch.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ remaining_bottles: newCount }),
          })
          updatedBatch.remaining_bottles = newCount
        }

        setSelectedBatch(updatedBatch)
        fetchBatches()
      }
    } catch (error) {
      console.error('Error saving log:', error)
    }
  }

  const handlePhaseChange = async (newPhase) => {
    let newStatus = selectedBatch.status

    if (newPhase === 'Primary' || newPhase === 'Secondary') newStatus = 'ACTIVE'
    else if (newPhase === 'Bulk Aging') newStatus = 'BULK AGING'
    else if (newPhase === 'Bottled') newStatus = 'BOTTLED'
    else if (newPhase === 'Archived') newStatus = 'ARCHIVED'

    try {
      const response = await fetch(`http://localhost:8000/api/batches/${selectedBatch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, phase: newPhase }),
      })

      if (response.ok) {
        const updatedBatch = await response.json()
        setSelectedBatch(updatedBatch)
        setActiveTab(newStatus)
        fetchBatches()
      }
    } catch (error) {
      console.error('Error updating phase:', error)
    }
  }

  const handleSaveEdit = async (editForm) => {
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
      })

      if (response.ok) {
        const updatedBatch = await response.json()
        setSelectedBatch(updatedBatch)
        setIsEditModalOpen(false)
        fetchBatches()
      }
    } catch (error) {
      console.error('Error updating batch:', error)
    }
  }

  const handleDeleteBatch = async () => {
    if (window.confirm(`Permanently delete "${selectedBatch.name}"?`)) {
      await fetch(`http://localhost:8000/api/batches/${selectedBatch.id}`, { method: 'DELETE' })
      setIsEditModalOpen(false)
      setSelectedBatch(null)
      fetchBatches()
    }
  }

  if (selectedBatch) {
    return (
      <>
        <BatchDetail
          batch={selectedBatch}
          onBack={() => setSelectedBatch(null)}
          onUpdatePhase={handlePhaseChange}
          onAddLog={handleSaveLog}
          onOpenEdit={() => setIsEditModalOpen(true)}
        />
        <EditBatchModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          batch={selectedBatch}
          onSubmit={handleSaveEdit}
          onDelete={handleDeleteBatch}
        />
      </>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Batches</h2>
            <p className="font-body-lg text-lg text-on-surface-variant mt-1">
              Manage and log your operations.
            </p>
          </div>
        </header>

        <BatchList
          batches={batches}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSelectBatch={setSelectedBatch}
        />
      </div>

      <NewBatchModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateBatch}
        initialData={prefillData}
      />
    </>
  )
}
