-- Seed Data for Filipino Restaurant Management System
-- Run this AFTER running the schema file

-- Insert Categories
INSERT INTO categories (category_name, description) VALUES
('Meats', 'Meat ingredients'),
('Vegetables', 'Fresh vegetables'),
('Condiments', 'Sauces and seasonings'),
('Spices', 'Spices and herbs'),
('Liquids', 'Oils, vinegar, water'),
('Staples', 'Rice, noodles, etc.'),
('Seafood', 'Fish and seafood'),
('Dairy', 'Eggs, milk products');

-- Insert Common Filipino Ingredients
INSERT INTO ingredients (ingredient_name, unit_of_measurement, category_id) VALUES
-- Meats
('Pork Belly', 'kg', 1),
('Chicken', 'kg', 1),
('Beef', 'kg', 1),
('Ground Pork', 'kg', 1),
-- Vegetables
('Onion', 'kg', 2),
('Garlic', 'kg', 2),
('Tomato', 'kg', 2),
('Potato', 'kg', 2),
('Carrot', 'kg', 2),
('Cabbage', 'kg', 2),
('Eggplant', 'kg', 2),
('String Beans', 'kg', 2),
('Bok Choy', 'kg', 2),
('Green Papaya', 'kg', 2),
-- Condiments
('Soy Sauce', 'mL', 3),
('Vinegar', 'mL', 3),
('Fish Sauce', 'mL', 3),
('Oyster Sauce', 'mL', 3),
('Banana Ketchup', 'mL', 3),
('Coconut Milk', 'mL', 3),
-- Spices
('Bay Leaf', 'g', 4),
('Black Pepper', 'g', 4),
('Ginger', 'kg', 4),
('Chili', 'kg', 4),
-- Liquids
('Cooking Oil', 'L', 5),
('Water', 'L', 5),
-- Staples
('Rice', 'kg', 6),
('Noodles', 'kg', 6),
-- Seafood
('Shrimp', 'kg', 7),
('Milkfish', 'kg', 7),
-- Dairy
('Eggs', 'pieces', 8);

-- Insert 10 Famous Filipino Dishes
INSERT INTO menu_items (menu_name, description, selling_price, category, image_url, preparation_time) VALUES
(
  'Adobo',
  'Classic Filipino dish with pork or chicken braised in vinegar, soy sauce, garlic, and spices',
  120.00,
  'Main Course',
  'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=500',
  45
),
(
  'Sinigang na Baboy',
  'Savory and sour pork soup with tamarind, vegetables, and spices',
  150.00,
  'Main Course',
  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500',
  60
),
(
  'Kare-Kare',
  'Rich peanut-based stew with oxtail or beef and vegetables, served with bagoong',
  180.00,
  'Main Course',
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500',
  90
),
(
  'Lechon Kawali',
  'Crispy deep-fried pork belly served with lechon sauce or vinegar dip',
  160.00,
  'Main Course',
  'https://images.unsplash.com/photo-1624699963355-b1c8f96556a2?w=500',
  50
),
(
  'Sisig',
  'Sizzling chopped pork face and ears with onions, chili, and calamansi',
  140.00,
  'Main Course',
  'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500',
  40
),
(
  'Pancit Canton',
  'Filipino stir-fried noodles with vegetables, meat, and seafood',
  100.00,
  'Main Course',
  'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500',
  30
),
(
  'Lumpia Shanghai',
  'Crispy Filipino spring rolls filled with ground pork and vegetables',
  80.00,
  'Appetizer',
  'https://images.unsplash.com/photo-1626802618138-3ba10f367068?w=500',
  35
),
(
  'Chicken Tinola',
  'Ginger-based chicken soup with green papaya and chili leaves',
  130.00,
  'Main Course',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500',
  45
),
(
  'Pinakbet',
  'Vegetable medley with shrimp paste, featuring eggplant, bitter melon, and squash',
  110.00,
  'Main Course',
  'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500',
  40
),
(
  'Bicol Express',
  'Spicy pork dish cooked in coconut milk with chili peppers',
  135.00,
  'Main Course',
  'https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=500',
  50
);

-- Insert Recipes (Ingredients for each dish)
-- Note: These are simplified recipes. Adjust quantities based on serving size.

-- Adobo (menu_id: 1)
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed, notes) VALUES
(1, 1, 0.500, 'Pork Belly, cut into chunks'),
(1, 5, 0.050, 'Onion, sliced'),
(1, 6, 0.030, 'Garlic, minced'),
(1, 15, 0.100, 'Soy Sauce'),
(1, 16, 0.080, 'Vinegar'),
(1, 21, 0.003, 'Bay Leaf'),
(1, 22, 0.005, 'Black Pepper'),
(1, 25, 0.030, 'Cooking Oil');

-- Sinigang na Baboy (menu_id: 2)
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed, notes) VALUES
(2, 1, 0.400, 'Pork ribs or belly'),
(2, 5, 0.050, 'Onion'),
(2, 7, 0.100, 'Tomato'),
(2, 11, 0.100, 'Eggplant'),
(2, 12, 0.100, 'String Beans'),
(2, 9, 0.100, 'Radish/Carrot'),
(2, 17, 0.030, 'Fish Sauce'),
(2, 26, 1.000, 'Water');

