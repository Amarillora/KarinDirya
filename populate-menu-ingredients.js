// Script to populate menu ingredients
// Run this with: node populate-menu-ingredients.js

import { createClient } from '@supabase/supabase-js'

// You'll need to add your Supabase credentials here or import from your config
const SUPABASE_URL = 'your-supabase-url'
const SUPABASE_KEY = 'your-supabase-anon-key'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Helper function to find ingredient by name
async function getIngredientId(name) {
  const { data } = await supabase
    .from('ingredients')
    .select('ingredient_id')
    .ilike('ingredient_name', name)
    .single()
  return data?.ingredient_id
}

// Helper function to find menu by name
async function getMenuId(name) {
  const { data } = await supabase
    .from('menu_items')
    .select('menu_id')
    .ilike('menu_name', name)
    .single()
  return data?.menu_id
}

// Menu ingredient recipes
const recipes = {
  'Adobo': [
    { ingredient: 'Pork', quantity: 0.25 },       // 250g
    { ingredient: 'Beef', quantity: 0.25 },       // Alternative: 250g
    { ingredient: 'Chicken', quantity: 0.25 },    // Alternative: 250g
    { ingredient: 'Soy Sauce', quantity: 0.1 },   // 100mL
    { ingredient: 'Cooking Oil', quantity: 0.1 }, // 100mL
    { ingredient: 'Garlic', quantity: 0.05 },     // 50g
    { ingredient: 'Onion', quantity: 0.05 },      // 50g
    { ingredient: 'Bay Leaf', quantity: 0.005 },  // 5g
    { ingredient: 'Ginger', quantity: 0.02 },     // 20g
  ],
  'Sinigang': [
    { ingredient: 'Pork', quantity: 0.3 },
    { ingredient: 'Tomato', quantity: 0.1 },
    { ingredient: 'Onion', quantity: 0.1 },
    { ingredient: 'Eggplant', quantity: 0.05 },
    { ingredient: 'Radish', quantity: 0.05 },
    { ingredient: 'String Beans', quantity: 0.05 },
    { ingredient: 'Tamarind', quantity: 0.03 },
    { ingredient: 'Water', quantity: 0.5 },
  ],
  'Fried Chicken': [
    { ingredient: 'Chicken', quantity: 0.35 },
    { ingredient: 'Cooking Oil', quantity: 0.2 },
    { ingredient: 'Garlic', quantity: 0.02 },
    { ingredient: 'Salt', quantity: 0.01 },
    { ingredient: 'Pepper', quantity: 0.005 },
    { ingredient: 'Flour', quantity: 0.05 },
  ],
  'Lumpia': [
    { ingredient: 'Pork', quantity: 0.15 },
    { ingredient: 'Carrot', quantity: 0.1 },
    { ingredient: 'Garlic', quantity: 0.02 },
    { ingredient: 'Onion', quantity: 0.05 },
    { ingredient: 'Cooking Oil', quantity: 0.15 },
    { ingredient: 'Salt', quantity: 0.005 },
    { ingredient: 'Pepper', quantity: 0.003 },
  ],
  'Pancit Canton': [
    { ingredient: 'Chicken', quantity: 0.1 },
    { ingredient: 'Carrot', quantity: 0.05 },
    { ingredient: 'Cabbage', quantity: 0.05 },
    { ingredient: 'Garlic', quantity: 0.02 },
    { ingredient: 'Onion', quantity: 0.03 },
    { ingredient: 'Soy Sauce', quantity: 0.03 },
    { ingredient: 'Cooking Oil', quantity: 0.05 },
  ],
  'Menudo': [
    { ingredient: 'Pork', quantity: 0.25 },
    { ingredient: 'Tomato', quantity: 0.1 },
    { ingredient: 'Garlic', quantity: 0.03 },
    { ingredient: 'Onion', quantity: 0.05 },
    { ingredient: 'Carrot', quantity: 0.05 },
    { ingredient: 'Potato', quantity: 0.1 },
    { ingredient: 'Soy Sauce', quantity: 0.03 },
    { ingredient: 'Cooking Oil', quantity: 0.05 },
  ],
  'Bicol Express': [
    { ingredient: 'Pork', quantity: 0.3 },
    { ingredient: 'Coconut Milk', quantity: 0.1 },
    { ingredient: 'Chili', quantity: 0.05 },
    { ingredient: 'Garlic', quantity: 0.03 },
    { ingredient: 'Onion', quantity: 0.05 },
    { ingredient: 'Ginger', quantity: 0.02 },
  ],
  'Sisig': [
    { ingredient: 'Pork', quantity: 0.3 },
    { ingredient: 'Garlic', quantity: 0.05 },
    { ingredient: 'Onion', quantity: 0.1 },
    { ingredient: 'Chili', quantity: 0.03 },
    { ingredient: 'Soy Sauce', quantity: 0.02 },
    { ingredient: 'Vinegar', quantity: 0.01 },
    { ingredient: 'Pepper', quantity: 0.005 },
  ],
  'Kare-Kare': [
    { ingredient: 'Beef', quantity: 0.3 },
    { ingredient: 'Eggplant', quantity: 0.05 },
    { ingredient: 'String Beans', quantity: 0.05 },
    { ingredient: 'Garlic', quantity: 0.03 },
    { ingredient: 'Onion', quantity: 0.05 },
  ],
  'Tinola': [
    { ingredient: 'Chicken', quantity: 0.35 },
    { ingredient: 'Ginger', quantity: 0.05 },
    { ingredient: 'Onion', quantity: 0.05 },
    { ingredient: 'Garlic', quantity: 0.02 },
  ]
}

async function populateMenuIngredients() {
  console.log('Starting to populate menu ingredients...\n')

  // First, let's see what menus and ingredients exist
  const { data: menus } = await supabase
    .from('menu_items')
    .select('menu_id, menu_name')
  
  const { data: ingredients } = await supabase
    .from('ingredients')
    .select('ingredient_id, ingredient_name')

  console.log('Available Menus:', menus?.map(m => m.menu_name).join(', '))
  console.log('Available Ingredients:', ingredients?.map(i => i.ingredient_name).join(', '))
  console.log('\n')

  // Process each recipe
  for (const [menuName, recipeItems] of Object.entries(recipes)) {
    console.log(`\nProcessing: ${menuName}`)
    
    const menuId = await getMenuId(menuName)
    if (!menuId) {
      console.log(`  ⚠️  Menu "${menuName}" not found, skipping...`)
      continue
    }

    for (const item of recipeItems) {
      const ingredientId = await getIngredientId(item.ingredient)
      
      if (!ingredientId) {
        console.log(`  ⚠️  Ingredient "${item.ingredient}" not found, skipping...`)
        continue
      }

      // Insert the menu ingredient
      const { error } = await supabase
        .from('menu_ingredients')
        .insert({
          menu_id: menuId,
          ingredient_id: ingredientId,
          quantity_needed: item.quantity
        })

      if (error) {
        console.log(`  ❌ Error adding ${item.ingredient}: ${error.message}`)
      } else {
        console.log(`  ✅ Added ${item.quantity}kg/L of ${item.ingredient}`)
      }
    }
  }

  console.log('\n✨ Done!')
}

// Run the script
populateMenuIngredients().catch(console.error)
