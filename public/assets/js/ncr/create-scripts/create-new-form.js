// Once user completes a quality form, it will create a new ncr
// Gets current year
let qualFormID;
const submitBtn = document.getElementById('submit-quality-btn');
sessionStorage.setItem('currentNCRStage', "QUA")
let errorList;

// Function which creates quality form
async function createQualityForm() {
    const errorList = [];
    const qualityFormData = {
        qualFormID: await getQualityFormID(),
        qualFormProcessApplicable: getProcess(),
        qualItemDesc: document.getElementById('description-item')?.value?.trim() || '', 
        qualIssueDesc: document.getElementById('description-defect')?.value?.trim() || '',
        qualItemID: parseInt(document.getElementById('po-prod-no')?.value?.trim(), 10) || null, 
        qualImageFileName: null, 
        qualSalesOrderNo: parseInt(document.getElementById('sales-order-no')?.value?.trim(), 10) || null,
        qualQtyReceived: Number(document.getElementById('quantity-received').value) || null, 
        qualQtyDefective: Number(document.getElementById('quantity-defective').value) || null, 
        qualItemNonConforming: parseInt(document.querySelector('input[name="item-nonconforming"]:checked')?.value, 10) || null, 
        qualRepID: parseInt(sessionStorage.getItem('empID'), 10) || null, 
        qualDate: document.getElementById('quality-rep-date')?.value?.trim() || ''
    };

    const requiredFields = [
        'supplier-name', 
        'po-prod-no', 
        'process-applicable',
        'sales-order-no', 
        'quantity-received', 
        'quantity-defective', 
        'description-item', 
        'description-defect', 
        'item-nonconforming', 
        'quality-rep-name'
    ];

    let formIsValid = true;
    let isAnyFieldEmpty = false;

    // Check for empty required fields and add invalid class
    requiredFields.forEach(field => {
        const input = document.getElementById(field);

        if (field === 'item-nonconforming') {
            const nonConformingValue = document.querySelector('input[name="item-nonconforming"]:checked');
            if (!nonConformingValue) {
                formIsValid = false;
                isAnyFieldEmpty = true;
                document.getElementById(field)?.classList.add('error');
            } else {
                document.getElementById(field)?.classList.remove('error');
            }
        } 
        else if(field === 'process-applicable'){
            const processApplicable = document.querySelector('input[name="process-applicable"]:checked');
            if (!processApplicable) {
                formIsValid = false;
                isAnyFieldEmpty = true;
                document.getElementById(field)?.classList.add('error');
            } else {
                document.getElementById(field)?.classList.remove('error');
            }
        }
        else if (!input || !input.value?.trim()) {
            formIsValid = false;
            isAnyFieldEmpty = true;
            input?.classList.add('error');
        } else {
            input?.classList.remove('error');
        }
    });

    if(isAnyFieldEmpty){
        errorList.push('Please fill out all the fields.');
    }

    // Validate if Sales Order, Quantity Received, and Quantity Defective are valid numbers
    const salesOrderNo = parseFloat(qualityFormData.qualSalesOrderNo);
    const qtyReceived = parseFloat(qualityFormData.qualQtyReceived);
    const qtyDefective = parseFloat(qualityFormData.qualQtyDefective);

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
        document.getElementById('error-message').innerHTML = `<ul>${errorList.map(item => `<li>${item}</li>`).join('')}</ul>`;
        return;
    }

    try {
        const response = await fetch('/api/qualityForms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(qualityFormData) // Send form data without file
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        qualFormID = await getQualityFormID() - 1; 
        await createNCR(); 

    } catch (error) {
        console.error('Error creating quality form:', error);
        alert('Failed to create quality form. Please try again');
    }
}

