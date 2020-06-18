const express = require('express');
const Categoria = require('../models/categoria');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

//Mostrar todas las categorias
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            } else {
                res.json({
                    ok: true,
                    categorias
                });
            }
        });

});

//Mostrar categoria por id
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        } else {
            res.json({
                ok: true,
                categoria: categoriaDB
            });
        }
    });

});

//Crear nueva categoria
app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        } else {
            res.status(201).json({
                ok: true,
                categoria: categoriaDB
            });
        }
    });

});

//Actualizar descripcion de categoria
app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true, useFindAndModify: false }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else {
            res.json({
                ok: true,
                categoria: categoriaDB
            });
        }
    });

});

//Eliminacion fisica de categoria solo por administrador
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;

    // Eliminación fisica
    Categoria.findByIdAndRemove(id, { useFindAndModify: false }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: 'Categoria no encontrada'
            });
        } else {
            res.json({
                ok: true,
                err: {
                    message: 'Categoria borrada'
                }
            });
        }
    });

});


module.exports = app;