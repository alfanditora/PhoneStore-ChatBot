const express = require('express');
const Product = require('../models/product');
const sequelize = require('../config/db');
const router = express.Router();
const roleAuthorization = require('../middleware/role');;

// Create Product (protected route)
router.post('/create', roleAuthorization(['admin']), async (req, res) => {
    const {
        name,
        brand,
        display,
        chipset,
        ram,
        storage,
        camera,
        video,
        battery,
        OS,
        price,
        stock,
        image
    } = req.body;

    try {
        const existingProduct = await Product.findOne({ where: { name } });
        if (existingProduct) {
            return res.status(400).json({ error: 'Product name must be unique' });
        }

        const newProduct = await Product.create({
            name,
            brand,
            display,
            chipset,
            ram,
            storage,
            camera,
            video,
            battery,
            OS,
            price,
            stock,
            image
        });
        return res.status(201).json({ message: 'Product created', product: newProduct });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error creating product' });
    }
});

// Get All Products (protected route)
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [['id', 'ASC']]
        });
        return res.status(200).json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error fetching products' });
    }
});

// Get a Single Product (protected route)
router.get('/:productName', async (req, res) => {
    const { productName } = req.params;
    try {
        const product = await Product.findOne({
            where: { name: productName }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        return res.status(200).json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error fetching product' });
    }
});

// Update Product (protected route)
router.put('/:productName', roleAuthorization(['admin']), async (req, res) => {
    const { productName } = req.params;
    const {
        name,
        brand,
        display,
        chipset,
        ram,
        storage,
        camera,
        video,
        battery,
        OS,
        price,
        stock,
        image
    } = req.body;

    try {
        const product = await Product.findOne({
            where: { name: productName }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        product.name = name || product.name;
        product.brand = brand || product.brand;
        product.display = display || product.display;
        product.chipset = chipset || product.chipset;
        product.ram = ram || product.ram;
        product.storage = storage || product.storage;
        product.camera = camera || product.camera;
        product.video = video || product.video;
        product.battery = battery || product.battery;
        product.OS = OS || product.OS;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        product.image = image || product.image;

        await product.save();
        return res.status(200).json({ message: 'Product updated', product });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error updating product' });
    }
});

// Delete Product (protected route)
router.delete('/:productName', roleAuthorization(['admin']), async (req, res) => {
    const { productName } = req.params;
    try {
        const product = await Product.findOne({
            where: { name: productName }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        await product.destroy();

        // Resetting the autoincrement value for the "id" column
        await sequelize.query(`
            SELECT setval(pg_get_serial_sequence('products', 'id'), coalesce(max(id), 1) + 1, false) FROM products;
        `);

        return res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error deleting product' });
    }
});

// Get Products by Brand (protected route)
router.get('/brand/:brand', async (req, res) => {
    const { brand } = req.params;
    try {
        const products = await Product.findAll({
            where: { brand },
            order: [['id', 'ASC']]
        });
        if (products.length === 0) {
            return res.status(404).json({ error: 'No products found for this brand' });
        }
        return res.status(200).json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error fetching products by brand' });
    }
});

module.exports = router;
