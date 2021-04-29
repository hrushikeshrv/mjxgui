class Cursor {

}

class Symbol {
    latex = '';

    draw = function() {}
    getLatex = function() {}
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