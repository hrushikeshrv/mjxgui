const surface = document.createElement('div');
surface.contentEditable = 'true';
surface.id = 'mjxgui-editor-surface';

const toolbar = document.createElement('div');
toolbar.id = 'mjxgui-editor-toolbar-hrv';


const div = document.querySelector('#keys');
document.addEventListener('keydown', function(evt) {
    div.innerHTML = evt.key;
})