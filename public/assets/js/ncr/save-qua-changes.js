document.getElementById('save-changes-btn').addEventListener('click', async function () {
    try {
        await saveQualityForm();
    } catch (error) {
        console.error('Error saving Quality form and NCR:', error);
        alert('Failed to save. Please try again.');
    }
});

async function saveQualityForm() {
    errorList = [];
    const qualityFormID = await getQualityFormID();
    console.log('NEW QUA ID: ' + qualityFormID);
    // Collect form data without image
    const qualityFormData = {
        qualFormID: qualityFormID,
        qualFormProcessApplicable: getProcess(),
        qualItemDesc: document.getElementById('description-item')?.value?.trim() || '',
        qualIssueDesc: document.getElementById('description-defect')?.value?.trim() || '',
        qualImageFileName: null,
        qualItemID: parseInt(document.getElementById('po-prod-no')?.value?.trim(), 10) || 0,
        qualImageFileName: null,
        qualSalesOrderNo: parseInt(document.getElementById('sales-order-no')?.value?.trim(), 10) || 0,
        qualQtyReceived: parseFloat(document.getElementById('quantity-received')?.value?.trim()) || 0,
        qualQtyDefective: parseFloat(document.getElementById('quantity-defective')?.value?.trim()) || 0,
        qualItemNonConforming: parseInt(document.querySelector('input[name="item-nonconforming"]:checked')?.value, 10) || 0,
        qualRepID: parseInt(sessionStorage.getItem('empID'), 10) || null,
        qualDate: document.getElementById('quality-rep-date')?.value?.trim() || new Date().toISOString().split('T')[0]
    };

    try {
        const response = await fetch('/api/qualityForms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(qualityFormData),
        });

        if (!response.ok) {
            throw new Error('Error saving Quality form');
        }

        const result = await response.json();
        console.log('Quality form saved:', result);

        await createNCR(qualityFormData.qualFormID);

        alert('Successfully saved Quality form and NCR!');
    } catch (error) {
        console.error('Error saving Quality form:', error);
        throw error;
    }
}

async function createNCR(qualFormID) {
    const ncrFormNo = new Date().getFullYear() + (await getNCRCode());

    const ncrData = {
        ncrFormNo: Number(ncrFormNo),
        qualFormID: Number(qualFormID),
        engFormID: null, // NULL since no ENG form has been yet created
        purFormID: null, // NULL since no PUR form has been yet created
        prodID: Number(document.getElementById('po-prod-no').value) || 0,
        ncrStatusID: 1, // 1: Open
        ncrStage: "QUA", // Remains in Quality Assurance stage
        ncrIssueDate: document.getElementById('quality-rep-date')?.value || new Date().toISOString().split('T')[0],
    };

    try {
        const response = await fetch('/api/ncrForms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ncrData),
        });

        if (!response.ok) {
            throw new Error('Error creating NCR form');
        }

        const result = await response.json();
        console.log('NCR created successfully:', result);
    } catch (error) {
        console.error('Error creating NCR:', error);
        throw error;
    }
}
