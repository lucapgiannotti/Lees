/**
 * Recipe JSON Import/Export Module
 * Provides standardized serialization for recipe data exchange.
 */

const RECIPE_SCHEMA_VERSION = "1.0.0";

function exportRecipe(recipe) {
  if (!recipe || !recipe.name) {
    throw new Error("Invalid recipe: must have a name");
  }
  return {
    schemaVersion: RECIPE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    recipe: {
      name: recipe.name,
      description: recipe.description || "",
      ingredients: (recipe.ingredients || []).map(i => ({
        name: i.name || "",
        amount: i.amount || "",
        unit: i.unit || ""
      })),
      method: recipe.method || "",
      prepTime: recipe.prepTime || null,
      cookTime: recipe.cookTime || null,
      servings: recipe.servings || null,
      tags: recipe.tags || [],
      source: recipe.source || ""
    }
  };
}

function importRecipe(jsonString) {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    throw new Error("Invalid JSON format");
  }
  if (!data.schemaVersion) {
    throw new Error("Not a valid recipe export file");
  }
  if (!data.recipe || !data.recipe.name) {
    throw new Error("Recipe data missing required fields");
  }
  return data.recipe;
}

function validateRecipe(recipe) {
  const errors = [];
  if (!recipe.name) errors.push("Name is required");
  if (!Array.isArray(recipe.ingredients)) errors.push("Ingredients must be an array");
  if (!recipe.method) errors.push("Method is required");
  return { valid: errors.length === 0, errors };
}

export { exportRecipe, importRecipe, validateRecipe, RECIPE_SCHEMA_VERSION };
