import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/mongo.js'; // Assuming your mongo.js is in config folder

// Import all routes
import userRoutes from './router/user.router.js'; // Your existing user routes
import customerRoutes from './router/customerRoutes.js';
import itemRoutes from './router/itemRoutes.js';
import orderRoutes from './router/orderRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Health check route
app.get('/', (req, res) => {
    res.json({ 
        message: 'API is running',
        endpoints: {
            users: '/api/users',
            customers: '/api/customers',
            items: '/api/items',
            orders: '/api/orders'
        }
    });
});

// API routes with versioning
app.use('/api/users', userRoutes); // Your existing user routes
app.use('/api/customers', customerRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});