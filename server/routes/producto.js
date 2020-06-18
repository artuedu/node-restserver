const express = require('express');
const Producto = require('../models/producto');
const { verificaToken } = require('../middlewares/autenticacion');
const producto = require('../models/producto');

let app = express();

//Index de productos
app.get('/producto', (req, res) => {

    let desde = Number(req.query.desde || 0);
    let limite = Number(req.query.limite || 5);

    Producto.find({ disponible: true })
        .limit(limite)
        .skip(desde)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            } else {
                Producto.countDocuments({ disponible: true }, (err, conteo) => {
                    res.json({
                        ok: true,
                        productos,
                        cuantos: conteo
                    });
                });
            }
        });

});

//Obtener producto por ID
app.get('/producto/:id', (req, res) => {

    let id = req.params.id;

    Producto.findById(id, 'nombre precioUni descripcion', { disponible: true })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            } else if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El producto no existe'
                    }
                });
            } else {
                res.json({
                    ok: true,
                    producto: productoDB
                });
            }
        });

});

//Buscar productos
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            } else {
                return res.json({
                    ok: true,
                    productos
                });
            }
        });

});

//Crear un producto
app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        } else {
            res.status(201).json({
                ok: true,
                producto: productoDB
            });
        }
    });

});

//Actualizar un producto
app.put('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El produtco no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            } else {
                res.json({
                    ok: true,
                    producto: productoGuardado
                });
            }
        });
    });

});

//Eliminar un producto
app.delete('/producto/:id', (req, res) => {

    //Eliminación logica
    let id = req.params.id;
    let body = {
        disponible: false
    };
    Producto.findByIdAndUpdate(id, body, { new: true, useFindAndModify: false }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        } else {
            res.json({
                ok: true,
                producto: {
                    message: 'Produto eliminado'
                }
            });
        }
    });

});

module.exports = app;