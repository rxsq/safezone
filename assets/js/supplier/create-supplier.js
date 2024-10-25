//get supplier form
const form = document.getElementById('supplier-form');

//document info
const supplierName = document.getElementById('supplier-name');
const supplierContactName = document.getElementById('supplier-contact-name');
const supplierEmail = document.getElementById('supplier-email');
const supplierPhone = document.getElementById('supplier-phone');
const supplierAddress = document.getElementById('supplier-address');
const supplierCity = document.getElementById('supplier-city');
const supplierCountry = document.getElementById('supplier-country');

form.addEventListener('submit', e =>{
    e.preventDefault();
    validateInputs();
});

let error_list = [];

//define error modal
var errorModal = new bootstrap.Modal(document.getElementById('errorModal'));

var successModal = new bootstrap.Modal(document.getElementById('successModal'));

function validateInputs() {
    //clear error list
    error_list = [];

    //store .value property and trim whitespace
    const supplierNameValue = supplierName.value.trim();
    const supplierContactNameValue = supplierContactName.value.trim();
    const supplierEmailValue = supplierEmail.value.trim();
    const supplierPhoneValue = supplierPhone.value.trim();
    const supplierAddressValue = supplierAddress.value.trim();
    const supplierCityValue = supplierCity.value.trim();
    const supplierCountryValue = supplierCountry.value.trim();

    const storedData = localStorage.getItem('suppliers');
    
    const supIDValue = JSON.parse(storedData).length + 1;

    //boolean variable which is checked later 
    let isValid = true;

    //add validation
    if(!supplierNameValue){
        error_list.push("Supplier Name is required.")
        isValid = false;
    }
    if(!supplierContactNameValue){
        error_list.push("Contact Name is required.")
        isValid = false;
    }
    if(!supplierEmailValue){
        error_list.push("Email is required.")
        isValid = false;
    }
    if(!supplierPhoneValue){
        error_list.push("Phone Number is required.")
        isValid = false;
    }
    if(!supplierAddressValue){
        error_list.push("Address is required.")
        isValid = false;
    }
    if(!supplierCityValue){
        error_list.push("City is required.")
        isValid = false;
    }
    if(!supplierCountryValue){
        error_list.push("Country is required.")
        isValid = false;
    }


    if(!isValid){
        const errorMessages = error_list.join('\n');
        alert(`Validation Errors:\n${errorMessages}`) //Temp alert for testing
    }
    else{
        createNewSupplier({
            supID: supIDValue,
            supContactName: supplierContactNameValue,
            supContactEmail: supplierEmailValue,
            supContactPhone: supplierPhoneValue,
            supName: supplierNameValue,
            supAddress: supplierAddressValue,
            supCity: supplierCityValue,
            supCounty: supplierCountryValue
        });
    }
};

function createNewSupplier(validData) {
    const storedData = localStorage.getItem('suppliers');
    
    // Check if stored data exists
    let suppliers = storedData ? JSON.parse(storedData) : [];

    // Add the new supplier record
    suppliers.push(validData);

    // Save updated suppliers array back to local storage
    localStorage.setItem('suppliers', JSON.stringify(suppliers));

    const successMessage = 'Supplier added successfully!';
    alert(successMessage); 

    window.location.href = 'supplier.html'; // Change this to the path of your index page

}