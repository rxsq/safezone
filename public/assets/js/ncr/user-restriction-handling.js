function handleUserRole(userRole) {
    console.log(userRole);
    switch (userRole) {
        case "Administrator": adminAccess(); break;
        case "Quality": qualityAccess(); break;
        case "Engineering": defaultAccess(); break;
        case "Purchasing": defaultAccess(); break;
    }
}

function adminAccess(){
    document.querySelectorAll('button').forEach(button => {
        button.style.display = "";
    })
}

document.addEventListener('DOMContentLoaded', function() {
    handleUserRole(sessionStorage.getItem("userRole"));
});


function disableArchiveButton(){
    setTimeout(() => {
        const buttons = document.querySelectorAll('button.action-btn.archive-btn');

        if (buttons.length > 0) {
            buttons.forEach(button => {
                button.style.display = 'none';
            });
        }
    }, 200); 
}

function disableEditButtons(){
    setTimeout(() => {
        const buttons = document.querySelectorAll('button.action-btn.edit-btn');
        console.log("Buttons found:", buttons);

        if (buttons.length > 0) {
            buttons.forEach(button => {
                console.log("Hiding button:", button);
                button.style.display = 'none';
            });
        } else {
            console.log("No edit buttons found'");
        }
    }, 30); 
}

function disableCreateButton(){
    document.getElementById('new-suppliers-btn').style.display = "none";
}

function qualityAccess(){ disableArchiveButton(); }; 

function defaultAccess(){
    disableDeleteButtons();
    disableEditButtons();
    disableCreateButton();
}