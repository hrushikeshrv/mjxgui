// Draws the editor UI and canvas inside the given div

const symbolLatexMap = {
    'alpha': '\\alpha',
    'beta': '\\beta',
    'gamma': '\\gamma'
}

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

    // ? Listen for keypresses
    const display = document.querySelector('#mjxgui-display');
    document.addEventListener('keydown', function(evt) {
        MathJax.typesetClear([display]);
        mjxguiCursor.keyPress(evt);
        display.innerHTML = mjxguiCursor.toLatex();
        // console.log(mjxguiCursor.toLatex());
        MathJax.typesetPromise([display]).then(() => {});
    });

    // ? Listen for button presses
    const mjxguiSymbols = document.querySelectorAll('.mjxgui-operator, .mjxgui-greek-letter');
    const mjxguiFunctions = document.querySelectorAll('.mjxgui-function');

    mjxguiSymbols.forEach(symbol => {
        symbol.addEventListener('click', function() {
            if (symbol.dataset.latexData in symbolLatexMap) {
                console.log(mjxguiCursor.block);
                let _ = new MJXGUISymbol(mjxguiCursor.block, symbolLatexMap[symbol.dataset.latexData]);
                console.log(mjxguiCursor.block);
                mjxguiCursor.addComponent(_);
                console.log(mjxguiCursor.block);
                mjxguiCursor.updateDisplay();
            }
        })
    })
}