// Draws the editor UI and canvas inside the given div
window.onload = function() {
    const tabButtons = document.querySelectorAll('.tab-container');
    const tabs = document.querySelectorAll('.tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabs.forEach(tab => {
                if (tab.dataset.tab === button.dataset.tab) {
                    tab.classList.remove('hidden');
                }
                else {
                    tab.classList.add('hidden');
                }
            })
        })
    })
}