# What is MJXGUI?
MJXGUI is a widget style application meant to give users a graphical interface for creating equations to use on the web. It uses MathJax as a core dependency and as an external renderer to show users a preview of their equation as they write it. Once users have created their equation, it generates corresponding LaTeX for it for you to handle however you would like, the most common use case being to store it as plain text, so you can use it later with MathJax.

The motivation was to have something like a pop-up widget that would help users build an expression graphically just as they do in Google Docs or Microsoft Word, but then would also convert the same equation into LaTeX so it could be rendered with MathJax later.

# Features
- Build mathematical, physical, and chemical equations using a GUI, similar to inserting equations in editors like Microsoft Word and Google Docs
- Support for Greek letters, mathematical operators, and common mathematical functions
- Write your own math functions, operators, and characters to add support for the same not available by default.
- Convert created equations into LaTeX for storage and representation in the browser.

# Installation
MJXGUI uses MathJax as a core dependency, so you need to include both MathJax as well as MJXGUI into your webpage. MJXGUI does not have a built-in renderer, and uses MathJax to render the equations as they are being built.

Make sure you include MathJax before including MJXGUI.

Include the minified MJXGUI source file in your <head> tag by getting the [source from GitHub](https://raw.githubusercontent.com/hrushikeshrv/mjxgui/main/src/mjxgui.min.js).

Also include the stylesheet for MJXGUI. Make sure you include the stylesheet before your site's stylesheet, to allow your CSS to override MJXGUI's CSS.

```javascript
<script>
    MathJax = {
        tex: {
            inlineMath: [
                ['$', '$'],
                ['\\(', '\\)'],
            ],
            displayMath: [['$$', '$$']],
        },
        svg: {
            fontCache: 'global',
        },
        options: {
            menuOptions: {
                settings: {
                    zoom: 'NoZoom',
                    zscale: '250%',
                },
            },
        },
    };
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
```

# Usage
MJXGUI works by showing your users a button/element prompting them to insert an equation. MJXGUI attaches event listeners to these elements and shows the editor UI when they are clicked.

Once the user is done entering the equation/expression, the editor UI disappears and a callback function that you supply is run. This callback function has access to the full internal API, from which you can access the generated LaTeX for the expression the user just entered. Make sure the callback function you supply is not an arrow function but a regular function.

Initialize MJXGUI by creating a new MJXGUI instance, which takes 3 parameters - a CSS selector, a callback function, and an options object.

```javascript
const mjxgui = new MJXGUI('selector', function() {}, options={});
```

The selector is a CSS selector that should be able to select the elements you want users to click on to start entering an equation. MJXGUI adds click event listeners to all selected elements and shows the editor UI whenever they are clicked.

The callback function is a function that is run when the user is done entering the equation and clicks on the “Done” button. This is where you will be able to access the LaTeX for the equation. The this keyword inside this function will have access to the MJXGUI cursor, which contains all the methods and properties used to build equations and generate LaTeX for them. Calling this.getLatex() will generate the LaTeX for the equation and return it to you as a string.

You would build a minimal example as shown below. This example takes the LaTeX for the equation the user has created, appends it to the body, and typesets it using MathJax.

```html
<button id="mjxgui-button">Add Equation</button>
<div id="equation-output" style="padding: 40px; font-size: 2rem">
    <h3 style="font-family: monospace">Inserted Equations:</h3>
</div>
<script>
    const eqnOutput = document.querySelector('#equation-output');
    
    const mjxgui = new MJXGUI('#mjxgui-button');
    
    mjxgui.successCallback = function () {
        MathJax.typesetClear([eqnOutput]);
        eqnOutput.innerHTML += '$$' + mjxgui.getLatex() + '$$' + '<br>';
        MathJax.typesetPromise([eqnOutput]).then(() => {});
    }
</script>
```

Currently, the following options are supported -

| Option          | Data Type | Default value | Description                                                                                                                                                                                |
|-----------------|-----------|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `mathDelimiter` | String    | `"$$"`        | The math delimiter as configured in when you load MathJax. Use the same delimiter you use for inserting equation blocks, not inline equations. Most commonly used block delimiter is "$$". |
| `theme`         | String    | `undefined`   | Pass theme as "dark" to render the MJXGUI widget in dark mode. Any other value will default to light mode.                                                                                 |

# Examples
1. [Example 1 - Inserting Equations](./examples/basic-example.html)
2. [Example 2 - Insert Equations and Their LaTeX](./examples/insert-equation-and-latex.html)
3. [Example 3 - Add A Custom Symbol](./examples/add-custom-symbol.html)
4. [Example 4 - Add A Custom Function](./examples/add-custom-function.html)

# Customizing
MJXGUI lets you add support for functions and/or symbols that are not already present in the editor widget.

## Adding A Custom Symbol
To add a symbol to the editor widget that is not already present, you will need the following information -

1. The LaTeX representation of the symbol
2. The HTML representation of the symbol (to show in the editor widget)

Once you create an MJXGUI instance, call the `MJXGUI.registerSymbol()` method to add the symbol you want.

### Example: Adding &there4; to the editor
For example, lets say you want to add the ∴ symbol to the editor widget. In LaTeX, you can use the `\therefore` command to render a ∴ symbol, and the HTML code for it is `&there4`;

`MJXGUI.registerSymbol()` takes 2 required and 2 optional arguments -

1. `latexData` - The LaTeX representation of the symbol, in this case `"\therefore"`.
2. `buttonContent` - The HTML representation of the symbol, in this case `"&there4;"`. This HTML representation can be a simple string, an SVG, some custom HTML, an HTML character code, or LaTeX that can be typeset using MathJax (see argument 4).
3. `title` - A string that will be set as the title attribute of the rendered button.
4. `typeset` - A boolean that, if true, will use MathJax to typeset the HTML representation (argument 2). If you set this as true, make sure that MathJax is fully loaded when you call `registerSymbol()`. Defaults to `false`.

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

You will need to create a class that extends from one of MJXGUI's many Component classes, and override the `toLatex()` method of the class. You can find a list of Component classes MJXGUI provides, along with their use cases in the API documentation. 

Once you create this class and an MJXGUI instance, call the `MJXGUI.registerFunction()` method to add the function you want.

### Example: Adding $ sin^2 $ to the editor
For example, let's say we want to add a $ sin^2 $ function to the editor.

`MJXGUI.registerFunction()` takes 2 required and 2 optional arguments - 

1. `componentClass` - A class inheriting from one of MJXGUI's many component classes, which knows how to render it's content as LaTeX.
2. `buttonContent` - The HTML representation of the function. This can be a simple string, an SVG, some custom HTML, an HTML character code, or LaTeX that can be typeset using MathJax.
3. `title` - A string that will be set as the title attribute of the rendered button.
4. `typeset` - A boolean that, if true, will use MathJax to typeset the HTML representation (argument 2). If you set this as true, make sure that MathJax is fully loaded when you call `registerFunction()`. Defaults to `false`.

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