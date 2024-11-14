// Define submit button
const submitBtn = document.getElementById('submit-engineering-btn');

// Function which creates engineering form
async function createEngineeringForm(){
    //Collect inputs
    const engineeringFormData = { 
        engFormID: await getEngineeringFormID(),
        engReview: document.querySelector('input[name="review-by-engineer"]:checked').value, 
        engCustNotification: document.querySelector('input[name="require-notification"]:checked').value,
        engDispositionDesc: document.getElementById('disposition').value,
        engDrawingUpdate: document.querySelector('input[name="require-updating"]:checked').value,
        engRevisionNo: document.getElementById('original-rev-number').value,
        engUpdatedRevisionNo: document.getElementById('updated-rev-number').value,
        engID: sessionStorage.getItem("empID"),
        engDate: document.getElementById('engineer-date').value
    };
    try{
        // HANDLE CREATION WITH INPUT 
    }
    catch(error){
        console.error('Error creating engineering form:', error);
        alert('Failed to create engineer form. Please try again');
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

// EventListener code for submit button
submitBtn.addEventListener('click', function(){
    createEngineeringForm();
});