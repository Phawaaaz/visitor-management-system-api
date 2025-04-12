const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Define Routes
app.use('/api/visitors', require('./routes/visitor.js'));
app.use('/api/admins', require('./routes/admin.js'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/super-admin', require('./routes/superAdmin'));
app.get("/", (req, res) => {
  res.send("Welcome to the Visitor Management System API!");
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

module.exports = app;