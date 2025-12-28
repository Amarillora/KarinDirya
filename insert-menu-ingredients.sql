-- ============================================
-- MENU INGREDIENTS POPULATION SCRIPT
-- ============================================
-- This script populates the recipes table for all menu items
-- Run this in your Supabase SQL Editor

-- First, check what menu items you have:
-- SELECT menu_id, menu_name FROM menu_items ORDER BY menu_name;

-- Then check your ingredients:
-- SELECT ingredient_id, ingredient_name FROM ingredients ORDER BY ingredient_name;

-- ============================================
-- STEP 1: Clear existing recipes (optional)
-- ============================================
-- TRUNCATE recipes;

-- ============================================
-- STEP 2: Insert recipes
-- ============================================
-- Replace the menu_id and ingredient_id values with your actual IDs

-- Example for ADOBO (menu_id = 1)
-- Find your actual IDs first, then uncomment and adjust:

/*
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES
-- Adobo
((SELECT menu_id FROM menu_items WHERE menu_name ILIKE 'adobo'), 
 (SELECT ingredient_id FROM ingredients WHERE ingredient_name ILIKE 'pork'), 0.25),
((SELECT menu_id FROM menu_items WHERE menu_name ILIKE 'adobo'), 
 (SELECT ingredient_id FROM ingredients WHERE ingredient_name ILIKE 'soy sauce'), 0.1),
((SELECT menu_id FROM menu_items WHERE menu_name ILIKE 'adobo'), 
 (SELECT ingredient_id FROM ingredients WHERE ingredient_name ILIKE 'cooking oil'), 0.1),
((SELECT menu_id FROM menu_items WHERE menu_name ILIKE 'adobo'), 
 (SELECT ingredient_id FROM ingredients WHERE ingredient_name ILIKE 'garlic'), 0.05),
((SELECT menu_id FROM menu_items WHERE menu_name ILIKE 'adobo'), 
 (SELECT ingredient_id FROM ingredients WHERE ingredient_name ILIKE 'onion'), 0.05),
((SELECT menu_id FROM menu_items WHERE menu_name ILIKE 'adobo'), 
 (SELECT ingredient_id FROM ingredients WHERE ingredient_name ILIKE 'bay leaf'), 0.005),
((SELECT menu_id FROM menu_items WHERE menu_name ILIKE 'adobo'), 
 (SELECT ingredient_id FROM ingredients WHERE ingredient_name ILIKE 'ginger'), 0.02);
*/

-- ============================================
-- GENERIC TEMPLATE - Copy this for each menu
-- ============================================
-- Replace 'MENU_NAME' with your actual menu name
-- Replace 'INGREDIENT_NAME' with actual ingredient names
-- Adjust quantity_needed values as needed

/*
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_id FROM menu_items WHERE menu_name ILIKE 'MENU_NAME'), 
 (SELECT ingredient_id FROM ingredients WHERE ingredient_name ILIKE 'INGREDIENT_1'), 0.25),
((SELECT menu_id FROM menu_items WHERE menu_name ILIKE 'MENU_NAME'), 
 (SELECT ingredient_id FROM ingredients WHERE ingredient_name ILIKE 'INGREDIENT_2'), 0.1),
((SELECT menu_id FROM menu_items WHERE menu_name ILIKE 'MENU_NAME'), 
 (SELECT ingredient_id FROM ingredients WHERE ingredient_name ILIKE 'INGREDIENT_3'), 0.05);
*/

-- ============================================
-- COMPLETE EXAMPLES FOR COMMON FILIPINO DISHES
-- ============================================

-- ADOBO
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) 
SELECT 
  m.menu_id,
  i.ingredient_id,
  v.qty
FROM menu_items m
CROSS JOIN (VALUES 
  ('pork', 0.25),
  ('soy sauce', 0.1),
  ('cooking oil', 0.1),
  ('garlic', 0.05),
  ('onion', 0.05),
  ('bay leaf', 0.005),
  ('ginger', 0.02)
) AS v(ing_name, qty)
JOIN ingredients i ON i.ingredient_name ILIKE v.ing_name
WHERE m.menu_name ILIKE 'adobo'
ON CONFLICT (menu_id, ingredient_id) DO NOTHING;

-- SINIGANG
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) 
SELECT 
  m.menu_id,
  i.ingredient_id,
  v.qty
