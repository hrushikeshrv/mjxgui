const div = document.querySelector('#keys');
document.addEventListener('keydown', function(evt) {
    div.innerHTML = evt.key;
})