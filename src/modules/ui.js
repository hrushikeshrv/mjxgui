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
    'lim': Limit,
    'sqrt': Sqrt,
    'nsqrt': NthRoot,
    'sub': Subscript,
    'sup': Superscript,
    'subsup': SubSupRight,
    'frac': Fraction,
}

class MJXGUI {
    constructor(elementSelector, mathDelimiter, successCallback) {
        this.selector = elementSelector;
        this.elements = document.querySelectorAll(elementSelector);
        this.mathDelimiter = mathDelimiter;
        this.successCallback = successCallback;
        this.eqnHistory = [];
        this.expression = new Expression();
        this.cursor = new Cursor(this.expression, '_mjxgui_editor_display');
        this.isMobileDevice = 'ontouchstart' in document.documentElement;
        this.pseudoMobileKeyboard = null;
        this.showUI = () => {
            // Show the editor window
            this.editorWindow.style.display = 'block';
            this.editorWindow.dataset.visible = 'true';

            // If on mobile, give the focus to a hidden text input so the keyboard pops up
            if (this.isMobileDevice || true) {
                // Assume that this.pseudoMobileKeyboard is not null
                // this.showUI will always be called after this.pseudoMobileKeyboard
                // is set in this.constructUI()
                this.pseudoMobileKeyboard.focus();
                console.log('focussed the pseudo keyboard');
            }
        }

        if (this.elements instanceof String || typeof this.elements === 'string') {
            this.elements = document.querySelectorAll(this.elements);
        }

        this.constructUI();
        this.elements.forEach(el => {
            el.addEventListener('click', this.showUI);
        })

        document.addEventListener('keydown', evt => {
            if (this.editorWindow.dataset.visible === 'false') return;
            MathJax.typesetClear([this.eqnDisplay]);
            this.cursor.keyPress(evt);
            this.eqnDisplay.innerHTML = this.mathDelimiter + this.cursor.toDisplayLatex() + this.mathDelimiter;
            MathJax.typesetPromise([this.eqnDisplay]).then(() => {});
        })

        const symbols = this.editorWindow.querySelectorAll('.mjxgui-operator, .mjxgui-greek-letter');
        const functions = this.editorWindow.querySelectorAll('.mjxgui-function');

        symbols.forEach(symbol => {
            symbol.addEventListener('click', () => {
                if (symbol.dataset.latexData in symbolLatexMap) {
                    let _ = new MJXGUISymbol(this.cursor.block, symbolLatexMap[symbol.dataset.latexData]);
                    this.cursor.addComponent(_);
                    this.cursor.updateDisplay();
                }
            })
        })

        functions.forEach(func => {
            func.addEventListener('click', () => {
                let _;
                if (func.dataset.templateType !== 'null') {
                    if (func.dataset.templateType === 'three') {
                        _ = new TemplateThreeBlockComponent(this.cursor.block, func.dataset.latexData);
                    }
                    else if (func.dataset.templateType === 'trigonometric') {
                        _ = new TrigonometricTwoBlockComponent(this.cursor.block, func.dataset.latexData);
                    }
                }
                else {
                    _ = new functionComponentMap[func.dataset.functionId](this.cursor.block);
                }
                this.cursor.addComponent(_);
                this.cursor.updateDisplay();
            })
        })
    }

