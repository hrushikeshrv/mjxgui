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

    draw() {}

    // Move the cursor to the next block in blockList
    seekF() {}

    // Move the cursor to the previous block in blockList
    seekB() {}

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
        // If the current block is null, we are in between two indices of the expressionList
        // We remove the previous element in expressionList if it is empty, otherwise we do nothing
        if (this.currentBlock === null) {
            if (this.currentExpression < 1) return;
            if (expressionList[parseInt(this.currentExpression)].isEmpty()) {
                expressionList.splice(parseInt(this.currentExpression), 1);
                this.currentExpression = parseInt(this.currentExpression);
                this.updateBlock(-1);
                this.seekB();
            }
        }
        // The block we are in will only contain text, because the cursor can only be at the "leaves" of the block "tree"
        // If the block we are in is not empty we delete the last character from the block's latex
        // Otherwise we check if the expression we are in is empty.
        // If yes we delete the entire expression, else we do nothing
        let cb = blockList[this.currentBlock];
        if (!cb.isEmpty()) {
            cb.latex = cb.latex.slice(0, -1);
            this.seekB();
        }
        else {
            if (expressionList[this.currentExpression].isEmpty()) {
                expressionList.splice(this.currentExpression, 1);
                this.currentExpression--;
                this.updateBlock(0);
                this.seekB();
            }
        }
    }

    keyDown() {}

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