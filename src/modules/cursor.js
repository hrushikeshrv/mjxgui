// Listens for keypress and modifies the Expression accordingly

const characters = new Set();
for (let char of 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@^*;:\'"/?.,<>-=+`~') {
    characters.add(char);
}

/**
 * @class
 * 
 */
class Cursor {
    constructor(expression, display) {
        this.expression = expression;
        this.block = null; // block we are in currently
        this.component = null; // component we are in currently
        this.child = -0.5; // position in the current block
        this.position = -0.5; // position in the expression
        this.latex = '';
        this.display = display;
        this.skippables = ['\\left.', '\\right.'];
        this.left_brackets = ['\\left(', '\\left[', '\\left|'];
        this.right_brackets = ['\\right)', '\\right]', '\\right|'];
    }

    addText(text) {
        // Insert some text into the Expression, either as its own block or into the block
        // we are in currently.
        if (this.block === null) {
            // Safe to assume we are not in any block and are between two components in the 
            // Expression or at the start or end of the Expression.
            const _ = new TextComponent(this.block);
            _.blocks[0].addChild(text);
            this.expression.add(_, Math.ceil(this.position));
            
            this.child = -0.5;
            this.position++;
        }
        else {
            // We are in some Block in some Component of the Expression. 
            // The child we are in changes, the component, block, and position remain the same
            const _ = new TextComponent(this.block);
            _.blocks[0].addChild(text);
            this.block.addChild(_, Math.ceil(this.child));
            this.child++;
        }
    }

    addComponent(component) {
        // Insert a new Component into the Expression at the position of the cursor.
        // If we are in a block, we add a Component to the block as a child, otherwise 
        // we insert the Component on the top level as a new component in the 
        // Expression
        if (this.block === null) {
            this.expression.add(component, Math.ceil(this.position));
            this.position = Math.ceil(this.position);
            if (component instanceof MJXGUISymbol || component instanceof TextComponent) {
                this.block = null;
                this.component = null;
                this.position += 0.5;
            }
            else {
                this.block = component.blocks[0];
                this.component = component;
            }
            this.child = -0.5;
        }
        else {
            // Add the component to the block's children and increment this.child in preparation to move
            // inside the inserted component
            this.block.addChild(component, Math.ceil(this.child));
            // this.child += 0.5;
            if (component instanceof MJXGUISymbol || component instanceof TextComponent) {
                // If the component we just inserted is a Symbol or Text, don't move into it and increment
                // this.child by 0.5 again
                this.child += 1;
            }
            else {
                // Otherwise, move into the new component
                this.component = component;
                this.block = component.blocks[0];
                this.child = -0.5;
            }
        }
    }

    // removes the component to the left of the cursor 
    removeComponent() {
        if (this.block === null) {
            // If we are not in a block then we check if the component to the left is a TextComponent
            // If it is, we remove it, else we do nothing.
            let prevComponent = this.expression.components[Math.floor(this.position)];
            if (prevComponent instanceof TextComponent || prevComponent instanceof MJXGUISymbol) {
                this.position = Math.floor(this.position);
                this.component = prevComponent;
                this.block = prevComponent.blocks[0];
                this.child = -0.5;
                this.removeComponent();
            }
        }
        else if (this.component.parent === null) {
            // Find the component in the expression and remove it, change the cursor object's
            // component and block pointers
            for (let i = 0; i < this.expression.components.length; i++) {
                if (this.expression.components[i] === this.component) {
                    this.expression.remove(i);
                    break;
                }
            }
            this.position -= 0.5;
            this.component = null;
            this.block = null;
            this.child = -0.5;
        }
        else {
            // Capture the block above us to move into after we remove this component
            let parentBlock = this.component.parent;
            for (let i = 0; i <  parentBlock.children.length; i++) {
                if (parentBlock.children[i] === this.component) {
                    parentBlock.removeChild(i);
                    this.child = i - 0.5;
                    break;
                }
            }
            this.block = parentBlock;
            this.component = parentBlock.parent;
        }
    }

