let qualityForm, engineeringForm, purchasingForm, ncrID;

if (sessionStorage.getItem('mode') === 'view') {
    const buttonsToHide = [
        'submit-quality-btn',
        'submit-engineering-btn',
        'submit-purchasing-btn',
        'sample-data-btn-quality',
        'sample-data-btn-engineering',
        'sample-data-btn-purchasing'
    ];

    buttonsToHide.forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.style.display = "none"; 
            button.disabled = true;
        }
    });
}

// Function to fetch and populate quality form data
function fetchQualityForm(qualFormID) {
    fetch(`/api/qualityForms/${qualFormID}`)
        .then(response => response.json())
        .then(async qualityFormData => {
            document.getElementById('sales-order-no').value = qualityFormData.qualSalesOrderNo;
            document.getElementById('quantity-received').value = qualityFormData.qualQtyReceived;
            document.getElementById('quantity-defective').value = qualityFormData.qualQtyDefective;
            document.getElementById('description-item').value = qualityFormData.qualItemDesc;
            document.getElementById('description-defect').value = qualityFormData.qualIssueDesc;
            
            if (qualityFormData.qualItemNonConforming === 1) {
                document.querySelector('input[name="item-nonconforming"][value="1"]').checked = true;
            } else {
                document.querySelector('input[name="item-nonconforming"][value="0"]').checked = true;
            }
        
            document.getElementById('quality-rep-name').value = await getAndPopulateEmp(qualityFormData.qualRepID);
            document.getElementById('quality-rep-date').value = qualityFormData.qualDate;
        
            // Handle image display
            const imageFileName = qualityFormData.qualImageFileName;
            console.log(imageFileName);
        
            if (imageFileName) {
                const imageUrl = `/uploads/${imageFileName}`; 
        
                // Set up the anchor link for downloading (doesn't currently work)
                const imageDownloadLink = document.getElementById('imageDownloadLink');
                imageDownloadLink.href = imageUrl;  
                imageDownloadLink.download = imageFileName;  
        
                // Set the image source and display it
                const imageElement = document.getElementById('imagePreview');
                imageElement.src = imageUrl;
                imageElement.style.display = 'block';  
        
                // Display the filename next to the image
                const fileNameElement = document.getElementById('fileName');
                fileNameElement.textContent = imageFileName; 
                fileNameElement.style.display = 'inline';  
        
                document.getElementById('imagePreview').style.display = 'none';

                // Show the download link
                imageDownloadLink.style.display = 'inline-block';  
            } else {
                // Hide the image preview and filename if no image exists
                document.getElementById('imagePreview').style.display = 'none';
                document.getElementById('fileName').style.display = 'none';
                document.getElementById('imageDownloadLink').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching quality form:', error);
            alert('Failed to load quality form.');
        });
}

// Function to fetch engineering form data
function fetchEngineeringForm(engFormID) {
    fetch(`/api/engineerForms/${engFormID}`)
        .then(response => response.json())
        .then(async engFormData => {
            switch(engFormData.engReview){
                case "Use As Is": document.querySelector('input[name="review-by-engineer"][value="Use As Is"]').checked = true; break;
                case "Repair": document.querySelector('input[name="review-by-engineer"][value="Repair"]').checked = true; break;
                case "Rework": document.querySelector('input[name="review-by-engineer"][value="Rework"]').checked = true; break;
                case "Scrap": document.querySelector('input[name="review-by-engineer"][value="Scrap"]').checked = true; break;
            }

            switch(engFormData.engCustNotification){
                case 1: document.querySelector('input[name="require-notification"][value="1"]').checked = true; break;
                case 0: document.querySelector('input[name="require-notification"][value="0"]').checked = true; break;
            }

            document.getElementById('disposition').value = engFormData.engDispositionDesc;

            switch(engFormData.engDrawingUpdate){
                case 1: document.querySelector('input[name="require-updating"][value="1"]').checked = true; break;
                case 0: document.querySelector('input[name="require-updating"][value="0"]').checked = true; break;
            }

            document.getElementById('original-rev-number').value = engFormData.engRevisionNo;
            document.getElementById('updated-rev-number').value = engFormData.engUpdatedRevisionNo;
            document.getElementById('engineering').value = await getAndPopulateEmp(engFormData.engID);
            document.getElementById('revision-date').value = engFormData.engUpdatedRevisionDate;
            document.getElementById('engineer-date').value = engFormData.engDate;
        })
        .catch(error => {
            console.error('Error fetching engineering form:', error);
            alert('Failed to load engineering form.');
        });
}

//Function to fetch purchasing form data
function fetchPurchasingForm(purFormID) {
    fetch(`/api/purchasingForms/${purFormID}`)  
    .then(response => response.json())
    .then(async purFormData => {
        // LOGIC TO POPULATE INPUTS BASED ON EXISTING DATA
        console.log(purFormData); 
        document.getElementById('car-number').value = purFormData.purCarNo;
        document.getElementById('purchasing-followup').value = purFormData.purFollowUpType;
        document.getElementById('purchasing-followup-date').value = purFormData.purFollowUpDate;
        document.getElementById('purchasing-date').value = purFormData.purNCRClosingDate;
        if(purFormData.purDescription != null) document.querySelector(`input[name="preliminary-decision"][value="${purFormData.purDescription}"]`).checked = true;
        document.querySelector(`input[name="car-raised"][value="${purFormData.purCarRaised}"]`).checked = true;
        document.querySelector(`input[name="follow-up-required"][value="${purFormData.purFollowUpReq}"]`).checked = true;
    })
    .catch(error => {
        console.error('Error fetching purchasing form:', error);
        alert('Failed to load purchasing form.');
    });
}

// Function to fetch supplier ID based on product ID
async function getSupplierID(prodID) {
    return fetch(`/api/products/${prodID}`)
        .then(response => response.json())
        .then(product => product.supID)
        .catch(error => console.error('Error fetching product:', error));
}

// Function to populate NCR inputs
async function populateNCRInputs(ncrFormID) {
    try {
        const response = await fetch(`/api/ncrForms/${ncrFormID}`);
        const ncrForm = await response.json();

        document.getElementById('ncr-no').value = ncrForm.ncrFormNo;
        document.getElementById('ncr-date').value = ncrForm.ncrIssueDate;
        sessionStorage.setItem("currentNCRStage", ncrForm.ncrStage);
        formatAndPopulateStage();
        qualityForm = ncrForm.qualFormID;
        engineeringForm = ncrForm.engFormID;
        purchasingForm = ncrForm.purFormID;
        ncrID = ncrForm.ncrFormID;
        setSupplierAndTriggerChange(await getSupplierID(ncrForm.prodID));
        document.getElementById('po-prod-no').value = ncrForm.prodID;

        if (qualityForm != null) {
            fetchQualityForm(qualityForm);
        }

        if (engineeringForm) {
            fetchEngineeringForm(engineeringForm);

            document.getElementById('submit-engineering-btn').innerText = "Update Engineering Form";
            document.getElementById('submit-purchasing-btn').style.display = "";
            document.getElementById('submit-purchasing-btn').disabled = false;
        } else {
            document.getElementById('submit-engineering-btn').innerText = "Create Engineering Form";
            document.getElementById('submit-purchasing-btn').style.display = "none";
            document.getElementById('submit-purchasing-btn').disabled = true;
        
            document.getElementById('purchasing-fieldset').classList.add('fieldset-disabled');
        }

        if (purchasingForm) {
            document.getElementById('purchasing-fieldset').classList.remove('fieldset-disabled');
            fetchPurchasingForm(purchasingForm);
        }

        const currentNCRStage = sessionStorage.getItem('currentNCRStage');

        if (currentNCRStage === 'QUA') {
            document.getElementById('section-quality').style.display = "block";
            document.getElementById('engineering-fieldset').classList.add('fieldset-disabled');
            document.getElementById('section-engineering').style.display = "none";
        }
        else if(currentNCRStage === "ENG"){
            document.getElementById('section-engineering').style.display = "block";
            document.getElementById('purchasing-fieldset').classList.add('fieldset-disabled');
            document.getElementById('section-purchasing').style.display = "none";
            document.getElementById('save-changes-qua-draft').style.display = "none";
        }
        else{
            document.getElementById('save-changes-qua-draft').style.display = "none";
            document.getElementById('section-purchasing').style.display = "block";
            document.getElementById('save-changes-qua-draft').style.display = "none";
            document.getElementById('save-changes-eng-draft').style.display = "none";

        }

        if (sessionStorage.getItem('mode') === 'view') {
            document.getElementById('purchasing-fieldset').classList.remove('fieldset-disabled');
        }
    } catch (error) {
        console.error('Error fetching NCR form:', error);
        alert('Failed to load NCR form.');
    }
}

// Function to get and populate employee name based on empID
async function getAndPopulateEmp(empID) {
    return fetch(`/api/employees/${empID}`)
        .then(response => response.json())
        .then(employee => `${employee.empFirst} ${employee.empLast}`)
        .catch(error => {
            console.error('Error fetching employee', error);
        });
}

// Function to format and populate stage based on session data
function formatAndPopulateStage() {
    switch (sessionStorage.getItem('currentNCRStage')) {
        case "QUA":
            document.getElementById('stage').value = "Quality";
            break;
        case "ENG":
            document.getElementById('stage').value = "Engineering";
            break;
        case "PUR":
            document.getElementById('stage').value = "Purchasing";
            break;
    }
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const ncrFormID = urlParams.get('ncrFormID');  
    if (ncrFormID) {
        populateNCRInputs(ncrFormID);
    }

    const createQualBtn = document.getElementById('submit-quality-btn');
    const createEngBtn = document.getElementById('submit-engineering-btn');
    createQualBtn.innerText = "Update Quality Form";
    createEngBtn.innerText = "Update Engineering Form";

    const radioButton = document.querySelector('input[name="car-raised"][value="0"]');

    radioButton.checked = true;

    const changeEvent = new Event('change', { bubbles: true });
    radioButton.dispatchEvent(changeEvent);

    const followUpRadioButton = document.querySelector('input[name="follow-up-required"][value="0"]');

    followUpRadioButton.checked = true;

    followUpRadioButton.dispatchEvent(changeEvent);

});

