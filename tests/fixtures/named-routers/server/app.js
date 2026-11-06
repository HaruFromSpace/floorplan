const express = require('express');
const app = express();
app.use('/shop/orders', require('./routes/orders'));
module.exports = app;