// Function which generates quality form ID
async function getQualityFormID(){
    try{
        const response = await fetch('api/qualityForms');

        if(!response.ok){
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        return data.length + 1;
    }
    catch(error){
        console.error('Error regarding quality form ID generation', error);
        throw error;
    }
}

// Function which handles supplier/ production process
function getProcess(){
    if(document.getElementById('recInsp').checked){
        return "SUP";
    } 
    else if(document.getElementById('wip').checked){
        return "WIP";   
    }
    else return "";
}

// Function to create new NCR in "ncr_form.json"
// Function is called after quality form is created
async function createNCR(){
    const ncrFormNo = currentYear + await getNCRCode();
    

    // Stage changed because quality form should already be created once this is called
    sessionStorage.setItem("currentNCRStage", "ENG"); 

    const ncrData = {
        ncrFormNo: Number(ncrFormNo),
        qualFormID: Number(qualFormID),
        engFormID: null, //NULL since no eng form has been yet created
        purFormID: null, //NULL since no pur form has been yet created
        prodID: Number(document.getElementById('po-prod-no').value),
        ncrStatusID: 1, // 1: Open, 2: Closed
        ncrStage: sessionStorage.getItem("currentNCRStage"),
        ncrIssueDate: document.getElementById('quality-rep-date').value
    }

    try{
        const response = await fetch('/api/ncrForms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ncrData)
        });

        if(!response.ok){
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        
        alert('Success creating NCR and Quality Assurance Form. Engineering department has been notified');
        
        await notifyDepartmentManager(ncrFormNo, "Engineering");
    }
    catch(error){
        console.error('Error creating new NCR report:', error);
        alert('Failed to create NCR. Please try again.');
    }
}

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

// Event listener for radio buttons to remove error when selected
document.querySelectorAll('input[name="item-nonconforming"]').forEach(radio => {
    radio.addEventListener("change", function() {
        const formGroup = this.closest('.form-group');
        if (document.querySelector('input[name="item-nonconforming"]:checked')) {
            formGroup.classList.remove("error");
        }
    });
});

document.querySelectorAll('input[name="process-applicable"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        // Check if any checkbox is checked
        const checkboxGroup = document.querySelectorAll('input[name="process-applicable"]:checked');
        const processApplicableGroup = document.getElementById('process-applicable');  
        
        if (checkboxGroup.length > 0) {
            processApplicableGroup.classList.remove('error'); 
        } else {
            processApplicableGroup.classList.add('error');
        }
    });
});

// EventListener code for submit button
document.addEventListener('DOMContentLoaded', function() {
    // EventListener for submit button
    document.getElementById("qualityForm").addEventListener("submit", function(event) {
        event.preventDefault();

        removeErrorClasses();

        createQualityForm();
    });
});

// Function to remove error classes 
function removeErrorClasses() {
    const errorElements = document.querySelectorAll(".error");
    errorElements.forEach(element => {
        element.classList.remove("error");
    });
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

    // Await the response from getMostRecentNCRForm to make sure the ID is fetched before making the notification request
    const mostRecentNCRFormID = await getMostRecentNCRForm();
    
    // Add a new notification for the employee
    const notificationResponse = await fetch('/api/notifications/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: empID, 
            message: notificationMessage,
            ncrFormID: mostRecentNCRFormID  
        }),
    });

    const notificationResult = await notificationResponse.json();
    if (notificationResponse.ok) {
        console.log('Notification added successfully:', notificationResult);
    } else {
        console.error('Error adding notification:', notificationResult.error);
    }
}

async function getMostRecentNCRForm() {
    try {
        const response = await fetch("/api/ncrForms");
        
        if (!response.ok) {
            throw new Error('Failed to fetch NCR forms data.');
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const mostRecentNCRForm = data.items[data.items.length - 1];  
            const ncrFormID = mostRecentNCRForm.ncrFormID; 

            console.log('Most Recent NCRForm ID:', ncrFormID);
            return ncrFormID;
        } else {
            throw new Error('No NCR forms found.');
        }
    } catch (error) {
        console.error('Error fetching NCR form:', error);
    }
}
