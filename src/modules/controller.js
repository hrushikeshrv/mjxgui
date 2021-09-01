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
            
            this.child = 0;
            // this.block = _.blocks[0];
            // this.component = _;
            this.position++;
        }
        else {
            // We are in some Block in some Component of the Expression. 
            // The child we are in changes, the component, block, and position remain the same
            const _ = new TextComponent(this.block);
            _.blocks[0].addChild(text);
            this.block.addChild(_, this.child);
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
            if (component instanceof MJXGUISymbol || component instanceof TextComponent) {
                this.block = null;
                this.component = null;
                this.position += 0.5;
            }
            else {
                this.block = component.blocks[0];
                this.component = component;
            }
        }
        else {
            this.block.addChild(component, this.child);
            this.component = component;
            this.block = component.blocks[0];
        }
        this.child = 0;
    }

    removeComponent() {
        if (this.block === null) {
            // If we are not in a block then we check if the component to the left is a TextComponent
            // If it is, we remove it, else we do nothing.
            let prevComponent = this.expression.components[Math.floor(this.position)];
            if (prevComponent instanceof TextComponent || prevComponent instanceof MJXGUISymbol) {
                this.position = Math.floor(this.position);
                this.component = prevComponent;
                this.block = prevComponent.blocks[0];
                this.child = 0;
                this.removeComponent();
            }
        }
        else if (this.component.parent === null) {
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
            if (parentBlock.children.length === 0) {
                this.component = parentBlock.parent;
                this.block = parentBlock.parent.blocks[0];
            }
            else {
                this.component = parentBlock.children[this.child-1];
                this.block = parentBlock.children[this.child-1].blocks[0];
            }

            // If we end up moving into a text component or symbol, move one level up
            if (this.component instanceof TextComponent || this.component instanceof MJXGUISymbol) {
                this.component = this.component.parent.parent;
                this.block = this.block.parent.parent;
            }
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
            // If the component at this index is a MJXGUISymbol or a TextComponent, skip it and go to the next
            if (this.expression.components[this.position] instanceof TextComponent || this.expression.components[this.position] instanceof MJXGUISymbol) {
                // If the component to the right of the cursor is a TextComponent, we skip it and
                // move one more position to the right and into the space between two components
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
            // If the component at this index is a MJXGUISymbol or a TextComponent, we skip this component and go one more step backward
            if (this.expression.components[this.position] instanceof TextComponent || this.expression.components[this.position] instanceof MJXGUISymbol) {
                // If the component to the left of the cursor is a TextComponent, we skip it and
                // move one more position to the left and into the space between two components
                this.position -= 0.5;
                this.child = -0.5;
                this.block = null;
                this.component = null;
            }
            else {
                // Otherwise we moved into a Function
                // Set the block to be the last block of the function and set the child to be at the right most end
                this.component = this.expression.components[this.position];
                this.block = this.component.blocks[this.component.blocks.length-1];
                this.child = this.block.children.length-0.5;
                // this.position remains the same
            }
        }
        else {
            if (this.child === -0.5) {
                // If we are in the first child, we want to move to a different block.
                // Detect the position of the block in the component.
                // If the block is the first block of the component, we move into the space between two components
                // Else, we just move to the block before the current one in the same component.
                let pos = this.component.blocks.indexOf(this.block);
                if (pos === 0) {
                    this.component = null;
                    this.block = null;
                    this.child = -0.5;
                    this.position -= 0.5;
                }
                else {
                    // this.component and this.position remain the same
                    this.block = this.component.blocks[pos-1];
                    this.child = this.block.children.length-0.5;
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
        if (this.expression.components.length === 0) return;
        else if (this.position === -0.5) return;
        if (this.block === null) {
            let prevComponent = this.expression.components[Math.floor(this.position)];
            if (prevComponent instanceof TextComponent || prevComponent instanceof MJXGUISymbol) {
                this.removeComponent();
            }
            else {
                this.component = prevComponent;
                this.block = this.component.blocks[this.component.blocks.length-1];
                this.child = this.block.children.length-1;
                this.position = Math.floor(this.position);
            }
        }
        // TODO - This implementation of backspace() is probably not correct and will break inside nested functions
        else {
            this.block.removeChild(this.child);
            this.child--;
            if (this.child < 0) this.child = 0;
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

        this.addComponent(caret);
        let latex = this.toLatex();
        this.removeComponent();
        return latex;
    }

    updateDisplay() {
        if (this.display instanceof String || typeof this.display === 'string') {
            this.display = document.getElementById(this.display);
        }
        MathJax.typesetClear([this.display]);
        this.display.innerHTML = '$$' + this.toDisplayLatex() + '$$';
        MathJax.typesetPromise([this.display]).then(() => {});
    }
}

let mjxguiCursor = new Cursor(expression, 'mjxgui-display');