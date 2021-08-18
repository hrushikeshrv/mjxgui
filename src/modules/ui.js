// Draws the editor UI and canvas inside the given div

const symbolLatexMap = {
    'alpha': '\\alpha',
    'beta': '\\beta',
    'gamma': '\\gamma',
    'delta': '\\delta',
    'epsilon': '\\epsilon',
    'zeta': '\\zeta',
    'eta': '\\eta',
    'theta': '\\theta',
    'iota': '\\iota',
    'kappa': '\\kappa',
    'lambda': '\\lambda',
    'mu': '\\mu',
    'nu': '\\nu',
    'xi': '\\xi',
    'omicron': '\\omicron',
    'pi': '\\pi',
    'rho': '\\rho',
    'sigma': '\\sigma',
    'tau': '\\tau',
    'upsilon': '\\upsilon',
    'phi': '\\phi',
    'chi': '\\chi',
    'psi': '\\psi',
    'omega': '\\omega',
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
    const latexOutput = document.querySelector('#mjxgui-latex-out');
    document.addEventListener('keydown', function(evt) {
        MathJax.typesetClear([display]);
        mjxguiCursor.keyPress(evt);
        display.innerHTML = mjxguiCursor.toLatex();
        // console.log(mjxguiCursor.toLatex());
        MathJax.typesetPromise([display]).then(() => {});
        latexOutput.innerHTML = mjxguiCursor.latex;
    });

    // ? Listen for button presses
    const mjxguiSymbols = document.querySelectorAll('.mjxgui-operator, .mjxgui-greek-letter');
    const mjxguiFunctions = document.querySelectorAll('.mjxgui-function');

    mjxguiSymbols.forEach(symbol => {
        symbol.addEventListener('click', function() {
            if (symbol.dataset.latexData in symbolLatexMap) {
                let _ = new MJXGUISymbol(mjxguiCursor.block, symbolLatexMap[symbol.dataset.latexData]);
                mjxguiCursor.addComponent(_);
                mjxguiCursor.updateDisplay();
                latexOutput.innerHTML = mjxguiCursor.latex;
            }
        })
    })
}