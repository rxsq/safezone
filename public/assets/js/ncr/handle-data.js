// Bootstrap toggle for tooltips
function tooltip() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Fetch from NCR Forms API
function fetchNcrForms(){
    fetch('api/ncrForms')
        .then(response => {
            if(!response.ok){
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            populateRecentNcrTable(data);
            updateMetrics(data);
            renderBarChart(data);
            renderSupplierChart(data);
            tooltip();
        })
        .catch(error => console.error('Error fetching NCR forms:', error))
}

// Function to update metrics on page
function updateMetrics(data){
    // Parse through data to get metric values
    const total = data.length;
    const active = data.filter(ncr => ncr.ncrStatusID === 1).length;
    const inactive = data.filter(ncr => ncr.ncrStatusID === 2).length;

    // Set metrics
    document.getElementById('metricTotal').innerText = total;
    document.getElementById('metricActive').innerText = active;
    document.getElementById('metricInactive').innerText = inactive;
}

// Function to populate recent NCR table
async function populateRecentNcrTable(data){
    // Get tablebody element & clear innerHTML
    const tableBody = document.getElementById('tbodyRecentNCR');
    tableBody.innerHTML = '';

    data.sort((a,b) => new Date(b.ncrIssueDate) - new Date(a.ncrIssueDate));

    let openRecords = 0; 

    // Loop which iterates over all items in data array
    for(let i = 0; i < data.length; i ++){
        // If 5 open records are showing, then break out of loop
        if(openRecords === 5) break;

        let ncr = data[i];

        const row = document.createElement('tr'); // Create new row element to be used in the table

        let ncrStatus;
        // If status is open, incriment openRecords
        if(ncr.ncrStatusID === 1){
            ncrStatus = "Open";
            openRecords++;
        } else continue;

        // Fetch supplier name 
        const productResponse = await fetch(`/api/products/${ncr.prodID}`);
        const productData = await productResponse.json();

        const supplierResponse = await fetch(`/api/suppliers/${productData.supID}`);
        const supplierData = await supplierResponse.json();

        const supplierName = supplierData.supName;

        // Generating table row
        row.innerHTML = `
            <td>${ncr.ncrFormNo}</td>
            <td>${supplierName}</td>
            <td>${ncr.ncrIssueDate.substring(0, 10)}</td>
            <td>${ncrStatus}</td>
            <td class="action-buttons-td">
                <button class="edit-btn" onclick="viewNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="View NCR">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="edit-btn" onclick="editNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Edit NCR">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="delete-btn" onclick="archiveNCR('${ncr.ncrFormID}', '${ncr.ncrFormNo}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Archive NCR">
                    <i class="bi bi-archive"></i>
                </button>
                <button class="bi bi-file-earmark-pdf" onclick="printNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Print PDF">
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    }
}

// DOMContentLoaded EventListener
document.addEventListener('DOMContentLoaded', function () {
    tooltip();
});

// Groups NCR records by issue date
function groupByIssueDate(data) {
    const dateCounts = {};

    data.forEach(ncr => {
        const issueDate = ncr.ncrIssueDate.substring(0, 10); // Format: YYYY-MM-DD
        dateCounts[issueDate] = (dateCounts[issueDate] || 0) + 1;
    });

    return dateCounts;
}

//Groups NCR records by YYYY-MM
function groupByYearMonth(data) {
    const dateCounts = {};

    data.forEach(ncr => {
        // Extract "YYYY-MM" from "YYYY-MM-DD" format
        const issueYearMonth = ncr.ncrIssueDate.substring(0, 7); // e.g., "2024-11"
        dateCounts[issueYearMonth] = (dateCounts[issueYearMonth] || 0) + 1;
    });

    return dateCounts;
}    
// NCR chart 
function renderBarChart(data) {
    const ctx = document.getElementById('issueDateChart').getContext('2d');

    // Get the grouped data by year-month
    const dateCounts = groupByYearMonth(data);
    const labels = Object.keys(dateCounts);
    const values = Object.values(dateCounts);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "NCR's per Year-Month",
                data: values,
                backgroundColor: '#173451',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year-Month',
                    },
                },
                y: {
                    beginAtZero: true, // Ensure Y-axis starts at 0
                    title: {
                        display: true,
                        text: "Number of NCR",
                    },
                    ticks: {
                        stepSize: 1, // Count NCR forms in whole numbers (0, 1, 2, etc.)
                    },
                },
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
        },
    });
}

//Groups NCR's by supplier
async function groupBySupplier(data) {
    const supplierCounts = {};

    // Iterate over each NCR record to count by supplier name
    for (let ncr of data) {
        const prodID = ncr.prodID;
        
        // Fetch the product based on prodID
        const productResponse = await fetch(`/api/products/${prodID}`);
        const productData = await productResponse.json();

        const supID = productData.supID;

        // Fetch the supplier based on supID
        const supplierResponse = await fetch(`/api/suppliers/${supID}`);
        const supplierData = await supplierResponse.json();

        const supplierName = supplierData.supName || 'Unknown'; // Get the supplier name or default to 'Unknown'

        // Count NCRs per supplier
        supplierCounts[supplierName] = (supplierCounts[supplierName] || 0) + 1;
    }

    return supplierCounts; // Returns an object like { "Supplier Name 1": count, "Supplier Name 2": count, ... }
}
// Supplier chart
async function renderSupplierChart(data) {
    const ctx = document.getElementById('supplierChart').getContext('2d');

    // Group NCRs by supplier name using groupBySupplier function
    const supplierCounts = await groupBySupplier(data); // Await the asynchronous grouping function

    const labels = Object.keys(supplierCounts); // Supplier names
    const values = Object.values(supplierCounts); // NCR counts per supplier

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "NCR's per Supplier",
                data: values,
                backgroundColor: '#173451',
                borderColor: 'rgba(255, 171, 0, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Supplier Name',
                    },
                    ticks: {
                        autoSkip: false, // Display all supplier names on the x-axis
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Number of NCR",
                    },
                    ticks: {
                        stepSize: 1, // Use whole numbers for NCR count
                    },
                },
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
        },
    });
}

// Viewing NCR's
function viewNCR(ncrFormID){
    const mode = 'view';
    sessionStorage.setItem("mode", "view");
    window.location.href = `non-conformance-report.html?ncrFormID=${ncrFormID}&mode=${mode}`;
}

// Editing NCR's
function editNCR(ncrFormID){
    const mode = 'edit'
    window.location.href = `non-conformance-report.html?ncrFormID=${ncrFormID}&mode=${mode}`;
    populateNCRInputs(ncrFormID);
}

// Printing NCR to PDF
function printNCR(ncrFormID){

}

// Archive NCR 
function archiveNCR(ncrFormID, ncrFormNo) {
    fetch(`/api/ncrForms/${ncrFormID}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch NCR form');
            return response.json();
        })
        .then(data => {
            const { engFormID, purFormID, ncrStage } = data;

            if (ncrStage === 'ARC') {
                alert('This NCR form is already archived.');
                return;
            }

            // Check for incomplete fields
            const incompleteFields = [];
            if (!engFormID) incompleteFields.push('Engineering Form');
            //if (!purFormID) incompleteFields.push('Purchasing Form');

            let confirmationMessage = `Are you sure you want to archive this NCR form?`;
            if (incompleteFields.length > 0) {
                confirmationMessage += `\nThe following form(s) are not completed: ${incompleteFields.join(', ')}.`;
            }

            // Ask for confirmation
            if (!confirm(confirmationMessage)) {
                return;
            }

            // Proceed to archive the form
            fetch(`/api/ncrForms/${ncrFormNo}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    ncrStage: 'ARC',
                    ncrStatusID: 2, 
                }),
            })
                .then(response => {
                    if (response.ok) {
                        alert('NCR form archived successfully!');
                        window.location.reload(); // Refresh the page
                    } else {
                        return response.json().then(error => {
                            throw new Error(error.message || 'Failed to archive NCR form');
                        });
                    }
                })
                .catch(error => {
                    console.error('Error archiving NCR form:', error);
                    alert(`Error: ${error.message}`);
                });
        })
        .catch(error => {
            console.error('Error fetching NCR form:', error);
            alert(`Error: ${error.message}`);
        });
}


//DOMContentLoaded Event Listener
document.addEventListener('DOMContentLoaded', function(){
    fetchNcrForms();

    const newNCRButton = document.getElementById('new-ncr-btn');

    sessionStorage.setItem("mode", "");

    newNCRButton.addEventListener('click', function() {
        window.location.href = 'non-conformance-report.html?' + new URLSearchParams({ mode: 'create' }).toString();
    });
});



