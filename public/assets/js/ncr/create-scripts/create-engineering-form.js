if(sessionStorage.getItem("mode") == "create"){
// Define submit button
const submitBtn = document.getElementById('submit-engineering-btn');

// Function which creates engineering form
async function createEngineeringForm(){

    const status = await checkNCRValidity();

    if(status == "VALID"){

        //Collect inputs
        const engineeringFormData = { 
            engFormID: await getEngineeringFormID(),
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
        try{
            const response = await fetch('/api/engineerForms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'applications/json'
                },
                body: JSON.stringify(engineeringFormData)     
            });

            if(!response.ok){
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            const ncrFormNo = document.getElementById('ncr-no').value.replace(/\D/g, '');  // Clean NCR form ID
            alert('Success creating Engineer Form. Purchasing department has been notified');        }
        catch(error){
            console.error('Error creating engineering form:', error);
            alert('Failed to create engineer form. Please try again');
        }
    }
    else if(status == "ERROR"){
        alert('Unknown error, Please try again and if the issue persists check with administrator');
    }
    // If quality rep form is not completed
    else if(status == "INCOMPLETE"){
        alert('Cannot create engineering form. Form is incomplete meaning there is no quality rep entry.\nCheck quality representive entry and try again');
    }
    // If NCR number is not valid for whatever reason
    else if(status == "INVALID"){
        alert('Cannot create engineering form. NCR number is not valid.')
    }
}

// Function which generates engineering form ID
async function getEngineeringFormID(){
    try{
        const response = await fetch('api/engineerForms');

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

// Function which updates NCR
async function updateNCR(data){

}

// Function which checks validity of NCR record
async function checkNCRValidity(){
    let ncrNo = document.getElementById('ncr-no').value.replace(/\D/g, '');
    
    if(isNaN(ncrNo)){
        return "INVALID";
    }
    
    // Check with forms 
    try{
        const response = await fetch('/api/ncrForms');
        const ncrData = await response.json();

        const ncrForm = ncrData.find(item => item.ncrFormNo === ncrNo);

        if(!ncrForm){
            return "INVALID";
        }
        else if(ncrForm.qualFormID === null){
            return "INCOMPLETE";
        }

        return "VALID";
    }
    catch(error){
        console.error("Error fetching NCR data:", error);
        return "ERROR";
    }
}

// EventListener code for submit button
submitBtn.addEventListener('click', function(){
    createEngineeringForm();
});
}