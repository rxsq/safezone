/*

Business rules:
NCR Number
Rules: 
- NCR numbers must follow format 20XX-XXX (Year followed by 3 digit number)
- Required field

*/


//Get form
const form = document.getElementById('ncr-form')

//Non-Conformance Report Document Info
const ncrNo = document.getElementById('ncr-no'); 
const docNo = document.getElementById('document-no');
const ncrDate = document.getElementById('ncr-date');
const ncrStatus = document.getElementById('status');

//Quality Representative Info
const suppName = document.getElementById('supplier-name');

//Checkboxes for identifying process applicable * not required
//const recInsp = document.getElementById('recInsp');
//const wip = document.getElementById('wip');

//Product & Order Info
const prodNo = document.getElementById('po-prod-no');
const salesNo = document.getElementById('sales-order-no');
const receiveQuantity = document.getElementById('quantity-received');
const defectiveQuantity = document.getElementById('quantity-defective');
const description = document.getElementById('description-item');
const defectDesc = document.getElementById('description-defect');
const qualityRepName = document.getElementById('quality-rep-name');
const qualityRepDate = document.getElementById('quality-rep-date');

//EventListener for submit click on button
form.addEventListener('submit', e => {
    e.preventDefault();
    validateInputs();
});

//Array which stores issues
let error_list = [];

//Function to validate inputs
const validateInputs = () => {
    //Clear error list
    error_list = [];

    //Store .value property from each input and trim whitespace
    const ncrNoValue = ncrNo.value.trim();
    const docNoValue = docNo.value.trim();
    const ncrDateValue = ncrDate.value.trim();
    const statusValue = ncrStatus.value.trim();
    const suppNameValue = suppName.value.trim();
    const prodNoValue = prodNo.value.trim();
    const salesNoValue = salesNo.value.trim();
    const receiveQuantityValue = receiveQuantity.value.trim();
    const defectiveQuantityValue = defectiveQuantity.value.trim();
    const descriptionValue = description.value.trim();
    const defectDescValue = defectDesc.value.trim();
    const qualityRepNameValue = qualityRepName.value.trim();
    const qualityRepDateValue = qualityRepDate.value.trim();

    //Boolean variable which is checked later
    let isValid = true;

    //NCR number patten
    const ncrPattern = /^20\d{2}-\d{3}$/;
    
    //Required field validation
    if(!ncrNoValue){
        error_list.push("NCR Number is required.")
        isValid = false;
    }
    if(!docNoValue){
        error_list.push("Document Number is required.")
        isValid = false;
    }
    if(!ncrDateValue){
        error_list.push("NCR Date is required.")
        isValid = false;
    }
    if(!statusValue){
        error_list.push("Status is required.")
        isValid = false;
    }
    if(!suppNameValue){
        error_list.push("Supplier Name is required.")
        isValid = false;
    }
    if(!prodNoValue){
        error_list.push("Product Number is required.")
        isValid = false;
    }
    if(!salesNoValue){
        error_list.push("Product Number is required.")
        isValid = false;
    }
    if(!receiveQuantityValue){
        error_list.push("Received Quantity is required.")
        isValid = false;
    }
    if (!defectiveQuantityValue) {
        error_list.push("Defective Quantity is required.");
        isValid = false;
    }
    if (!descriptionValue) {
        error_list.push("Item Description is required.");
        isValid = false;
    }
    if (!defectDescValue) {
        error_list.push("Defect Description is required.");
        isValid = false;
    }
    if (!qualityRepNameValue) {
        error_list.push("Quality Representative Name is required.");
        isValid = false;
    }
    if (!qualityRepDateValue) {
        error_list.push("Quality Representative Date is required.");
        isValid = false;
    }
    
    //Check NCR pattern
    if(!ncrPattern.test(ncrNoValue)){
        error_list.push("NCR Number must follow the format: 20XX-XXX (Year followed by a 3-digit number).")
        isValid = false;
    }

    //Checking isNaN for number fields
    if(isNaN(docNoValue)){
        error_list.push("Incorrect format for document number.")
        isValid = false;
    }
    if(isNaN(prodNoValue)){
        error_list.push("Incorrect format for product number.")
        isValid = false;
    }
    if(isNaN(salesNoValue)){
        error_list.push("Incorrect format for sales order number.")
        isValid = false;
    }
    if(isNaN(receiveQuantityValue)){
        error_list.push("Incorrect format for receive quantity.")
        isValid = false;
    }
    if(isNaN(defectiveQuantityValue)){
        error_list.push("Incorrect format for defective quantity.")
        isValid = false;
    }

    //Add more validation for date values: i.e. impossible entries 

    //Check isValid variable
    if(!isValid){ // If not valid
        const errorMessages = error_list.join('\n');
        alert(`Validation Errors:\n${errorMessages}`) //Temp alert for testing
    }
    else{ //If valid
        alert('Success!')
    }
};

