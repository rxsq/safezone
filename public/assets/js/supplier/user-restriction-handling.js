
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
