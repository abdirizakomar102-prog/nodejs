# CRUD Operations with Node.js, Express & MongoDB

A simple Node.js application with CRUD operations for Customer, Order, and Item management.

## 📦 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Postman (for API testing)

## 🚀 Installation

1. **Clone or download the project**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create `.env` file** in the root directory:
   ```
   MONGO_URI=mongodb://localhost:27017/crud-app
   JWT_SECRET=your-secret-key-here
   PORT=3000
   ```
4. **Start MongoDB** (if using local):
   ```bash
   # Windows
   mongod

   # Mac/Linux
   sudo systemctl start mongod
   ```

## ▶️ Running the Application

```bash
# Development mode
npm run dev

# Or directly
node server.js
```

The server will start at: `http://localhost:3000`

## 📊 Database Schemas

### 1. **User** (Authentication)
- `name`, `email`, `password`, `role` (admin/user)

### 2. **Customer**
- `name`, `email`, `phone`, `address`
- Linked to Orders

### 3. **Item** (Products)
- `name`, `description`, `price`, `category`, `stockQuantity`

### 4. **Order**
- `customer` (reference), `items` (array), `totalAmount`, `status`
- Links Customers and Items

## 🔐 Authentication

### Create Admin User:
```bash
POST /odmapi/muser
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

### Login:
```bash
POST /odmapi/mlogin
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
Returns: `{ "success": true, "token": "jwt-token-here" }`

## 📋 API Endpoints

### **User Authentication**
- `POST /odmapi/muser` - Create user (admin only)
- `POST /odmapi/mlogin` - Login
- `GET /odmapi/musers` - Get all users (admin only)
- `GET /odmapi/muser/:id` - Get user by ID (admin only)

### **Customer Management** (`/api/customers`)
- `POST /` - Create customer (admin only)
- `GET /` - Get all customers (admin only)
- `GET /:id` - Get customer by ID (admin only)
- `PUT /:id` - Update customer (admin only)
- `DELETE /:id` - Delete customer (admin only)
- `GET /:id/orders` - Get customer's orders (admin only)

### **Item Management** (`/api/items`)
- `POST /` - Create item (admin only)
- `GET /` - Get all items (admin only)
- `GET /:id` - Get item by ID (admin only)
- `PUT /:id` - Update item (admin only)
- `DELETE /:id` - Delete item (admin only)
- `PATCH /:id/stock` - Update item stock (admin only)

### **Order Management** (`/api/orders`)
- `POST /` - Create order (admin only)
- `GET /` - Get all orders (admin only)
- `GET /:id` - Get order by ID (admin only)
- `PATCH /:id/status` - Update order status (admin only)
- `PATCH /:id/cancel` - Cancel order (admin only)
- `POST /:id/items` - Add item to order (admin only)

## 🧪 Testing with Postman

### Step 1: Create Admin User
```
POST http://localhost:3000/odmapi/muser
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

### Step 2: Login & Get Token
```
POST http://localhost:3000/odmapi/mlogin
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
Save the `token` from response.

### Step 3: Create Customer
```
POST http://localhost:3000/api/customers
Headers: Authorization: Bearer YOUR_TOKEN
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```

### Step 4: Create Item
```
POST http://localhost:3000/api/items
Headers: Authorization: Bearer YOUR_TOKEN
{
  "name": "Laptop",
  "price": 999.99,
  "category": "Electronics",
  "stockQuantity": 50
}
```

### Step 5: Create Order
```
POST http://localhost:3000/api/orders
Headers: Authorization: Bearer YOUR_TOKEN
{
  "customerId": "PASTE_CUSTOMER_ID",
  "items": [
    {
      "itemId": "PASTE_ITEM_ID",
      "quantity": 2
    }
  ]
}
```

## 🗂️ Project Structure

```
project/
├── config/
│   └── mongo.js           # MongoDB connection
├── controllers/
│   ├── userController.js   # User/auth controllers
│   ├── customerController.js
│   ├── itemController.js
│   └── orderController.js
├── middlewares/
│   └── auth.middlewares.js # Authentication middleware
├── models/
│   ├── userModel.js       # Mongoose schemas
│   ├── customerModel.js
│   ├── itemModel.js
│   └── orderModel.js
├── routes/
│   ├── userRoutes.js      # Route definitions
│   ├── customerRoutes.js
│   ├── itemRoutes.js
│   └── orderRoutes.js
├── server.js              # Main server file
├── .env                   # Environment variables
└── package.json
```

## 🔧 Key Features

- ✅ JWT Authentication
- ✅ Role-based Authorization (Admin/User)
- ✅ MongoDB with Mongoose ODM
- ✅ Complete CRUD operations
- ✅ Relationships between entities
- ✅ Error handling
- ✅ Pagination & filtering

## ⚠️ Troubleshooting

1. **MongoDB connection error**: Check if MongoDB is running
2. **401 Unauthorized**: Include valid JWT token in headers
3. **403 Forbidden**: User doesn't have admin role
4. **Validation errors**: Check request body format
5. **500 errors**: Check server console for details

## 📝 Notes

- All CRUD routes require admin role
- Use MongoDB Atlas for cloud database
- Change JWT_SECRET in production
- Add CORS for frontend integration

## 👤 Author

Sh. Abdirisak Sh. Omar

## 📄 License

MIT