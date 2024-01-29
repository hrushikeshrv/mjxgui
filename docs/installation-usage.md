---
layout: default
title: Installation & Usage 
nav_order: 2
---

# Installation
MJXGUI uses MathJax as a core dependency, so you need to include both MathJax as well as MJXGUI into your webpage. MJXGUI does not have a built-in renderer, and uses MathJax to render the equations as they are being built.

Make sure you include MathJax before including MJXGUI.

Then include the MJXGUI javascript file and stylesheet. You can get both the script and the stylesheet from GitHub -
1. [mjxgui.js](https://raw.githubusercontent.com/hrushikeshrv/mjxgui/main/src/mjxgui.min.js)
2. [mjxgui.css](https://raw.githubusercontent.com/hrushikeshrv/mjxgui/main/src/mjxgui.css)

You can include MJXGUI's stylesheet before your site's stylesheet, to allow your CSS to override MJXGUI's CSS.

An example config could be -

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<link rel="stylesheet" href="path/to/mjxgui/css">
<script src="path/to/mjxgui/javascript"></script>
```

# Usage
MJXGUI works by showing your users a button/element prompting them to insert an equation. MJXGUI attaches event listeners to these elements and shows the editor UI when they are clicked.

Once the user is done entering the equation/expression, the editor UI disappears and a callback function that you supply is run. This callback function is where you can access the generated LaTeX for the expression the user just entered and handle however you need. The most common use case is to store it as LaTeX and/or render it on your page using MathJax.

Initialize MJXGUI by creating a new MJXGUI instance, which takes 3 parameters - a CSS selector, a callback function, and an options object.

```javascript
const mjxgui = new MJXGUI('selector', function() {}, options={});
```

The selector is a CSS selector that should be able to select the elements you want users to click on to start entering an equation. MJXGUI attaches click event listeners to all selected elements and shows the editor UI whenever they are clicked.

The callback function is a function that is run when the user is done entering the equation and clicks on the “✔” button. This is where you will be able to access the LaTeX for the equation. For more information on how you should write a callback function, see [writing a success callback]({% link api/mjxgui-instance.md %}#writing-a-success-callback).

You would build a minimal example as shown below. This example takes the LaTeX for the equation the user has created, appends it to the body, and typesets it using MathJax.

```html
<button id="mjxgui-button">Add Equation</button>
<div id="equation-output"></div>
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

The API provided by the MJXGUI instance is documented in [MJXGUI Instance documentation]({% link api/mjxgui-instance.md %}).