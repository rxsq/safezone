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
    return ids.length > 0 ? Math.max(...ids) + 1 : 1; 
};

// GET all suppliers
router.get('/', (req, res, next) => {
    try {
        const data = readJsonFile(filename); 
        if (Object.keys(req.query).length === 0) {
            return res.json({
                status: 'success',
                totalRecords: data.length,
                items: data, 
            });
        }

        res.locals.data = data; 
        paginatedResults(data)(req, res, next);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
}, (req, res) => {
    const data = res.locals.data; 
    const totalRecords = data.length; 
    const limit = parseInt(req.query.limit) || 10;
    const totalPages = Math.ceil(totalRecords / limit); 
    const currentPage = parseInt(req.query.page) || 1; 

    res.json({
        status: 'success',
        totalRecords: totalRecords,
        totalPages: totalPages,
        currentPage: currentPage,
        items: res.paginatedResults.results, 
        next: res.paginatedResults.next,
        previous: res.paginatedResults.previous
    });
});

// GET a supplier by supID
router.get('/:supID', (req, res) => {
    const value = Number(req.params.supID); 

    if (isNaN(value)) {
        return res.status(400).json({ status: 'error', message: 'Supplier ID not provided or invalid' });
    }

    try {
        const existingData = readJsonFile(filename);
        const supplier = existingData.find(item => item.supID === value);

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
        newSupplier.supID = getNextSupID(existingData); 
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
    const value = Number(req.params.supID); 

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
