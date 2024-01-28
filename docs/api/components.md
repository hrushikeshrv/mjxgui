---
layout: default
title: Components
parent: API
nav_order: 2
---

# MJXGUI Components & Blocks
{: .no_toc }
MJXGUI has several Component classes which define how LaTeX is generated.

1. TOC
{:toc}

# What Are Components?
Each object you insert as part of an equation - a character, symbol, function, etc. corresponds to a particular Component class. For example, consider the equation

$$ z = \frac{x}{y} $$

Internally, this equation is made up of multiple `Component`s. Each character is represented by a `TextComponent` class, in this case, the characters "z", "x", and "y". Moreover, the fraction is represented by its own `Fraction` component class. Each component is made up of `Block`s. A block is just a generic container that represents a part of the component. For example, the `TextComponent` has only one block which stores the character it is representing. The `Fraction` class has two blocks - one stores the content of the numerator and the other stores the content of the denominator. Each block can store a single character (as in case of the `TextComponent`'s block) or another component class.

![MJXGUI Structure](../media/mjxgui-structure.svg)

## Writing Your Own Components
If you want to add a function to the editor widget that is not present out of the box, you will need to write a component class that will inherit from one of MJXGUI's built-in component classes. You will then have to override the `toLatex()` method of the class to define how the LaTeX should be generated for your component.

To identify which component class you should inherit from, determine how many "blocks" your function has. For example, a fraction has two blocks - the numerator and the denominator, and the square root function has just one block. As a guideline, you can usually consider each `{}` in the LaTeX representation of a function as a block - fraction is written as `\frac{}{}`, therefore has 2 blocks, and square root is written as `\sqrt{}`, therefore has only 1 block.

# Base Component Class

# One Block Component

# Two Block Component

# Three Block Component

# Text Component