// Function which handles supplier process
function getProcess(){
    if(document.getElementById('recInsp').checked){
        return "SUP";
    } 
    else if(document.getElementById('wip').checked){
        return "WIP";   
    }
    else return "";
}

const submitQuaBtn = document.getElementById('submit-quality-btn');
// Submit button for quality form update
submitQuaBtn.addEventListener('click', async function(event) {
    event.preventDefault();
    
    errorList = [];
    let formIsValid = true;

    // Collect data from form fields
    const updatedQualityData = {
        qualFormID: qualityForm,  
        qualFormProcessApplicable: getProcess(),
        qualItemDesc: document.getElementById('description-item').value.trim() || '', 
        qualIssueDesc: document.getElementById('description-defect').value.trim() || '',
        qualItemID: Number(document.getElementById('po-prod-no').value.trim()) || null, 
        qualSalesOrderNo: Number(document.getElementById('sales-order-no').value.trim()) || null,
        qualQtyReceived: Number(document.getElementById('quantity-received').value) || null, 
        qualQtyDefective: Number(document.getElementById('quantity-defective').value) || null, 
        qualItemNonConforming: Number(document.querySelector('input[name="item-nonconforming"]:checked')?.value) || null, 
        qualRepID: Number(sessionStorage.getItem('empID')) || null,
        qualDate: document.getElementById('quality-rep-date').value.trim() || ''
    };

    const requiredFields = [
        'po-prod-no', 
        'description-item', 
        'description-defect', 
        'sales-order-no', 
        'quantity-received', 
        'quantity-defective', 
        'item-nonconforming', 
        'quality-rep-name',
    ];

    // Check for empty required fields and add invalid class
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        
        if (field === 'item-nonconforming') {
            const nonConformingValue = document.querySelector('input[name="item-nonconforming"]:checked');
            if (!nonConformingValue) {
                formIsValid = false;
                errorList.push('Please select an item nonconforming value.');
                document.getElementById(field)?.classList.add('error');
            } else {
                document.getElementById(field)?.classList.remove('error');
            }
        } else if (!input || !input.value.trim()) {
            formIsValid = false;
            errorList.push(`Please fill in the ${input.name || field}`);
            input?.classList.add('error');
        } else {
            input?.classList.remove('error');
        }
    });

    // Validate if Sales Order, Quantity Received, and Quantity Defective are valid numbers
    const salesOrderNo = updatedQualityData.qualSalesOrderNo;
    const qtyReceived = updatedQualityData.qualQtyReceived;
    const qtyDefective = updatedQualityData.qualQtyDefective;

    if (isNaN(salesOrderNo) || isNaN(qtyReceived) || isNaN(qtyDefective)) {
        formIsValid = false;

        if (isNaN(salesOrderNo)) {
            errorList.push('Please enter a valid numeric value for the sales order number.');
            document.getElementById('sales-order-no').classList.add('error');
        }
        if (isNaN(qtyReceived)) {
            errorList.push('Please enter a valid numeric value for the quantity received.');
            document.getElementById('quantity-received').classList.add('error');
        }
        if (isNaN(qtyDefective)) {
            errorList.push('Please enter a valid numeric value for the quantity defective.');
            document.getElementById('quantity-defective').classList.add('error');
        }
    }

    if (qtyReceived < qtyDefective) {
        formIsValid = false;
        errorList.push('Quantity Received cannot be less than Quantity Defective.');
        document.getElementById('quantity-received').classList.add('error');
        document.getElementById('quantity-defective').classList.add('error');
    }

    if (!formIsValid) {
        document.getElementById('error-message-quality').innerHTML = `<ul>${errorList.map(item => `<li>${item}</li>`).join('')}</ul>`;
        return; 
    }

    try {
        const updateResponse = await fetch(`/api/qualityForms/${updatedQualityData.qualFormID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedQualityData),
        });

        if (!updateResponse.ok) {
            const data = await updateResponse.json();
            alert(`Failure updating quality data: ${data.message || 'Unknown error'}`);
            return; 
        }

        // Fetch and update NCR if needed
        const urlParams = new URLSearchParams(window.location.search);
        const ncrFormID = urlParams.get('ncrFormID');
        const ncrResponse = await fetch(`/api/ncrForms/${ncrFormID}`);
        
        if (!ncrResponse.ok) {
            throw new Error(`Failed to fetch NCR form with ID ${ncrFormID}`);
        }

        const ncrData = await ncrResponse.json();

        if (ncrData.ncrStage === "QUA") {
            const updatedNcrData = { ncrStage: "ENG" };
            const updateNcrResponse = await fetch(`/api/ncrForms/${ncrFormID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedNcrData),
            });

            if (updateNcrResponse.ok) {
                console.log('NCR Quality form created successfully.');
                alert('Success updating quality form.');
                notifyDepartmentManager(ncrData.ncrFormNo, 'Engineering'); 
                location.reload();
            } else {
                const data = await updateNcrResponse.json();
                alert(`Failed to update NCR stage: ${data.message || 'Unknown error'}`);
            }
        } 
    } catch (error) {
        console.error('Error updating quality and NCR data:', error);
        alert('An error occurred while updating quality and NCR data.');
    }

  
});

  // EventListener code for submit button
