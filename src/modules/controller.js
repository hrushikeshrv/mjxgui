// Listens for keypresses and modifies the Expression accordingly

let expression = new Expression();
const characters = new Set();
for (let char of 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*(){};:\'"/?.,<>-=_+`~') {
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
        this.child = 0;
        this.position = -0.5;
        this.cacheText = '';
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
            
            this.child = 0;
            // this.block = _.blocks[0];
            // this.component = _;
            this.position++;
        }
        else {
            // We are in some Block in some Component of the Expression. 
            // The child we are in changes, the component and position remain the same
            this.block.addChild(text, this.child);
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
        }
        else {
            this.block.addChild(component, this.child);
        }
        this.child = 0;
        this.block = component.blocks[0] || null;
        this.component = component;
    }

    removeComponent() {
        if (this.block === null) return;
        if (this.component.parent === null) {
            //Find the component in the expression and remove it, change the cursor object's
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
            this.child = 0;
        }
        else {
            let parentBlock = this.component.parent;
            for (let i = 0; i <  parentBlock.children.length; i++) {
                if (parentBlock.children[i] === this.component) {
                    parentBlock.removeChild(i);
                    this.child = i;
                    break;
                }
            }
            this.component = parentBlock.children[this.child];
            this.block = parentBlock;
        }
    }

    keyPress(event) {
        if (characters.has(event.key)) {
            this.addText(event.key);
        }
        else if (event.key === 'ArrowLeft') {
            this.seekLeft();
        }
        else if (event.key === 'ArrowRight') {
            this.seekRight();
        }
        else if (event.key === 'Backspace') {
            this.backspace();
        }
    }

    seekRight() {
        let maxPos = this.expression.components.length - 0.5;
        if (this.position >= maxPos) return;
        else if (this.block === null) {
            this.position += 0.5;
            if (this.expression.components[this.position] instanceof TextComponent) {
                // If the component to the right of the cursor is a TextComponent, we skip it and
                // move one more position to the right and into the space between two componenets
                this.position += 0.5;
                this.block = null;
                this.child = 0;
                this.component = null;
            }
            else {
                this.component = this.expression.components[this.position];
                this.block = this.component.blocks[0];
                this.child = 0;
            }
        }
        else {
            if (this.child === this.block.children.length-1) {
                // If we are in the last child, we want to move to a different block.
                // Detect the position of the block in the component.
                // If the block is the last block of the component, we move into the space between
                // Else, we just move to the block after the current one
                let pos = this.component.blocks.indexOf(this.block);
                if (pos === this.component.blocks.length-1) {
                    this.position += 0.5;
                    this.block = null;
                    this.child = 0;
                    this.component = null;
                }
                else {
                    this.block = this.component.blocks[pos+1];
                    this.child = 0;
                }
            }
            else {
                this.child++;
            }
        }
        
    }

    seekLeft() {
        if (this.position <= -0.5) return;
        else if (this.block === null) {
            this.position -= 0.5;
            if (this.expression.components[this.position] instanceof TextComponent) {
                // If the component to the left of the cursor is a TextComponent, we skip it and
                // move one more position to the left and into the space between two components
                this.position -= 0.5;
                this.block = null;
                this.child = 0;
                this.component = null;
            }
            else {
                this.component = this.expression.components[this.position];
                this.block = this.component.blocks[this.component.blocks.length-1];
                this.child = this.block.children.length-1;
            }
        }
        else {
            if (this.child === 0) {
                // If we are in the first child, we want to move to a different block.
                // Detect the position of the block in the component.
                // If the block is the first block of the component, we move into the space between two components
                // Else, we just move to the block before the current one in the same component.
                let pos = this.component.blocks.indexOf(this.block);
                if (pos === 0) {
                    this.component = null;
                    this.block = null;
                    this.child = 0;
                    this.position -= 0.5;
                }
                else {
                    this.block = this.component.blocks[pos-1];
                    this.child = this.block.children.length-1;
                }
            }
            else {
                this.child--;
            }
        }
    }

    backspace() {
        // NOTE - If we are in the space between two components and the component to the left
        // is a TextComponent, delete the TextComponent directly.
    }

    toLatex() {
        // Insert a "cursor" character (\framebox{|}) where the cursor is and generate 
        // LaTeX for the entire expression
        let caret = new TextComponent(this.block);
        // caret.blocks[0].addChild('\\framebox{|}');
        caret.blocks[0].addChild('|');

        let oldPos = this.position;
        this.position = Math.floor(this.position) + 1;

        this.addComponent(caret);
        let latex = '$$ ' + this.expression.toLatex() + '$$';
        this.removeComponent();

        this.block = null;
        this.component = null;
        this.position = oldPos;
        return latex;
    }

    updateDisplay() {
        if (this.display instanceof String || typeof this.display === 'string') {
            this.display = document.getElementById(this.display);
        }
        MathJax.typesetClear([this.display]);
        this.display.innerHTML = mjxguiCursor.toLatex();
        MathJax.typesetPromise([this.display]).then(() => {});
    }
}

let mjxguiCursor = new Cursor(expression, 'mjxgui-display');