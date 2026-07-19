# Inline Form Builder

## Why I Am Building This

I am building this project to demonstrate my frontend engineering skills through a functional, data driven product rather than a static marketing website.

Most of my previous projects have focused on full stack development and machine learning. While those projects included frontend work, the interface was usually only one part of a broader system. This project is therefore intentionally more frontend focused, giving me an opportunity to concentrate on product quality, responsive design, testing, accessibility, data handling and maintainable React architecture.

The project was also inspired by feedback I received from Henry while discussing the junior frontend opportunity. The key areas highlighted were:

* high code quality
* a strong understanding of the code
* polished and responsive product interfaces
* functional data integration
* sensible testing
* security conscious engineering
* keeping the codebase lean and understandable

The goal is therefore  to build a focused product where each feature is deliberate, well tested and clearly understood.

## What I Am Building

The Inline Form Builder allows users to create forms directly within a docs style editor.

Rather than separating the building experience into a field library, form canvas and properties panel, the editor itself closely resembles the final form. Users add questions, edit labels and arrange fields directly on the page.

The project focuses on the form building experience rather than collecting or storing real submissions.

The concept is inspired by Tally.

## Planned Features

### Drag-and-Drop Field Reordering

Users can change field order through drag and drop.

The interaction will include:

* clear drag handles
* visible drop locations
* smooth movement
* protection against invalid drop states

### Field Configuration

Each field has its own configuration.

For example, a text input may support:

```text
Label: Full name
Placeholder: Enter your name
Required: Yes
Minimum length: 2
Maximum length: 100
```

A dropdown may support:

```text
Label: Account type
Options:
- Personal
- Business
- Student
```