    // Inject the editor HTML and CSS into the DOM
    constructUI() {
        // Injects the UI HTML & CSS into the DOM and binds the needed event listeners

        // CSS First
        const css = `#mjxgui_editor_window{display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background-color:#f0f0f0;border:2px solid #000;border-radius:6px;box-shadow:0 0 20px rgba(0,0,0,.3);padding:20px;min-width:280px;max-width:600px}#_mjxgui_tab_container_container{display:flex;flex-flow:row wrap}.mjxgui_tab_container{padding:5px;font-family:monospace;font-size:1.1rem;border-radius:6px;background-color:#f0f0f0;transition:background-color ease .25s;cursor:pointer;user-select:none;margin:0 10px}.mjxgui_tab_container:hover{background-color:#dcdcdc}#mjxgui_editor_controls{display:flex;flex-flow:row wrap;justify-content:space-between}#_mjxgui_editor_display{padding:10px;margin:10px;border:1px solid #000;border-radius:6px}.mjxgui_tab{padding:10px;margin-top:10px;display:none;align-items:stretch;flex-flow:row wrap}.mjxgui_tab .mjxgui-btn{background-color:#f0f0f0;transition:background-color ease .25s;cursor:pointer;margin:2px;min-width:25px;text-align:center}.mjxgui-btn:hover{background-color:#dcdcdc}.mjxgui_button_container,.mjxgui_clear_save_buttons{display:flex;flex-flow:row wrap;font-family:monospace;font-size:1.1rem;align-items:center;justify-content:center}.mjxgui_button_container{margin:0 5px;background-color:#f0f0f0;border-radius:6px;transition:background-color ease .25s;cursor:pointer;padding:5px}.mjxgui_button_container:hover{background-color:#dcdcdc}`;
        const style = document.createElement('style');
        document.head.appendChild(style);
        style.appendChild(document.createTextNode(css));

        // HTML
        const editorDiv = document.createElement('div');
        editorDiv.id = 'mjxgui_editor_window';
        editorDiv.dataset.visible = 'false';
        editorDiv.innerHTML = `<div id="mjxgui_editor_controls"><input type="text" style="display:none" id="mjxgui-pseudo-mobile-keyboard"><div style="cursor:pointer"><svg xmlns="http://www.w3.org/2000/svg" class="mjxgui_close_button_svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div><div class="mjxgui_clear_save_buttons"><span class="mjxgui_button_container" id="mjxgui_clear_equation"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="4" y1="7" x2="20" y2="7"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/></svg> <span>Clear Eqn</span></span> <span class="mjxgui_button_container" id="mjxgui_save_equation"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10"/></svg> <span>Done</span></span></div></div><div id="_mjxgui_tab_container_container"><div class="mjxgui_tab_container" data-tab="1">Greek Letters</div><div class="mjxgui_tab_container" data-tab="2">Operators & Symbols</div><div class="mjxgui_tab_container" data-tab="3">Functions</div></div><div class="mjxgui_tab" style="display:flex" data-tab="1"><span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Alpha">&Alpha;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Beta">&Beta;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Gamma">&Gamma;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Delta">&Delta;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Epsilon">&Epsilon;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Zeta">&Zeta;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Eta">&Eta;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Theta">&Theta;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Iota">&Iota;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Kappa">&Kappa;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Lambda">&Lambda;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Mu">&Mu;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Nu">&Nu;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Xi">&Xi;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Omicron">&Omicron;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Pi">&Pi;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Rho">&Rho;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Sigma">&Sigma;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Tau">&Tau;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Upsilon">&Upsilon;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Phi">&Phi;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Chi">&Chi;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Psi">&Psi;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Omega">&Omega;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="alpha">&alpha;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="beta">&beta;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="gamma">&gamma;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="delta">&delta;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="epsilon">&epsilon;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="zeta">&zeta;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="eta">&eta;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="theta">&theta;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="iota">&iota;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="kappa">&kappa;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="lambda">&lambda;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="mu">&mu;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="nu">&nu;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="xi">&xi;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="omicron">&omicron;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="pi">&pi;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="rho">&rho;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="sigma">&sigma;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="tau">&tau;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="upsilon">&upsilon;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="phi">&phi;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="chi">&chi;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="psi">&psi;</span> <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="omega">&omega;</span></div><div class="mjxgui_tab" data-tab="2"><span class="mjxgui-btn mjxgui-operator" data-latex-data="times">&times;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="div">&div;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="centerdot">&centerdot;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="plusmn">&plusmn;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="lt">&lt;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="gt">&gt;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="leq">&leq;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="GreaterEqual">&GreaterEqual;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="equals">&equals;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="approx">&approx;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="NotEqual">&NotEqual;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="mnplus">&mnplus;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="starf">&starf;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="bigcup">&bigcup;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="bigcap">&bigcap;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="cup">&cup;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="cap">&cap;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="sub">&sub;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="sup">&sup;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="sube">&sube;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="supe">&supe;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="nsub">&nsub;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="nsup">&nsup;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="nsube">&nsube;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="nsupe">&nsupe;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="propto">&propto;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="parallel">&parallel;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="npar">&npar;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="asympeq">&asympeq;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="isin">&isin;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="notin">&notin;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="exist">&exist;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="nexist">&nexist;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="perp">&perp;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="Leftarrow">&Leftarrow;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="Rightarrow">&Rightarrow;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="Leftrightarrow">&Leftrightarrow;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="angle">&angle;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="angmsd">&angmsd;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="rightarrow">&rightarrow;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="leftarrow">&leftarrow;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="leftrightarrow">&leftrightarrow;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="longrightarrow">&longrightarrow;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="longleftarrow">&longleftarrow;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="longleftrightarrow">&longleftrightarrow;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="uparrow">&uparrow;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="downarrow">&downarrow;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="updownarrow">&updownarrow;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="PartialD">&PartialD;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="hbar">&hbar;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="real">&real;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="nabla">&nabla;</span> <span class="mjxgui-btn mjxgui-operator" data-latex-data="infin">&infin;</span></div><div class="mjxgui_tab" data-tab="3"><span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="sum">&Sigma;</span> <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="int">&int;</span> <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="iint">&#8748</span> <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="iiint">&iiint;</span> <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="oint">&oint;</span> <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="prod">&Pi;</span> <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="coprod">&coprod;</span> <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="bigcup">&bigcup;</span> <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="bigcap">&bigcap;</span> <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="bigvee">&bigvee;</span> <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="bigwedge">&bigwedge;</span> <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="lim"><svg viewBox="0 0 567 567"><text fill="#242424" font-family="Cambria" font-size="500" font-weight="500" text-anchor="middle" transform="matrix(.75 0 0 .75 279.5 326.267)"><tspan x="0">lim</tspan></text></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="sqrt"><svg viewBox="0 0 567 567"><defs><style>.cls-1,.cls-2{stroke:#000;fill-rule:evenodd}.cls-1{stroke-width:4.67px}.cls-2{stroke-width:7.42px}</style></defs><path id="Line_1" d="M3.707 306.883l-1.73-2.643 41.9-27.427 1.73 2.642z" class="cls-1" data-name="Line 1"/><path id="Line_2" d="M47.233 275.65l1.831-1.045 80.1 140.4-1.831 1.044z" class="cls-1" data-name="Line 2"/><path id="Line_3" d="M129.569 410.274l-3.113-1.374 111.707-252.923 3.113 1.375z" class="cls-2" data-name="Line 3"/><path id="Line_4" d="M241.471 154.67v-1.746h322.563v1.746H241.471z" class="cls-2" data-name="Line 4"/><path fill="none" fill-rule="evenodd" stroke="#000" stroke-width="10.125" d="M288.978 190.824H495.53v206.552H288.978V190.824z"/></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="nsqrt"><svg viewBox="0 0 567 567"><defs><style>.cls-1,.cls-2,.cls-3{stroke:#000;fill-rule:evenodd}.cls-1{stroke-width:4.67px}.cls-2{stroke-width:7.42px}.cls-3{fill:none;stroke-width:10.13px}</style></defs><path id="Line_1" d="M3.707 306.883l-1.73-2.643 41.9-27.427 1.73 2.642z" class="cls-1" data-name="Line 1"/><path id="Line_2" d="M47.233 275.65l1.831-1.045 80.1 140.4-1.831 1.044z" class="cls-1" data-name="Line 2"/><path id="Line_3" d="M129.569 410.274l-3.113-1.374 111.707-252.923 3.113 1.375z" class="cls-2" data-name="Line 3"/><path id="Line_4" d="M241.471 154.67v-1.746h322.563v1.746H241.471z" class="cls-2" data-name="Line 4"/><path d="M288.978 190.824H495.53v206.552H288.978V190.824z" class="cls-3"/><path id="Rectangle_1_copy" d="M69.42 178.744h90.512v90.512H69.42v-90.512z" class="cls-3" data-name="Rectangle 1 copy"/></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="sub"><svg viewBox="0 0 567 567"><defs><style>.cls-1{fill:none;stroke:#000;stroke-width:12.88px;fill-rule:evenodd}</style></defs><path d="M27.09 82.836h285.083v285.083H27.09V82.836z" class="cls-1"/><path id="Rectangle_1_copy" d="M362.8 295.421h169.985V465.41H362.8V295.421z" class="cls-1" data-name="Rectangle 1 copy"/></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="sup"><svg viewBox="0 0 567 567"><defs><style>.cls-1{fill:none;stroke:#000;stroke-width:12.88px;fill-rule:evenodd}</style></defs><path d="M27.09 468.164h285.083V183.081H27.09v285.083z" class="cls-1"/><path id="Rectangle_1_copy" d="M362.8 255.579h169.985V85.59H362.8v169.989z" class="cls-1" data-name="Rectangle 1 copy"/></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="subsup"><svg viewBox="0 0 567 567"><defs><style>.cls-1{fill:none;stroke:#000;stroke-width:12.88px;fill-rule:evenodd}</style></defs><path d="M34.7 413.554h267.862V145.693H34.7v267.861z" class="cls-1"/><path id="Rectangle_1_copy" d="M362.8 243.579h169.985V73.59H362.8v169.989z" class="cls-1" data-name="Rectangle 1 copy"/><path id="Rectangle_1_copy_2" d="M533.2 487.579H363.215V317.59H533.2v169.989z" class="cls-1" data-name="Rectangle 1 copy 2"/></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="frac"><svg viewBox="0 0 567 567"><defs><style>.cls-1{fill:none;stroke:#000;fill-rule:evenodd;stroke-width:12.88px}</style></defs><path id="Rectangle_1_copy" d="M193.8 225.579h169.985V55.59H193.8v169.989z" class="cls-1" data-name="Rectangle 1 copy"/><path id="Line_1" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="10.125" d="M124 284v-1h295v1H124z" data-name="Line 1"/><path id="Rectangle_1_copy_2" d="M364.2 528.579H194.215V358.59H364.2v169.989z" class="cls-1" data-name="Rectangle 1 copy 2"/></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="sin"><svg viewBox="0 0 567 567"><text fill="#242424" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">sin</tspan></text></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="cos"><svg viewBox="0 0 567 567"><text fill="#242424" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">cos</tspan></text></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="tan"><svg viewBox="0 0 567 567"><text fill="#242424" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">tan</tspan></text></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="csc"><svg viewBox="0 0 567 567"><text fill="#242424" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">csc</tspan></text></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="sec"><svg viewBox="0 0 567 567"><text fill="#242424" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">sec</tspan></text></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="cot"><svg viewBox="0 0 567 567"><text fill="#242424" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">cot</tspan></text></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="arcsin"><svg width="45" height="20" viewBox="0 0 2000 567"><text fill="#242424" font-family="Cambria" font-size="500" text-anchor="middle" transform="matrix(1.5 0 0 1.5 973.5 496)"><tspan x="0">arcsin</tspan></text></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="arccos"><svg width="45" height="20" viewBox="0 0 2000 567"><text fill="#242424" font-family="Cambria" font-size="500" text-anchor="middle" transform="matrix(1.5 0 0 1.5 973.5 496)"><tspan x="0">arccos</tspan></text></svg></span> <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="arctan"><svg width="45" height="20" viewBox="0 0 2000 567"><text fill="#242424" font-family="Cambria" font-size="500" text-anchor="middle" transform="matrix(1.5 0 0 1.5 973.5 496)"><tspan x="0">arctan</tspan></text></svg></span></div><div id="_mjxgui_editor_display">${this.mathDelimiter} | ${this.mathDelimiter}</div>`;

        this.editorWindow = editorDiv;
        this.eqnDisplay = editorDiv.querySelector('#_mjxgui_editor_display');
        this.pseudoMobileKeyboard = editorDiv.querySelector('#mjxgui-pseudo-mobile-keyboard');
        const mjxguiTabButtons = editorDiv.querySelectorAll('.mjxgui_tab_container');
        const mjxguiTabs = editorDiv.querySelectorAll('.mjxgui_tab');

        mjxguiTabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                mjxguiTabs.forEach(tab => {
                    if (tab.dataset.tab === btn.dataset.tab) {
                        tab.style.display = 'flex';
                    }
                    else {
                        tab.removeAttribute('style');
                    }
                })
            })
        });

        const closeEditor = editorDiv.querySelector('.mjxgui_close_button_svg');
        closeEditor.addEventListener('click', function() {
            editorDiv.removeAttribute('style');
            editorDiv.dataset.visible = 'false';
        })

        const clearEquationButton = editorDiv.querySelector('#mjxgui_clear_equation');
        clearEquationButton.addEventListener('click', () => {
            this.clearEquation();
        });

        const saveEquationButton = editorDiv.querySelector('#mjxgui_save_equation');
        saveEquationButton.addEventListener('click', () => {
            const latex = this.cursor.toLatex();
            if (latex) {
                this.successCallback();
            }
            editorDiv.removeAttribute('style');
            editorDiv.dataset.visible = 'false';
            this.clearEquation();
        });

        document.body.appendChild(editorDiv);
    }

    // Remove the current expression from the display, add it to the history, create a new expression and reset
    // all cursor properties to defaults.
    clearEquation() {
        // push this entire expression onto the eqnHistory array so the user can access it again
        this.eqnHistory.push(this.expression);
        this.expression = new Expression();
        this.cursor.expression = this.expression;
        this.cursor.block = null;
        this.cursor.component = null;
        this.cursor.child = -0.5;
        this.cursor.position = -0.5;
        this.cursor.latex = '';
        this.cursor.updateDisplay();
    }

    // Getter method that just returns the cursor's LaTeX.
    getLatex() {
        return this.cursor.toLatex();
    }

    // Removes all MJXGUI click listeners from the MJXGUI.elements,
    // keeps the selector the same, and selects DOM elements again.
    // Meant to be called if the DOM changes after DOM content is loaded
    // or after the MJXGUI object is created.
    rebindListeners() {
        this.elements.forEach(el => {
            el.removeEventListener('click', this.showUI);
        })
        this.elements = document.querySelectorAll(this.selector);
        this.elements.forEach(el => {
            el.addEventListener('click', this.showUI);
        })
    }
}