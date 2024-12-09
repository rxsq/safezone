const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Path to the JSON file
const filename = path.join(__dirname, '../public/assets/data/products.json');

// Read JSON file utility function
const readJsonFile = (file) => {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
};

// Write JSON file utility function
const writeJsonFile = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

function paginatedResults(model){
    return (req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page -1) * limit;
        const endIndex = page * limit;

        const results = {}

        if(endIndex < model.length){
            results.next = {
                page: page + 1,
                limit: limit
            }
        }

        if(startIndex > 0){
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }

        results.results = model.slice(startIndex, endIndex);

        res.paginatedResults = results;
        next();
    }
}

// GET all products
router.get('/', (req, res, next) => {
    try {
        const data = readJsonFile(filename); // Read the JSON file

        // Check if there are no query parameters
        if (Object.keys(req.query).length === 0) {
            // Return all data if no query parameters are provided
            return res.json({
                status: 'success',
                totalRecords: data.length,
                items: data, // All items returned without pagination
            });
        }

        // Otherwise, apply pagination
        res.locals.data = data; // Store the data for pagination
        paginatedResults(data)(req, res, next); // Invoke paginated results middleware
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
}, (req, res) => {
    // This middleware handles paginated results
    const data = res.locals.data; // Get the original data
    const totalRecords = data.length; // Total records count
    const limit = parseInt(req.query.limit) || 10; // Default limit of 10
    const totalPages = Math.ceil(totalRecords / limit); // Total pages based on limit
    const currentPage = parseInt(req.query.page) || 1; // Current page, default 1

    res.json({
        status: 'success',
        totalRecords: totalRecords,
        totalPages: totalPages,
        currentPage: currentPage,
        items: res.paginatedResults.results, // Paginated results
        next: res.paginatedResults.next, // Next page info
        previous: res.paginatedResults.previous // Previous page info
    });
});


// GET a product by prodID
router.get('/:prodID', (req, res) => {
    const value = Number(req.params.prodID); // Convert to number

    if (isNaN(value)) {
        return res.status(400).json({ status: 'error', message: 'Product ID not provided or invalid' });
    }

    try {
        const existingData = readJsonFile(filename);
        const product = existingData.find(item => item.prodID === value); // Compare as a number

        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
});

// POST a new product
router.post('/', (req, res) => {
    const newData = req.body; // Assuming data comes in the body

    // Basic validation for required fields
    if (!newData.prodName || !newData.prodCategory || !newData.supID) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    try {
        const existingData = readJsonFile(filename);
        
        // Generate a new unique prodID
        const newProdID = existingData.length ? Math.max(...existingData.map(item => item.prodID)) + 1 : 1;

        // Assign the new prodID
        newData.prodID = newProdID;

        existingData.push(newData); // Add new data
        writeJsonFile(filename, existingData);
        res.status(201).json({ status: 'success', message: 'Product added successfully', productId: newProdID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

// DELETE a product by prodID
router.delete('/:prodID', (req, res) => {
    const value = Number(req.params.prodID); // Convert to number

    if (isNaN(value)) {
        return res.status(400).json({ status: 'error', message: 'Product ID not provided or invalid' });
    }

    try {
        const existingData = readJsonFile(filename);
        const updatedData = existingData.filter(item => item.prodID !== value);

        // Only write if there was a change
        if (existingData.length === updatedData.length) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }

        writeJsonFile(filename, updatedData);
        res.json({ status: 'success', message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

// PUT (update) a product by prodID
router.put('/:prodID', (req, res) => {
    const value = Number(req.params.prodID);
    const updatedProduct = req.body;

    try {
        const existingData = readJsonFile(filename);
        const index = existingData.findIndex(item => item.prodID === value);

        if (index === -1) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }

        // Merge existing product with updated data
        existingData[index] = { ...existingData[index], ...updatedProduct };
        writeJsonFile(filename, existingData);
        res.json({ status: 'success', message: 'Product updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to update JSON file' });
    }
});

// Export the router
module.exports = router;
