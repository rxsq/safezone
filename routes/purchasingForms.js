const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Path to the JSON file
const filename = path.join(__dirname, '../public/assets/data/ncr_purchasing_form.json');

// Read JSON file utility function
const readJsonFile = (file) => {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
};

// Write JSON file utility function
const writeJsonFile = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

// GET all Purchasing forms
router.get('/', (req, res) => {
    try {
        const data = readJsonFile(filename);
        res.json(data);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
});

// POST a new Purchasing form
router.post('/', (req, res) => {
    const newPurchasingForm = req.body;

    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Error reading data file' });

        let purchasingForms = JSON.parse(data);
        purchasingForms.push(newPurchasingForm); // Add new form to array

        fs.writeFile(filename, JSON.stringify(purchasingForms, null, 2), (err) => {
            if (err) return res.status(500).json({ message: 'Error writing to data file' });
            res.status(201).json({ message: 'Purchasing form created successfully' });
        });
    });
});

// PUT (Update) a Purchasing form by purFormID
router.put('/:purFormID', (req, res) => {
    const purFormID = req.params.purFormID;
    const updatedData = req.body;

    try {
        const existingData = readJsonFile(filename);
        const index = existingData.findIndex(item => item.purFormID === parseInt(purFormID));

        if (index === -1) {
            return res.status(404).json({ status: 'error', message: 'Purchasing form not found' });
        }

        existingData[index] = { ...existingData[index], ...updatedData };
        writeJsonFile(filename, existingData);
        res.json({ status: 'success', message: 'Purchasing form updated successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

// DELETE a Purchasing form by purFormID
router.delete('/:purFormID', (req, res) => {
    const purFormID = req.params.purFormID;

    try {
        const existingData = readJsonFile(filename);
        const updatedData = existingData.filter(item => item.purFormID !== parseInt(purFormID));

        if (updatedData.length === existingData.length) {
            return res.status(404).json({ status: 'error', message: 'Purchasing form not found' });
        }

        writeJsonFile(filename, updatedData);
        res.json({ status: 'success', message: 'Purchasing form deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

module.exports = router;
