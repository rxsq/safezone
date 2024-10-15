document.addEventListener('DOMContentLoaded', function(){
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('btn-close');
    const homeContent = document.querySelector('.home-content');

    toggleBtn.addEventListener('click', function(){
        sidebar.classList.toggle("collapsed"); //Toggles collapsed class in css
        homeContent.classList.toggle("expanded");
}); 
})