document.getElementById("supplier-name").addEventListener("input", function() {
    if (this.value && this.value !== "") {
        this.classList.remove("error");
    }
});

document.getElementById("po-prod-no").addEventListener("input", function() {
    if (this.value && this.value !== "") {
        this.classList.remove("error");
    }
});

document.getElementById("sales-order-no").addEventListener("input", function() {
    if (!isNaN(this.value) && this.value.trim() !== "") {
        this.classList.remove("error");
    }
});

document.getElementById("quantity-received").addEventListener("input", function() {
    if (this.value && !isNaN(this.value)) {
        this.classList.remove("error");
    }
});

document.getElementById("quantity-defective").addEventListener("input", function() {
    if (this.value && !isNaN(this.value)) {
        this.classList.remove("error");
    }
});

document.getElementById("description-item").addEventListener("input", function() {
    if (this.value && this.value.trim() !== "") {
        this.classList.remove("error");
    }
});

document.getElementById("description-defect").addEventListener("input", function() {
    if (this.value && this.value.trim() !== "") {
        this.classList.remove("error");
    }
});


const submitEngBtn = document.getElementById('submit-engineering-btn');
submitEngBtn.addEventListener('click', async function (event) {
    event.preventDefault();

    console.log("engineering form: " + engineeringForm);

    let errorList = [];

    const requiredFields = [
        'disposition',
        'engineer-date'
    ];

    let formIsValid = true;

    // Validate radio button
    const reviewByEngineer = document.querySelector('input[name="review-by-engineer"]:checked');
    if (!reviewByEngineer) {
        formIsValid = false;
        errorList.push('Please select a review by engineer option.');
        document.getElementById('review-engineering-div').classList.add('error');
    } else {
        document.getElementById('review-engineering-div').classList.remove('error');
    }

    // Validate other required fields
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input || !input.value?.trim()) {
            formIsValid = false;
            errorList.push(`Please fill out the ${field} field.`);
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    // Validate Dates 
    const revisionDate = document.getElementById('revision-date').value?.trim();
    const engineerDate = document.getElementById('engineer-date').value?.trim();
    if (revisionDate && !Date.parse(revisionDate)) {
        formIsValid = false;
        errorList.push('Please provide a valid revision date.');
        document.getElementById('revision-date').classList.add('error');
    }
    if (!Date.parse(engineerDate)) {
        formIsValid = false;
        errorList.push('Please provide a valid engineer date.');
        document.getElementById('engineer-date').classList.add('error');
    }

    // Show error messages if validation fails
    if (!formIsValid) {
        document.getElementById('error-message-engineering').innerHTML = `<ul>${errorList.map(item => `<li>${item}</li>`).join('')}</ul>`;
        return;
    }

    // If form is valid, proceed with form submission logic
    try {
        const formData = { 
            engReview: reviewByEngineer.value, 
            engCustNotification: Number(document.querySelector('input[name="require-notification"]:checked')?.value || 0), 
            engDispositionDesc: document.getElementById('disposition').value, 
            engDrawingUpdate: Number(document.querySelector('input[name="require-updating"]:checked')?.value || 0), 
            engRevisionNo: document.getElementById('original-rev-number').value || null, 
            engUpdatedRevisionNo: document.getElementById('updated-rev-number').value || null,
            engID: Number(sessionStorage.getItem('empID')) || null,
            engUpdatedRevisionDate: document.getElementById('revision-date').value || null,
            engDate: document.getElementById('engineer-date').value 
        };

        if (engineeringForm) {
            // Update existing engineering form
            const response = await fetch(`/api/engineerForms/${engineeringForm}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Engineering form updated successfully.');
            } else {
                alert('Error updating engineering form.');
            }
        } else {
            // Create a new engineering form
            const response = await fetch(`/api/engineerForms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const newEngForm = await response.json();
                const newEngFormID = newEngForm.engFormID;

                const ncrFormID = ncrID;
                const updatedNCRData = { engFormID: newEngFormID, ncrStage: "PUR" };

                // Update the NCR form with the new engineering form ID
                const updateResponse = await fetch(`/api/ncrForms/${ncrFormID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedNCRData),
                });

                if (updateResponse.ok) {
                    alert('Engineering form created successfully.');
                    location.reload();
                } else {
                    alert('Error updating NCR form with engineering form ID.');
                }
            } else {
                alert('Error creating engineering form.');
            }
        }
    } catch (error) {
        alert('Error processing the form: ' + error);
        console.error('Error processing the form:', error);
    }
});

document.querySelectorAll('input[name="review-by-engineer"]').forEach(function(radioButton) {
    radioButton.addEventListener('change', function() {
        document.getElementById('review-engineering-div').classList.remove('error');
    });
});

document.getElementById('disposition').addEventListener('input', function(){
    this.classList.remove('error');
});

const submitPurBtn = document.getElementById('submit-purchasing-btn');
submitPurBtn.addEventListener('click', async function (event) {
    event.preventDefault();

    console.log("purchasing form", purchasingForm);

    let errorList = [];

    let formIsValid = true;

    // Validate radio button 
    const preliminaryDecision = document.querySelector('input[name="preliminary-decision"]:checked');
    if (!preliminaryDecision) {
        formIsValid = false;
        errorList.push('Please select a preliminary decision option.');
        document.getElementById('preliminary-decision-div').classList.add('error');
    } else {
        document.getElementById('preliminary-decision-div').classList.remove('error');
    }

    // Validate radio button for "car-raised"
    const carRaised = document.querySelector('input[name="car-raised"]:checked');
    if (!carRaised) {
        formIsValid = false;
        errorList.push('Please select a car raised option.');
        document.getElementById('car-raised-div').classList.add('error');
    }

    // Validate radio button for "follow-up-required"
    const followUpRequired = document.querySelector('input[name="follow-up-required"]:checked');
    if (!followUpRequired) {
        formIsValid = false;
        errorList.push('Please select a follow-up required option.');
        document.getElementById('follow-up-required-div').classList.add('error');
    }

    // Validate "car number" as a valid number
    const carNumber = document.getElementById('car-number').value;
    if (carNumber && isNaN(carNumber)) {
        formIsValid = false;
        errorList.push('Car number must be a valid number.');
        document.getElementById('car-number').classList.add('error');
    }

    // Validate that dates are provided and valid
    const followUpDate = document.getElementById('purchasing-followup-date').value;
    const purchaseDate = document.getElementById('purchasing-date').value;
    if (followUpDate && !Date.parse(followUpDate)) {
        formIsValid = false;
        errorList.push('Please provide a valid follow-up date.');
        document.getElementById('purchasing-followup-date').classList.add('error');
    } 

    if (!Date.parse(purchaseDate)) {
        formIsValid = false;
        errorList.push('Please provide a valid purchasing date.');
        document.getElementById('purchasing-date').classList.add('error');
    } 

    // Show error messages if validation fails
    if (!formIsValid) {
        document.getElementById('error-message-purchasing').innerHTML = `<ul>${errorList.map(item => `<li>${item}</li>`).join('')}</ul>`;
        return;
    }

    // If form is valid, proceed with form submission logic
    try {
        const formData = {
            purDescription: preliminaryDecision.value,
            purCarRaised: Number(carRaised.value),
            purCarNo: Number(carNumber) || null,
            purFollowUpReq: Number(followUpRequired.value),
            purFollowUpType: document.getElementById('purchasing-followup').value || null,
            purFollowUpDate: followUpDate || null,
            purInspectorID: Number(sessionStorage.getItem('empID')) || null,
            purNCRClosingDate: purchaseDate,
        };

        const currentPurFormID = purchasingForm ? purchasingForm.purFormID : null;

        if (currentPurFormID) {
            // Update existing purchasing form
            const response = await fetch(`/api/purchasingForms/${currentPurFormID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Purchasing form updated successfully.');
            } else {
                alert('Error updating purchasing form');
            }
        } else {
            // Create a new purchasing form
            const response = await fetch(`/api/purchasingForms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const newPurForm = await response.json();
                const newPurFormID = newPurForm.purFormID;

                const ncrFormID = ncrID;
                const updatedNCRData = { purFormID: newPurFormID, ncrStatusID: 2, ncrStage: "PUR" };

                // Update the NCR form with the new purchasing form ID
                const updateResponse = await fetch(`/api/ncrForms/${ncrFormID}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedNCRData),
                });

                if (updateResponse.ok) {
                    alert('Purchasing form created and NCR form updated successfully');

                    location.reload();

                    const ncrFormNo = document.getElementById('ncr-no').value.replace(/\D/g, '');
                    await notifyDepartmentManager(ncrFormNo, "Final Approval");
                } else {
                    alert('Error updating NCR form with purchasing form ID');
                    console.error('Error updating NCR form:', await updateResponse.json());
                }
            } else {
                alert('Error creating purchasing form');
                console.error('Error response:', await response.json());
            }
        }
    } catch (error) {
        alert('Error processing the form: ' + error.message);
        console.error('Error processing the form:', error);
    }
});