    keyPress(event) {
        if (characters.has(event.key)) {
            this.addText(event.key);
        }
        else if (event.key === 'ArrowLeft') {
            this.seekLeft();
        }
        else if (event.key === 'ArrowRight') {
            this.seekRight();
        }
        else if (event.key === 'Backspace') {
            this.backspace();
        }
        else if (event.key === ' ') {
            let _ = new MJXGUISymbol(this.block, '\\:\\:');
            this.addComponent(_);
        }
        else if (event.key === '\\') {
            let _ = new MJXGUISymbol(this.block, '\\backslash');
            this.addComponent(_);
        }
        else if (['$','#','%','&','_','{','}'].includes(event.key)) {
            let _ = new MJXGUISymbol(this.block, `\\${event.key}`);
            this.addComponent(_);
        }
        else if (['(',')','[',']','|'].includes(event.key)) {
            if (['(','['].includes(event.key)) {
                let left = new MJXGUISymbol(this.block, `\\left${event.key}`);
                this.addComponent(left);
                
                // invisible right bracket
                let right_inv = new MJXGUISymbol(this.block, `\\right.`); 
                // When we are in the main expression level
                if (this.block ===null) {
                    // adding the invisible bracket to the end of the expression
                    this.expression.add(right_inv);
                }
                // When we are in a block
                else{
                    // adding the invisible bracket to the end of the current block
                    this.block.addChild(right_inv);
                }
            }
            else if ([')',']'].includes(event.key)) {
                let right = new MJXGUISymbol(this.block, `\\right${event.key}`);
                this.addComponent(right);
                
                // invisible left bracket
                let left_inv = new MJXGUISymbol(this.block, `\\left.`); 
                // When we are in the main expression level
                if (this.block ===null) {
                    // adding the invisible bracket to the start of the expression
                    this.expression.add(left_inv, 0);
                }
                // When we are in a block
                else{
                    // adding the invisible bracket to the start of the current block
                    this.block.addChild(left_inv, 0);
                }
            }
            else if (event.key === '|') {
                let open_bracket_count = 0;
                // When we are in the main expression level
                if (this.block === null) {
                    for(let i = 0; i < this.position; i++){
                        if(this.expression.components[i] instanceof MJXGUISymbol && ['\\left|','\\right|'].includes(this.expression.components[i].toLatex())){
                            if (this.expression.components[i].toLatex() === '\\left|')
                                open_bracket_count++;
                            else
                                open_bracket_count--;
                            
                        }
                    }
                    
                }
                // When we are in a block
                else {
                    for(let i = 0; i < this.child; i++){
                        if(this.block.children[i] instanceof MJXGUISymbol && ['\\left|','\\right|'].includes(this.block.children[i].toLatex())){
                            if (this.block.children[i].toLatex() === '\\left|')
                                open_bracket_count++;
                            else
                                open_bracket_count--;
                            
                        }
                    }
                }

                // Deciding whether to add a left or right bracket based on the number of open brackets
                if (open_bracket_count > 0){
                    let right = new MJXGUISymbol(this.block, `\\right|`);
                    this.addComponent(right);
                    
                    // invisible left bracket
                    let left_inv = new MJXGUISymbol(this.block, `\\left.`);
                    this.expression.add(left_inv, 0);
                }                         
                else {
                    let left = new MJXGUISymbol(this.block, `\\left|`);
                    this.addComponent(left);
                    
                    // invisible right bracket
                    let right_inv = new MJXGUISymbol(this.block, `\\right.`);
                    this.expression.add(right_inv);
                }
            }
        }
    }

    seekRight() {
        let maxPos = this.expression.components.length - 0.5;
        if (this.position >= maxPos) return;
        else if (this.block === null) {
            this.position += 0.5;
            // If the component at this index is a MJXGUISymbol or a TextComponent, skip it and go to the next
            if (this.expression.components[this.position] instanceof TextComponent || this.expression.components[this.position] instanceof MJXGUISymbol) {
                if (this.skippables.includes(this.expression.components[this.position].toLatex())) {
                    this.position -= 0.5;
                    return;
                }
                // If the component to the right of the cursor is a TextComponent, we skip it and
                // move one more position to the right and into the space between two components
                this.position += 0.5;
                this.child = -0.5;
                this.block = null;
                this.component = null;
            }
            else {
                // Otherwise we moved into a function
                // Set the block to be the last block of the function and set the child to be at the left most end
                this.component = this.expression.components[this.position];
                this.block = this.component.blocks[0];
                this.child = -0.5;
                if (this.block.children.length !== 0) {
                    while(this.block.children[this.child + 0.5] instanceof MJXGUISymbol && this.skippables.includes(this.block.children[this.child + 0.5].toLatex())) {
                        this.child +=1;
                    }
                }
                // this.position remains the same
            }
        }
        else {
            if (this.child === this.block.children.length-0.5) {
                // If we are at the end of the block, we want to move to a different block
                // and possibly a new component
                let pos = this.component.blocks.indexOf(this.block);
                if (pos === this.component.blocks.length-1) {
                    // If we are in the last block of the current component, we want to move out of this component
                    if (this.component.parent === null) {
                        // We are at the top level, our component and blocks become null
                        this.component = null;
                        this.block = null;
                        this.child = -0.5;
                        this.position += 0.5;
                    }
                    else {
                        // Otherwise, we move one level above and our component becomes the parent component
                        // our block becomes the block that the current component was in
                        this.block = this.component.parent;
                        // Record the position the current component is in. We move the cursor here
                        this.child = this.block.children.indexOf(this.component) + 0.5;
                        this.component = this.block.parent;
                    }
                }
                else {
                    // this.component and this.position remain the same
                    this.block = this.component.blocks[pos+1];
                    this.child = -0.5;
                    if (this.block.children.length !== 0) {
                        while(this.block.children[this.child + 0.5] instanceof MJXGUISymbol && this.skippables.includes(this.block.children[this.child + 0.5].toLatex())) {
                            this.child +=1;
                        }
                    }
                }
            }
            else {           
                // We are not at the end of the block
                // Detect the component to the right
                let nextComponent = this.block.children[Math.ceil(this.child)];
                if (nextComponent instanceof TextComponent || nextComponent instanceof MJXGUISymbol) {
                    if(this.skippables.includes(nextComponent.toLatex())) {
                        this.child = this.block.children.length-0.5;
                        this.seekRight();
                        return;
                    }
                    // If it is a TextComponent or Symbol, skip it and move on
                    this.child++;
                }
                else {
                    this.component = nextComponent;
                    this.block = this.component.blocks[0];
                    this.child = -0.5;
                    if (this.block.children.length !== 0) {
                        while(this.block.children[this.child + 0.5] instanceof MJXGUISymbol && this.skippables.includes(this.block.children[this.child + 0.5].toLatex())) {
                            this.child +=1;
                        }
                    }
                }
            }
        }
    }

