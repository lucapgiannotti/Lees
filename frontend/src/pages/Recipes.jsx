// src/pages/Recipes.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RecipeList from '../components/recipes/RecipeList'
import RecipeDetail from '../components/recipes/RecipeDetail'
import RecipeFormModal from '../components/recipes/RecipeFormModal'

export default function Recipes() {
  const [recipes, setRecipes] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(null)

  const navigate = useNavigate()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  const fetchRecipes = () => {
    fetch('http://localhost:8000/api/recipes')
      .then((res) => res.json())
      .then((data) => setRecipes(data))
      .catch((err) => console.error('Error fetching recipes:', err))
  }

  useEffect(() => {
    fetchRecipes()
  }, [])

  const handleBrewThis = (desiredVolume) => {
    // Standard ABV formula: (OG - FG) * 131.25
    const averageFg = (selectedRecipe.target_fg_low + selectedRecipe.target_fg_high) / 2
    const calculatedAbv = ((selectedRecipe.target_og - averageFg) * 131.25).toFixed(1)

    const prefill = {
      name: `${selectedRecipe.name} (Batch)`,
      style: selectedRecipe.style,
      volume_gal: desiredVolume,
      target_og: selectedRecipe.target_og,
      target_abv: parseFloat(calculatedAbv),
      recipe: selectedRecipe.source || 'Lees Cookbook',
    }

    navigate('/batches', { state: { prefill, autoOpen: true } })
  }

  const handleSaveRecipe = async (form) => {
    const isNew = !form.id
    const method = isNew ? 'POST' : 'PATCH'
    const url = isNew
      ? 'http://localhost:8000/api/recipes'
      : `http://localhost:8000/api/recipes/${form.id}`

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          total_volume_gal: parseFloat(form.total_volume_gal),
          target_og: parseFloat(form.target_og),
          target_fg_low: parseFloat(form.target_fg_low),
          target_fg_high: parseFloat(form.target_fg_high),
        }),
      })

      if (response.ok) {
        const updatedRecipe = await response.json()
        if (!isNew) {
          setSelectedRecipe(updatedRecipe)
        }
        setIsEditModalOpen(false)
        setIsNewModalOpen(false)
        fetchRecipes()
      }
    } catch (err) {
      console.error(`Error ${isNew ? 'creating' : 'updating'} recipe:`, err)
    }
  }

  const handleDeleteRecipe = async () => {
    if (window.confirm(`Permanently delete "${selectedRecipe.name}"?`)) {
      await fetch(`http://localhost:8000/api/recipes/${selectedRecipe.id}`, { method: 'DELETE' })
      setIsEditModalOpen(false)
      setSelectedRecipe(null)
      fetchRecipes()
    }
  }

  if (selectedRecipe) {
    return (
      <>
        <RecipeDetail
          recipe={selectedRecipe}
          onBack={() => setSelectedRecipe(null)}
          onEdit={() => setIsEditModalOpen(true)}
          onBrew={handleBrewThis}
        />

        <RecipeFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          recipe={selectedRecipe}
          onSubmit={handleSaveRecipe}
          onDelete={handleDeleteRecipe}
          title="Edit Recipe Template"
        />
      </>
    )
  }

  return (
    <>
      <RecipeList
        recipes={recipes}
        onSelectRecipe={setSelectedRecipe}
        onOpenNewRecipe={() => setIsNewModalOpen(true)}
      />

      <RecipeFormModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        recipe={null}
        onSubmit={handleSaveRecipe}
        title="Create New Recipe"
      />
    </>
  )
}
