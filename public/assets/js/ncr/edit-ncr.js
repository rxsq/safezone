let qualityForm, engineeringForm, ncrID;

// Function to fetch and populate quality form data
function fetchQualityForm(qualFormID) {
    fetch(`/api/qualityForms/${qualFormID}`)
        .then(response => response.json())
        .then(async qualityFormData => {
            if (qualityFormData.qualFormSupplierProcess !== null) {
                document.getElementById('rfecInsp').checked = true;
            }
            if (qualityFormData.qualFormProductionProcess !== null) {
                document.getElementById('wip').checked = true;
            }
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
        })
        .catch(error => {
            console.error('Error fetching quality form:', error);
            alert('Failed to load quality form.');
        });
}

function fetchEngineeringForm(engFormID){
    fetch(`/api/engineerForms/${engFormID}`)
        .then(response => response.json())
        .then(async engFormData => {
            switch(engFormData.engReview){
                case "Use As Is": document.querySelector('input[name="review-by-engineer"][value="Use As Is"]').checked = true;
                    break;
                case "Repair": document.querySelector('input[name="review-by-engineer"][value="Repair"]').checked = true;
                    break;
                case "Rework": document.querySelector('input[name="review-by-engineer"][value="Rework"]').checked = true;
                    break;
                case "Scrap": document.querySelector('input[name="review-by-engineer"][value="Scrap"]').checked = true;
                    break;
            }

            switch(engFormData.engCustNotification){
                case 1: document.querySelector('input[name="require-notification"][value="1"]').checked = true;
                    break;
                case 0: document.querySelector('input[name="require-notification"][value="0"]').checked = true;
                    break;
            }

            document.getElementById('disposition').value = engFormData.engDispositionDesc;
            
            switch(engFormData.engDrawingUpdate){
                case 1: document.querySelector('input[name="require-updating"][value="1"]').checked = true;
                    break;
                case 0: document.querySelector('input[name="require-updating"][value="0"]').checked = true;
                    break;
            }

            document.getElementById('original-rev-number').value = engFormData.engRevisionNo;
            document.getElementById('updated-rev-number').value = engFormData.engUpdatedRevisionNo;
            document.getElementById('engineering').value = await getAndPopulateEmp(engFormData.engID);
            document.getElementById('revision-date').value = engFormData.engUpdatedRevisionDate;
            document.getElementById('engineer-date').value = engFormData.engDate;

        })
        .catch(error => {
            console.error('Error fetching engineer form:', error);
            alert('Failed to load engineer form.');
        });
}

// Function to get supplier with product ID
async function getSupplierID(prodID) {
    return fetch(`/api/products/${prodID}`)
        .then(response => response.json())
        .then(product => {
            return product.supID; 
        })
        .catch(error => {
            console.error('Error fetching product:', error);
        });
}

async function populateNCRInputs(ncrFormID) {
    // Fetch and populate NCR info
    fetch(`/api/ncrForms/${ncrFormID}`)
        .then(response => response.json())
        .then(async ncrForm => {
            document.getElementById('ncr-no').value = ncrForm.ncrFormNo;
            document.getElementById('ncr-date').value = ncrForm.ncrIssueDate;
            sessionStorage.setItem("currentNCRStage", ncrForm.ncrStage);
            formatAndPopulateStage();
            qualityForm = ncrForm.qualFormID;
            engineeringForm = ncrForm.engFormID;
            ncrID = ncrForm.ncrFormID;
            setSupplierAndTriggerChange(await getSupplierID(ncrForm.prodID))
            //document.getElementById('po-prod-no').value = ncrForm.prodID;
            
            // Fetch quality form only if we have a valid qualFormID
            if (qualityForm) {
                fetchQualityForm(qualityForm);
            }
            
            // Fetch engineering form if required
            if (engineeringForm) {
                console.log('Fetching Engineering form...');
                fetchEngineeringForm(engineeringForm);
            }
        })
        .catch(error => {
            console.error('Error fetching NCR form:', error);
            alert('Failed to load NCR form.');
        });
}

// Function to get and populate quality representative name
async function getAndPopulateEmp(empID) {
    return fetch(`/api/employees/${empID}`)
        .then(response => response.json())
        .then(employee => {
            return employee.empFirst + " " + employee.empLast;
        })
        .catch(error => {
            console.error('Error fetching employee', error);
        });
}

// Function to format NCR Number as YYYY-### 
function formatNCRNumber(ncrFormNo) {
    const year = ncrFormNo.slice(0, 4);
    const code = ncrFormNo.slice(4);
    const formattedCode = code.padStart(3, '0');
    return `${year}-${formattedCode}`;
}