-- Kare-Kare (menu_id: 3)
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed, notes) VALUES
(3, 3, 0.500, 'Beef or Oxtail'),
(3, 5, 0.050, 'Onion'),
(3, 6, 0.030, 'Garlic'),
(3, 11, 0.150, 'Eggplant'),
(3, 12, 0.100, 'String Beans'),
(3, 10, 0.100, 'Cabbage'),
(3, 25, 0.050, 'Cooking Oil');

-- Lechon Kawali (menu_id: 4)
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed, notes) VALUES
(4, 1, 0.600, 'Pork Belly'),
(4, 6, 0.030, 'Garlic'),
(4, 21, 0.003, 'Bay Leaf'),
(4, 22, 0.005, 'Black Pepper'),
(4, 25, 0.500, 'Cooking Oil for deep frying'),
(4, 16, 0.050, 'Vinegar for dipping');

-- Sisig (menu_id: 5)
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed, notes) VALUES
(5, 1, 0.400, 'Pork face/ears, boiled and chopped'),
(5, 5, 0.100, 'Onion, chopped'),
(5, 6, 0.030, 'Garlic'),
(5, 24, 0.020, 'Chili'),
(5, 31, 1.000, 'Egg'),
(5, 15, 0.020, 'Soy Sauce'),
(5, 25, 0.030, 'Cooking Oil');

-- Pancit Canton (menu_id: 6)
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed, notes) VALUES
(6, 28, 0.300, 'Canton Noodles'),
(6, 2, 0.150, 'Chicken, sliced'),
(6, 29, 0.100, 'Shrimp'),
(6, 9, 0.100, 'Carrot, julienned'),
(6, 10, 0.100, 'Cabbage, shredded'),
(6, 5, 0.050, 'Onion'),
(6, 6, 0.030, 'Garlic'),
(6, 15, 0.050, 'Soy Sauce'),
(6, 18, 0.030, 'Oyster Sauce'),
(6, 25, 0.040, 'Cooking Oil');

-- Lumpia Shanghai (menu_id: 7)
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed, notes) VALUES
(7, 4, 0.300, 'Ground Pork'),
(7, 5, 0.050, 'Onion, minced'),
(7, 6, 0.020, 'Garlic, minced'),
(7, 9, 0.050, 'Carrot, minced'),
(7, 15, 0.020, 'Soy Sauce'),
(7, 31, 1.000, 'Egg'),
(7, 25, 0.300, 'Cooking Oil for frying');

-- Chicken Tinola (menu_id: 8)
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed, notes) VALUES
(8, 2, 0.500, 'Chicken, cut into pieces'),
(8, 5, 0.050, 'Onion'),
(8, 6, 0.030, 'Garlic'),
(8, 23, 0.050, 'Ginger, sliced'),
(8, 14, 0.300, 'Green Papaya'),
(8, 17, 0.030, 'Fish Sauce'),
(8, 26, 1.000, 'Water'),
(8, 25, 0.030, 'Cooking Oil');

-- Pinakbet (menu_id: 9)
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed, notes) VALUES
(9, 29, 0.150, 'Shrimp'),
(9, 5, 0.050, 'Onion'),
(9, 6, 0.030, 'Garlic'),
(9, 7, 0.100, 'Tomato'),
(9, 11, 0.150, 'Eggplant'),
(9, 12, 0.100, 'String Beans'),
(9, 17, 0.030, 'Fish Sauce/Shrimp Paste');

-- Bicol Express (menu_id: 10)
INSERT INTO recipes (menu_id, ingredient_id, quantity_needed, notes) VALUES
(10, 1, 0.400, 'Pork Belly, cubed'),
(10, 5, 0.050, 'Onion'),
(10, 6, 0.030, 'Garlic'),
(10, 23, 0.030, 'Ginger'),
(10, 24, 0.050, 'Chili'),
(10, 20, 0.400, 'Coconut Milk'),
(10, 17, 0.020, 'Fish Sauce'),
(10, 25, 0.030, 'Cooking Oil');

-- Insert Sample Stock Data
INSERT INTO stock_ingredients (ingredient_id, container_type, quantity_containers, container_size, container_price, purchase_date) VALUES
-- Soy Sauce
(15, 'bottle', 5, 1000, 150, CURRENT_DATE),
(15, 'bottle', 10, 750, 120, CURRENT_DATE),
-- Cooking Oil
(25, 'bottle', 8, 1000, 180, CURRENT_DATE),
-- Vinegar
(16, 'bottle', 6, 750, 100, CURRENT_DATE),
-- Rice
(27, 'sack', 3, 50000, 2200, CURRENT_DATE),
-- Garlic
(6, 'kg', 5, 1, 120, CURRENT_DATE),
-- Onion
(5, 'kg', 10, 1, 80, CURRENT_DATE),
-- Pork Belly
(1, 'kg', 15, 1, 320, CURRENT_DATE),
-- Chicken
(2, 'kg', 12, 1, 180, CURRENT_DATE),
-- Fish Sauce
(17, 'bottle', 5, 750, 85, CURRENT_DATE);

-- Insert a sample order
INSERT INTO orders (order_number, customer_name, status, payment_method) VALUES
('ORD-001', 'Juan Dela Cruz', 'completed', 'cash');

INSERT INTO order_items (order_id, menu_id, quantity, unit_price) VALUES
(1, 1, 2, 120.00), -- 2 Adobo
(1, 6, 1, 100.00), -- 1 Pancit Canton
(1, 7, 1, 80.00);  -- 1 Lumpia Shanghai

-- Update order as completed
UPDATE orders SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE order_id = 1;
