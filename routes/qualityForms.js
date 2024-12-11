const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const filename = path.join(__dirname, '../public/assets/data/ncr_quality_form.json');

// Read JSON file utility function
const readJsonFile = (file) => {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
};

// Write JSON file utility function
const writeJsonFile = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

// Routes

// GET all Quality forms
router.get('/', (req, res) => {
    try {
        const data = readJsonFile(filename);
        res.json(data);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
});

// Get Quality form by ID
router.get('/:qualFormID', (req, res) => {
    const qualFormID = parseInt(req.params.qualFormID);

    try {
        const existingData = readJsonFile(filename);
        const form = existingData.find(item => item.qualFormID === qualFormID);

        if (!form) {
            return res.status(404).json({ status: 'error', message: 'Quality form not found' });
        }

        res.json(form);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
});

// POST new Quality form (without image upload)
router.post('/', (req, res) => {
    try {
        // Parse fields from req.body (no image)
        let newQualityForm = {
            qualFormID: req.body.qualFormID, // Auto-generate or manage ID elsewhere
            qualItemDesc: req.body.qualItemDesc || '',
            qualIssueDesc: req.body.qualIssueDesc || '',
            qualItemID: Number(req.body.qualItemID) || null,
            qualSalesOrderNo: Number(req.body.qualSalesOrderNo) || '',
            qualQtyReceived: Number(req.body.qualQtyReceived) || '',
            qualQtyDefective: Number(req.body.qualQtyDefective) || '',
            qualItemNonConforming: Number(req.body.qualItemNonConforming) || null,
            qualRepID: Number(req.body.qualRepID),
            qualDate: req.body.qualDate || '',
        };

        // Read existing JSON data
        const existingData = readJsonFile(filename);
        existingData.push(newQualityForm);

        // Save updated data back to the file
        writeJsonFile(filename, existingData);

        res.status(201).json({ message: 'Quality form created successfully', data: newQualityForm });
    } catch (error) {
        console.error('Error creating quality form:', error);
        res.status(500).json({ status: 'error', message: 'Failed to save quality form' });
    }
});

// PUT (update) Quality form (without image upload)
router.put('/:qualFormID', (req, res) => {
    const qualFormID = parseInt(req.params.qualFormID);

    try {
        // Extract and validate data from request
        const updatedFields = {
            qualItemDesc: req.body.qualItemDesc || '',
            qualIssueDesc: req.body.qualIssueDesc || '',
            qualItemID: Number(req.body.qualItemID) || null,
            qualSalesOrderNo: Number(req.body.qualSalesOrderNo) || null,
            qualQtyReceived: Number(req.body.qualQtyReceived) || null,
            qualQtyDefective: Number(req.body.qualQtyDefective) || null,
            qualItemNonConforming: Number(req.body.qualItemNonConforming) || null,
            qualRepID: Number(req.body.qualRepID) || null,
            qualDate: req.body.qualDate || ''
        };

        // Read existing JSON data
        const existingData = readJsonFile(filename);
        const index = existingData.findIndex(item => item.qualFormID === qualFormID);

        if (index === -1) {
            return res.status(404).json({ status: 'error', message: 'Quality form not found' });
        }

        // Update the existing data
        existingData[index] = { ...existingData[index], ...updatedFields };

        // Save updated data back to the file
        writeJsonFile(filename, existingData);

        res.json({ status: 'success', message: 'Quality form updated successfully' });
    } catch (error) {
        console.error('Error updating quality form:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update quality form' });
    }
});


// DELETE a Quality form by qualFormID
router.delete('/:qualFormID', (req, res) => {
    const qualFormID = req.params.qualFormID;

    try {
        const existingData = readJsonFile(filename);
        const updatedData = existingData.filter(item => item.qualFormID !== parseInt(qualFormID));

        if (updatedData.length === existingData.length) {
            return res.status(404).json({ status: 'error', message: 'Quality form not found' });
        }

        writeJsonFile(filename, updatedData);
        res.json({ status: 'success', message: 'Quality form deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

module.exports = router;
