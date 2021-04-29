const expressionList = [];
const blockList = [];

class Cursor {
    constructor() {
        this.currentBlock = 0;
        this.currentExpression = 0;
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

    // Delete the last character/block/expression
    backspace() {
        if (blockList.length === 0 || this.currentBlock === null) {
            return;
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
                this.seekB();
            }
        }
    }

    keyDown() {}

    // Generate latex for all expressions in expressionList and quit the widget
    write() {}

    moveToBlock(block) {}
}

class GUISymbol {
    constructor(latex) {
        this.latex = latex;
    }
    draw() {
        throw new Error('The draw function for this GUISymbol has not been implemented yet.')
    }

    generateLatex() {
        return `\\${this.latex}`;
    }
}

class PM extends GUISymbol {
    constructor() {
        super('pm');
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
        // TODO - Push these two new blocks into the global blockList
        //  at the appropriate position (Cursor index over blockList)
        super(50, 30, [b1, b2]);
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
        // TODO - Push these two new blocks into the global blockList
        //  at the appropriate position (Cursor index over blockList)
        super(50, 50, [b1, b2, b3]);
    }

    generateLatex() {
        return `\\sum_{${this.blocks[0].getLatex()}}^{${this.blocks[1].getLatex()}}{${this.blocks[2].getLatex()}}`;
    }
}