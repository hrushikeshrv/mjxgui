// Builds the expression/equation being typed in by the user
// Exposes its API for the cursor module to use

/**
 * @class
 * Thin wrapper around the Component class that collects all the components together in an Expression
 * that can be easily rendered and converted to LaTeX.
**/
class Expression {
    constructor(nestingDepth = 0) {
        this.components = [];
        this.nestingDepth = nestingDepth;
    }

    add(component, position = this.components.length) {
        // Insert component at position in this Expression.
        // Defaults to adding the component to the end of Expression
        this.components.splice(position, 0, component);
    }

    remove(position = this.components.length-1) {
        // Remove the component at position in this Expression.
        // Defaults to removing the last component in this Expression
        this.components.splice(position, 1);
    }

    toLatex() {
        // Generate LaTeX code from the components in this Expression
        let latex = '';
        for (let c of this.components) {
            latex += c.toLatex() + ' ';
        }
        return latex.trim();
    }
}

/**
 * @class
 * Represents a block. A fundamental unit of the Expression. 
 * 
 * All data is ultimately stored in
 * a Block. A Component or any child class of Component has a fixed number of Blocks in it, and a Block can
 * have a variable number of 'children'. An element in a Block's children array can either be a string
 * or another Component, allowing for nesting of Components.
 */
class Block {
    constructor(parent) {
        /**
         * @param parent: The component to which this block belongs
         */
        this.children = [];
        this.parent = parent;
    }

    toLatex() {
        // Generate LaTeX code from the contents of this block.
        // A block's children can contain either strings or an arbitrary child class of Component.
        if (this.children.length === 0) return '';
        let latex = '';
        for (let c of this.children) {
            if (typeof c === 'string') {
                latex += c;
            }
            else {
                latex += c.toLatex() + ' ';
            }
        }
        return latex.trim();
    }

    addChild(component, position = this.children.length) {
        // Setter method to add some component to this block at position. Component can be any child class of Component.
        // Defaults to adding the component at the end.
        this.children.splice(position, 0, component);
    }

    removeChild(position = this.children.length-1) {
        // Remove some component from this block.
        // Defaults to removing the last component.
        this.children.splice(position, 1);
    }
}

/**
 * @class
 * Base class representing a Component of the equation. Inherited by the TextComponent, all *Symbol,
 * and all *Function classes. All child classes of Component override the toLatex method
 * to customize the LaTeX generated. You can define your own child classes to add support for 
 * LaTeX syntax not yet supported.
 */
class Component {
    constructor(blocks = [], parent = null) {
        /**
         * @param blocks: The blocks contained by the component
         * @param parent: The block the component is inside (if any), null if no parent
         */
        this.blocks = blocks;
        this.parent = parent;
    }

    toLatex() {
        return '';
    }

    addBlock(block, position) {
        this.blocks.splice(position, 0, block);
    }

    removeBlock(position) {
        this.blocks.splice(position, 1);
    }

    isEmpty() {
        // Returns true if the blocks in the component are empty
        for (let block of this.blocks) {
            if (block.children.length) return false;
        }
        return true;
    }
}


/**
 * @class
 * A component with one block
 */
 class OneBlockComponent extends Component {
    constructor(parent) {
        let b1 = new Block();
        super([b1], parent);
        b1.parent = this;
    }
}


/**
 * @class
 * A component with two blocks
 */
class TwoBlockComponent extends Component {
    constructor(parent) {
        let b1 = new Block();
        let b2 = new Block();
        super([b1, b2], parent);
        b1.parent = this;
        b2.parent = this;
    }
}


/**
 * @class
 * A component with three blocks. We could further subclass ThreeBlockComponent to define a class that
 * takes in some LaTeX data, since that is mostly the only thing that varies between functions, and that would
 * make this file much DRYer
 */
class ThreeBlockComponent extends Component {
    constructor(parent) {
        let b1 = new Block();
        let b2 = new Block();
        let b3 = new Block();
        super([b1, b2, b3], parent);
        b1.parent = this;
        b2.parent = this;
        b3.parent = this;
    }
}


/**
 * @class
 * A template three block component that contains three blocks and uses the same LaTeX template.
 * Only the LaTeX command changes, but the template remains the same for every three block component.
 * We don't define a two block template component because the LaTeX generation for two block components
 * differs significantly from component to component.
 */
class TemplateThreeBlockComponent extends ThreeBlockComponent {
    constructor(parent, latexData) {
        super(parent);
        this.latexData = latexData;
    }

    toLatex() {
        return `\\${this.latexData}_{${this.blocks[0].toLatex()}}^{${this.blocks[1].toLatex()}}{${this.blocks[2].toLatex()}}`;
    }
}


/**
 * @class
 * A template two block component for trigonometric functions, which all use the same LaTeX template.
 * Every trigonometric component will, by default, have an empty block as a superscript. MathJax removes the
 * empty block while rendering, so users will be able to raise the function to any power without us having to
 * define a separate template component to support exponents for trigonometric components.
 */
class TrigonometricTwoBlockComponent extends TwoBlockComponent {
    constructor(parent, latexData) {
        super(parent);
        this.latexData = latexData;
    }

    toLatex() {
        return `\\${this.latexData}^{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}


/**
 * @class
 * A component with only text and no symbol, function of other LaTeX data. Safe to assume that
 * it only has one block with a string inside. Equivalent to a single block.
 */
class TextComponent extends Component {
    constructor(parent) {
        let b1 = new Block();
        super([b1], parent);
        b1.parent = this;
    }

    toLatex() {
        return this.blocks[0].toLatex();
    }
}


/**
 * @class
 * A symbol which is just some latex with no arguments to be inserted into the expression.
 */
// TODO - Add support for the backslash character as a symbol
class MJXGUISymbol extends Component {
    constructor(parent, latexData) {
        super([], parent);
        this.latexData = latexData;
    }

    toLatex() {
        return this.latexData;
    }
}


/**
 * @class
 * A framebox
 */
class FrameBox extends OneBlockComponent {
    toLatex() {
        return `\\boxed{${this.blocks[0].toLatex()}}`;
    }
}


/**
 * @class
 * The limit function
 */
class Limit extends TwoBlockComponent {
    toLatex() {
        return `\\lim_{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}


/**
 * @class
 * A fraction
 */
class Fraction extends TwoBlockComponent {
    toLatex() {
        return `\\frac{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}


/**
 * @class
 * Subscript
 */
class Subscript extends TwoBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}_{${this.blocks[1].toLatex()}}`;
    }
}


/**
 * @class
 * Superscript
 */

class Superscript extends TwoBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}^{${this.blocks[1].toLatex()}}`;
    }
}


/**
 * @class
 * Some text with both a subscript as well as a superscript on the left side
 */
class SubSupRight extends ThreeBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}_{${this.blocks[1].toLatex()}}^{${this.blocks[2].toLatex()}}`;
    }
}