// Function to format and populate stage
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

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const ncrFormID = urlParams.get('ncrFormID');  
    if (ncrFormID) {
        populateNCRInputs(ncrFormID);
    }
    fetch('../assets/data/products.json')
    .then(response => response.json())
    .then(data => {
        window.products = data; 
    })
    .catch(error => console.error('Failed to load products:', error));

    if((!document.getElementById('engineering').value) && ((sessionStorage.getItem("userRole") == "Administrator") || (sessionStorage.getItem("userRole") == "Engineering"))){
        document.getElementById('engineering').value = sessionStorage.getItem('userName');
        document.getElementById('engineer-date').value = new Date().toISOString().substring(0, 10);
    }
});

const submitQuaBtn = document.getElementById('submit-quality-btn');
const submitEngBtn = document.getElementById('submit-engineering-btn');

// Function which handles supplier process
function getSupplierProcess(){
    if(document.getElementById('recInsp').checked){
        return "SUP";
    } else return null;
}

//Function which handles production process
function getProductionProcess(){
    if(document.getElementById('wip').checked){
        return "WIP";
    } else return null;
}

submitQuaBtn.addEventListener('click', async function(event) {
    event.preventDefault(); 
    
    const currentQualFormID = qualityForm; 
    if (!currentQualFormID) {
        alert('No quality form to update.');
        return;
    }

    const updatedQualityData = {
        qualFormID: currentQualFormID,  
        qualFormSupplierProcess: getSupplierProcess(),
        qualFormProductionProcess: getProductionProcess(),
        qualItemDesc: document.getElementById('description-item').value,
        qualIssueDesc: document.getElementById('description-defect').value,
        qualItemID: Number(document.getElementById('po-prod-no').value), 
        qualImageFileName: null,  // Handle later
        qualSalesOrderNo: Number(document.getElementById('sales-order-no').value),
        qualQtyReceived: Number(document.getElementById('quantity-received').value), 
        qualQtyDefective: Number(document.getElementById('quantity-defective').value), 
        qualItemNonConforming: Number(document.querySelector('input[name="item-nonconforming"]:checked').value), 
        qualRepID: Number(sessionStorage.getItem('empID')),
        qualDate: document.getElementById('quality-rep-date').value
    };

    console.log("Updated data being sent:", updatedQualityData);
    
    fetch(`/api/qualityForms/${updatedQualityData.qualFormID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQualityData),
    })
    .then(response => {
        console.log("Response status:", response.status); 
        if (response.ok) {
            alert('Successful update on quality data');
        } else {
            response.json().then(data => {
                console.log('Error response data:', data);
                alert(`Failure updating quality data: ${data.message || 'Unknown error'}`);
            });
        }
    })
    .catch(error => {
        console.error('Error updating quality assurance form:', error);
        alert('An error occurred while updating the quality form');
    });

    const ncrFormNo = document.getElementById('ncr-no').value.replace(/\D/g, '');  // Clean NCR form ID

    await notifyDepartmentManager(ncrFormNo, "Engineering");
});

// Function which checks validity of NCR record
async function checkNCRValidity() {
    let ncrNo = document.getElementById('ncr-no').value.replace(/\D/g, '');
    console.log(ncrNo);
    
    if (isNaN(ncrNo)) {
        return "INVALID";
    }
    
    try {
        const response = await fetch('/api/ncrForms');
        const ncrData = await response.json();

        const ncrForm = ncrData.find(item => item.ncrFormNo == ncrNo);

        console.log(ncrForm);

        if (!ncrForm) {
            return "INVALID";
        } else if (ncrForm.qualFormID === null) {
            return "INCOMPLETE"; // If the quality form is missing, mark as INCOMPLETE
        } else if (ncrForm.engFormID === null) {
            return "INCOMPLETE"; // If the engineering form is missing, mark as INCOMPLETE
        }

        return "VALID"; // If both quality and engineering forms are present, return VALID
    } catch (error) {
        console.error("Error fetching NCR data:", error);
        return "ERROR";
    }
}



submitEngBtn.addEventListener('click', async function(event) {
    event.preventDefault();

    let currentEngFormID = engineeringForm; // Get the current engineering form ID

    // If no engineering form ID exists, create a new one
    if (!currentEngFormID || currentEngFormID === null || currentEngFormID === '') {
        await createEngineerForm(currentEngFormID);  // Create a new form if ID is not valid
        currentEngFormID = engineeringForm; // After creation, assign the new form ID
    }

    if (!currentEngFormID || currentEngFormID === null || currentEngFormID === '') {
        alert("Failed to create or retrieve Engineering Form ID.");
        return; // Stop if still no valid form ID
    }

    // Prepare the data to update the engineering form
    const updatedEngineeringData = { 
        engFormID: currentEngFormID,
        engReview: document.querySelector('input[name="review-by-engineer"]:checked').value, 
        engCustNotification: Number(document.querySelector('input[name="require-notification"]:checked').value),
        engDispositionDesc: document.getElementById('disposition').value,
        engDrawingUpdate: Number(document.querySelector('input[name="require-updating"]:checked').value),
        engRevisionNo: Number(document.getElementById('original-rev-number').value),
        engUpdatedRevisionNo: Number(document.getElementById('updated-rev-number').value),
        engUpdatedRevisionDate: document.getElementById('revision-date').value,
        engID: Number(sessionStorage.getItem("empID")),
        engDate: document.getElementById('engineer-date').value
    };

    console.log("Updated engineering data being sent:", updatedEngineeringData);

    try {
        // First, update the engineering form (PUT request)
        let response = await fetch(`/api/engineerForms/${updatedEngineeringData.engFormID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedEngineeringData),
        });

        if (!response.ok) {
            throw new Error('Failed to update engineering form');
        }

        alert('Successfully updated engineering form data. Purchasing department has been notified');

        // After updating the engineering form, check the NCR form and update it if necessary
        const ncrResponse = await fetch(`/api/ncrForms/${ncrFormID}`);
        const ncrForm = await ncrResponse.json();

        
    } catch (error) {
        console.error('Error:', error);
        alert('Error occurred while updating engineering or NCR form.');
    }
});

