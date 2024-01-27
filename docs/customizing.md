---
layout: default
title: Customizing
nav_order: 3
---

# Customizing
MJXGUI lets you add support for functions and/or symbols that are not already present in the editor widget.

## Adding A Custom Symbol
To add a symbol to the editor widget that is not already present, you will need the following information -

1. The LaTeX representation of the symbol
2. The HTML representation of the symbol (to show in the editor widget)

Once you create an MJXGUI instance, call the `registerSymbol()` method on the MJXGUI instance to add the symbol you want.

### Example: Adding &there4; to the editor
For example, lets say you want to add the ∴ symbol to the editor widget. In LaTeX, you can use the `\therefore` command to render a ∴ symbol, and the HTML code for it is `&there4`;

`registerSymbol()` takes 2 required and 2 optional arguments -

1. `latexData` - The LaTeX representation of the symbol, in this case `"\therefore"`. Required.
2. `buttonContent` - The HTML representation of the symbol, in this case `"&there4;"`. This HTML representation can be a simple string, an SVG, some custom HTML, an HTML character code, or LaTeX that can be typeset using MathJax (see argument 4). Required.
3. `title` - A string that will be set as the title attribute of the rendered button. Optional.
4. `typeset` - A boolean that, if true, will use MathJax to typeset the HTML representation (argument 2). If you set this as true, make sure that MathJax is fully loaded when you call `registerSymbol()`. Optional, defaults to `false`.

```javascript
const mjxgui = new MJXGUI('#mjxgui-button');
mjxgui.successCallback = function () {
    // Handle user input here 
}

mjxgui.registerSymbol('\\therefore', '&there4;', 'Therefore', false);
```
You can see this example [here](./examples/add-custom-symbol.html).

## Adding A Custom Function
Adding a function to the editor widget is a little different from adding a symbol. A function needs to know how its LaTeX should be generated, since it is not simple static LaTeX like a symbol. To add a function that is not already present, you will need -

1. A class that knows how to generate the LaTeX you need for your function
2. An HTML representation of the function (to show in the editor widget)

You will need to create a class that extends from one of MJXGUI's many Component classes, and override the `toLatex()` method of the class. You can find a list of Component classes MJXGUI provides, along with when to use them in the [Components documentation](./api/components.md).

Once you create this class and an MJXGUI instance, call the `registerFunction()` method on the MJXGUI instance to add the function you want.

### Example: Adding $ sin^2 \boxed{} $ to the editor
For example, let's say you want to add the $ sin^2 \boxed{} $ function to the editor.

`registerFunction()` takes 2 required and 2 optional arguments -

1. `componentClass` - A class inheriting from one of MJXGUI's many component classes, which knows how to render it's content as LaTeX. Required.
2. `buttonContent` - The HTML representation of the function. This can be a simple string, an SVG, some custom HTML, an HTML character code, or LaTeX that can be typeset using MathJax (see argument 4). Required.
3. `title` - A string that will be set as the title attribute of the rendered button. Optional.
4. `typeset` - A boolean that, if true, will use MathJax to typeset the HTML representation (argument 2). If you set this as true, make sure that MathJax is fully loaded when you call `registerFunction()`. Optional, defaults to `false`.

```javascript
// Create the class that knows how to render sin^2 as LaTeX
class SinSquaredComponent extends OneBlockComponent {
    toLatex() {
        return `\\sin^{2}{${this.blocks[0].toLatex()}}`;
    }
}

// Create an MJXGUI instance
const mjxgui = new MJXGUI('#mjxgui-button');
mjxgui.successCallback = function () {
    // Handle user input here 
};

mjxgui.registerFunction(
    componentClass = SinSquaredComponent,
    buttonContent = `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
        <msup>
            <mi>sin</mi>
            <mn>2</mn>
        </msup>
    </math>`,
    title = 'Sine squared',
    typeset = false
);
```
You can see this example [here](./examples/add-custom-function.html).
