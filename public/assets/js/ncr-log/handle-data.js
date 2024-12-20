const pageSize = 6;
let currentPage = 1;
const userRole = sessionStorage.getItem('userRole');

function resetProductSelect() {
    const productSelect = document.getElementById('editProduct');
    while (productSelect.options.length) {
        productSelect.remove(0);
    }

    const defaultOption = document.createElement('option');
    defaultOption.value = "-1";  
    defaultOption.textContent = "Select a Product";  
    defaultOption.selected = true; 

    productSelect.appendChild(defaultOption);
}

// bootstrap tooltip 
function initializeTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

const urlParams = new URLSearchParams(window.location.search);
const savedSupplier = urlParams.get('supplier');
const savedStage = urlParams.get('stage');
const savedIssueDate = urlParams.get('issueDate');

function fetchNcrForms(page = 1, pagelimitSize = pageSize) {
    const paginationParams = `page=${page}&limit=${pagelimitSize}`;
    let url = `/api/ncrForms?${paginationParams}`;

    // Append filters to the URL if they exist
    if (savedSupplier) url += `&supplier=${savedSupplier}`;
    if (savedStage) url += `&stage=${savedStage}`;
    if (savedIssueDate) url += `&issueDate=${savedIssueDate}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "success") {
                // Update page number
                document.getElementById('page-number').textContent = `Page ${data.currentPage}`;
                
                populateRecentNcrTable(data.items);

                renderPaginationControls(data); 
            } else {
                console.error('Failed fetching data for pagination');
            }
        })
        .catch(error => console.error('Error fetching NCR forms:', error));
}

// Function to render pagination controls
function renderPaginationControls(data) {
    const paginationContainer = document.getElementById('pagination-controls');
    paginationContainer.innerHTML = ''; 

    const currentPage = data.currentPage;
    const totalPages = data.totalPages;

    const maxButtons = 3; 
    const pagesToShow = Math.min(maxButtons, totalPages); 
    
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - pagesToShow + 1);
    }

    createNavigationButton(paginationContainer, 'First', 1, currentPage === 1);
    createNavigationButton(paginationContainer, 'Prev', currentPage - 1, currentPage === 1);

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => fetchNcrForms(i);
        pageButton.disabled = i === currentPage;
        paginationContainer.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        const ellipsisButton = document.createElement('button');
        ellipsisButton.textContent = '...';
        ellipsisButton.onclick = () => showPageInput(currentPage, totalPages);
        paginationContainer.appendChild(ellipsisButton);
    }

    createNavigationButton(paginationContainer, 'Next', currentPage + 1, currentPage === totalPages);
    createNavigationButton(paginationContainer, 'Last', totalPages, currentPage === totalPages);
}

// Function to create navigation buttons
function createNavigationButton(container, text, page, isDisabled) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = () => fetchNcrForms(page);
    button.disabled = isDisabled;
    container.appendChild(button);
}

// Function to show page input 
function showPageInput(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination-controls');

    const pageInput = document.createElement('input');
    pageInput.type = 'number';
    pageInput.value = currentPage;
    pageInput.min = 1;
    pageInput.max = totalPages;
    pageInput.classList.add('page-input');

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Go';
    submitButton.onclick = () => {
        const inputPage = parseInt(pageInput.value);
        if (inputPage >= 1 && inputPage <= totalPages) {
            fetchNcrForms(inputPage);
        } else {
            alert('Please enter a valid page number');
        }
    };

    paginationContainer.innerHTML = '';
    paginationContainer.appendChild(pageInput);
    paginationContainer.appendChild(submitButton);
    pageInput.style.display = 'inline-block'; 
}


function updateMetrics(data) {
    const total = data.length;
    const active = data.filter(ncr => ncr.ncrStatusID == "OPEN").length;
    const inactive = data.filter(ncr => ncr.ncrStatusID == "CLSD").length;

    document.getElementById('metricTotal').innerText = total;
    document.getElementById('metricActive').innerText = active;
    document.getElementById('metricInactive').innerText = inactive;
}

// Function to populate recent NCR table with data
async function populateRecentNcrTable(data, closedRecords = false, archivedRecords = false) {
    console.log(data);

    const tableBody = document.getElementById('tbodyRecentNCR');
    if (!tableBody) {
        console.error("Table body not found");
        return;
    }

    tableBody.innerHTML = ''; // Clear existing rows

    let openRecords = 0;

    for (let i = 0; i < data.length; i++) {
        let ncr = data[i];

        // Skip closed records if `closedRecords` is false
        if (!closedRecords && ncr.ncrStatusID !== 1) {
            continue;
        }

        // Skip archived records if `archivedRecords` is false
        if (!archivedRecords && ncr.ncrStage === "ARC") {
            continue;
        }

        // Increment open records counter for open NCRs
        if (ncr.ncrStatusID === 1) {
            openRecords++;
        }

        // Create table row
        const row = document.createElement('tr');

        try {
            const productResponse = await fetch(`/api/products/${ncr.prodID}`);
            if (!productResponse.ok) throw new Error('Failed to fetch product');
            const productData = await productResponse.json();

            const supplierResponse = await fetch(`/api/suppliers/${productData.supID}`);
            if (!supplierResponse.ok) throw new Error('Failed to fetch supplier');
            const supplierData = await supplierResponse.json();
            const supplierName = supplierData.supName;

            switch (userRole) {
                case "Administrator":
                    row.innerHTML = `
                    <td>${ncr.ncrFormNo}</td>
                    <td>${supplierName}</td>
                    <td>${ncr.ncrIssueDate.substring(0, 10)}</td>
                    <td>${ncr.ncrStage}</td>
                    <td class="action-buttons-td">
                        <button class="action-btn view-btn" onclick="viewNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="View NCR">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="editNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Edit NCR">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="action-btn archive-btn" onclick="archiveNCR('${ncr.ncrFormID}', '${ncr.ncrFormNo}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Archive NCR">
                            <i class="bi bi-archive"></i>
                        </button>
                        <button class="action-btn pdf-btn" onclick="printNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Print PDF">
                            <i class="bi bi-filetype-pdf"></i>
                        </button>
                    </td>
                `;
                    break;
                default:
                    row.innerHTML = `
                    <td>${ncr.ncrFormNo}</td>
                    <td>${supplierName}</td>
                    <td>${ncr.ncrIssueDate.substring(0, 10)}</td>
                    <td>${ncr.ncrStage}</td>
                    <td class="action-buttons-td">
                        <button class="action-btn view-btn" onclick="viewNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="View NCR">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="editNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Edit NCR">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="action-btn pdf-btn" onclick="printNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Print PDF">
                            <i class="bi bi-filetype-pdf"></i>
                        </button>
                    </td>
                `;
                    break;
            }

            tableBody.appendChild(row);
            initializeTooltips();
        } catch (error) {
            console.error('Error fetching related data:', error);
        }
    }
}

function viewNCR(ncrFormID) {
    sessionStorage.setItem("mode", "view");
    window.location.href = `edit-ncr.html?ncrFormID=${ncrFormID}`;
}

function editNCR(ncrFormID) {
    sessionStorage.setItem("mode", "edit");
    window.location.href = `edit-ncr.html?ncrFormID=${ncrFormID}`;
    populateNCRInputs(ncrFormID);
}

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
            fetch(`/api/ncrForms/${ncrFormID}`, {
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

function printNCR(ncrFormID) {
    const isConfirmed = confirm('Are you sure you want to generate and print the NCR report?');
    if (!isConfirmed) return;

    console.log(`Fetching NCR form with ID: ${ncrFormID}`);

    fetch(`/api/ncrForms/${ncrFormID}`)
        .then(response => {
            console.log('Received response for NCR form:', response);
            if (!response.ok) throw new Error('Failed to fetch NCR form');
            return response.json();
        })
        .then(ncrData => {
            console.log('NCR data received:', ncrData);
            if (!ncrData || typeof ncrData !== 'object') throw new Error('Invalid NCR data received');

            // Fetch related data
            const productFetch = fetch(`/api/products/${ncrData.prodID}`).then(res => res.json()); 
            const qualityFetch = fetch(`/api/qualityForms/${ncrData.qualFormID}`).then(res => res.json());
            const engineeringFetch = ncrData.engFormID ? fetch(`/api/engineerForms/${ncrData.engFormID}`).then(res => res.json()) : Promise.resolve(null);
            const purchasingFetch = ncrData.purFormID ? fetch(`/api/purchasingForms/${ncrData.purFormID}`).then(res => res.json()) : Promise.resolve(null); 

            return Promise.all([ncrData, productFetch, qualityFetch, engineeringFetch, purchasingFetch]);
        })
        .then(([ncrData, productData, qualityData, engineeringData, purchasingData]) => {
            console.log('All data fetched:', { ncrData, productData, qualityData, engineeringData, purchasingData });

            // Use `supID` from `productData` to fetch supplier data
            return Promise.all([
                Promise.resolve(ncrData),
                Promise.resolve(productData),
                fetch(`/api/suppliers/${productData.supID}`).then(res => res.json()), 
                Promise.resolve(qualityData),
                Promise.resolve(engineeringData),
                Promise.resolve(purchasingData),
            ]);
        })
        .then(([ncrData, productData, supplierData, qualityData, engineeringData, purchasingData]) => {
            console.log('Supplier data fetched:', supplierData);
            
            const pdfData = {
                ncrData,
                productData,
                supplierData,
                qualityData,
                engineeringData,
                purchasingData,
            };

            console.log('Sending data to generate PDF:', pdfData);

            return fetch('/api/ncrPdfRoute/generate-ncr-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfData),
            });
        })
        .then(response => {
            console.log('Received response for PDF generation:', response);
            if (!response.ok) throw new Error('Failed to generate PDF');
            return response.blob();
        })
        .then(blob => {
            console.log('Received PDF blob');
            const url = window.URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'NCR_Report.pdf';
            downloadLink.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error generating the NCR report. Please try again.');
        });
}

fetchNcrForms(); 