document.querySelectorAll('input[name="preliminary-decision"]').forEach(function(radioButton) {
    radioButton.addEventListener('change', function() {
        document.getElementById('preliminary-decision-div').classList.remove('error');
    });
});

// Function which ghenerates the existing purchasing form ID
async function getPurchasingFormID(status) {
    if(status === "UPDATE"){
        const ncrNo = document.getElementById('ncr-no').value.replace(/\D/g, '');
        try{
            const response = await fetch(`/api/purchasingForms/${ncrNo}`) 

            if(!response.ok){
                throw new Error('Form not found for update.');
            }

            const data = await response.json();
            return data.purFormID;
        } catch(error){
            console.error('Error fetching purchasing form for update: ', error);
            throw error;
        }
    }
    else{
        // Generate the new form ID
        try{
            const response = await fetch('/api/purchasingForms');

            if(!response.ok){
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();
            return data.length + 1;
        }
        catch(error){
            console.error('Error generating new purchasing form ID', error);
            throw error;
        }
    }
}

async function notifyDepartmentManager(ncrFormNo, department) {
    const recipient = "andrewdionne09@gmail.com"; 
    const subject = `Form Update Required: Form ${ncrFormNo}`;
    const message = `
NCR Form ${ncrFormNo} is now ready for updating in the ${department} department. 

Please review and proceed with the necessary actions at your earliest convenience.
`;

    try {
        const response = await fetch('/api/email/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipient,
                subject,
                message
            }),
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Email sent successfully:', result);
        } else {
            console.error('Error sending email:', result.error);
        }
    } catch (error) {
        console.error('An unexpected error occurred:', error);
    }

    
    const notificationMessage = `NCR Form ${ncrFormNo} in the ${department} department requires your attention.`;
            
    let empID;
    
    switch(department){
        case "Engineering": empID = 2; break;
        case "Purchasing": empID = 3; break;
    }

    // Add a new notification for the employee
    const notificationResponse = await fetch('/api/notifications/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: empID, 
            message: notificationMessage,
            ncrFormID: ncrID
        }),
    });

    const notificationResult = await notificationResponse.json();
    if (notificationResponse.ok) {
        console.log('Notification added successfully:', notificationResult);
    } else {
        console.error('Error adding notification:', notificationResult.error);
    }


}