FROM menu_items m
CROSS JOIN (VALUES 
  ('pork', 0.3),
  ('tomato', 0.1),
  ('onion', 0.1),
  ('eggplant', 0.05),
  ('radish', 0.05),
  ('string beans', 0.05),
  ('tamarind', 0.03)
) AS v(ing_name, qty)
JOIN ingredients i ON i.ingredient_name ILIKE v.ing_name
WHERE m.menu_name ILIKE 'sinigang'
ON CONFLICT (menu_id, ingredient_id) DO NOTHING;

-- FRIED CHICKEN
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) 
SELECT 
  m.menu_id,
  i.ingredient_id,
  v.qty
FROM menu_items m
CROSS JOIN (VALUES 
  ('chicken', 0.35),
  ('cooking oil', 0.2),
  ('garlic', 0.02),
  ('salt', 0.01),
  ('pepper', 0.005),
  ('flour', 0.05)
) AS v(ing_name, qty)
JOIN ingredients i ON i.ingredient_name ILIKE v.ing_name
WHERE m.menu_name ILIKE '%chicken%' AND m.menu_name ILIKE '%fried%'
ON CONFLICT (menu_id, ingredient_id) DO NOTHING;

-- LUMPIA
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) 
SELECT 
  m.menu_id,
  i.ingredient_id,
  v.qty
FROM menu_items m
CROSS JOIN (VALUES 
  ('pork', 0.15),
  ('carrot', 0.1),
  ('garlic', 0.02),
  ('onion', 0.05),
  ('cooking oil', 0.15),
  ('salt', 0.005),
  ('pepper', 0.003)
) AS v(ing_name, qty)
JOIN ingredients i ON i.ingredient_name ILIKE v.ing_name
WHERE m.menu_name ILIKE 'lumpia'
ON CONFLICT (menu_id, ingredient_id) DO NOTHING;

-- PANCIT
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) 
SELECT 
  m.menu_id,
  i.ingredient_id,
  v.qty
FROM menu_items m
CROSS JOIN (VALUES 
  ('chicken', 0.1),
  ('carrot', 0.05),
  ('cabbage', 0.05),
  ('garlic', 0.02),
  ('onion', 0.03),
  ('soy sauce', 0.03),
  ('cooking oil', 0.05)
) AS v(ing_name, qty)
JOIN ingredients i ON i.ingredient_name ILIKE v.ing_name
WHERE m.menu_name ILIKE 'pancit'
ON CONFLICT (menu_id, ingredient_id) DO NOTHING;

-- MENUDO
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) 
SELECT 
  m.menu_id,
  i.ingredient_id,
  v.qty
FROM menu_items m
CROSS JOIN (VALUES 
  ('pork', 0.25),
  ('tomato', 0.1),
  ('garlic', 0.03),
  ('onion', 0.05),
  ('carrot', 0.05),
  ('potato', 0.1),
  ('soy sauce', 0.03),
  ('cooking oil', 0.05)
) AS v(ing_name, qty)
JOIN ingredients i ON i.ingredient_name ILIKE v.ing_name
WHERE m.menu_name ILIKE 'menudo'
ON CONFLICT (menu_id, ingredient_id) DO NOTHING;

-- SISIG
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) 
SELECT 
  m.menu_id,
  i.ingredient_id,
  v.qty
FROM menu_items m
CROSS JOIN (VALUES 
  ('pork', 0.3),
  ('garlic', 0.05),
  ('onion', 0.1),
  ('chili', 0.03),
  ('soy sauce', 0.02),
  ('vinegar', 0.01),
  ('pepper', 0.005)
) AS v(ing_name, qty)
JOIN ingredients i ON i.ingredient_name ILIKE v.ing_name
WHERE m.menu_name ILIKE 'sisig'
ON CONFLICT (menu_id, ingredient_id) DO NOTHING;

-- TINOLA
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) 
SELECT 
  m.menu_id,
  i.ingredient_id,
  v.qty
FROM menu_items m
CROSS JOIN (VALUES 
  ('chicken', 0.35),
  ('ginger', 0.05),
  ('onion', 0.05),
  ('garlic', 0.02)
) AS v(ing_name, qty)
JOIN ingredients i ON i.ingredient_name ILIKE v.ing_name
WHERE m.menu_name ILIKE 'tinola'
ON CONFLICT (menu_id, ingredient_id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to see what was inserted:
SELECT 
  mi.menu_name,
  i.ingredient_name,
  r.quantity_needed,
  i.unit_of_measurement
FROM recipes r
JOIN menu_items mi ON r.menu_id = mi.menu_id
JOIN ingredients i ON r.ingredient_id = i.ingredient_id
ORDER BY mi.menu_name, i.ingredient_name;
