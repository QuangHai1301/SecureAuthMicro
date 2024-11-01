const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors')
const path = require('path');
const router = require('./routes/router');
const PORT = process.env.PORT || 19006;
app.use(express.json());
app.use(cors());

app.use(express.static('public'));

app.use('/api',router);



app.listen(PORT , () => {
  console.log('Server started on port ' + PORT);
});