//Eventlisteners for "Does the drawing require updating" to show or not show fields (defaults to no)
document.getElementById('require-updating-yes').addEventListener('change', function(){
    document.getElementById('revision-info').style.display = "";
});

document.getElementById('require-updating-no').addEventListener('change', function(){
    document.getElementById('revision-info').style.display = "none";
});

//Eventlisteners for "CAR number entry"
document.getElementById('car-yes').addEventListener('change', function(){
    document.getElementById('car-info').style.display = "";
});

document.getElementById('car-no').addEventListener('change', function(){
    document.getElementById('car-info').style.display = "none";
});

//Eventlisteners for "Follow up required"
document.getElementById('followup-yes').addEventListener('change', function(){
    document.getElementById('followup-info').style.display = "";
});

document.getElementById('followup-no').addEventListener('change', function(){
    document.getElementById('followup-info').style.display = "none";
});


// Function which handles quality form draft
document.getElementById('save-changes-qua-draft').addEventListener('click', async function() {
    if (qualityForm) {
        console.log(qualityForm);
        
        // Get the image file from the input element
        const imageFileInput = document.getElementById('image-upload');  
        const imageFile = imageFileInput?.files[0] || null;  

        // Create FormData to send image and other form data together
        const formData = new FormData();
        
        formData.append('qualFormID', qualityForm);
        formData.append('qualItemDesc', document.getElementById('description-item').value.trim() || '');
        formData.append('qualIssueDesc', document.getElementById('description-defect').value.trim() || '');
        formData.append('qualItemID', Number(document.getElementById('po-prod-no').value.trim()) || null);
        formData.append('qualSalesOrderNo', Number(document.getElementById('sales-order-no').value.trim()) || null);
        formData.append('qualQtyReceived', Number(document.getElementById('quantity-received').value.trim()) || null);
        formData.append('qualQtyDefective', Number(document.getElementById('quantity-defective').value.trim()) || null);
        formData.append('qualItemNonConforming', Number(document.querySelector('input[name="item-nonconforming"]:checked')?.value) || null);
        formData.append('qualRepID', Number(sessionStorage.getItem('empID')) || null);
        formData.append('qualDate', document.getElementById('quality-rep-date').value.trim() || '');

        if (imageFile) {
            formData.append('qualImageFile', imageFile); 
        }

        try {
            const response = await fetch(`/api/qualityForms/${qualityForm}`, {
                method: 'PUT',
                body: formData  
            });

            if (response.ok) {
                alert('Quality form draft saved successfully.');
            } else {
                alert('Error saving quality form draft.');
            }
        } catch (error) {
            alert('Error saving quality form draft: ' + error);
            console.error(error);
        }
    } else {
        alert('Quality form ID is not available. Cannot save draft.');
    }
});

