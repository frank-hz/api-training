const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
const cors = require('cors');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extented: true}));
app.set('views', path.join(__dirname, 'views'));

dotenv.config();
app.use(express.json());
app.use(cors());
// app.use(express.static('public'));


app.use('/api/users', userRoutes);

app.use('/', (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'index.html'));
    res.render('index');
})

const port = process.env.PORT || 1000;
app.listen(port, function(){
    console.log(`Server live on ${port}`);
})