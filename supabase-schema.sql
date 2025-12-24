-- Restaurant Management System Schema for Karindirya
-- Run this in your Supabase SQL Editor

-- 1. Category Table
CREATE TABLE IF NOT EXISTS categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ingredients Table
CREATE TABLE IF NOT EXISTS ingredients (
  ingredient_id SERIAL PRIMARY KEY,
  ingredient_name VARCHAR(100) NOT NULL UNIQUE,
  unit_of_measurement VARCHAR(20) NOT NULL, -- kg, g, L, mL, pieces, etc.
  category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. StockIngredients Table (Enhanced for better inventory tracking)
CREATE TABLE IF NOT EXISTS stock_ingredients (
  stock_id SERIAL PRIMARY KEY,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
  container_type VARCHAR(50) NOT NULL, -- bottle, sachet, bag, box, etc.
  quantity_containers INTEGER NOT NULL, -- number of containers
  container_size DECIMAL(10, 2) NOT NULL, -- size of each container
  container_price DECIMAL(10, 2) NOT NULL, -- price per container
  total_quantity DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_containers * container_size) STORED,
  total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_containers * container_price) STORED,
  unit_price DECIMAL(10, 4) GENERATED ALWAYS AS (container_price / container_size) STORED,
  purchase_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  supplier VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. MenuItems Table
CREATE TABLE IF NOT EXISTS menu_items (
  menu_id SERIAL PRIMARY KEY,
  menu_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  selling_price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50), -- appetizer, main course, dessert, drinks
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  preparation_time INTEGER, -- in minutes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Recipes Table (Defines ingredients needed for each menu item)
CREATE TABLE IF NOT EXISTS recipes (
  recipe_id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL REFERENCES menu_items(menu_id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
  quantity_needed DECIMAL(10, 3) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(menu_id, ingredient_id)
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  order_id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE,
  customer_name VARCHAR(100),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, completed, cancelled
  payment_method VARCHAR(20), -- cash, gcash, card
  notes TEXT,
  completed_at TIMESTAMP
);

-- 7. OrderItems Table (Individual items in each order)
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  menu_id INTEGER NOT NULL REFERENCES menu_items(menu_id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_stock_ingredient ON stock_ingredients(ingredient_id);
CREATE INDEX idx_recipes_menu ON recipes(menu_id);
CREATE INDEX idx_recipes_ingredient ON recipes(ingredient_id);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_menu ON order_items(menu_id);

-- Create a view for current stock levels (sum of all stock entries per ingredient)
CREATE OR REPLACE VIEW current_stock_levels AS
SELECT 
  i.ingredient_id,
  i.ingredient_name,
  i.unit_of_measurement,
  COALESCE(SUM(si.total_quantity), 0) as total_stock,
  COALESCE(AVG(si.unit_price), 0) as avg_unit_price,
  COUNT(si.stock_id) as stock_entries
FROM ingredients i
LEFT JOIN stock_ingredients si ON i.ingredient_id = si.ingredient_id
GROUP BY i.ingredient_id, i.ingredient_name, i.unit_of_measurement;

-- Create a view for menu items with total cost
CREATE OR REPLACE VIEW menu_cost_analysis AS
SELECT 
  m.menu_id,
  m.menu_name,
  m.selling_price,
  COALESCE(SUM(r.quantity_needed * csl.avg_unit_price), 0) as total_cost,
  m.selling_price - COALESCE(SUM(r.quantity_needed * csl.avg_unit_price), 0) as profit_margin,
  CASE 
    WHEN m.selling_price > 0 THEN 
      ((m.selling_price - COALESCE(SUM(r.quantity_needed * csl.avg_unit_price), 0)) / m.selling_price * 100)
    ELSE 0 
  END as profit_percentage
FROM menu_items m
LEFT JOIN recipes r ON m.menu_id = r.menu_id
LEFT JOIN current_stock_levels csl ON r.ingredient_id = csl.ingredient_id
GROUP BY m.menu_id, m.menu_name, m.selling_price;

-- Function to update order total
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET total_amount = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  )
  WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update order total when order items change
CREATE TRIGGER trigger_update_order_total
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total();

-- Function to check ingredient availability before order
CREATE OR REPLACE FUNCTION check_ingredient_availability(p_menu_id INTEGER, p_quantity INTEGER)
RETURNS TABLE(ingredient_name VARCHAR, needed DECIMAL, available DECIMAL, sufficient BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.ingredient_name,
    r.quantity_needed * p_quantity as needed,
    csl.total_stock as available,
    csl.total_stock >= (r.quantity_needed * p_quantity) as sufficient
  FROM recipes r
  JOIN ingredients i ON r.ingredient_id = i.ingredient_id
  JOIN current_stock_levels csl ON i.ingredient_id = csl.ingredient_id
  WHERE r.menu_id = p_menu_id;
END;
$$ LANGUAGE plpgsql;

-- Function to deduct ingredients after order completion
CREATE OR REPLACE FUNCTION deduct_ingredients_from_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Only deduct when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- For each order item, deduct ingredients
    -- This is a simplified version - in production, you'd need more sophisticated stock tracking
    UPDATE stock_ingredients si
    SET quantity_containers = GREATEST(0, quantity_containers - 
      CEIL((r.quantity_needed * oi.quantity) / si.container_size)::INTEGER
    )
    FROM order_items oi
    JOIN recipes r ON oi.menu_id = r.menu_id
    WHERE si.ingredient_id = r.ingredient_id
      AND oi.order_id = NEW.order_id
      AND si.quantity_containers > 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to deduct ingredients when order is completed
CREATE TRIGGER trigger_deduct_ingredients
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION deduct_ingredients_from_stock();
