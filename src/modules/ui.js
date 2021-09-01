// Draws the editor UI and canvas inside the given div

const symbolLatexMap = {
    // Lowercase greek letters
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

    // Uppercase greek letters
    'Alpha': 'A',
    'Beta': 'B',
    'Gamma': '\\Gamma',
    'Delta': '\\Delta',
    'Epsilon': 'E',
    'Zeta': 'Z',
    'Eta': 'H',
    'Theta': '\\Theta',
    'Iota': 'I',
    'Kappa': 'K',
    'Lambda': '\\Lambda',
    'Mu': 'M',
    'Nu': 'N',
    'Xi': '\\Xi',
    'Omicron': 'O',
    'Pi': '\\Pi',
    'Rho': 'P',
    'Sigma': '\\Sigma',
    'Tau': 'T',
    'Upsilon': '\\Upsilon',
    'Phi': '\\Phi',
    'Chi': 'X',
    'Psi': '\\Psi',
    'Omega': '\\Omega',

    // Operators and symbols
    'times': '\\times',
    'div': '\\div',
    'centerdot': '\\cdot',
    'plusmn': '\\pm',
    'mnplus': '\\mp',
    'starf': '\\star',
    'bigcup': '\\bigcup',
    'bigcap': '\\bigcap',
    'cup': '\\cup',
    'cap': '\\cap',
    'lt': '\\lt',
    'gt': '\\gt',
    'leq': '\\leq',
    'GreaterEqual': '\\geq',
    'equals': '=',
    'approx': '\\approx',
    'NotEqual': '\\ne',
    'sub': '\\subset',
    'sup': '\\supset',
    'sube': '\\subseteq',
    'supe': '\\supseteq',
    'nsub': '\\not\\subset',
    'nsup': '\\not\\supset',
    'nsube': '\\not\\subseteq',
    'nsupe': '\\not\\supseteq',
    'propto': '\\propto',
    'parallel': '\\parallel',
    'npar': '\\nparallel',
    'asympeq': '\\asymp',
    'isin': '\\in',
    'notin': '\\notin',
    'exist': '\\exists',
    'nexist': '\\nexists',
    'perp': '\\perp',
    'Leftarrow': '\\Leftarrow',
    'Rightarrow': '\\Rightarrow',
    'Leftrightarrow': '\\iff',
    'angle': '\\angle',
    'angmsd': '\\measuredangle',
    'rightarrow': '\\to',
    'leftarrow': '\\gets',
    'leftrightarrow': '\\leftrightarrow',
    'longrightarrow': '\\longrightarrow',
    'longleftarrow': '\\longleftarrow',
    'longleftrightarrow': '\\longleftrightarrow',
    'uparrow': '\\uparrow',
    'downarrow': '\\downarrow',
    'updownarrow': '\\updownarrow',
    'PartialD': '\\partial',
    'hbar': '\\hbar',
    'real': '\\Re',
    'nabla': '\\nabla',
    'infin': '\\infty',
}

const functionComponentMap = {
    'sum': Sum,
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
        console.log(mjxguiCursor.block);
        display.innerHTML = '$$' + mjxguiCursor.toDisplayLatex() + '$$';
        console.log(mjxguiCursor.block);
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

    mjxguiFunctions.forEach(func => {
        func.addEventListener('click', function() {
            if (func.dataset.functionId in functionComponentMap) {
                let _ = new functionComponentMap[func.dataset.functionId]();
                // console.log(expression.components);
                mjxguiCursor.addComponent(_);
                // console.log(expression.components);
                mjxguiCursor.updateDisplay();
                // console.log(expression.components);
                latexOutput.innerHTML = mjxguiCursor.latex;
            }
        })
    })
}