    seekLeft() {
        if (this.position <= -0.5) return;
        else if (this.block === null) {
            this.position -= 0.5;
            // If the component at this index is a MJXGUISymbol or a TextComponent, we skip this component and go one more step backward
            if (this.expression.components[this.position] instanceof TextComponent || this.expression.components[this.position] instanceof MJXGUISymbol) {
                if (this.skippables.includes(this.expression.components[this.position].toLatex())) {
                    this.position += 0.5;
                    return;
                }
                // If the component to the left of the cursor is a TextComponent, we skip it and
                // move one more position to the left and into the space between two components
                this.position -= 0.5;
                this.child = -0.5;
                this.block = null;
                this.component = null;
            }
            else {
                // Otherwise we moved into a Function
                // Set the block to be the last block of the function and set the child to be at the right most end
                this.component = this.expression.components[this.position];
                this.block = this.component.blocks[this.component.blocks.length-1];
                this.child = this.block.children.length-0.5;
                if (this.block.children.length !== 0) {
                    while(this.block.children[Math.floor(this.child)] instanceof MJXGUISymbol && this.skippables.includes(this.block.children[Math.floor(this.child)].toLatex())) {
                        this.child -=1;
                    }
                }
                // this.position remains the same
            }
        }
        else {
            if (this.child === -0.5) {
                // If we are at the start of the block, we want to move to a different block
                // and possibly a new component
                let pos = this.component.blocks.indexOf(this.block);
                if (pos === 0) {
                    // If we are in the first block of this component, we want to move out of this component
                    if (this.component.parent === null) {
                        // We are at the top level, our component and blocks become null
                        this.component = null;
                        this.block = null;
                        this.child = -0.5;
                        this.position -= 0.5;
                    }
                    else {
                        // Otherwise, we move one level above and our component becomes the parent component
                        // our block becomes the block that the current component was in
                        this.block = this.component.parent;
                        // Record the position the current component is in. We move the cursor there.
                        this.child = this.block.children.indexOf(this.component) - 0.5;
                        this.component = this.block.parent;
                    }
                }
                else {
                    // this.component and this.position remain the same
                    this.block = this.component.blocks[pos-1];
                    this.child = this.block.children.length-0.5;
                    if (this.block.children.length !== 0) {
                        while(this.block.children[this.child - 0.5] instanceof MJXGUISymbol && this.skippables.includes(this.block.children[this.child - 0.5].toLatex())) {
                            this.child -=1;
                        }
                    }
                }
            }
            else {
                // We are not at the start of the block
                // Detect the component to the left
                let prevComponent = this.block.children[Math.floor(this.child)];
                if (prevComponent instanceof TextComponent || prevComponent instanceof MJXGUISymbol) {
                    if(this.skippables.includes(prevComponent.toLatex())) {
                        this.child = -0.5;
                        this.seekLeft();
                        return;
                    }
                    // If it is a TextComponent or Symbol, skip it and move on
                    this.child--;
                }
                else {
                    this.component = prevComponent;
                    this.block = this.component.blocks[this.component.blocks.length-1];
                    this.child = this.block.children.length - 0.5;
                    if (this.block.children.length !== 0) {
                        while(this.block.children[this.child - 0.5] instanceof MJXGUISymbol && this.skippables.includes(this.block.children[this.child - 0.5].toLatex())) {
                            this.child -=1;
                        }
                    }
                }
            }
        }
    }

