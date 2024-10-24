//When html content is loaded, fire event
document.addEventListener('DOMContentLoaded', function(){ 
    //localStorage.clear(); //Add to reset records

    //retrieve data in localstorage
    const storedData = localStorage.getItem('ncrForms');

    if(storedData){
        //if exists then parse it and populate table
        const data = JSON.parse(storedData);
        updateMetrics(data);
        populateRecentNcrTable(data);
    }
    else {
        //initially fetch data from json
        fetch('../assets/data/ncr_forms.json')
        .then(response => response.json())
        .then(data => {
            //store fetched data in local storage
            localStorage.setItem('ncrForms', JSON.stringify(data));
            updateMetrics(data);
            populateRecentNcrTable(data);
        })
    }  
});

function updateMetrics(data){
    const total = data.length;
    const active = data.filter(ncr => ncr.ncrStatusID == "OPEN").length;
    const inactive = data.filter(ncr => ncr.ncrStatusID == "CLSD").length;

    document.getElementById('metricTotal').innerText = total;
    document.getElementById('metricActive').innerText = active;
    document.getElementById('metricInactive').innerText = inactive;

    //handle overdue
    //const overdue = 
    //document.querySelector('.key-metrics .metric-card.overdue p').innerText = overdue;
};

function populateRecentNcrTable(data){
    const tableBody = document.getElementById('tbodyRecentNCR');

    //clear existing rows
    tableBody.innerHTML = "";

    //loop through data and insert it into table
    data.forEach(ncr => {
        const row = document.createElement('tr');

        //status
        if(ncr.ncrStatusID == "OPEN") {
            statusText = "Active";
        }
        else{
            statusText = "Inactive";
        }

        /*insert each record into the columns in the table
        and insert action buttons with onclick events that point
        to the different related functions*/
        row.innerHTML = `
            <td>${ncr.ncrFormNo}</td>
            <td>${ncr.ncrDocumentNo}</td>
            <td>${ncr.ncrSupplierName}</td>
            <td>${ncr.ncrDefectDesc}</td>
            <td>${statusText}</td>
            <td class="action-buttons-td">
                <button class="view-btn" onclick="viewNCR('${ncr.ncrFormNo}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="edit-btn" onclick="editNCR('${ncr.ncrFormNo}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="delete-btn" onclick="deleteNCR('${ncr.ncrFormNo}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row); //append the row to the table body
    })
};

//function to handle viewing selected ncr
function viewNCR(ncrFormNo){
    const storedData = localStorage.getItem('ncrForms');
    if(storedData){
        const ncrForms = JSON.parse(storedData);
        const ncrToView = ncrForms.find(ncr => ncr.ncrFormNo == ncrFormNo);

        //populate modal fields with data 
        document.getElementById('viewFormNo').innerText = ncrToView.ncrFormNo;
        document.getElementById('viewDocumentNo').innerText = ncrToView.ncrDocumentNo;
        document.getElementById('viewDescription').innerText = ncrToView.ncrDescription;
        document.getElementById('viewIssueDate').innerText = new Date(ncrToView.ncrIssueDate);
        document.getElementById('viewImageFileName').innerText = ncrToView.ncrImageFileName;
        document.getElementById('viewProdID').innerText = ncrToView.prodID;
        document.getElementById('viewSalesOrderNo').innerText = ncrToView.ncrSalesOrderNo;
        document.getElementById('viewQtyReceived').innerText = ncrToView.ncrQtyRecieved;
        document.getElementById('viewQtyDefective').innerText = ncrToView.ncrQtyDefective;
        document.getElementById('viewDefectDesc').innerText = ncrToView.ncrDefectDesc;
        document.getElementById('viewStatusID').innerText = ncrToView.ncrStatusID;
        document.getElementById('viewSupplierName').innerText = ncrToView.ncrSupplierName;

        //display modal
        const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
        viewModal.show();
    }
};

//function to handle editing selected ncr
function editNCR(ncrFormNo){
    const storedData = localStorage.getItem('ncrForms');
    if(storedData){
        const ncrForms = JSON.parse(storedData);
        const ncrToEdit = ncrForms.find(ncr => ncr.ncrFormNo == ncrFormNo);

        //populate form fields with selected record's data
        document.getElementById('editNcrFormNo').value = ncrToEdit.ncrFormNo;
        document.getElementById('editDocumentNo').value = ncrToEdit.ncrDocumentNo;
        document.getElementById('editDescription').value = ncrToEdit.ncrDescription;
        document.getElementById('editIssueDate').value = ncrToEdit.ncrIssueDate.substring(0, 16); // For datetime-local
        document.getElementById('editImageFileName').value = ncrToEdit.ncrImageFileName;
        document.getElementById('editProdID').value = ncrToEdit.prodID;
        document.getElementById('editSalesOrderNo').value = ncrToEdit.ncrSalesOrderNo;
        document.getElementById('editQtyReceived').value = ncrToEdit.ncrQtyRecieved;
        document.getElementById('editQtyDefective').value = ncrToEdit.ncrQtyDefective;
        document.getElementById('editDefectDesc').value = ncrToEdit.ncrDefectDesc;
        document.getElementById('editStatusID').value = ncrToEdit.ncrStatusID;
        document.getElementById('editSupplierName').value = ncrToEdit.ncrSupplierName;

        //display modal
        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();
    }
};

//save changes event listener attached to edit modal
document.getElementById('btnSaveChanges').onclick = function() {
    const ncrFormNo = document.getElementById('editNcrFormNo').value;
    const updatedDocumentNo = document.getElementById('editDocumentNo').value;
    const updatedDescription = document.getElementById('editDescription').value;
    const updatedIssueDate = document.getElementById('editIssueDate').value;
    const updatedImageFileName = document.getElementById('editImageFileName').value;
    const updatedProdID = document.getElementById('editProdID').value;
    const updatedSalesOrderNo = document.getElementById('editSalesOrderNo').value;
    const updatedQtyReceived = document.getElementById('editQtyReceived').value;
    const updatedQtyDefective = document.getElementById('editQtyDefective').value;
    const updatedDefectDesc = document.getElementById('editDefectDesc').value;
    const updatedStatusID = document.getElementById('editStatusID').value;
    const updatedSupplierName = document.getElementById('editSupplierName').value;

    const storedData = localStorage.getItem('ncrForms');
    if(storedData){
        const ncrForms = JSON.parse(storedData);

        //find index of ncr to update
        const index = ncrForms.findIndex(ncr => ncr.ncrFormNo == ncrFormNo);
        if(index != -1){ //needs to at least be selecting an existing record
            //update record
            ncrForms[index] = {
                ncrFormNo,
                ncrDocumentNo: updatedDocumentNo,
                ncrDescription: updatedDescription,
                ncrIssueDate: updatedIssueDate,
                ncrImageFileName: updatedImageFileName,
                prodID: updatedProdID,
                ncrSalesOrderNo: updatedSalesOrderNo,
                ncrQtyRecieved: updatedQtyReceived,
                ncrQtyDefective: updatedQtyDefective,
                ncrDefectDesc: updatedDefectDesc,
                ncrStatusID: updatedStatusID,
                ncrSupplierName: updatedSupplierName
            };

            //save updated data into localstorage
            localStorage.setItem('ncrForms', JSON.stringify(ncrForms));

            //refresh table
            populateRecentNcrTable(ncrForms);
            updateMetrics(ncrForms);
        }
    }

    const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
    editModal.hide();
};

function deleteNCR(ncrFormNo){
    //show confirmation message in modal
    document.getElementById('deleteModalBody').innerText = `Are you sure you want to delete the record: ${ncrFormNo}?`;
    
    //event listener for yes button
    document.getElementById('btnDeleteYes').onclick = function() {
        removeNCR(ncrFormNo);
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    };
    
    document.getElementById('btnDeleteNo').onclick = function(){
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    }
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
};

function removeNCR(ncrFormNo){
    const storedData = localStorage.getItem('ncrForms');
    if(storedData){
        const ncrForms = JSON.parse(storedData);

        const updatedForms = ncrForms.filter(ncr => ncr.ncrFormNo != ncrFormNo);

        localStorage.setItem('ncrForms', JSON.stringify(updatedForms));

        populateRecentNcrTable(updatedForms);
        updateMetrics(updatedForms);
    }
}