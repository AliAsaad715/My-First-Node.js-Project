const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./helpers/error_handler');
const auth = require('./middlewares/auth');
require('dotenv/config');

app.use(cors());// Allow all origins 

//Middlewares
app.use(bodyParser.json());// parse application/json
app.use(morgan('tiny'));// log request in console
app.use(auth);
app.use(errorHandler);

//Routers
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');

const api = process.env.API_URL;

app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

//Database
mongoose.connect(process.env.CONNECTION_STRING)
    .then(() => {
        console.log("Database Connection is ready...");
    })
    .catch((error) => {
        console.log(error);
    });

//Server
app.listen(3000, () => {
    console.log('Server is running http://localhost:3000');
})