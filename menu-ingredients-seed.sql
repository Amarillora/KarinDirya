-- Menu Ingredients Seed Data
-- This file populates the recipes table with ingredient requirements for each menu item

-- First, let's check what menu items and ingredients we have
-- Assuming menu_ids: 1=Adobo, 2=Sinigang, 3=Fried Chicken, 4=Lumpia, 5=Pancit

-- ADOBO (Pork or Chicken Adobo) - Assuming menu_id = 1
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES
-- Pork or Chicken (assuming ingredient_id 1 for Pork or 2 for Chicken)
(1, 1, 0.25),  -- 250g Pork
-- Soy Sauce (assuming ingredient_id for soy sauce)
(1, 15, 0.1),  -- 100mL Soy Sauce
-- Cooking Oil
(1, 9, 0.1),   -- 100mL Cooking Oil
-- Garlic
(1, 5, 0.05),  -- 50g Garlic
-- Onion
(1, 6, 0.05),  -- 50g Onion
-- Bay Leaf
(1, 21, 0.005), -- 5g Bay Leaf
-- Ginger
(1, 20, 0.02),  -- 20g Ginger
-- Water (if tracked as ingredient)
(1, 17, 0.25);  -- 250mL Water

-- SINIGANG (Pork Sinigang) - Assuming menu_id = 2
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES
(2, 1, 0.3),   -- 300g Pork
(2, 6, 0.1),   -- 100g Onion
(2, 3, 0.1),   -- 100g Tomato
(2, 4, 0.05),  -- 50g Eggplant
(2, 7, 0.05),  -- 50g String Beans (Sitaw)
(2, 8, 0.05),  -- 50g Radish (Labanos)
(2, 11, 0.03), -- 30g Tamarind or Sinigang Mix
(2, 17, 0.5),  -- 500mL Water
(2, 18, 0.005); -- 5g Salt

-- FRIED CHICKEN - Assuming menu_id = 3
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES
(3, 2, 0.35),  -- 350g Chicken
(3, 9, 0.2),   -- 200mL Cooking Oil
(3, 5, 0.02),  -- 20g Garlic
(3, 18, 0.01), -- 10g Salt
(3, 19, 0.005), -- 5g Pepper
(3, 22, 0.05); -- 50g Flour

-- LUMPIA (Spring Rolls) - Assuming menu_id = 4
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES
(4, 1, 0.15),  -- 150g Ground Pork
(4, 4, 0.1),   -- 100g Carrots
(4, 5, 0.02),  -- 20g Garlic
(4, 6, 0.05),  -- 50g Onion
(4, 23, 0.1),  -- 100g Lumpia Wrapper
(4, 9, 0.15),  -- 150mL Cooking Oil
(4, 18, 0.005), -- 5g Salt
(4, 19, 0.003); -- 3g Pepper

-- PANCIT CANTON - Assuming menu_id = 5
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES
(5, 24, 0.2),  -- 200g Canton Noodles
(5, 2, 0.1),   -- 100g Chicken
(5, 4, 0.05),  -- 50g Carrots
(5, 10, 0.05), -- 50g Cabbage
(5, 5, 0.02),  -- 20g Garlic
(5, 6, 0.03),  -- 30g Onion
(5, 15, 0.03), -- 30mL Soy Sauce
(5, 9, 0.05),  -- 50mL Cooking Oil
(5, 17, 0.1);  -- 100mL Water

-- MENUDO - Assuming menu_id = 6
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES
(6, 1, 0.25),  -- 250g Pork
(6, 25, 0.1),  -- 100g Pork Liver
(6, 3, 0.1),   -- 100g Tomato
(6, 5, 0.03),  -- 30g Garlic
(6, 6, 0.05),  -- 50g Onion
(6, 4, 0.05),  -- 50g Carrots
(6, 26, 0.1),  -- 100g Potato
(6, 15, 0.03), -- 30mL Soy Sauce
(6, 27, 0.05), -- 50mL Tomato Sauce
(6, 9, 0.05);  -- 50mL Cooking Oil

-- BICOL EXPRESS - Assuming menu_id = 7
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES
(7, 1, 0.3),   -- 300g Pork
(7, 28, 0.1),  -- 100mL Coconut Milk
(7, 29, 0.05), -- 50g Chili Peppers
(7, 30, 0.05), -- 50g Shrimp Paste (Bagoong)
(7, 5, 0.03),  -- 30g Garlic
(7, 6, 0.05),  -- 50g Onion
(7, 20, 0.02); -- 20g Ginger

-- SISIG - Assuming menu_id = 8
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES
(8, 31, 0.3),  -- 300g Pork Face/Belly
(8, 5, 0.05),  -- 50g Garlic
(8, 6, 0.1),   -- 100g Onion
(8, 29, 0.03), -- 30g Chili
(8, 32, 0.02), -- 20mL Calamansi
(8, 15, 0.02), -- 20mL Soy Sauce
(8, 33, 0.01), -- 10mL Vinegar
(8, 19, 0.005); -- 5g Pepper

-- KARE-KARE - Assuming menu_id = 9
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES
(9, 34, 0.3),  -- 300g Oxtail or Beef
(9, 35, 0.1),  -- 100g Peanut Butter
(9, 4, 0.05),  -- 50g Eggplant
(9, 7, 0.05),  -- 50g String Beans
(9, 10, 0.05), -- 50g Bok Choy
(9, 30, 0.02), -- 20g Shrimp Paste
(9, 5, 0.03),  -- 30g Garlic
(9, 6, 0.05),  -- 50g Onion
(9, 17, 0.5);  -- 500mL Water

-- TINOLA - Assuming menu_id = 10
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES
(10, 2, 0.35), -- 350g Chicken
(10, 20, 0.05), -- 50g Ginger
(10, 6, 0.05), -- 50g Onion
(10, 5, 0.02), -- 20g Garlic
(10, 36, 0.1), -- 100g Green Papaya
(10, 37, 0.05), -- 50g Chili Leaves
(10, 38, 0.03), -- 30g Fish Sauce (Patis)
(10, 17, 0.5); -- 500mL Water

-- Note: You'll need to adjust the ingredient_ids based on your actual ingredient IDs in the database
-- To find your ingredient IDs, run: SELECT ingredient_id, ingredient_name FROM ingredients ORDER BY ingredient_name;
