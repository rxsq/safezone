const userRole = sessionStorage.getItem("userRole");
const urlParams = new URLSearchParams(window.location.search);
const mode = sessionStorage.getItem("mode")

document.addEventListener('DOMContentLoaded', () => {
    handleUserAccess();
    reDisableInaccessibleInputs();
});

function handleUserAccess() {
    if (mode === 'view') {
        viewModeAccess();
    } 
    else{
        handleUserRole(userRole)
    }
}

function handleUserRole(userRole){
    switch(userRole){
        case "Administrator": adminAccess(); break;
        case "Quality": qualityAccess(); break;
        case "Engineering": engineeringAccess(); break;
        default: noAccess();
    }
}

function viewModeAccess(){
    disableAllInputs();  // Disables all input elements for view mode
}

function adminAccess(){
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
    });
}

function qualityAccess(){
    disableAllInputs();  // Disable all inputs by default

    const qualityFields = document.querySelectorAll('#section-quality input, #section-quality select, #section-quality textarea');
    qualityFields.forEach(input => {
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
    });
}

function engineeringAccess(){
    disableAllInputs();  // Disable all inputs by default

    const engineeringFields = document.querySelectorAll('#section-engineering input, #section-engineering select, #section-engineering textarea');
    engineeringFields.forEach(input => {
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
    });
}

function noAccess(){
    disableAllInputs();  // No access for unauthorized roles
}

function reDisableInaccessibleInputs() {
    document.getElementById("ncr-no").setAttribute('readonly', true);
    document.getElementById("ncr-no").setAttribute('disabled', true);
    
    document.getElementById("document-no").setAttribute('readonly', true);
    document.getElementById("document-no").setAttribute('disabled', true);
    
    document.getElementById("ncr-date").setAttribute('readonly', true);
    document.getElementById("ncr-date").setAttribute('disabled', true);
    
    document.getElementById("stage").setAttribute('readonly', true);
    document.getElementById("stage").setAttribute('disabled', true);
    
    document.getElementById("quality-rep-name").setAttribute('readonly', true);
    document.getElementById("quality-rep-name").setAttribute('disabled', true);
    
    document.getElementById("quality-rep-date").setAttribute('readonly', true);
    document.getElementById("quality-rep-date").setAttribute('disabled', true);
    
    document.getElementById("engineering").setAttribute('readonly', true);
    document.getElementById("engineering").setAttribute('disabled', true);
    
    document.getElementById("engineer-date").setAttribute('readonly', true);
    document.getElementById("engineer-date").setAttribute('disabled', true);
}


// Helper function to disable all inputs
function disableAllInputs(){
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.setAttribute('readonly', true);
        input.setAttribute('disabled', true);
    });
}
