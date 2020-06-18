//Puerto
process.env.PORT = process.env.PORT || 3000;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Base de datos
let urlDB;
if (process.env.NODE_ENV == 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

//Vencimiento de token
//48 horas
process.env.CADUCIDAD_TOKEN = '48h';

//SEED de autentucación
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

//Google client ID
process.env.CLIENT_ID = process.env.CLIENT_ID || '1018895008459-lpbus6b186keitvr2khpbifs5ojlova3.apps.googleusercontent.com';