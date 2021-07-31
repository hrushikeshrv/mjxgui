// Controller module - listens for keypresses and triggers the appropriate expression and
// rendering methods
MJXGUI = MJXGUI || {}
MJXGUI.seekList = [];
MJXGUI.supportedKeys = {}

class Cursor {
    constructor() {
        this.seekPos = 0;
        this.x = 0;
        this.y = 0;
        this.depth = 0;
    }

    seekF() {}

    seekB() {}

    backspace() {}

    keyPress() {}
}

const mjxguiCursor = new Cursor();

class MathFunction {
    constructor(width, height, depth, scale, components) {
        this.components = components;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.scale = scale;
    }

    draw() {}

    isEmpty() {
        for (let c of this.components) {
            if (c.isEmpty()) return false;
        }
        return true;
    }

    generateLatex() {
        throw new Error('The generateLatex function is not yet implemented for this MathFunction');
    }
}

class Component {
    constructor(x, y, width, height) {
        this.contents = [];
        this.x = x;
        this.y = y;
        this.parent = null;
        this.width = width;
        this.height = height;
    }

    draw() {}

    isEmpty() {
        return this.contents.length === 0;
    }

    generateLatex() {
        if (this.isEmpty()) return;
        let latex = '';
        for (let c of this.contents) {
            if (typeof c === 'string') {
                latex += c + ' ';
            }
            else {
                latex += c.generateLatex() + ' ';
            }
        }
        return latex;
    }
}


// Define MathFunction child classes

class Sum extends MathFunction {
    constructor() {
        let width = 40;
        let height = 50;
        let scale = 1;
        let depth = mjxguiCursor.depth;
        let components = [
            new Component(mjxguiCursor.x, mjxguiCursor.y, width*scale, height*scale),
            new Component(mjxguiCursor.x, mjxguiCursor.y, width*scale, height*scale),
            new Component(mjxguiCursor.x, mjxguiCursor.y, width*scale, height*scale)
        ];
        super(width, height, depth, scale, components);
        components.forEach(c => {c.parent = this;})
    }

    generateLatex() {
        return `\\sum_{${this.components[0].generateLatex()}}^{${this.components[1].generateLatex()}}{${this.components[2].generateLatex()}}`;
    }
}