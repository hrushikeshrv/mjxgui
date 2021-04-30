const expressionList = [];
const blockList = [];

class Cursor {
    constructor() {
        // currentBlock can take integer values as indices into blockList or null if we are not in a block (in between 2 Expressions/Symbols)
        this.currentBlock = null;
        // currentExpression can take integer values as indices into expressionList
        // or half integer values to represent the cursor being in between two expressions/symbols
        // When currentExpression is a half integer, currentBlock is null
        this.currentExpression = -0.5;
        this.x = 5;
        this.y = 2;
        this.height = 50;
    }

    isInBlock() {
        return this.currentBlock !== null;
    }

    // Draw the cursor on the canvas
    draw() {}

    // Move the cursor one step forwards
    seekF() {}

    // Move the cursor one step to the back
    seekB() {
        // If we are in a block then we check which block of the Expression (first, second, etc.) we are in.
        // If we are not in the first block of any Expression, we just move to the block to the left in the same Expression.
        // Otherwise we move into the space between the current Expression and the previous Expression.
        // If we are already in the space between two Expressions (i.e. we are not in any block), we move to the last block in the Expression to the left.
        if (this.isInBlock()) {
            let currentIndex = -1;
            let cb = blockList[this.currentBlock];
            let neighbours = expressionList[this.currentExpression].blocks
            for (let i = 0; i < neighbours.length; i++) {
                if (neighbours[i] === cb) {
                    currentIndex = i;
                    break;
                }
            }
            if (currentIndex > 0) {
                cb = neighbours[currentIndex - 1];
                for (let i = 0; i < blockList.length; i++) {
                    if (blockList[i] === cb) {
                        this.currentBlock = i;
                        return;
                    }
                }
            }
            else {
                this.currentExpression -= 0.5;
                this.currentBlock = null;
            }
        }
        else {
            if (this.currentExpression < 0) return;

            this.currentExpression = Math.floor(this.currentExpression);
            this.updateBlock(-1);
        }
    }

    // Update this.currentBlock everytime we delete an Expression/Symbol or move to a new Expression/Symbol
    updateBlock(position = -1) {
        let cb;
        if (position === -1) cb = expressionList[this.currentExpression].blocks.slice(position)[0];
        else cb = expressionList[this.currentExpression].blocks[position];

        for (let block = 0; block < blockList.length; block++) {
            if (blockList[block] === cb) {
                this.currentBlock = block;
                return;
            }
        }
    }

    seekBlock(newBlock) {
        for (let block = 0; block < blockList.length; block++) {
            if (blockList[block] === newBlock) {
                this.currentBlock = block;
                return;
            }
        }
    }

    // Delete the last character/block/expression
    backspace() {
        if (blockList.length === 0) {
            return;
        }
        // If we are not in any Block, we are in between two indices of the expressionList
        // We remove the previous element in expressionList if it is empty, otherwise we do nothing
        if (this.currentBlock === null) {
            if (this.currentExpression < 1) return;
            if (expressionList[parseInt(this.currentExpression)].isEmpty()) {
                expressionList.splice(parseInt(this.currentExpression), 1);
                this.currentExpression--;
            }
        }
        // The block we are in will only contain text, because the cursor can only be at the "leaves" of the block "tree" (since Blocks can be nested)
        // If the block we are in is not empty we delete the last character from the block's latex
        // Otherwise we check if the expression we are in is empty.
        // If yes we delete the entire expression, else we do nothing
        let cb = blockList[this.currentBlock];
        if (!cb.isEmpty()) {
            cb.latex = cb.latex.slice(0, -1);
        }
        else {
            if (expressionList[this.currentExpression].isEmpty()) {
                expressionList.splice(this.currentExpression, 1);
                this.currentExpression -= 0.5;
                this.currentBlock = null;
            }
        }
    }

