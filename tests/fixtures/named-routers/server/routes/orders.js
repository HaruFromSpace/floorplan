const express = require('express');
const orderRoutes = express.Router();
orderRoutes.get('/', (req, res) => res.json([]));
orderRoutes.delete('/:id', (req, res) => res.sendStatus(204));
module.exports = orderRoutes;