/**
 * @class
 * The square root function
 */
class Sqrt extends OneBlockComponent {
    toLatex() {
        return `\\sqrt{${this.blocks[0].toLatex()}}`;
    }
}


/**
 * @class
 * The nth root function
 */
class NthRoot extends TwoBlockComponent {
    toLatex() {
        return `\\sqrt[${this.blocks[0].toLatex()}]{${this.blocks[1].toLatex()}}`;
    }
}
// Listens for keypress and modifies the Expression accordingly

const characters = new Set();
for (let char of 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@^*()[];:\'"/?.,<>-=+`~') {
    characters.add(char);
}

/**
 * @class
 *
 */
class Cursor {
    constructor(expression, display) {
        this.expression = expression;
        this.block = null;
        this.component = null;
        this.child = -0.5;
        this.position = -0.5;
        this.latex = '';
        this.display = display;
    }

    addText(text) {
        // Insert some text into the Expression, either as its own block or into the block
        // we are in currently.
        if (this.block === null) {
            // Safe to assume we are not in any block and are between two components in the
            // Expression or at the start or end of the Expression.
            const _ = new TextComponent(this.block);
            _.blocks[0].addChild(text);
            this.expression.add(_, Math.ceil(this.position));

            this.child = -0.5;
            this.position++;
        } else {
            // We are in some Block in some Component of the Expression.
            // The child we are in changes, the component, block, and position remain the same
            const _ = new TextComponent(this.block);
            _.blocks[0].addChild(text);
            this.block.addChild(_, Math.ceil(this.child));
            this.child++;
        }
    }

    addComponent(component) {
        // Insert a new Component into the Expression at the position of the cursor.
        // If we are in a block, we add a Component to the block as a child, otherwise
        // we insert the Component on the top level as a new component in the
        // Expression
        if (this.block === null) {
            this.expression.add(component, Math.ceil(this.position));
            this.position = Math.ceil(this.position);
            if (
                component instanceof MJXGUISymbol ||
                component instanceof TextComponent
            ) {
                this.block = null;
                this.component = null;
                this.position += 0.5;
            } else {
                this.block = component.blocks[0];
                this.component = component;
            }
            this.child = -0.5;
        } else {
            // Add the component to the block's children and increment this.child in preparation to move
            // inside the inserted component
            this.block.addChild(component, Math.ceil(this.child));
            // this.child += 0.5;
            if (
                component instanceof MJXGUISymbol ||
                component instanceof TextComponent
            ) {
                // If the component we just inserted is a Symbol or Text, don't move into it and increment
                // this.child by 0.5 again
                this.child += 1;
            } else {
                // Otherwise, move into the new component
                this.component = component;
                this.block = component.blocks[0];
                this.child = -0.5;
            }
        }
    }

    removeComponent() {
        if (this.block === null) {
            // If we are not in a block then we check if the component to the left is a TextComponent
            // If it is, we remove it, else we do nothing.
            let prevComponent =
                this.expression.components[Math.floor(this.position)];
            if (
                prevComponent instanceof TextComponent ||
                prevComponent instanceof MJXGUISymbol
            ) {
                this.position = Math.floor(this.position);
                this.component = prevComponent;
                this.block = prevComponent.blocks[0];
                this.child = -0.5;
                this.removeComponent();
            }
        } else if (this.component.parent === null) {
            // Find the component in the expression and remove it, change the cursor object's
            // component and block pointers
            for (let i = 0; i < this.expression.components.length; i++) {
                if (this.expression.components[i] === this.component) {
                    this.expression.remove(i);
                    break;
                }
            }
            this.position -= 0.5;
            this.component = null;
            this.block = null;
            this.child = -0.5;
        } else {
            // Capture the block above us to move into after we remove this component
            let parentBlock = this.component.parent;
            for (let i = 0; i < parentBlock.children.length; i++) {
                if (parentBlock.children[i] === this.component) {
                    parentBlock.removeChild(i);
                    this.child = i - 0.5;
                    break;
                }
            }
            this.block = parentBlock;
            this.component = parentBlock.parent;
        }
    }

    keyPress(event) {
        if (characters.has(event.key)) {
            this.addText(event.key);
        } else if (event.key === 'ArrowLeft') {
            this.seekLeft();
        } else if (event.key === 'ArrowRight') {
            this.seekRight();
        } else if (event.key === 'Backspace') {
            this.backspace();
        } else if (event.key === 'Enter') {
            document.getElementById('mjxgui_save_equation').click();
        } else if (event.key === ' ') {
            let _ = new MJXGUISymbol(this.block, '\\:\\:');
            this.addComponent(_);
        } else if (event.key === '\\') {
            let _ = new MJXGUISymbol(this.block, '\\backslash');
            this.addComponent(_);
        } else if (['$', '#', '%', '&', '_', '{', '}'].includes(event.key)) {
            let _ = new MJXGUISymbol(this.block, `\\${event.key}`);
            this.addComponent(_);
        }
        this.updateDisplay();
    }

    seekRight() {
        let maxPos = this.expression.components.length - 0.5;
        if (this.position >= maxPos) return;
        else if (this.block === null) {
            this.position += 0.5;
            // If the component at this index is a MJXGUISymbol or a TextComponent, skip it and go to the next
            if (
                this.expression.components[this.position] instanceof
                    TextComponent ||
                this.expression.components[this.position] instanceof
                    MJXGUISymbol
            ) {
                // If the component to the right of the cursor is a TextComponent, we skip it and
                // move one more position to the right and into the space between two components
                this.position += 0.5;
                this.child = -0.5;
                this.block = null;
                this.component = null;
            } else {
                // Otherwise we moved into a function
                // Set the block to be the last block of the function and set the child to be at the left most end
                this.component = this.expression.components[this.position];
                this.block = this.component.blocks[0];
                this.child = -0.5;
                // this.position remains the same
            }
        } else {
            if (this.child === this.block.children.length - 0.5) {
                // If we are at the end of the block, we want to move to a different block
                // and possibly a new component
                let pos = this.component.blocks.indexOf(this.block);
                if (pos === this.component.blocks.length - 1) {
                    // If we are in the last block of the current component, we want to move out of this component
                    if (this.component.parent === null) {
                        // We are at the top level, our component and blocks become null
                        this.component = null;
                        this.block = null;
                        this.child = -0.5;
                        this.position += 0.5;
                    } else {
                        // Otherwise, we move one level above and our component becomes the parent component
                        // our block becomes the block that the current component was in
                        this.block = this.component.parent;
                        // Record the position the current component is in. We move the cursor here
                        this.child =
                            this.block.children.indexOf(this.component) + 0.5;
                        this.component = this.block.parent;
                    }
                } else {
                    // this.component and this.position remain the same
                    this.block = this.component.blocks[pos + 1];
                    this.child = -0.5;
                }
            } else {
                // We are not at the end of the block
                // Detect the component to the right
                let nextComponent = this.block.children[Math.ceil(this.child)];
                if (
                    nextComponent instanceof TextComponent ||
                    nextComponent instanceof MJXGUISymbol
                ) {
                    // If it is a TextComponent or Symbol, skip it and move on
                    this.child++;
                } else {
                    this.component = nextComponent;
                    this.block = this.component.blocks[0];
                    this.child = -0.5;
                }
            }
        }
    }

