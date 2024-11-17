if(sessionStorage.getItem("mode") == "create"){
// Once user completes a quality form, it will create a new ncr
// Gets current year
const currentYear = new Date().getFullYear();
let qualFormID;
const submitBtn = document.getElementById('submit-quality-btn');
sessionStorage.setItem('currentNCRStage', "QUA")

// Function which creates quality form
async function createQualityForm(){
    //Collect inputs and use get functions
    const qualityFormData = {
            qualFormID: await getQualityFormID(),
            qualFormSupplierProcess: getSupplierProcess(),
            qualFormProductionProces: getProductionProcess(),
            qualItemDesc: document.getElementById('description-item').value,
            qualIssueDesc: document.getElementById('description-defect').value,
            qualItemID: document.getElementById('po-prod-no').value, //.value is stored prodID
            qualImageFileName: null, // Handle later
            qualSalesOrderNo: document.getElementById('sales-order-no').value,
            qualQtyReceived: document.getElementById('quantity-received').value,
            qualQtyDefective: document.getElementById('quantity-defective').value,
            qualItemNonConforming: document.querySelector('input[name="item-nonconforming"]:checked').value,
            qualRepID: sessionStorage.getItem('empID'),
            qualDate:document.getElementById('quality-rep-date').value
        };
        try{
            const response = await fetch('/api/qualityForms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(qualityFormData)
            });

            if(!response.ok){
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            // Call to create new NCR record after completion of quality form
            qualFormID = await getQualityFormID() - 1; // Sets local variable to most recent quality form ID
            await createNCR();
        } catch(error){
            console.error('Error creating quality form:', error);
            alert('Failed to create quality form. Please try again'); // Modify this to use something nicer than an alert lol
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

// Function to create new NCR in "ncr_form.json"
// Function is called after quality form is created
async function createNCR(){
    const ncrFormNo = currentYear + await getNCRCode();
    const ncrFormID = await getNCRFormID();
    
    // Stage changed bc quality form should already be created once this is called
    sessionStorage.setItem("currentNCRStage", "ENG"); 

    const ncrData = {
        ncrFormID: ncrFormID,
        ncrFormNo: ncrFormNo,
        qualFormID: qualFormID,
        engFormID: null, //NULL since no eng form has been yet created
        purFormID: null, //NULL sine no pur form has been yet created
        prodID: document.getElementById('po-prod-no').value,
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
        
        alert('Success creating NCR and Quality Assuance Form. Engineering department has been notified');
    
        await notifyDepartmentManager(ncrFormNo, "Engineering");
    }
    catch(error){
        console.error('Error creating new NCR report:', error);
        alert('Failed to create NCR. Please try again.');
    }

    alert(inEditMode);

}

// EventListener code for submit button
submitBtn.addEventListener('click', function(){
    createQualityForm();
});

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

}