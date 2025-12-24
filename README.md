# 🍽️ Karindirya Restaurant Management System

A complete restaurant management system built with React and Supabase, featuring 10 famous Filipino dishes. Perfect for managing a Filipino eatery (karindirya).

## 📋 Features

### 🎯 Key Components

1. **Dashboard**
   - Overview of daily sales and orders
   - Today's revenue tracking
   - Low stock alerts
   - Quick action buttons

2. **Menu Management**
   - View all menu items with images
   - Filter by category (All, Main Course, Appetizer)
   - Toggle item availability
   - Display pricing and preparation time

3. **Order Management**
   - Create new orders with customer details
   - Select multiple menu items
   - Real-time order tracking (Pending → Preparing → Completed)
   - View order history
   - Multiple payment methods (Cash, GCash, Card)

4. **Inventory Management**
   - Track ingredient stock levels
   - Add new stock entries with container details
   - Automatic calculation of unit prices and totals
   - Visual stock status indicators (In Stock, Low Stock, Out of Stock)
   - View average unit prices

## 🍜 Filipino Dishes Included

1. **Adobo** - Classic Filipino braised pork/chicken
2. **Sinigang na Baboy** - Sour pork soup with tamarind
3. **Kare-Kare** - Peanut-based oxtail stew
4. **Lechon Kawali** - Crispy deep-fried pork belly
5. **Sisig** - Sizzling chopped pork
6. **Pancit Canton** - Stir-fried noodles
7. **Lumpia Shanghai** - Filipino spring rolls
8. **Chicken Tinola** - Ginger chicken soup
9. **Pinakbet** - Vegetable medley with shrimp paste
10. **Bicol Express** - Spicy pork in coconut milk

## 🗄️ Database Schema

The system uses an enhanced database structure with:

- **categories** - Ingredient categories
- **ingredients** - All ingredients with measurements
- **stock_ingredients** - Enhanced inventory tracking with container details
- **menu_items** - Menu items with images and pricing
- **recipes** - Ingredient requirements for each dish
- **orders** - Order headers
- **order_items** - Individual items in orders

### Key Features of Schema:
- Generated columns for automatic calculations (total_quantity, total_price, unit_price)
- Database views for current stock levels and menu cost analysis
- Triggers for automatic order total updates
- Functions for ingredient availability checking
- Automatic ingredient deduction on order completion

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js installed
- Supabase account (free tier works great)

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase-schema.sql` to create tables
3. Run `supabase-seed-data.sql` to populate with Filipino dishes and sample data
4. Get your project URL and anon key from Project Settings → API

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Application
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 📊 Database Views & Functions

### Views
- **current_stock_levels** - Real-time stock quantities and average prices
- **menu_cost_analysis** - Menu items with cost and profit margins

### Functions
- **check_ingredient_availability()** - Check if ingredients are sufficient for orders
- **deduct_ingredients_from_stock()** - Auto-deduct ingredients when orders complete
- **update_order_total()** - Auto-calculate order totals

## 💡 Usage Tips

### Adding Stock
1. Navigate to Inventory
2. Click "+ Add Stock"
3. Fill in:
   - Ingredient
   - Container type (bottle, bag, kg, etc.)
   - Number of containers
   - Container size
   - Price per container
4. System automatically calculates unit price and totals

### Creating Orders
1. Navigate to Orders
2. Click "+ New Order"
3. Enter customer name (optional)
4. Select payment method
5. Click menu items to add to order
6. Adjust quantities using +/- buttons
7. Submit order

### Managing Menu
1. Navigate to Menu
2. Filter by category
3. Toggle availability for items
4. View pricing and preparation times

## 🎨 Tech Stack

- **Frontend**: React 19 + Vite
- **Database**: Supabase (PostgreSQL)
- **Routing**: React Router DOM
- **Styling**: Custom CSS with responsive design

## 📁 Project Structure

```
kark-karindirya/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx/css
│   │   ├── MenuList.jsx/css
│   │   ├── OrderManagement.jsx/css
│   │   ├── InventoryManagement.jsx/css
│   │   └── Navigation.jsx/css
│   ├── lib/
│   │   └── supabase.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── supabase-schema.sql
├── supabase-seed-data.sql
├── .env.example
└── package.json
```

## 🔐 Security Notes

- Never commit your `.env` file
- Keep your Supabase keys secure
- Use Row Level Security (RLS) in production
- Implement proper authentication for production use

## 🚀 Future Enhancements

- User authentication and roles
- Sales reports and analytics
- Recipe cost calculator
- Supplier management
- Table management for dine-in
- QR code ordering
- Kitchen display system
- Mobile app version

## 📝 License

This project is open source and available for educational purposes.

## 🙏 Credits

Built for Filipino restaurant owners and operators to manage their karindirya efficiently!

---

**Mabuhay!** 🇵🇭