    seekLeft() {
        if (this.position <= -0.5) return;
        else if (this.block === null) {
            this.position -= 0.5;
            // If the component at this index is a MJXGUISymbol or a TextComponent, we skip this component and go one more step backward
            if (
                this.expression.components[this.position] instanceof
                    TextComponent ||
                this.expression.components[this.position] instanceof
                    MJXGUISymbol
            ) {
                // If the component to the left of the cursor is a TextComponent, we skip it and
                // move one more position to the left and into the space between two components
                this.position -= 0.5;
                this.child = -0.5;
                this.block = null;
                this.component = null;
            } else {
                // Otherwise we moved into a Function
                // Set the block to be the last block of the function and set the child to be at the right most end
                this.component = this.expression.components[this.position];
                this.block =
                    this.component.blocks[this.component.blocks.length - 1];
                this.child = this.block.children.length - 0.5;
                // this.position remains the same
            }
        } else {
            if (this.child === -0.5) {
                // If we are at the start of the block, we want to move to a different block
                // and possibly a new component
                let pos = this.component.blocks.indexOf(this.block);
                if (pos === 0) {
                    // If we are in the first block of this component, we want to move out of this component
                    if (this.component.parent === null) {
                        // We are at the top level, our component and blocks become null
                        this.component = null;
                        this.block = null;
                        this.child = -0.5;
                        this.position -= 0.5;
                    } else {
                        // Otherwise, we move one level above and our component becomes the parent component
                        // our block becomes the block that the current component was in
                        this.block = this.component.parent;
                        // Record the position the current component is in. We move the cursor there.
                        this.child =
                            this.block.children.indexOf(this.component) - 0.5;
                        this.component = this.block.parent;
                    }
                } else {
                    // this.component and this.position remain the same
                    this.block = this.component.blocks[pos - 1];
                    this.child = this.block.children.length - 0.5;
                }
            } else {
                // We are not at the start of the block
                // Detect the component to the left
                let prevComponent = this.block.children[Math.floor(this.child)];
                if (
                    prevComponent instanceof TextComponent ||
                    prevComponent instanceof MJXGUISymbol
                ) {
                    // If it is a TextComponent or Symbol, skip it and move on
                    this.child--;
                } else {
                    this.component = prevComponent;
                    this.block =
                        this.component.blocks[this.component.blocks.length - 1];
                    this.child = this.block.children.length - 0.5;
                }
            }
        }
    }

    backspace() {
        if (this.expression.components.length === 0) return;
        else if (this.position === -0.5) return;

        if (this.block === null) {
            // If we are not in a block, we are in between two components, remove the previous component if it is
            // a TextComponent
            let prevComponent =
                this.expression.components[Math.floor(this.position)];
            if (
                prevComponent instanceof TextComponent ||
                prevComponent instanceof MJXGUISymbol
            ) {
                this.removeComponent();
            } else {
                this.component = prevComponent;
                this.block =
                    this.component.blocks[this.component.blocks.length - 1];
                this.child = this.block.children.length - 0.5;
                this.position = Math.floor(this.position);
            }
        } else {
            if (this.component.isEmpty()) {
                this.removeComponent();
            } else {
                if (this.child <= -0.5) {
                    const blockPos = this.component.blocks.indexOf(this.block);
                    if (blockPos === 0) return;
                    this.block = this.component.blocks[blockPos - 1];
                    this.child = this.block.children.length - 0.5;
                } else {
                    this.block.removeChild(Math.floor(this.child));
                    this.child--;
                }
            }
        }
    }

    toLatex() {
        // Generate LaTeX from the expression built till now
        let latex = this.expression.toLatex();
        this.latex = latex;
        return latex;
    }

    toDisplayLatex() {
        // Generate LaTeX to show in the display by adding a caret character to the expression.
        // This is not the real LaTeX of the expression but the LaTeX resulting after we add
        // a caret as a | character in the expression
        let caret = new TextComponent(this.block);
        caret.blocks[0].addChild('|');

        let frame = new FrameBox(this.block);

        if (this.block === null) {
            // If we are not in any block, we just add the caret, generate latex
            // and reset the components
            this.expression.add(caret, Math.ceil(this.position));
        } else {
            // We add the current component inside the frame, add the caret in the
            // right position, generate latex and reset the components
            let i = this.component.blocks.indexOf(this.block);
            this.component.removeBlock(i);
            this.component.addBlock(frame, i);
            frame.blocks[0] = this.block;
            this.block.addChild(caret, Math.ceil(this.child));
        }

        let latex = this.toLatex();

        if (this.block === null) {
            this.expression.remove(Math.ceil(this.position));
        } else {
            let i = this.component.blocks.indexOf(frame);
            this.component.removeBlock(i);
            this.component.addBlock(this.block, i);
            this.block.removeChild(Math.ceil(this.child));
        }

        return latex;
    }

    updateDisplay() {
        if (
            this.display instanceof String ||
            typeof this.display === 'string'
        ) {
            this.display = document.querySelector(this.display);
        }
        MathJax.typesetClear([this.display]);
        this.display.innerHTML = '$$' + this.toDisplayLatex() + '$$';
        MathJax.typesetPromise([this.display]).then(() => {});
    }
}

// Draws the editor UI and canvas inside the given div

