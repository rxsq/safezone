const userRole = sessionStorage.getItem("userRole");
const mode = sessionStorage.getItem("mode");

document.addEventListener('DOMContentLoaded', () => {
    handleUserAccess();
    reDisableInaccessibleInputs();

    if (mode === 'edit') {
        navigateToUserForm();
    }
});

function handleUserAccess() {
    if (mode === 'view') {
        viewModeAccess();
    } else {
        handleUserRole(userRole);
    }
}

function handleUserRole(userRole) {
    switch (userRole) {
        case "Administrator": adminAccess(); break;
        case "Quality": qualityAccess(); break;
        case "Engineering": engineeringAccess(); break;
        case "Purchasing": purchasingAccess(); break;
        default: noAccess();
    }
}

function viewModeAccess() {
    disableAllInputs(); // Disables all input elements for view mode
}

function adminAccess() {
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
    });
}

function qualityAccess() {
    disableAllInputs();
    disableEngineeringForm();
    disablePurchasingForm();
    enableSectionInputs('#section-quality');
}

function engineeringAccess() {
    disableAllInputs();
    disablePurchasingForm();
    enableSectionInputs('#section-engineering');

    document.getElementById('submit-quality-btn').style.display = "none";
}

function purchasingAccess() {
    disableAllInputs();
    enableSectionInputs('#section-purchasing');

    document.getElementById('submit-quality-btn').style.display = "none";
    document.getElementById('submit-engineering-btn').style.display = "none";
}

function noAccess() {
    disableAllInputs(); // No access for unauthorized roles
}

function reDisableInaccessibleInputs() {
    const readonlyFields = [
        "ncr-no",
        "document-no",
        "ncr-date",
        "stage",
        "quality-rep-name",
        "quality-rep-date",
        "engineering",
        "engineer-date",
    ];

    readonlyFields.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.setAttribute('readonly', true);
            element.setAttribute('disabled', true);
        }
    });
}

// Helper function to disable all inputs
function disableAllInputs() {
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.setAttribute('readonly', true);
        input.setAttribute('disabled', true);
    });
}

function disableEngineeringForm() {
    if(mode != "create")
        document.getElementById('engineering-fieldset').style.display = "none";
}

function disablePurchasingForm() {
    if(mode != "create")
        document.getElementById('purchasing-fieldset').style.display = "none";
}

// Helper function to enable specific section inputs
function enableSectionInputs(sectionSelector) {
    const inputs = document.querySelectorAll(`${sectionSelector} input, ${sectionSelector} select, ${sectionSelector} textarea`);
    inputs.forEach(input => {
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
    });
}

// Function which closes forms based on the status of the current form (only in edit mode)
function navigateToUserForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const ncrFormID = urlParams.get('ncrFormID');

    fetch(`/api/ncrForms/${ncrFormID}`)
        .then(response => response.json())
        .then(ncrForm => {
            // Determine which form sections to display based on the retrieved NCR form
            if (!ncrForm.qualFormID) {
                showSection('#section-quality');
            } else if (!ncrForm.engFormID) {
                showSection('#section-engineering');
            } else if (!ncrForm.purFormID) {
                showSection('#section-purchasing');
            } else {
                console.log("All forms are closed or completed.");
                hideAllSections();
            }
        })
        .catch(error => {
            console.error('Error fetching NCR form:', error);
        });
}

// Helper function to display a specific section
function showSection(sectionSelector) {
    hideAllSections();
    document.querySelector(sectionSelector).style.display = "block";
}

// Helper function to hide all sections
function hideAllSections() {
    document.querySelectorAll('#section-quality, #section-engineering, #section-purchasing').forEach(section => {
        section.style.display = "none";
    });
}
