const express =require('express');
const routes = require('./routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// cors permite que te conectes a otro servidor

const cors =require('cors')

//conectar mongoose
mongoose.connect('mongodb+srv://nicoechiburu:del1al11@cluster0.sv6mzwe.mongodb.net/estfinal',
console.log('Db on')
)

// crear el servidor
const app = express();

// habilitar bodyparser
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Habilitar cors
app.use(cors());

// Rutas de la app
app.use('/', routes());

// carpeta publica
app.use(express.static('uploads'));


// puerto

const puerto = 2000;
app.listen(puerto,console.log('servidor :', puerto));