    backspace() {
        if (this.expression.components.length === 0) return;
        else if (this.position === -0.5) return;

        if (this.block === null) {
            // If we are not in a block, we are in between two components, remove the previous component if it is
            // a TextComponent
            let prevComponent = this.expression.components[Math.floor(this.position)];
            if (prevComponent instanceof TextComponent || prevComponent instanceof MJXGUISymbol) {
                if (this.skippables.includes(prevComponent.toLatex())) {
                    return;
                }
                if( this.left_brackets.includes(prevComponent.toLatex()) || this.right_brackets.includes(prevComponent.toLatex())){
                    let bracket = prevComponent.toLatex();
                    if(this.left_brackets.includes(bracket)){
                        this.expression.remove();
                    } 
                    else if (this.right_brackets.includes(bracket)){
                        this.expression.remove(0);
                        this.position--;
                    }
                }
                this.removeComponent();
            }
            else {
                this.component = prevComponent;
                this.block = this.component.blocks[this.component.blocks.length-1];
                this.child = this.block.children.length-0.5;
                this.position = Math.floor(this.position);
                if (this.block.children.length !== 0) {
                    while(this.block.children[Math.floor(this.child)] instanceof MJXGUISymbol && this.skippables.includes(this.block.children[Math.floor(this.child)].toLatex())) {
                        this.child -=1;
                    }
                }
            }
        }
        else {
            if (this.component.isEmpty()) {
                this.removeComponent();
            }
            else {
                if (this.child <= -0.5) {
                    const blockPos = this.component.blocks.indexOf(this.block);
                    if (blockPos === 0) return;
                    this.block = this.component.blocks[blockPos-1];
                    this.child = this.block.children.length-0.5;
                    if (this.block.children.length !== 0) {
                        while(this.block.children[Math.floor(this.child)] instanceof MJXGUISymbol && this.skippables.includes(this.block.children[Math.floor(this.child)].toLatex())) {
                            this.child -=1;
                        }
                    }
                }
                else {
                    let prevComponent = this.block.children[Math.floor(this.child)];
                    if (prevComponent instanceof TextComponent || prevComponent instanceof MJXGUISymbol) {
                        if (this.skippables.includes(prevComponent.toLatex())) {
                            this.child = -0.5;
                            this.backspace();
                            return;
                        }
                    }
                    if( this.left_brackets.includes(prevComponent.toLatex()) || this.right_brackets.includes(prevComponent.toLatex())) {
                        let bracket = prevComponent.toLatex();
                        this.block.removeChild(Math.floor(this.child));
                        this.child--;
                        if(this.left_brackets.includes(bracket)){
                            this.block.removeChild();
                        } 
                        else if (this.right_brackets.includes(bracket)){
                            this.block.removeChild(0);
                            this.child--;
                        }
                    }
                    else {
                        this.block.removeChild(Math.floor(this.child));
                        this.child--;
                    }
                }
            }
        }
    }

    toLatex() {
        // Generate LaTeX from the expression built till now
        let latex = this.expression.toLatex();
        this.latex = latex;
        return latex;
    }

    toDisplayLatex() {
        // Generate LaTeX to show in the display by adding a caret character to the expression. 
        // This is not the real LaTeX of the expression but the LaTeX resulting after we add 
        // a caret as a | character in the expression
        let caret = new TextComponent(this.block);
        caret.blocks[0].addChild('|');
        
        let frame = new FrameBox(this.block);

        if (this.block === null) {
            // If we are not in any block, we just add the caret, generate latex 
            // and reset the components
            this.expression.add(caret, Math.ceil(this.position));
        }
        else {
            // We add the current component inside the frame, add the caret in the 
            // right position, generate latex and reset the components
            let i = this.component.blocks.indexOf(this.block);
            this.component.removeBlock(i);
            this.component.addBlock(frame, i);
            frame.blocks[0] = this.block;
            this.block.addChild(caret, Math.ceil(this.child));
        }

        let latex = this.toLatex();
        

        if (this.block === null) {
            this.expression.remove(Math.ceil(this.position));
        }
        else {
            let i = this.component.blocks.indexOf(frame);
            this.component.removeBlock(i);
            this.component.addBlock(this.block, i);
            this.block.removeChild(Math.ceil(this.child));
        }

        return latex;
    }

    updateDisplay() {
        if (this.display instanceof String || typeof this.display === 'string') {
            this.display = document.getElementById(this.display);
        }
        MathJax.typesetClear([this.display]);
        this.display.innerHTML = '$$' + this.toDisplayLatex() + '$$';
        MathJax.typesetPromise([this.display]).then(() => {});
    }
}