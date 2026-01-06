import express from 'express';
import dotenv from 'dotenv';
import db from './config/db.js';
import router from './router/book.route.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use('/api', router);
db;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});