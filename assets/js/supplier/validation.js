// Get all fields

//Form
const suppForm = document.getElementById('supplier-form') 

//Supplier info
const suppName = document.getElementById('supplier-name');
const suppContactName = document.getElementById('supplier-contact-name');
const suppEmail = document.getElementById('supplier-email');
const phone = document.getElementById('supplier-phone');

//Address info
const address = document.getElementById('supplier-address');
const city = document.getElementById('supplier-city');
const country = document.getElementById('supplier-country');

//EventListener for submit click on button
suppForm.addEventListener('submit', e => {
    e.preventDefault();
    validateInputs();
});

//Array which stores issues
let error_list = [];

const validateInputs = () => {
    //Clear errors
    error_list = [];
    
    const suppNameValue = suppName.value.trim();
    const suppContactNameValue = suppContactName.value.trim();
    const suppEmailValue = suppEmail.value.trim();
    const phoneValue = phone.value.trim();
    const addressValue = address.value.trim();
    const cityValue = city.value.trim();
    const countryValue = country.value.trim();

    let isValid = true;

    if(!suppNameValue){
        error_list.push("Supplier Name is required.")
        isValid = false;
    }
    if(!suppContactNameValue){
        error_list.push("Contact Name is required.")
        isValid = false;
    }
    if(!suppEmailValue){
        error_list.push("Email is required.")
        isValid = false;
    }
    if(!phoneValue){
        error_list.push("Phone Number is required.")
        isValid = false;
    }
    if(!addressValue){
        error_list.push("Address is required.")
        isValid = false;
    }
    if(!cityValue){
        error_list.push("City is required.")
        isValid = false;
    }
    if(!countryValue){
        error_list.push("Country is required.")
        isValid = false;
    }

    //Check isValid variable
    if(!isValid){ // If not valid
        const errorMessages = error_list.join('\n');
        alert(`Validation Errors:\n${errorMessages}`) //Temp alert for testing
    }
    else{ //If valid
        alert('Success!')
    }
};