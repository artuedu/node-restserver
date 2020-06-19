const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo.'
            }
        });
    }

    //Validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', ')
            }
        });
    }

    // Archivo a subir
    let archivo = req.files.archivo;
    //Nombre del archivo
    let nombreCortado = archivo.name.split('.');
    //Extension de archivo
    let extension = nombreCortado[nombreCortado.length - 1];

    //Extensiones permitidas
    let extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    //Validacion de extension
    if (extencionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extencionesValidas.join(', '),
                ext: extension
            }
        });
    }

    //Asignacion de nombre de archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        //Imagen cargada
        //Validacion de tipo para actualizacion de registro
        switch (tipo) {
            case 'usuarios':
                imagenUsuario(id, res, nombreArchivo);
                break;
            case 'productos':
                imagenProducto(id, res, nombreArchivo);
                break;
            default:
                // code block
        }

    });
});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        } else {

            borraArchivo(usuarioDB.img, 'usuarios');

            usuarioDB.img = nombreArchivo;
            usuarioDB.save((err, usuarioGuardado) => {
                res.json({
                    ok: true,
                    usuario: usuarioGuardado,
                    img: nombreArchivo
                });
            });
        }
    });

}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El prodcuto no existe'
                }
            });
        } else {

            borraArchivo(productoDB.img, 'productos');

            productoDB.img = nombreArchivo;
            productoDB.save((err, productoGuardado) => {
                res.json({
                    ok: true,
                    producto: productoGuardado,
                    img: nombreArchivo
                });
            });
        }
    });

}

function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }

}

module.exports = app;