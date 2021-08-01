// Builds the expression/equation being typed in by the user
// Exposes its API for the controller module to use

/**
 * @Class
 * Thin wrapper around the Component class that collects all the components together in an Expression
 * that can be easily rendered and converted to LaTeX.
**/
class Expression {
    constructor(nestingDepth = 0) {
        this.components = [];
        this.nestingDepth = nestingDepth;
    }

    add(component, position = this.components.length) {
        // Insert component at position in this Expression.
        // Defaults to adding the component to the end of Expression
        this.components.splice(position, 0, component);
    }

    remove(position = this.components.length-1) {
        // Remove the component at position in this Expression.
        // Defaults to removing the last component in this Expression
        this.components.splice(position, 1);
    }

    toLatex() {
        // Generate LaTeX code from the components in this Expression
        let latex = '';
        for (let c of this.components) {
            latex += c.toLatex();
        }
        return latex;
    }
}

/**
 * @Class
 * Represents a block. A fundamental unit of the Expression.
 */
class Block {
    constructor() {
        this.children = [];
    }

    toLatex() {
        // Generate LaTeX code from the contents of this block.
        // A block's children can contain either strings or an arbitrary child class of Component.
        if (this.children.length === 0) return '';
        let latex = '';
        for (let c of this.children) {
            if (typeof c === 'string') {
                latex += c + ' ';
            }
            else {
                latex += c.toLatex() + ' ';
            }
        }
        return latex;
    }

    addChild(component, position = this.children.length) {
        // Setter method to add some component to this block at position. Component can be any child class of Component.
        // Defaults to adding the component at the end.
        this.children.splice(position, 0, component);
    }

    removeChild(position = this.children.length-1) {
        // Remove some component from this block.
        // Defaults to removing the last component.
        this.children.splice(position, 1);
    }
}

/**
 * @Class
 * Abstract base class representing a Component of the equation. Inherited by the TextBlock, all *Symbol,
 * and all *Function classes.
 */
class Component {
    constructor(blocks = []) {
        this.blocks = blocks;
    }

    toLatex() {
        return '';
    }
}

/**
 * @Class
 * A component with only text and no symbol, function of other LaTeX data. Safe to assume that
 * it only has one block with a string inside.
 */
class TextComponent extends Component {
    constructor() {
        super([new Block()]);
    }

    toLatex() {
        return this.blocks[0].toLatex();
    }
}