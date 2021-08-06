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
    constructor(expression) {
        this.expression = expression;
        this.block = null;
        this.component = null;
        this.child = 0;
        this.position = -0.5;
        this.cacheText = '';
    }

    addText(text) {
        // Insert some text into the Expression, either as its own block or into the block
        // we are in currently.
        console.log(`Position was ${this.position}`);
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
        console.log(`Position became ${this.position}`);
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
        this.block = component.blocks[0];
        this.component = component;
    }

    backspace() {

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
            this.position--;
            this.component = this.expression.components[this.position];
            this.block = this.component.blocks[0];
            this.child = 0;
        }
        else {
            let parentBlock = this.component.parent;
            for (let i = 0; i <  parentBlock.children.length; i++) {
                if (parentBlock.children[i] === this.component) {
                    parentBlock.removeChild(i);
                    this.child = i-1;
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
            if (this.position === -0.5) return;
            this.position--;
        }
        else if (event.key === 'ArrowRight') {
            if (this.position + 0.5 > this.expression.components.length) return;
            this.position++;
        }
    }

    toLatex() {
        // Insert a "cursor" character (\framebox{|}) where the cursor is and generate 
        // LaTeX for the entire expression
        let caret = new TextComponent(this.block);
        caret.blocks[0].addChild('\\framebox{|}');

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
}

let mjxguiCursor = new Cursor(expression);