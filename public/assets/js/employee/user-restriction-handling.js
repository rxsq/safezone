
function handleUserRole(userRole) {
    switch (userRole) {
        case "Administrator": adminAccess(); break;
        case "Quality": defaultAccess(); break;
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

function disableDeleteButtons(){
    setTimeout(() => {
        const buttons = document.querySelectorAll('button.action-btn.delete-btn');

        if (buttons.length > 0) {
            buttons.forEach(button => {
                button.style.display = 'none';
            });
        }
    }, 30); 
}

function disableEditButtons(){
    setTimeout(() => {
        const buttons = document.querySelectorAll('button.action-btn.edit-btn');

        if (buttons.length > 0) {
            buttons.forEach(button => {
                button.style.display = 'none';
            });
        } 
    }, 30); 
}

function disableCreateButton(){
    document.getElementById('new-employee-btn').style.display = "none";
}

function defaultAccess(){
    disableDeleteButtons();
    disableEditButtons();
    disableCreateButton();
}