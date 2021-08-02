// Listens for keypresses and modifies the Expression accordingly

let expression = new Expression();

/**
 * @class
 * 
 */
class Cursor {
    constructor(expression) {
        this.expression = expression;
        this.block = null;
        this.component = null;
        this.position = 0;
        this.cacheText = '';
    }

    addText(text) {
        // Insert some text into the Expression, either as its own block or into the block
        // we are in currently.

        if (this.block === null) {
            // Safe to assume we are not in any block and are between two components in the 
            // Expression or at the start or end of the Expression.
            const _ = new TextComponent();
            _.blocks[0].addChild(text);
            this.expression.add(_, Math.floor(this.position));
            
            this.block = _.blocks[0];
            this.component = _;
            this.position = Math.floor(this.position + 1);
        }
        else {
            // We are in some Block in some Component of the Expression.
            this.block.addChild(text);
        }
    }

    addComponent(component) {
        // Insert a new Component into the Expression at the position of the cursor.
        // If we are in a block, we add a Component to the block as a child, otherwise 
        // we insert the Component on the top level as a new component in the 
        // Expression
    }

    backspace() {

    }

    removeComponent() {

    }

    keyPress() {

    }
}