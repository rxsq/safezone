const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); 

const router = express.Router();

const uploadDir = path.join(__dirname, '../public/assets/data/uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Initialize multer with storage configuration
const upload = multer({ storage: storage });

// Path to the JSON file
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

// POST a new Quality form (with file upload)
router.post('/', upload.single('file'), (req, res) => {
    let newQualityForm = JSON.parse(req.body.qualityFormData);

    if (req.file) {
        newQualityForm.filePath = `..public/assets/data/uploads/${req.file.filename}`;
    }

    newQualityForm = {
        qualFormID: newQualityForm.qualFormID || null,
        qualFormProcessApplicable: newQualityForm.qualFormProcessApplicable || '',
        qualItemDesc: newQualityForm.qualItemDesc || '',
        qualIssueDesc: newQualityForm.qualIssueDesc || '',
        qualItemID: newQualityForm.qualItemID || null,
        qualImageFileName: req.file.filename || null,
        qualSalesOrderNo: newQualityForm.qualSalesOrderNo || 0,
        qualQtyReceived: newQualityForm.qualQtyReceived || 0,
        qualQtyDefective: newQualityForm.qualQtyDefective || 0,
        qualItemNonConforming: newQualityForm.qualItemNonConforming || 0,
        qualRepID: newQualityForm.qualRepID || 1, 
        qualDate: newQualityForm.qualDate || ''
    };

    // Read the existing data file
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Error reading data file' });

        let qualityForms = JSON.parse(data);
        qualityForms.push(newQualityForm); 

        // Write the updated data back to the file
        fs.writeFile(filename, JSON.stringify(qualityForms, null, 2), (err) => {
            if (err) return res.status(500).json({ message: 'Error writing to data file' });
            res.status(201).json({ message: 'Quality form created successfully' });
        });
    });
});

// PUT (update) Quality form
router.put('/:qualFormID', (req, res) => {
    const qualFormID = parseInt(req.params.qualFormID);
    const updatedData = req.body; 

    try {
        const existingData = readJsonFile(filename);

        // Find index of the form by qualFormID
        const index = existingData.findIndex(item => item.qualFormID === qualFormID);
        if (index === -1) {
            return res.status(404).json({ status: 'error', message: 'Quality form not found' });
        }

        // Update the form with the new data
        existingData[index] = { ...existingData[index], ...updatedData };

        writeJsonFile(filename, existingData);
        res.json({ status: 'success', message: 'Quality form updated successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to update JSON file' });
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
