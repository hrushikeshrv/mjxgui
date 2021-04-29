class Cursor {

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
                l += exp.generateLatex();
            }
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
    constructor(name, height, width, blocks) {
        this.name = name;
        this.height = height;
        this.width = width;
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