    // Handle key presses
    keyDown(evt) {
        if (evt.key === 'ArrowLeft') {this.seekB()}
        else if (evt.key === 'ArrowRight') {this.seekF()}
        else if (evt.key === 'Backspace') {this.backspace()}
    }

    // Generate latex for all expressions in expressionList and quit the widget
    write() {}

    moveToBlock(block) {}
}

const mjxguiCursor = new Cursor();

class GUISymbol {
    constructor(latex) {
        this.latex = latex;
    }
    draw() {
        throw new Error('The draw function for this GUISymbol has not been implemented yet.')
    }

    isEmpty() {
        return true;
    }

    insertIntoExpressionList() {
        // If the cursor is not in any block (and therefore on the top level), insert this Expression into the global expressionList
        // else we are inside a block, so add this Symbol as a child of the block we are in and don't insert into the global expressionList
        if (mjxguiCursor.currentBlock === null) {
            expressionList.splice(Math.floor(mjxguiCursor.currentExpression)+1, 0, this);
            mjxguiCursor.currentExpression = Math.floor(mjxguiCursor.currentExpression) + 1;
            mjxguiCursor.updateBlock(0);
        }
        else {
            blockList[mjxguiCursor.currentBlock].children.push(this);
        }
    }

    generateLatex() {
        return `\\${this.latex}`;
    }
}

class PM extends GUISymbol {
    constructor() {
        super('pm');
        this.insertIntoExpressionList();
    }

    draw() {

    }
}

class Block {
    constructor() {
        this.children = [];
        this.latex = '';
    }

    getLatex() {
        if (this.children.length === 0) {
            return this.latex;
        }
        else {
            let l = '';
            for (let exp of this.children) {
                l += ' ' + exp.generateLatex();
            }
            return l;
        }
    }

    draw() {
        throw new Error('The draw function for this Block has not been implemented yet.')
    }

    isEmpty() {
        return (this.latex === '' && this.children.length === 0)
    }
}

class Expression {
    constructor(width, height, blocks) {
        this.width = width;
        this.height = height;
        this.blocks = blocks;
    }

    draw() {
        throw new Error('The draw function for this Expression has not been implemented yet.')
    }

    insertIntoExpressionList() {
        // If the cursor is not in any block (and therefore on the top level), insert this Expression into the global expressionList
        // else we are inside a block, so add this Expresion as a child of the block we are in and don't insert into the global expressionList
        if (mjxguiCursor.currentBlock === null) {
            expressionList.splice(Math.floor(mjxguiCursor.currentExpression)+1, 0, this);
            mjxguiCursor.currentExpression = Math.floor(mjxguiCursor.currentExpression) + 1;
            mjxguiCursor.updateBlock(0);
        }
        else {
            blockList[mjxguiCursor.currentBlock].children.push(this);
            mjxguiCursor.seekBlock(this.blocks[0]);
        }
    }

    isEmpty() {
        for (let block of this.blocks) {
            if (!block.isEmpty()) {
                return false;
            }
        }
        return true;
    }

    generateLatex() {
        throw new Error('The generateLatex function for this Expression has not been implemented yet.')
    }
}

class NSqrt extends Expression {
    constructor() {
        const b1 = new Block();
        const b2 = new Block();
        blockList.push(b1, b2);

        super(50, 30, [b1, b2]);
        this.insertIntoExpressionList();
    }

    generateLatex() {
        return `\\sqrt[${this.blocks[0].getLatex()}]{${this.blocks[1].getLatex()}}`
    }
}

class Sum extends Expression {
    constructor() {
        const b1 = new Block();
        const b2 = new Block();
        const b3 = new Block();
        blockList.push(b1, b2, b3);

        super(50, 50, [b1, b2, b3]);
        this.insertIntoExpressionList();
    }

    generateLatex() {
        return `\\sum_{${this.blocks[0].getLatex()}}^{${this.blocks[1].getLatex()}}{${this.blocks[2].getLatex()}}`;
    }
}