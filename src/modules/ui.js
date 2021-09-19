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
        this.elements = elementSelector;
        this.mathDelimiter = mathDelimiter;
        this.successCallback = successCallback;
        this.eqnHistory = [];
        this.expression = new Expression();
        this.cursor = new Cursor(this.expression, '_mjxgui_editor_display');
        // this.latex = '';
        // this.editorWindow = null;
        // this.eqnDisplay = null;

        if (this.elements instanceof String || typeof this.elements === 'string') {
            this.elements = document.querySelectorAll(this.elements);
        }

        this.constructUI();
        this.elements.forEach(el => {
            el.addEventListener('click', () => {
                this.editorWindow.style.display = 'block';
                this.editorWindow.dataset.visible = 'true';
            })
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
                console.log('Cursor block before', this.cursor.block);
                console.log('Cursor component before', this.cursor.component);
                console.log('Cursor position before', this.cursor.position);
                console.log('Cursor child before', this.cursor.child);
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
                console.log('Cursor block after', this.cursor.block);
                console.log('Cursor component after', this.cursor.component);
                console.log('Cursor position after', this.cursor.position);
                console.log('Cursor child after', this.cursor.child);
                console.log('------------\n\n');
            })
        })
    }

    constructUI() {
        // Injects the UI HTML & CSS into the DOM and binds the needed event listeners

        // CSS First
        const css = `
            #mjxgui_editor_window {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            
                background-color: rgb(240, 240, 240);
                border: 2px solid black;
                border-radius: 6px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            
                padding: 20px;
                min-width: 280px;
                max-width: 600px;
            }
            
            #_mjxgui_tab_container_container {
                display: flex;
                flex-flow: row wrap;
            }
            
            .mjxgui_tab_container {
                padding: 5px;
                font-family: monospace;
                font-size: 1.1rem;
                border-radius: 6px;
                background-color: rgb(240, 240, 240);
                transition: background-color ease 0.25s;
                cursor: pointer;
                user-select: none;
                margin: 0 10px;
            }
            
            .mjxgui_tab_container:hover {
                background-color: rgb(220, 220, 220);
            }
            
            #mjxgui_editor_controls {
                display: flex;
                flex-flow: row wrap;
                justify-content: space-between;
            }
            
            #_mjxgui_editor_display {
                padding: 10px;
                margin: 10px;
                border: 1px solid black;
                border-radius: 6px;
            }
            
            .mjxgui_tab {
                padding: 10px;
                margin-top: 10px;
                display: none;
                align-items: stretch;
                flex-flow: row wrap;
            }
            
            .mjxgui_tab .mjxgui-btn {
                background-color: rgb(240, 240, 240);
                transition: background-color ease 0.25s;
                cursor: pointer;
                margin: 2px;
                min-width: 25px;
                text-align: center;
            }
            
            .mjxgui-btn:hover {
                background-color: rgb(220, 220, 220);
            }
            
            .mjxgui_clear_save_buttons, .mjxgui_button_container {
                display: flex;
                flex-flow: row wrap;
                font-family: monospace;
                font-size: 1.1rem;
                align-items: center;
                justify-content: center;
            }
            
            .mjxgui_button_container {
                margin: 0 5px;
                background-color: rgb(240, 240, 240);
                border-radius: 6px;
                transition: background-color ease 0.25s;
                cursor: pointer;
                padding: 5px;
            }
            
            .mjxgui_button_container:hover  {
                background-color: rgb(220, 220, 220);
            }
        `;
        const style = document.createElement('style');
        document.head.appendChild(style);
        style.appendChild(document.createTextNode(css));

        // HTML
        const editorDiv = document.createElement('div');
        editorDiv.id = 'mjxgui_editor_window';
        editorDiv.dataset.visible = 'false';
        editorDiv.innerHTML = `
            <div id="mjxgui_editor_controls">
                <div style="cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" class="mjxgui_close_button_svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </div>
                <div class="mjxgui_clear_save_buttons">
                    <span class="mjxgui_button_container" id="mjxgui_clear_equation">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <line x1="4" y1="7" x2="20" y2="7" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                          <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                        </svg>
                        <span>Clear Eqn</span>
                    </span>
                    <span class="mjxgui_button_container" id="mjxgui_save_equation">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                        <span>Done</span>
                    </span>
                </div>
            </div>
            <div id="_mjxgui_tab_container_container">
                <div class="mjxgui_tab_container" data-tab="1">Greek Letters</div>
                <div class="mjxgui_tab_container" data-tab="2">Operators & Symbols</div>
                <div class="mjxgui_tab_container" data-tab="3">Functions</div>
            </div>
            <div class="mjxgui_tab" style="display: flex;" data-tab="1">
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Alpha">&Alpha;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Beta">&Beta;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Gamma">&Gamma;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Delta">&Delta;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Epsilon">&Epsilon;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Zeta">&Zeta;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Eta">&Eta;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Theta">&Theta;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Iota">&Iota;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Kappa">&Kappa;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Lambda">&Lambda;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Mu">&Mu;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Nu">&Nu;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Xi">&Xi;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Omicron">&Omicron;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Pi">&Pi;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Rho">&Rho;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Sigma">&Sigma;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Tau">&Tau;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Upsilon">&Upsilon;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Phi">&Phi;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Chi">&Chi;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Psi">&Psi;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="Omega">&Omega;</span>
    
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="alpha">&alpha;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="beta">&beta;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="gamma">&gamma;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="delta">&delta;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="epsilon">&epsilon;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="zeta">&zeta;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="eta">&eta;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="theta">&theta;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="iota">&iota;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="kappa">&kappa;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="lambda">&lambda;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="mu">&mu;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="nu">&nu;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="xi">&xi;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="omicron">&omicron;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="pi">&pi;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="rho">&rho;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="sigma">&sigma;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="tau">&tau;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="upsilon">&upsilon;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="phi">&phi;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="chi">&chi;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="psi">&psi;</span>
                <span class="mjxgui-btn mjxgui-greek-letter" data-latex-data="omega">&omega;</span>
            </div>
            <div class="mjxgui_tab" data-tab="2">
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="times">&times;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="div">&div;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="centerdot">&centerdot;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="plusmn">&plusmn;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="lt">&lt;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="gt">&gt;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="leq">&leq;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="GreaterEqual">&GreaterEqual;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="equals">&equals;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="approx">&approx;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="NotEqual">&NotEqual;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="mnplus">&mnplus;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="starf">&starf;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="bigcup">&bigcup;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="bigcap">&bigcap;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="cup">&cup;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="cap">&cap;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="sub">&sub;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="sup">&sup;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="sube">&sube;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="supe">&supe;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="nsub">&nsub;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="nsup">&nsup;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="nsube">&nsube;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="nsupe">&nsupe;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="propto">&propto;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="parallel">&parallel;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="npar">&npar;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="asympeq">&asympeq;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="isin">&isin;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="notin">&notin;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="exist">&exist;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="nexist">&nexist;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="perp">&perp;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="Leftarrow">&Leftarrow;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="Rightarrow">&Rightarrow;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="Leftrightarrow">&Leftrightarrow;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="angle">&angle;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="angmsd">&angmsd;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="rightarrow">&rightarrow;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="leftarrow">&leftarrow;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="leftrightarrow">&leftrightarrow;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="longrightarrow">&longrightarrow;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="longleftarrow">&longleftarrow;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="longleftrightarrow">&longleftrightarrow;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="uparrow">&uparrow;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="downarrow">&downarrow;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="updownarrow">&updownarrow;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="PartialD">&PartialD;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="hbar">&hbar;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="real">&real;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="nabla">&nabla;</span>
                <span class="mjxgui-btn mjxgui-operator" data-latex-data="infin">&infin;</span>
            </div>
            <div class="mjxgui_tab" data-tab="3">
                <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="sum">&Sigma;</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="int">&int;</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="iint">$ \\iint{} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="iiint">&iiint;</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="oint">&oint;</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="prod">&Pi;</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="coprod">&coprod;</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="bigcup">&bigcup;</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="bigcap">&bigcap;</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="bigvee">&bigvee;</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="three" data-latex-data="bigwedge">&bigwedge;</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="lim">$ \\lim $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="sqrt">$ \\sqrt{\\Box} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="nsqrt">$ \\sqrt[n]{\\Box} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="sub">$ {\\Box}_{\\Box} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="sup">$ {\\Box}^{\\Box} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="subsup">$ {\\Box}^{\\Box}_{\\Box} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="null" data-function-id="frac">$ \\frac{\\Box}{\\Box} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="sin">$ \\sin{} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="cos">$ \\cos{} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="tan">$ \\tan{} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="csc">$ \\csc{} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="sec">$ \\sec{} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="cot">$ \\cot{} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="arcsin">$ \\arcsin{} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="arccos">$ \\arccos{} $</span>
                <span class="mjxgui-btn mjxgui-function" data-template-type="trigonometric" data-latex-data="arctan">$ \\arctan{} $</span>
            </div>
            <div id="_mjxgui_editor_display">${this.mathDelimiter} | ${this.mathDelimiter}</div>
        `;

        this.editorWindow = editorDiv;
        this.eqnDisplay = editorDiv.querySelector('#_mjxgui_editor_display');
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
}