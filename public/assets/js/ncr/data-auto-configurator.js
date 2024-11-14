document.addEventListener('DOMContentLoaded', async function(){
    // Setting dates
    document.getElementById('quality-rep-date').value = new Date().toISOString().substring(0, 10); 
    document.getElementById('ncr-date').value = new Date().toISOString().substring(0, 10);
    document.getElementById('revision-date').value = new Date().toISOString().substring(0, 10);
    document.getElementById('engineer-date').value = new Date().toISOString().substring(0, 10);

    // Set NCR No and Stage
    document.getElementById('ncr-no').value = currentYear + "-" + await getNCRCode();  // Function in create quality script
    // Switch for formatting status code to be readable
    switch(sessionStorage.getItem('currentNCRStage')){ 
        case "QUA": document.getElementById('stage').value = "Quality";
            break;
        case "ENG": document.getElementById('stage').value = "Engineering";
            break;
        case "PUR": document.getElementById('stage').value = "Purchasing";
    } 

    // Setting quality rep name
    if(sessionStorage.getItem('userName')){
        document.getElementById('quality-rep-name').value = sessionStorage.getItem('userName');
    } else {
        document.getElementById('quality-rep-name').value = "Quality Rep";
    }
});

