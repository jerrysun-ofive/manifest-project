# Inline Form Builder

## Why I Am Building This

Hi Henry and Tom, thank you again for this opportunity!

I am building this project to demonstrate my frontend engineering skills through a functional product rather than a static marketing website.

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

## Deployment

For convenience, a live version of the project is deployed on [Vercel](https://manifest-project-pi.vercel.app/). The project can also be run locally using the instructions below.

## Installation and Local Development

### Prerequisites

- Node.js 20.19 or later
- npm

### Install dependencies

```bash
git clone <repository-url>
cd manifest-project

npm run install:all
```

### Run locally

Start the frontend and backend together:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The backend API runs at [http://localhost:3001](http://localhost:3001).

## Project Scope

This project was created primarily to demonstrate my frontend engineering skills. A basic backend structure was started, however I ran out of time so a full backend integration, persistence and form submission handling were not completed.  

## Features

### Inline Editing

The form title, description, field labels and field descriptions can all be edited directly within the builder. This keeps the editing experience close to the appearance of the finished form.

### Field Types and Insertion

The builder supports short text, long text, number, date and dropdown fields. Fields can be inserted at a specific position using the **Add field** controls or the `/` keyboard shortcut. The field menu is searchable and supports keyboard navigation. The fields search also supports most most likely fields, i.e. searching "age" will suggest the "numbers" field.  

### Field Management and Reordering

Fields can be marked as required, duplicated, deleted or moved up and down. They can also be reordered using drag and drop, with a visual preview and drop indicator showing where the selected field will be placed.

### Field Configuration

Each field has settings suited to its type, including placeholders, default values, text length limits, number ranges and dropdown options. The builder validates the configuration and displays clear errors when settings conflict, such as a minimum value exceeding the maximum.

### Form Preview and Response Validation

The **Test form** view displays the form as a user would see it. Responses are validated against the configured required fields and limits, with field specific error messages shown for missing or invalid answers.

## Testing

The frontend uses Vitest and React Testing Library for component and interaction tests, with Playwright covering the main browser workflow.

```bash
npm run test:frontend
npm run test:e2e
npm run test:coverage --prefix frontend
```

**Test coverage:** The project currently achieves 87.87% statement coverage, 77.69% branch coverage, 82.11% function coverage, and 87.69% line coverage.
