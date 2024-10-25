document.addEventListener('DOMContentLoaded', function(){ 
    //localStorage.clear(); //Add to reset records

    //retrieve data in localstorage
    const storedData = localStorage.getItem('suppliers');

    if(storedData){
        //if exists then parse it and populate table
        const data = JSON.parse(storedData);
        populateSupplierTable(data);
    }
    else {
        //initially fetch data from json
        fetch('../assets/data/suppliers.json')
        .then(response => response.json())
        .then(data => {
            //store fetched data in local storage
            localStorage.setItem('suppliers', JSON.stringify(data));
            populateSupplieTrable(data);
        })
    }  
});

function populateSupplierTable(data){
    const tableBody = document.getElementById('supplier-list');

    //clear existing rows
    tableBody.innerHTML = "";

    //loop through data and insert into supplier table
    data.forEach(supplier => {
        const row = document.createElement('tr');

        /*insert each record into the columns in the table
        and insert action buttons with onclick events that point
        to the different related functions*/
        row.innerHTML = `
            <td>${supplier.supName}</td>
            <td>${supplier.supContactName}</td>
            <td>${supplier.supContactEmail}</td>
            <td>${supplier.supContactPhone}</td>
            <td class="action-buttons-td">
                <button class="view-btn" onclick="viewSupplier('${supplier.supID}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="edit-btn" onclick="editSupplier('${supplier.supID}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="delete-btn" onclick="deleteSupplier('${supplier.supName}', '${supplier.supID}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    })
}

//function to handle viewing selected supplier
function viewSupplier(supID){
    const storedData = localStorage.getItem('suppliers');
    if(storedData){
        const suppliers = JSON.parse(storedData);
        const supplierToView = suppliers.find(supplier => supplier.supID == supID);

        //populate modal fields with data
        document.getElementById('viewSupplierID').innerText = supplierToView.supID;
        document.getElementById('viewSupplierName').innerText = supplierToView.supName;
        document.getElementById('viewContactName').innerText = supplierToView.supContactName;
        document.getElementById('viewContactEmail').innerText = supplierToView.supContactEmail;
        document.getElementById('viewContactPhone').innerText = supplierToView.supContactPhone;
        document.getElementById('viewAddress').innerText = supplierToView.supAddress;
        document.getElementById('viewCity').innerText = supplierToView.supCity;
        document.getElementById('viewCountry').innerText = supplierToView.supCountry;

        //display modal
        const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
        viewModal.show();
    }   
}

//function to handle editing selected supplier
function editSupplier(supID){
    const storedData = localStorage.getItem('suppliers');
    if(storedData){
        const suppliers = JSON.parse(storedData);
        const supplierToEdit = suppliers.find(supplier => supplier.supID == supID);

        //populate form fields with selected record data
        document.getElementById('editSupID').value = supplierToEdit.supID;
        document.getElementById('editSupplierName').value = supplierToEdit.supName;
        document.getElementById('editContactName').value = supplierToEdit.supContactName;
        document.getElementById('editContactEmail').value = supplierToEdit.supContactEmail;
        document.getElementById('editContactPhone').value = supplierToEdit.supContactPhone;
        document.getElementById('editAddress').value = supplierToEdit.supAddress;
        document.getElementById('editCity').value = supplierToEdit.supCity;
        document.getElementById('editCountry').value = supplierToEdit.supCountry;

        //display modal
        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();
    }
}

//save changes event listener attached to edit modal
document.getElementById('btnSaveChanges').onclick = function() {
    const supID = document.getElementById('editSupID').value;
    const updatedSupplierName = document.getElementById('editSupplierName').value;
    const updatedSupplierContactName = document.getElementById('editContactName').value;
    const updatedSupplierContactEmail = document.getElementById('editContactEmail').value;
    const updatedSupplierContactPhone = document.getElementById('editContactPhone').value;
    const updatedSupplierAddress = document.getElementById('editAddress').value;
    const updatedSupplierCity = document.getElementById('editCity').value;
    const updatedSupplierCountry = document.getElementById('editCountry').value;

    const storedSupData = localStorage.getItem('suppliers');
    const storedNcrData = localStorage.getItem('ncrForms');

    if(storedSupData){
        const suppliers = JSON.parse(storedSupData);

        //find index of supplier to update
        const index = suppliers.findIndex(supplier => supplier.supID == supID);
        if(index != -1){
            //update record
            suppliers[index] = {
                supID,
                supContactName: updatedSupplierContactName,
                supContactEmail: updatedSupplierContactEmail,
                supContactPhone: updatedSupplierContactPhone,
                supName: updatedSupplierName,
                supAddress: updatedSupplierAddress,
                supCity: updatedSupplierCity,
                supCountry: updatedSupplierCountry
            };

            //save updated data into localstorage
            localStorage.setItem('suppliers', JSON.stringify(suppliers));

            //refresh table
            populateSupplierTable(suppliers);
        }
    }
    
    if(storedNcrData){
        //handle updating supplier in product table
    }

    const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
    editModal.hide();
}

//function to handle deleting selected supplier
function deleteSupplier(supID, supName){
    //show conformation message in modal
    document.getElementById('deleteModalBody').innerText = `Are you sure you want to delete the record: ${supName}?`

    //event listener for yes button
    document.getElementById('btnDeleteYes').onclick = function() {
        removeSupplier(supID);
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    };
    
    document.getElementById('btnDeleteNo').onclick = function(){
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    }
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

function removeSupplier(supID){
    const storedData = localStorage.getItem('suppliers');
    if(storedData){
        const suppliers = JSON.parse(storedData);

        //filters out all suppliers other than the deleted once
        const updatedSuppliers = suppliers.filter(suppliers => suppliers.supID != supID);

        //set to localstorage and repopulate table with updated data
        localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
        populateSupplierTable(updatedSuppliers);
    }
}