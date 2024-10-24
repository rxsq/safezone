document.addEventListener('DOMContentLoaded', function(){ 
    //localStorage.clear(); //Add to reset records

    //retrieve data in localstorage
    const storedData = localStorage.getItem('suppliers');

    if(storedData){
        //if exists then parse it and populate table
        const data = JSON.parse(storedData);
        //updateMetrics(data);
        //populateRecentNcrTable(data);
    }
    else {
        //initially fetch data from json
        fetch('../assets/data/suppliers.json')
        .then(response => response.json())
        .then(data => {
            //store fetched data in local storage
            localStorage.setItem('suppliers', JSON.stringify(data));
            //updateMetrics(data);
            //populateRecentNcrTable(data);
        })
    }  
});