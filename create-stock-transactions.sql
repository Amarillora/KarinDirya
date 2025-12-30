-- Create stock_transactions table for tracking all stock movements
CREATE TABLE IF NOT EXISTS stock_transactions (
  transaction_id SERIAL PRIMARY KEY,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL, -- 'purchase', 'deduction', 'adjustment'
  quantity_change DECIMAL(10, 3) NOT NULL, -- positive for additions, negative for deductions
  quantity_before DECIMAL(10, 3) NOT NULL,
  quantity_after DECIMAL(10, 3) NOT NULL,
  unit_of_measurement VARCHAR(20) NOT NULL,
  reference_type VARCHAR(50), -- 'stock_entry', 'order', 'manual_adjustment'
  reference_id INTEGER, -- stock_id or order_id
  order_number VARCHAR(20), -- for easy reference
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance (IF NOT EXISTS to allow re-running)
CREATE INDEX IF NOT EXISTS idx_transactions_ingredient ON stock_transactions(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON stock_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON stock_transactions(transaction_type);

-- Function to log stock additions (purchases)
CREATE OR REPLACE FUNCTION log_stock_purchase()
RETURNS TRIGGER AS $$
DECLARE
  v_quantity_before DECIMAL(10, 3);
  v_quantity_after DECIMAL(10, 3);
  v_unit VARCHAR(20);
BEGIN
  -- Get the unit of measurement
  SELECT unit_of_measurement INTO v_unit
  FROM ingredients
  WHERE ingredient_id = NEW.ingredient_id;
  
  -- Calculate quantity before (sum of all existing stock except this new one)
  SELECT COALESCE(SUM(total_quantity), 0) INTO v_quantity_before
  FROM stock_ingredients
  WHERE ingredient_id = NEW.ingredient_id
    AND stock_id != NEW.stock_id;
  
  -- Calculate quantity after (including the new stock)
  v_quantity_after := v_quantity_before + NEW.total_quantity;
  
  -- Log the transaction
  INSERT INTO stock_transactions (
    ingredient_id,
    transaction_type,
    quantity_change,
    quantity_before,
    quantity_after,
    unit_of_measurement,
    reference_type,
    reference_id,
    notes
  ) VALUES (
    NEW.ingredient_id,
    'purchase',
    NEW.total_quantity,
    v_quantity_before,
    v_quantity_after,
    v_unit,
    'stock_entry',
    NEW.stock_id,
    'Stock added: ' || NEW.container_type || ' - ' || COALESCE(NEW.supplier, 'No supplier')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log purchases when stock is added
DROP TRIGGER IF EXISTS trigger_log_stock_purchase ON stock_ingredients;
CREATE TRIGGER trigger_log_stock_purchase
AFTER INSERT ON stock_ingredients
FOR EACH ROW
EXECUTE FUNCTION log_stock_purchase();

-- Function to log stock deductions (from orders)
CREATE OR REPLACE FUNCTION log_stock_deduction()
RETURNS TRIGGER AS $$
DECLARE
  v_ingredient_id INTEGER;
  v_quantity_change DECIMAL(10, 3);
  v_quantity_before DECIMAL(10, 3);
  v_quantity_after DECIMAL(10, 3);
  v_unit VARCHAR(20);
  v_ingredient_name VARCHAR(100);
BEGIN
  -- Only log when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- For each order item, log the ingredient deductions
    FOR v_ingredient_id, v_quantity_change, v_unit, v_ingredient_name IN
      SELECT 
        r.ingredient_id,
        SUM(r.quantity_needed * oi.quantity) as total_used,
        i.unit_of_measurement,
        i.ingredient_name
      FROM order_items oi
      JOIN recipes r ON oi.menu_id = r.menu_id
      JOIN ingredients i ON r.ingredient_id = i.ingredient_id
      WHERE oi.order_id = NEW.order_id
      GROUP BY r.ingredient_id, i.unit_of_measurement, i.ingredient_name
    LOOP
      -- Get quantity before deduction
      SELECT COALESCE(SUM(total_quantity), 0) INTO v_quantity_before
      FROM stock_ingredients
      WHERE ingredient_id = v_ingredient_id;
      
      -- Calculate quantity after deduction
      v_quantity_after := v_quantity_before - v_quantity_change;
      
      -- Log the transaction
      INSERT INTO stock_transactions (
        ingredient_id,
        transaction_type,
        quantity_change,
        quantity_before,
        quantity_after,
        unit_of_measurement,
        reference_type,
        reference_id,
        order_number,
        notes
      ) VALUES (
        v_ingredient_id,
        'deduction',
        -v_quantity_change, -- negative for deduction
        v_quantity_before,
        v_quantity_after,
        v_unit,
        'order',
        NEW.order_id,
        NEW.order_number,
        'Used in order: ' || v_ingredient_name
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log deductions when order is completed
DROP TRIGGER IF EXISTS trigger_log_stock_deduction ON orders;
CREATE TRIGGER trigger_log_stock_deduction
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_stock_deduction();

-- Function to log stock updates (adjustments or deletions)
CREATE OR REPLACE FUNCTION log_stock_update()
RETURNS TRIGGER AS $$
DECLARE
  v_quantity_before DECIMAL(10, 3);
  v_quantity_after DECIMAL(10, 3);
  v_unit VARCHAR(20);
  v_quantity_change DECIMAL(10, 3);
BEGIN
  -- Get the unit of measurement
  SELECT unit_of_measurement INTO v_unit
  FROM ingredients
  WHERE ingredient_id = OLD.ingredient_id;
  
  IF TG_OP = 'DELETE' THEN
    -- Calculate total before deletion
    SELECT COALESCE(SUM(total_quantity), 0) INTO v_quantity_before
    FROM stock_ingredients
    WHERE ingredient_id = OLD.ingredient_id;
    
    v_quantity_after := v_quantity_before - OLD.total_quantity;
    v_quantity_change := -OLD.total_quantity;
    
    -- Log the deletion
    INSERT INTO stock_transactions (
      ingredient_id,
      transaction_type,
      quantity_change,
      quantity_before,
      quantity_after,
      unit_of_measurement,
      reference_type,
      reference_id,
      notes
    ) VALUES (
      OLD.ingredient_id,
      'adjustment',
      v_quantity_change,
      v_quantity_before,
      v_quantity_after,
      v_unit,
      'stock_deletion',
      OLD.stock_id,
      'Stock entry deleted: ' || OLD.container_type
    );
    
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Calculate total before update
    SELECT COALESCE(SUM(total_quantity), 0) - OLD.total_quantity INTO v_quantity_before
    FROM stock_ingredients
    WHERE ingredient_id = OLD.ingredient_id;
    
    v_quantity_after := v_quantity_before + NEW.total_quantity;
    v_quantity_change := NEW.total_quantity - OLD.total_quantity;
    
    -- Only log if quantity actually changed
    IF v_quantity_change != 0 THEN
      INSERT INTO stock_transactions (
        ingredient_id,
        transaction_type,
        quantity_change,
        quantity_before,
        quantity_after,
        unit_of_measurement,
        reference_type,
        reference_id,
        notes
      ) VALUES (
        NEW.ingredient_id,
        'adjustment',
        v_quantity_change,
        v_quantity_before,
        v_quantity_after,
        v_unit,
        'stock_update',
        NEW.stock_id,
        'Stock entry updated: ' || NEW.container_type
      );
    END IF;
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log stock updates and deletions
DROP TRIGGER IF EXISTS trigger_log_stock_update ON stock_ingredients;
CREATE TRIGGER trigger_log_stock_update
AFTER UPDATE OR DELETE ON stock_ingredients
FOR EACH ROW
EXECUTE FUNCTION log_stock_update();