const symbolLatexMap = {
    // Lowercase greek letters
    alpha: '\\alpha',
    beta: '\\beta',
    gamma: '\\gamma',
    delta: '\\delta',
    epsilon: '\\epsilon',
    zeta: '\\zeta',
    eta: '\\eta',
    theta: '\\theta',
    iota: '\\iota',
    kappa: '\\kappa',
    lambda: '\\lambda',
    mu: '\\mu',
    nu: '\\nu',
    xi: '\\xi',
    omicron: '\\omicron',
    pi: '\\pi',
    rho: '\\rho',
    sigma: '\\sigma',
    tau: '\\tau',
    upsilon: '\\upsilon',
    phi: '\\phi',
    chi: '\\chi',
    psi: '\\psi',
    omega: '\\omega',

    // Uppercase greek letters
    Alpha: 'A',
    Beta: 'B',
    Gamma: '\\Gamma',
    Delta: '\\Delta',
    Epsilon: 'E',
    Zeta: 'Z',
    Eta: 'H',
    Theta: '\\Theta',
    Iota: 'I',
    Kappa: 'K',
    Lambda: '\\Lambda',
    Mu: 'M',
    Nu: 'N',
    Xi: '\\Xi',
    Omicron: 'O',
    Pi: '\\Pi',
    Rho: 'P',
    Sigma: '\\Sigma',
    Tau: 'T',
    Upsilon: '\\Upsilon',
    Phi: '\\Phi',
    Chi: 'X',
    Psi: '\\Psi',
    Omega: '\\Omega',

    // Operators and symbols
    times: '\\times',
    div: '\\div',
    centerdot: '\\cdot',
    plusmn: '\\pm',
    mnplus: '\\mp',
    starf: '\\star',
    bigcup: '\\bigcup',
    bigcap: '\\bigcap',
    cup: '\\cup',
    cap: '\\cap',
    lt: '\\lt',
    gt: '\\gt',
    leq: '\\leq',
    GreaterEqual: '\\geq',
    equals: '=',
    approx: '\\approx',
    NotEqual: '\\ne',
    sub: '\\subset',
    sup: '\\supset',
    sube: '\\subseteq',
    supe: '\\supseteq',
    nsub: '\\not\\subset',
    nsup: '\\not\\supset',
    nsube: '\\not\\subseteq',
    nsupe: '\\not\\supseteq',
    propto: '\\propto',
    parallel: '\\parallel',
    npar: '\\nparallel',
    asympeq: '\\asymp',
    isin: '\\in',
    notin: '\\notin',
    exist: '\\exists',
    nexist: '\\nexists',
    perp: '\\perp',
    angle: '\\angle',
    angmsd: '\\measuredangle',
    Leftarrow: '\\Leftarrow',
    Rightarrow: '\\Rightarrow',
    Leftrightarrow: '\\Leftrightarrow',
    rightarrow: '\\to',
    leftarrow: '\\gets',
    leftrightarrow: '\\leftrightarrow',
    longrightarrow: '\\longrightarrow',
    longleftarrow: '\\longleftarrow',
    longleftrightarrow: '\\longleftrightarrow',
    uparrow: '\\uparrow',
    downarrow: '\\downarrow',
    updownarrow: '\\updownarrow',
    PartialD: '\\partial',
    hbar: '\\hbar',
    real: '\\Re',
    nabla: '\\nabla',
    infin: '\\infty',
};

const functionComponentMap = {
    lim: Limit,
    sqrt: Sqrt,
    nsqrt: NthRoot,
    sub: Subscript,
    sup: Superscript,
    subsup: SubSupRight,
    frac: Fraction,
};

class MJXGUI {
    constructor(
        elementSelector,
        successCallback = function (latex, instance) {},
        options = {},
    ) {
        this.selector = elementSelector;
        this.elements = document.querySelectorAll(elementSelector);
        this.options = options;
        this.mathDelimiter = this.options.mathDelimiter || '$$';
        this.isPersistent = options.isPersistent || false;
        this.successCallback = successCallback;
        this.eqnHistory = [];
        this.expression = new Expression();
        this.isMobileDevice = 'ontouchstart' in document.documentElement;
        this.pseudoMobileKeyboard = null;
        this.showUI = () => {
            // Show the editor window
            this.editorWindow.style.display = 'block';
            this.editorWindow.dataset.visible = 'true';
        };
        this.hideUI = () => {
            // Hide the editor window
            this.editorWindow.removeAttribute('style');
            this.editorWindow.dataset.visible = 'false';
        };

        if (
            this.elements instanceof String ||
            typeof this.elements === 'string'
        ) {
            this.elements = document.querySelectorAll(this.elements);
        }

        this.constructUI();
        this.cursor = new Cursor(this.expression, this.eqnDisplay);
        this.elements.forEach(el => {
            el.addEventListener('click', this.showUI);
        });

        document.addEventListener('keydown', evt => {
            if (this.editorWindow.dataset.visible === 'false') return;
            MathJax.typesetClear([this.eqnDisplay]);
            this.cursor.keyPress(evt);
            this.eqnDisplay.innerHTML =
                this.mathDelimiter +
                this.cursor.toDisplayLatex() +
                this.mathDelimiter;
            MathJax.typesetPromise([this.eqnDisplay]).then(() => {});
        });

        const symbols = this.editorWindow.querySelectorAll(
            '.mjxgui-operator, .mjxgui-greek-letter',
        );
        const functions =
            this.editorWindow.querySelectorAll('.mjxgui-function');

        symbols.forEach(symbol => {
            symbol.addEventListener('click', () => {
                if (symbol.dataset.latexData in symbolLatexMap) {
                    let _ = new MJXGUISymbol(
                        this.cursor.block,
                        symbolLatexMap[symbol.dataset.latexData],
                    );
                    this.cursor.addComponent(_);
                    this.cursor.updateDisplay();
                }
            });
        });

        functions.forEach(func => {
            func.addEventListener('click', () => {
                let _;
                if (func.dataset.templateType !== 'null') {
                    if (func.dataset.templateType === 'three') {
                        _ = new TemplateThreeBlockComponent(
                            this.cursor.block,
                            func.dataset.latexData,
                        );
                    } else if (func.dataset.templateType === 'trigonometric') {
                        _ = new TrigonometricTwoBlockComponent(
                            this.cursor.block,
                            func.dataset.latexData,
                        );
                    }
                } else {
                    _ = new functionComponentMap[func.dataset.functionId](
                        this.cursor.block,
                    );
                }
                this.cursor.addComponent(_);
                this.cursor.updateDisplay();
            });
        });
    }

