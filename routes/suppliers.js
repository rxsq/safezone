const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Path to the JSON file
const filename = path.join(__dirname, '../public/assets/data/suppliers.json');

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
    return(req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page -1) * limit;
        const endIndex = page * limit;

        const results = {};

        if(endIndex < model.lengt){
            results.next = {
                page: page + 1,
                limit: limit
            }
        }

        if(startIndex > 0){
            results.previous = {
                page: page -1,
                limit: limit
            }
        }

        results.results = model.slice(startIndex, endIndex);

        res.paginatedResults = results;
        next();
    }
}
// Utility function to get the next supID
const getNextSupID = (existingData) => {
    const ids = existingData.map(item => item.supID);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1; // Start from 1 if there are no suppliers
};

// GET all suppliers
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

// GET a supplier by supID
router.get('/:supID', (req, res) => {
    const value = Number(req.params.supID); // Convert to number

    if (isNaN(value)) {
        return res.status(400).json({ status: 'error', message: 'Supplier ID not provided or invalid' });
    }

    try {
        const existingData = readJsonFile(filename);
        const supplier = existingData.find(item => item.supID === value); // Compare as a number

        if (!supplier) {
            return res.status(404).json({ status: 'error', message: 'Supplier not found' });
        }

        res.json(supplier);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
});

// POST a new supplier
router.post('/', (req, res) => {
    const newSupplier = req.body;

    try {
        const existingData = readJsonFile(filename);
        newSupplier.supID = getNextSupID(existingData); // Assign the next supID
        existingData.push(newSupplier);
        writeJsonFile(filename, existingData);
        res.status(201).json({ status: 'success', message: 'Supplier added successfully', supplier: newSupplier });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

// DELETE a supplier by supID
router.delete('/:supID', (req, res) => {
    const value = Number(req.params.supID); // Convert to number

    if (isNaN(value)) {
        return res.status(400).json({ status: 'error', message: 'Supplier ID not provided or invalid' });
    }

    try {
        const existingData = readJsonFile(filename);
        const updatedData = existingData.filter(item => item.supID !== value);
        writeJsonFile(filename, updatedData);
        res.json({ status: 'success', message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

// PUT (update) a supplier by supID
router.put('/:supID', (req, res) => {
    const value = Number(req.params.supID);
    const updatedSupplier = req.body;

    try {
        const existingData = readJsonFile(filename);
        const index = existingData.findIndex(item => item.supID === value);

        if (index === -1) {
            return res.status(404).json({ status: 'error', message: 'Supplier not found' });
        }

        existingData[index] = { ...existingData[index], ...updatedSupplier };
        writeJsonFile(filename, existingData);
        res.json({ status: 'success', message: 'Supplier updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to update JSON file' });
    }
});

// Export the router
module.exports = router;