// Function which handles engineering form draft
document.getElementById('save-changes-eng-draft').addEventListener('click', async function () {
    const formData = { 
        engReview: document.querySelector('input[name="review-by-engineer"]:checked') 
            ? document.querySelector('input[name="review-by-engineer"]:checked').value 
            : null, 
        engCustNotification: Number(document.querySelector('input[name="require-notification"]:checked')?.value || 0), 
        engDispositionDesc: document.getElementById('disposition').value || null, 
        engDrawingUpdate: Number(document.querySelector('input[name="require-updating"]:checked')?.value || 0), 
        engRevisionNo: document.getElementById('original-rev-number').value || null, 
        engUpdatedRevisionNo: document.getElementById('updated-rev-number').value || null,
        engID: Number(sessionStorage.getItem('empID')) || null,
        engUpdatedRevisionDate: document.getElementById('revision-date').value || null,
        engDate: document.getElementById('engineer-date').value || null 
    };

    try {
        if (engineeringForm) {
            // Make a PUT request if engineeringForm is not null
            const response = await fetch(`/api/engineerForms/${engineeringForm}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Engineering form draft updated successfully.');
            } else {
                alert('Error updating engineering form draft.');
            }
        } else {
            // Make a POST request if engineeringForm is null
            const response = await fetch(`/api/engineerForms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newForm = await response.json();
                engineeringForm = newForm.engFormID; 
                
                // Update the NCR form with the new engineering form ID
                const urlParams = new URLSearchParams(window.location.search);
                const ncrFormID = urlParams.get('ncrFormID');

                if (ncrFormID) {
                    const updateNCRData = { engFormID: engineeringForm };

                    const ncrResponse = await fetch(`/api/ncrForms/${ncrFormID}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateNCRData),
                    });

                    if (ncrResponse.ok) {
                        alert('NCR form updated with new engineering form ID.');
                    } else {
                        alert('Error updating NCR form with engineering form ID.');
                    }
                }
            } else {
                alert('Error creating engineering form draft.');
            }
        }
    } catch (error) {
        alert('Error saving engineering form draft: ' + error.message);
        console.error('Error:', error);
    }
});



// Function which handles purchasing form draft
document.getElementById('save-changes-pur-draft').addEventListener('click', async function () {
    const formData = {
        purDescription: document.querySelector('input[name="preliminary-decision"]:checked') 
            ? document.querySelector('input[name="preliminary-decision"]:checked').value 
            : null,
        purCarRaised: Number(document.querySelector('input[name="car-raised"]:checked')?.value || 0),
        purCarNo: Number(document.getElementById('car-number').value) || null,
        purFollowUpReq: Number(document.querySelector('input[name="follow-up-required"]:checked')?.value || 0),
        purFollowUpType: document.getElementById('purchasing-followup').value || null,
        purFollowUpDate: document.getElementById('purchasing-followup-date').value || null,
        purInspectorID: Number(sessionStorage.getItem('empID')) || null,
        purNCRClosingDate: document.getElementById('purchasing-date').value || null,
    };

    try {
        if (purchasingForm) {
            // Make a PUT request if purchasingForm is not null
            const response = await fetch(`/api/purchasingForms/${purchasingForm}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Purchasing form draft updated successfully.');
            } else {
                alert('Error updating purchasing form draft.');
            }
        } else {
            // Make a POST request if purchasingForm is null
            const response = await fetch(`/api/purchasingForms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newForm = await response.json();
                purchasingForm = newForm.purFormID;

                // Update the NCR form with the new purchasing form ID
                const urlParams = new URLSearchParams(window.location.search);
                const ncrFormID = urlParams.get('ncrFormID');

                if (ncrFormID) {
                    const updateNCRData = { purFormID: purchasingForm };

                    const ncrResponse = await fetch(`/api/ncrForms/${ncrFormID}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateNCRData),
                    });

                    if (ncrResponse.ok) {
                        alert('NCR form updated with new purchasing form ID.');
                    } else {
                        alert('Error updating NCR form with purchasing form ID.');
                    }
                }
            } else {
                alert('Error creating purchasing form draft.');
            }
        }
    } catch (error) {
        alert('Error saving purchasing form draft: ' + error.message);
        console.error('Error:', error);
    }
});