    // Inject the editor HTML into the DOM
    constructUI() {
        // Injects the UI HTML into the DOM and binds the needed event listeners
        const editorDiv = document.createElement('div');
        editorDiv.classList.add('_mjxgui_editor_window');
        editorDiv.dataset.visible = 'false';
        editorDiv.innerHTML =
            '<div class="mjxgui_editor_controls"><div style="cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" class="mjxgui_close_button_svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div><div class="mjxgui_clear_save_buttons"><span class="mjxgui_button_container _mjxgui_clear_equation"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="4" y1="7" x2="20" y2="7"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/></svg> </span><span class="mjxgui_button_container _mjxgui_save_equation"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10"/></svg></span></div></div><div class="_mjxgui_tab_container_container"><div class="mjxgui_tab_container" data-tab="1">&alpha; Letters</div><div class="mjxgui_tab_container" data-tab="2">&plusmn; Symbols</div><div class="mjxgui_tab_container" data-tab="3">&Sigma; Functions</div></div><div class="mjxgui_tab _mjxgui_letters_tab" style="display: flex;" data-tab="1"><span class="mjxgui-btn mjxgui-greek-letter" title="Alpha" data-latex-data="Alpha">&Alpha;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Beta" data-latex-data="Beta">&Beta;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Gamma" data-latex-data="Gamma">&Gamma;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Delta" data-latex-data="Delta">&Delta;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Epsilon" data-latex-data="Epsilon">&Epsilon;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Zeta" data-latex-data="Zeta">&Zeta;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Eta" data-latex-data="Eta">&Eta;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Theta" data-latex-data="Theta">&Theta;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Iota" data-latex-data="Iota">&Iota;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Kappa" data-latex-data="Kappa">&Kappa;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Lambda" data-latex-data="Lambda">&Lambda;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Mu" data-latex-data="Mu">&Mu;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Nu" data-latex-data="Nu">&Nu;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Xi" data-latex-data="Xi">&Xi;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Omicron" data-latex-data="Omicron">&Omicron;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Pi" data-latex-data="Pi">&Pi;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Rho" data-latex-data="Rho">&Rho;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Sigma" data-latex-data="Sigma">&Sigma;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Tau" data-latex-data="Tau">&Tau;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Upsilon" data-latex-data="Upsilon">&Upsilon;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Phi" data-latex-data="Phi">&Phi;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Chi" data-latex-data="Chi">&Chi;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Psi" data-latex-data="Psi">&Psi;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="Omega" data-latex-data="Omega">&Omega;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="alpha" data-latex-data="alpha">&alpha;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="beta" data-latex-data="beta">&beta;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="gamma" data-latex-data="gamma">&gamma;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="delta" data-latex-data="delta">&delta;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="epsilon" data-latex-data="epsilon">&epsilon;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="zeta" data-latex-data="zeta">&zeta;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="eta" data-latex-data="eta">&eta;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="theta" data-latex-data="theta">&theta;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="iota" data-latex-data="iota">&iota;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="kappa" data-latex-data="kappa">&kappa;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="lambda" data-latex-data="lambda">&lambda;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="mu" data-latex-data="mu">&mu;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="nu" data-latex-data="nu">&nu;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="xi" data-latex-data="xi">&xi;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="omicron" data-latex-data="omicron">&omicron;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="pi" data-latex-data="pi">&pi;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="rho" data-latex-data="rho">&rho;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="sigma" data-latex-data="sigma">&sigma;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="tau" data-latex-data="tau">&tau;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="upsilon" data-latex-data="upsilon">&upsilon;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="phi" data-latex-data="phi">&phi;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="chi" data-latex-data="chi">&chi;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="psi" data-latex-data="psi">&psi;</span> <span class="mjxgui-btn mjxgui-greek-letter" title="omega" data-latex-data="omega">&omega;</span></div><div class="mjxgui_tab _mjxgui_symbols_tab" data-tab="2"><span class="mjxgui-btn mjxgui-operator" title="Times" data-latex-data="times">&times;</span> <span class="mjxgui-btn mjxgui-operator" title="Divide" data-latex-data="div">&div;</span> <span class="mjxgui-btn mjxgui-operator" title="Center dot" data-latex-data="centerdot">&centerdot;</span> <span class="mjxgui-btn mjxgui-operator" title="Plus-minus" data-latex-data="plusmn">&plusmn;</span> <span class="mjxgui-btn mjxgui-operator" title="Less than" data-latex-data="lt">&lt;</span> <span class="mjxgui-btn mjxgui-operator" title="Greater than" data-latex-data="gt">&gt;</span> <span class="mjxgui-btn mjxgui-operator" title="Less than or equal to" data-latex-data="leq">&leq;</span> <span class="mjxgui-btn mjxgui-operator" title="Greater than or equal to" data-latex-data="GreaterEqual">&GreaterEqual;</span> <span class="mjxgui-btn mjxgui-operator" title="Equals" data-latex-data="equals">&equals;</span> <span class="mjxgui-btn mjxgui-operator" title="Approximate" data-latex-data="approx">&approx;</span> <span class="mjxgui-btn mjxgui-operator" title="Not equal" data-latex-data="NotEqual">&NotEqual;</span> <span class="mjxgui-btn mjxgui-operator" title="Minus-plus" data-latex-data="mnplus">&mnplus;</span> <span class="mjxgui-btn mjxgui-operator" title="Star" data-latex-data="starf">&starf;</span> <span class="mjxgui-btn mjxgui-operator" title="Big cup" data-latex-data="bigcup">&bigcup;</span> <span class="mjxgui-btn mjxgui-operator" title="Big cap" data-latex-data="bigcap">&bigcap;</span> <span class="mjxgui-btn mjxgui-operator" title="Cup" data-latex-data="cup">&cup;</span> <span class="mjxgui-btn mjxgui-operator" title="Cap" data-latex-data="cap">&cap;</span> <span class="mjxgui-btn mjxgui-operator" title="Subset of" data-latex-data="sub">&sub;</span> <span class="mjxgui-btn mjxgui-operator" title="Superset of" data-latex-data="sup">&sup;</span> <span class="mjxgui-btn mjxgui-operator" title="Subset of or equal to" data-latex-data="sube">&sube;</span> <span class="mjxgui-btn mjxgui-operator" title="Superset of or equal to" data-latex-data="supe">&supe;</span> <span class="mjxgui-btn mjxgui-operator" title="Not a subset of" data-latex-data="nsub">&nsub;</span> <span class="mjxgui-btn mjxgui-operator" title="Not a superset of" data-latex-data="nsup">&nsup;</span> <span class="mjxgui-btn mjxgui-operator" title="Not a subset of or equal to" data-latex-data="nsube">&nsube;</span> <span class="mjxgui-btn mjxgui-operator" title="Not a superset of or equal to" data-latex-data="nsupe">&nsupe;</span> <span class="mjxgui-btn mjxgui-operator" title="Proportional to" data-latex-data="propto">&propto;</span> <span class="mjxgui-btn mjxgui-operator" title="Parallel to" data-latex-data="parallel">&parallel;</span> <span class="mjxgui-btn mjxgui-operator" title="Not parallel to" data-latex-data="npar">&npar;</span> <span class="mjxgui-btn mjxgui-operator" title="Approximately equal to" data-latex-data="asympeq">&asympeq;</span> <span class="mjxgui-btn mjxgui-operator" title="Element of" data-latex-data="isin">&isin;</span> <span class="mjxgui-btn mjxgui-operator" title="Not an element of" data-latex-data="notin">&notin;</span> <span class="mjxgui-btn mjxgui-operator" title="There exists" data-latex-data="exist">&exist;</span> <span class="mjxgui-btn mjxgui-operator" title="There does not exists" data-latex-data="nexist">&nexist;</span> <span class="mjxgui-btn mjxgui-operator" title="Perpendicular to" data-latex-data="perp">&perp;</span> <span class="mjxgui-btn mjxgui-operator" title="Implies (left)" data-latex-data="Leftarrow">&Leftarrow;</span> <span class="mjxgui-btn mjxgui-operator" title="Implies (right)" data-latex-data="Rightarrow">&Rightarrow;</span> <span class="mjxgui-btn mjxgui-operator" title="If and only if (iff)" data-latex-data="Leftrightarrow">&Leftrightarrow;</span> <span class="mjxgui-btn mjxgui-operator" title="Angle" data-latex-data="angle">&angle;</span> <span class="mjxgui-btn mjxgui-operator" title="Measured angle" data-latex-data="angmsd">&angmsd;</span> <span class="mjxgui-btn mjxgui-operator" title="Right arrow" data-latex-data="rightarrow">&rightarrow;</span> <span class="mjxgui-btn mjxgui-operator" title="Left arrow" data-latex-data="leftarrow">&leftarrow;</span> <span class="mjxgui-btn mjxgui-operator" title="Left right arrow" data-latex-data="leftrightarrow">&leftrightarrow;</span> <span class="mjxgui-btn mjxgui-operator" title="Long right arrow" data-latex-data="longrightarrow">&longrightarrow;</span> <span class="mjxgui-btn mjxgui-operator" title="Long left arrow" data-latex-data="longleftarrow">&longleftarrow;</span> <span class="mjxgui-btn mjxgui-operator" title="Long left right arrow" data-latex-data="longleftrightarrow">&longleftrightarrow;</span> <span class="mjxgui-btn mjxgui-operator" title="Up arrow" data-latex-data="uparrow">&uparrow;</span> <span class="mjxgui-btn mjxgui-operator" title="Down arrow" data-latex-data="downarrow">&downarrow;</span> <span class="mjxgui-btn mjxgui-operator" title="Up down arrow" data-latex-data="updownarrow">&updownarrow;</span> <span class="mjxgui-btn mjxgui-operator" title="Partial derivative" data-latex-data="PartialD">&PartialD;</span> <span class="mjxgui-btn mjxgui-operator" title="Reduced plank constant (h-bar)" data-latex-data="hbar">&hbar;</span> <span class="mjxgui-btn mjxgui-operator" title="Real part symbol" data-latex-data="real">&real;</span> <span class="mjxgui-btn mjxgui-operator" title="Nabla, del operator" data-latex-data="nabla">&nabla;</span> <span class="mjxgui-btn mjxgui-operator" title="Infinity symbol" data-latex-data="infin">&infin;</span></div><div class="mjxgui_tab _mjxgui_functions_tab" data-tab="3"><span class="mjxgui-btn mjxgui-function" title="Summation" data-template-type="three" data-latex-data="sum">&Sigma;</span> <span class="mjxgui-btn mjxgui-function" title="Integral" data-template-type="three" data-latex-data="int">&int;</span> <span class="mjxgui-btn mjxgui-function" title="Double integral" data-template-type="three" data-latex-data="iint">&#8748</span> <span class="mjxgui-btn mjxgui-function" title="Triple integral" data-template-type="three" data-latex-data="iiint">&iiint;</span> <span class="mjxgui-btn mjxgui-function" title="Contour integral" data-template-type="three" data-latex-data="oint">&oint;</span> <span class="mjxgui-btn mjxgui-function" title="Product" data-template-type="three" data-latex-data="prod">&Pi;</span> <span class="mjxgui-btn mjxgui-function" title="Co product" data-template-type="three" data-latex-data="coprod">&coprod;</span> <span class="mjxgui-btn mjxgui-function" title="Big cup (union)" data-template-type="three" data-latex-data="bigcup">&bigcup;</span> <span class="mjxgui-btn mjxgui-function" title="Big cap (intersection)" data-template-type="three" data-latex-data="bigcap">&bigcap;</span> <span class="mjxgui-btn mjxgui-function" title="Big vee (logical OR)" data-template-type="three" data-latex-data="bigvee">&bigvee;</span> <span class="mjxgui-btn mjxgui-function" title="Big wedge (logical AND)" data-template-type="three" data-latex-data="bigwedge">&bigwedge;</span> <span class="mjxgui-btn mjxgui-function" title="Limit" data-template-type="null" data-function-id="lim"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="500" font-weight="500" text-anchor="middle" transform="matrix(.75 0 0 .75 279.5 326.267)"><tspan x="0">lim</tspan></text></svg></span><span class="mjxgui-btn mjxgui-function" title="Square root" data-template-type="null" data-function-id="sqrt"><svg viewBox="0 0 567 567"><defs><style>.cls-1,.cls-2{fill-rule:evenodd}.cls-1{stroke-width:4.667px}.cls-2{stroke-width:7.417px}</style></defs><path id="Line_1" d="M3.707 306.883l-1.73-2.643 41.9-27.427 1.73 2.642z" class="cls-1" data-name="Line 1"/><path id="Line_2" d="M47.233 275.65l1.831-1.045 80.1 140.4-1.831 1.044z" class="cls-1" data-name="Line 2"/><path id="Line_3" d="M129.569 410.274l-3.113-1.374 111.707-252.923 3.113 1.375z" class="cls-2" data-name="Line 3"/><path id="Line_4" d="M241.471 154.67v-1.746h322.563v1.746H241.471z" class="cls-2" data-name="Line 4"/><path fill="none" fill-rule="evenodd" stroke-width="10.125" d="M288.978 190.824H495.53v206.552H288.978V190.824z"/></svg></span><span class="mjxgui-btn mjxgui-function" title="Nth root" data-template-type="null" data-function-id="nsqrt"><svg viewBox="0 0 567 567"><defs><style>.cls-1,.cls-2,.cls-3{fill-rule:evenodd}.cls-1{stroke-width:4.667px}.cls-2{stroke-width:7.417px}.cls-3{fill:none;stroke-width:10.125px}</style></defs><path id="Line_1" d="M3.707 306.883l-1.73-2.643 41.9-27.427 1.73 2.642z" class="cls-1" data-name="Line 1"/><path id="Line_2" d="M47.233 275.65l1.831-1.045 80.1 140.4-1.831 1.044z" class="cls-1" data-name="Line 2"/><path id="Line_3" d="M129.569 410.274l-3.113-1.374 111.707-252.923 3.113 1.375z" class="cls-2" data-name="Line 3"/><path id="Line_4" d="M241.471 154.67v-1.746h322.563v1.746H241.471z" class="cls-2" data-name="Line 4"/><path d="M288.978 190.824H495.53v206.552H288.978V190.824z" class="cls-3"/><path id="Rectangle_1_copy" d="M69.42 178.744h90.512v90.512H69.42v-90.512z" class="cls-3" data-name="Rectangle 1 copy"/></svg></span><span class="mjxgui-btn mjxgui-function" title="Subscript" data-template-type="null" data-function-id="sub"><svg viewBox="0 0 567 567"><defs><style>.cls-1{fill:none;stroke-width:12.875px;fill-rule:evenodd}</style></defs><path d="M27.09 82.836h285.083v285.083H27.09V82.836z" class="cls-1"/><path id="Rectangle_1_copy" d="M362.8 295.421h169.985V465.41H362.8V295.421z" class="cls-1" data-name="Rectangle 1 copy"/></svg></span><span class="mjxgui-btn mjxgui-function" title="Superscript" data-template-type="null" data-function-id="sup"><svg viewBox="0 0 567 567"><defs><style>.cls-1{fill:none;stroke-width:12.875px;fill-rule:evenodd}</style></defs><path d="M27.09 468.164h285.083V183.081H27.09v285.083z" class="cls-1"/><path id="Rectangle_1_copy" d="M362.8 255.579h169.985V85.59H362.8v169.989z" class="cls-1" data-name="Rectangle 1 copy"/></svg></span><span class="mjxgui-btn mjxgui-function" title="Subscript and Superscript" data-template-type="null" data-function-id="subsup"><svg viewBox="0 0 567 567"><defs><style>.cls-1{fill:none;stroke-width:12.875px;fill-rule:evenodd}</style></defs><path d="M34.7 413.554h267.862V145.693H34.7v267.861z" class="cls-1"/><path id="Rectangle_1_copy" d="M362.8 243.579h169.985V73.59H362.8v169.989z" class="cls-1" data-name="Rectangle 1 copy"/><path id="Rectangle_1_copy_2" d="M533.2 487.579H363.215V317.59H533.2v169.989z" class="cls-1" data-name="Rectangle 1 copy 2"/></svg></span><span class="mjxgui-btn mjxgui-function" title="Fraction" data-template-type="null" data-function-id="frac"><svg viewBox="0 0 567 567"><defs><style>.cls-1{fill:none;fill-rule:evenodd;stroke-width:12.875px}</style></defs><path id="Rectangle_1_copy" d="M193.8 225.579h169.985V55.59H193.8v169.989z" class="cls-1" data-name="Rectangle 1 copy"/><path id="Line_1" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="10.125" d="M124 284v-1h295v1H124z" data-name="Line 1"/><path id="Rectangle_1_copy_2" d="M364.2 528.579H194.215V358.59H364.2v169.989z" class="cls-1" data-name="Rectangle 1 copy 2"/></svg></span><span class="mjxgui-btn mjxgui-function" title="Sine" data-template-type="trigonometric" data-latex-data="sin"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">sin</tspan></text></svg></span><span class="mjxgui-btn mjxgui-function" title="Cosine" data-template-type="trigonometric" data-latex-data="cos"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">cos</tspan></text></svg></span><span class="mjxgui-btn mjxgui-function" title="Tangent" data-template-type="trigonometric" data-latex-data="tan"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">tan</tspan></text></svg></span><span class="mjxgui-btn mjxgui-function" title="Cosecant" data-template-type="trigonometric" data-latex-data="csc"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">csc</tspan></text></svg></span><span class="mjxgui-btn mjxgui-function" title="Secant" data-template-type="trigonometric" data-latex-data="sec"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">sec</tspan></text></svg></span><span class="mjxgui-btn mjxgui-function" title="Cotangent" data-template-type="trigonometric" data-latex-data="cot"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">cot</tspan></text></svg></span><span class="mjxgui-btn mjxgui-function" title="Inverse sine" data-template-type="trigonometric" data-latex-data="arcsin"><svg width="45" height="20" viewBox="0 0 2000 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="500" text-anchor="middle" transform="matrix(1.5 0 0 1.5 973.5 496)"><tspan x="0">arcsin</tspan></text></svg></span><span class="mjxgui-btn mjxgui-function" title="Inverse cosine" data-template-type="trigonometric" data-latex-data="arccos"><svg width="45" height="20" viewBox="0 0 2000 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="500" text-anchor="middle" transform="matrix(1.5 0 0 1.5 973.5 496)"><tspan x="0">arccos</tspan></text></svg></span><span class="mjxgui-btn mjxgui-function" title="Inverse tanget" data-template-type="trigonometric" data-latex-data="arctan"><svg width="45" height="20" viewBox="0 0 2000 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="500" text-anchor="middle" transform="matrix(1.5 0 0 1.5 973.5 496)"><tspan x="0">arctan</tspan></text></svg></span></div><div style="text-align: center;"><button class="_mjxgui_dir_btn leftArrowButton" style="cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-left" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0"/><path d="M5 12l6 6"/><path d="M5 12l6 -6"/></svg></button> <button class="_mjxgui_dir_btn rightArrowButton" style="cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-right" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0"/><path d="M13 18l6 -6"/><path d="M13 6l6 6"/></svg></button></div><div class="_mjxgui_editor_display"></div>';
        if (this.options.theme?.toLowerCase().trim() === 'dark') {
            editorDiv.classList.add('_mjxgui_dark_theme');
        }

        this.editorWindow = editorDiv;
        this.eqnDisplay = editorDiv.querySelector('._mjxgui_editor_display');
        this.eqnDisplay.innerHTML = `${this.mathDelimiter} | ${this.mathDelimiter}`;

        this.pseudoMobileKeyboard = editorDiv.querySelector(
            '.mjxgui-pseudo-mobile-keyboard',
        );
        const mjxguiTabButtons = editorDiv.querySelectorAll(
            '.mjxgui_tab_container',
        );
        const mjxguiTabs = editorDiv.querySelectorAll('.mjxgui_tab');

        const leftArrowButton = editorDiv.querySelector('.leftArrowButton');
        const rightArrowButton = editorDiv.querySelector('.rightArrowButton');

        leftArrowButton.addEventListener('click', () => {
            this.cursor.seekLeft();
            this.cursor.updateDisplay();
        });

        rightArrowButton.addEventListener('click', () => {
            this.cursor.seekRight();
            this.cursor.updateDisplay();
        });

        mjxguiTabButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                mjxguiTabs.forEach(tab => {
                    if (tab.dataset.tab === btn.dataset.tab) {
                        tab.style.display = 'flex';
                    } else {
                        tab.removeAttribute('style');
                    }
                });
            });
        });
        mjxguiTabButtons[0].classList.add('_mjxgui_active_tab');
        mjxguiTabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                mjxguiTabButtons.forEach(tabBtn => {
                    tabBtn.classList.remove('_mjxgui_active_tab');
                });
                btn.classList.add('_mjxgui_active_tab');
            });
        });

        const closeEditor = editorDiv.querySelector('.mjxgui_close_button_svg');
        closeEditor.addEventListener('click', this.hideUI);

        const clearEquationButton = editorDiv.querySelector(
            '._mjxgui_clear_equation',
        );
        clearEquationButton.addEventListener('click', () => {
            this.clearEquation();
        });

        const saveEquationButton = editorDiv.querySelector(
            '._mjxgui_save_equation',
        );
        saveEquationButton.addEventListener('click', () => {
            this.successCallback(this.getLatex(), this);
            this.hideUI();
            if (!this.isPersistent) this.clearEquation();
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

    /**
     * Getter method that returns the LaTeX for the currently built
     * equation.
     * @returns String - The generated LaTeX.
     */
    getLatex() {
        return this.cursor.toLatex();
    }

    /**
     * Removes all MJXGUI click listeners for the current selector,
     * selects DOM elements again, and rebinds MJXGUI click listeners. Meant
     * to be called if the DOM changes after the MJXGUI instance is created.
     */
    rebindListeners() {
        this.elements.forEach(el => {
            el.removeEventListener('click', this.showUI);
        });
        this.elements = document.querySelectorAll(this.selector);
        this.elements.forEach(el => {
            el.addEventListener('click', this.showUI);
        });
    }

    /**
     * Adds a function to the UI that is not supported out of the box.
     @param componentClass A class that inherits from one of MJXGUI's many component classes
     @param buttonContent HTML or text content that will be placed inside the rendered button
     @param title The title to show when a user hovers over the button
     @param typeset true if MathJax should typeset buttonContent
      (requires MathJax to be completely loaded when this function is called)
     */
    registerFunction(
        componentClass,
        buttonContent,
        title = '',
        typeset = false,
    ) {
        const el = document.createElement('span');
        el.classList.add('mjxgui-btn', 'mjxgui-function');
        el.title = title;
        el.dataset.templateType = 'user-defined';
        el.dataset.functionId = 'user-defined';
        el.innerHTML = buttonContent;
        this.editorWindow
            .querySelector('._mjxgui_functions_tab')
            .appendChild(el);
        if (typeset) MathJax.typesetPromise([el]).then(() => {});

        el.addEventListener('click', () => {
            this.cursor.addComponent(new componentClass());
            this.cursor.updateDisplay();
        });
    }

    /**
     * Adds a symbol to the UI that is not supported out of the box.
     @param latexData LaTeX code for the symbol
     @param buttonContent HTML or text content that will be placed inside the rendered button
     @param title The title to show when a user hovers over the button
     @param typeset true if MathJax should typeset buttonContent
      (requires MathJax to be completely loaded when this function is called)
     */
    registerSymbol(latexData, buttonContent, title = '', typeset = false) {
        const el = document.createElement('span');
        el.classList.add('mjxgui-btn', 'mjxgui-symbol');
        el.title = title;
        el.dataset.latexData = latexData;
        el.innerHTML = buttonContent;
        this.editorWindow.querySelector('._mjxgui_symbols_tab').appendChild(el);
        if (typeset) MathJax.typesetPromise([el]).then(() => {});

        el.addEventListener('click', () => {
            let _ = new MJXGUISymbol(this.cursor.block, latexData);
            this.cursor.addComponent(_);
            this.cursor.updateDisplay();
        });
    }

    /**
     * Transforms an <input> element into a button that allows users to enter an equation using MJXGUI.
     * Stores the resulting LaTeX of the equation as the value of the input.
     * @param selector A CSS selector that identifies the input(s) to be converted
     * @param options An object of options for configuring the MJXGUI widget
     */
    static createEquationInput(selector, options = {}) {
        if (options.isPersistent === undefined) options.isPersistent = true;
        const inputs = document.querySelectorAll(selector);
        const formInputHTML =
            '<div class="_mjxgui_equation_input"><button type="button" class="_mjxgui_insert_equation_button">Add Equation</button><div class="_mjxgui_equation_input_preview"></div></div>';
        for (let i = 0; i < inputs.length; i++) {
            let inp = inputs[i];
            inp.style.display = 'none';
            inp.value = '';

            const newEl = document.createElement('div');
            newEl.classList.add('_mjxgui_equation_input_wrapper');
            newEl.innerHTML = formInputHTML;
            inp.insertAdjacentElement('afterend', newEl);

            const inputEl = newEl.querySelector('._mjxgui_equation_input');
            const inpButton = newEl.querySelector(
                '._mjxgui_insert_equation_button',
            );
            const eqnDisplay = newEl.querySelector(
                '._mjxgui_equation_input_preview',
            );
            inpButton.id = `_mjxgui_insert_equation_button_${i}`;

            const widget = new MJXGUI(
                `#_mjxgui_insert_equation_button_${i}`,
                function () {},
                options,
            );
            widget.successCallback = function (latex, instance) {
                if (latex.length > 0) {
                    // Set input value and show equation preview
                    inp.value = latex;
                    MathJax.typesetClear([eqnDisplay]);
                    eqnDisplay.innerHTML = `$ ${latex} $`;
                    MathJax.typesetPromise([eqnDisplay]).then(() => {});

                    inpButton.textContent = 'Edit';
                } else {
                    inp.value = '';
                    MathJax.typesetClear([eqnDisplay]);
                    eqnDisplay.innerHTML = '';
                    inpButton.textContent = 'Add Equation';
                }

                if (inp.validity.valid) {
                    inputEl.classList.remove('_mjxgui_equation_input_invalid');
                    inputEl.classList.add('_mjxgui_equation_input_valid');
                } else {
                    inputEl.classList.add('_mjxgui_equation_input_invalid');
                    inputEl.classList.remove('_mjxgui_equation_input_valid');
                }
            };
        }
    }
}