async function getEngineeringFormID(status) {
    if (status === "UPDATE") {
        console.log(status);
        // Return the existing form ID from the database or from user input if updating
        const ncrNo = document.getElementById('ncr-no').value.replace(/\D/g, '');
        try {
            const response = await fetch(`/api/engineerForms/${ncrNo}`); // Fetch existing form based on NCR number

            if (!response.ok) {
                throw new Error('Form not found for update.');
            }

            const data = await response.json();
            return data.engFormID; // Return the existing form ID for updating
        } catch (error) {
            console.error('Error fetching engineering form for update:', error);
            throw error;
        }
    } else {
        // Generate new form ID
        try {
            const response = await fetch('/api/engineerForms');

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();
            return data.length + 1; // New form ID based on the existing count
        } catch (error) {
            console.error('Error generating new engineering form ID', error);
            throw error;
        }
    }
}


async function createEngineerForm() {
    const status = await checkNCRValidity();

    if (status === "VALID" || status === "UPDATE") {
        // Collect inputs
        const engineeringFormData = { 
            engFormID: await getEngineeringFormID(status),  
            engReview: document.querySelector('input[name="review-by-engineer"]:checked').value, 
            engCustNotification: document.querySelector('input[name="require-notification"]:checked').value,
            engDispositionDesc: document.getElementById('disposition').value,
            engDrawingUpdate: document.querySelector('input[name="require-updating"]:checked').value,
            engRevisionNo: document.getElementById('original-rev-number').value,
            engUpdatedRevisionNo: document.getElementById('updated-rev-number').value,
            engUpdatedRevisionDate: document.getElementById('revision-date').value,
            engID: sessionStorage.getItem("empID"),
            engDate: document.getElementById('engineer-date').value
        };

        // Validate required fields and highlight invalid ones (only 'review-by-engineer' and 'disposition')
        const requiredFields = ['review-by-engineer', 'disposition'];
        let formIsValid = true;

        requiredFields.forEach(field => {
            const input = document.querySelector(`[name="${field}"]`) || document.getElementById(field);
            if (!input || (!input.value.trim() && !input.checked)) {
                formIsValid = false;
                input?.classList.add('error');
            } else {
                input?.classList.remove('error');
            }
        });

        // If form is invalid, stop form submission
        if (!formIsValid) {
            alert('Please fill out all required fields correctly.');
            return; // Prevent form submission
        }

        try {
            const response = await fetch(`/api/engineerForms/${engineeringFormData.engFormID}`, {
                method: status === "UPDATE" ? 'PUT' : 'POST', // Use PUT if updating
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(engineeringFormData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            alert(status === "UPDATE" ? 'Engineering form updated successfully' : 'Engineering form created successfully');

            const ncrFormNo = document.getElementById('ncr-no').value.replace(/\D/g, '');  // Clean NCR form ID
            await notifyDepartmentManager(ncrFormNo, "Purchasing");

        } catch (error) {
            console.error('Error creating or updating engineering form:', error);
            alert('Failed to create or update engineering form. Please try again');
        }
    } else if (status === "ERROR") {
        alert('Unknown error, Please try again and if the issue persists check with administrator');
    } else if (status === "INCOMPLETE") {
        alert('Cannot create or update engineering form. Form is incomplete meaning there is no quality rep entry.\nCheck quality representative entry and try again');
    } else if (status === "INVALID") {
        alert('Cannot create or update engineering form. NCR number is not valid.');
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
}

