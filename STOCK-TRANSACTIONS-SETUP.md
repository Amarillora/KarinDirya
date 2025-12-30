# Stock Transaction History Setup Instructions

## Overview
This guide will help you set up the stock transaction history feature that automatically tracks:
- **Stock Additions (Purchases)** - When you add new stock
- **Stock Deductions** - When orders are completed and ingredients are used
- **Adjustments** - When stock entries are edited or deleted

## Prerequisites
- Access to your Supabase SQL Editor
- The `create-stock-transactions.sql` file in your project

## Installation Steps

### Step 1: Run the SQL Migration
1. Open your Supabase project dashboard
2. Navigate to the **SQL Editor** (in the left sidebar)
3. Click **"+ New query"**
4. Copy the entire content from `create-stock-transactions.sql`
5. Paste it into the SQL Editor
6. Click **"Run"** to execute the script

### Step 2: Verify the Installation
After running the script, verify that everything was created successfully:

```sql
-- Check if the table was created
SELECT * FROM stock_transactions LIMIT 1;

-- Check if triggers exist
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table IN ('stock_ingredients', 'orders');
```

You should see:
- A `stock_transactions` table
- Three triggers:
  - `trigger_log_stock_purchase` on `stock_ingredients`
  - `trigger_log_stock_update` on `stock_ingredients`
  - `trigger_log_stock_deduction` on `orders`

## What This Does

### 1. Stock Additions (Purchases)
When you add new stock through the **Inventory Management** interface:
- A **purchase** transaction is automatically logged
- Shows: ingredient name, quantity added, date/time
- Displays with 📈 Purchase icon
- Includes supplier information in notes

### 2. Stock Deductions
When an order is **completed**:
- A **deduction** transaction is logged for each ingredient used
- Shows: ingredient used, quantity deducted, order number
- Displays with 📉 Deduction icon
- Links back to the order for reference

### 3. Adjustments
When you **edit or delete** stock entries:
- An **adjustment** transaction is logged
- Shows: what changed and by how much
- Displays with ⚙️ Adjustment icon
- Helps track manual corrections

## Transaction History View

### Accessing Transaction History
1. Go to **Inventory Management**
2. Click the **"Transaction History"** button at the top
3. View all stock movements in chronological order

### Information Displayed
- **Date & Time** - When the transaction occurred
- **Ingredient** - Which ingredient was affected
- **Type** - Purchase, Deduction, or Adjustment
- **Change** - Amount added (+) or removed (-)
- **Before** - Stock level before the transaction
- **After** - Stock level after the transaction
- **Reference** - Order number or stock entry reference

### Features
- **Pagination** - Shows 10 transactions at a time
- **See More** - Load 10 more transactions at a time
- **Auto-refresh** - Updates when you switch views

## Testing the Feature

### Test 1: Add Stock
1. Go to Inventory Management
2. Click **"Add Stock"**
3. Fill in the form and submit
4. Switch to **"Transaction History"**
5. You should see a new **📈 Purchase** entry

### Test 2: Complete an Order
1. Go to Order Management
2. Create a new order with menu items
3. Change status to **Preparing**, then **Completed**
4. Go back to Inventory Management > Transaction History
5. You should see **📉 Deduction** entries for each ingredient used

### Test 3: Edit/Delete Stock
1. Go to Inventory Management
2. Click on any ingredient to view details
3. Edit or delete a stock entry
4. Check Transaction History
5. You should see an **⚙️ Adjustment** entry

## Troubleshooting

### Transactions Not Showing Up
1. Verify the SQL script ran successfully without errors
2. Check Supabase logs for any trigger errors
3. Ensure Row Level Security (RLS) is not blocking access:
   ```sql
   -- Disable RLS temporarily for testing
   ALTER TABLE stock_transactions DISABLE ROW LEVEL SECURITY;
   ```

### Old Data Not in History
- The transaction history only tracks changes **after** the system is installed
- Historical data from before installation won't appear
- This is normal and expected behavior

### Performance Issues
If you have thousands of transactions:
1. The pagination (10 at a time) helps with performance
2. You can adjust the limit in the code if needed
3. Consider archiving very old transactions

## Database Structure

### stock_transactions Table Schema
```
transaction_id       SERIAL PRIMARY KEY
ingredient_id        INTEGER (links to ingredients)
transaction_type     VARCHAR(20) - 'purchase', 'deduction', or 'adjustment'
quantity_change      DECIMAL(10, 3) - positive for additions, negative for removals
quantity_before      DECIMAL(10, 3) - stock level before
quantity_after       DECIMAL(10, 3) - stock level after
unit_of_measurement  VARCHAR(20) - kg, L, pieces, etc.
reference_type       VARCHAR(50) - type of reference
reference_id         INTEGER - stock_id or order_id
order_number         VARCHAR(20) - for order references
notes                TEXT - additional information
created_at           TIMESTAMP - when it happened
```

## Next Steps

After installation:
1. ✅ Run the SQL migration
2. ✅ Test by adding stock
3. ✅ Test by completing an order
4. ✅ Verify transaction history displays correctly
5. ✅ Share with your team how to use it

## Support

If you encounter any issues:
1. Check the Supabase SQL Editor for error messages
2. Review the trigger functions in the SQL file
3. Test with a simple stock addition first
4. Ensure your database permissions are correct

---

**Note**: This feature automatically tracks all stock movements from the moment it's installed. Past transactions (before installation) will not appear in the history.
