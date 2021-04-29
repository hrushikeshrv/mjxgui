class Cursor {

}

class GUISymbol {
    constructor(latex) {
        this.latex = latex;
    }
    draw() {
        throw new Error('The draw function has not been implemented for the base GUISymbol class yet.')
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
    children = [];
    latex = '';

    getLatex = function() {}
}

class Expression {
    blocks = [];
    id = undefined;
    width = undefined;
    height = undefined;

    draw = function() {}
    isEmpty = function() {}
    generateLatex = function() {}
}