# PREP Construction Management System - Global Design System

## Overview
This document outlines the consistent design system applied across all pages of the PREP Construction Management System, ensuring a unified user experience.

## Color Palette

### Primary Colors
- **Blue 50**: `#eff6ff` - Light blue backgrounds
- **Blue 100**: `#dbeafe` - Icon containers
- **Blue 500**: `#3b82f6` - Primary blue
- **Blue 600**: `#2563eb` - Primary buttons
- **Blue 700**: `#1d4ed8` - Hover states

### Neutral Colors
- **Neutral 50**: `#fafafa` - Light backgrounds
- **Neutral 100**: `#f5f5f5` - Hover states, icon containers
- **Neutral 200**: `#e5e5e5` - Borders
- **Neutral 500**: `#737373` - Secondary text
- **Neutral 600**: `#525252` - Labels
- **Neutral 800**: `#262626` - Primary text

### Status Colors
- **Green 100**: `#dcfce7` - Success backgrounds
- **Green 500**: `#22c55e` - Success text
- **Green 600**: `#16a34a` - Success hover
- **Amber 100**: `#fef3c7` - Warning backgrounds
- **Amber 600**: `#d97706` - Warning text
- **Red 100**: `#fee2e2` - Error backgrounds
- **Red 600**: `#dc2626` - Error text

## Typography

### Page Headers
```css
.page-header {
  @apply text-2xl sm:text-3xl font-semibold text-neutral-800;
}
```

### Page Subtitles
```css
.page-subtitle {
  @apply text-neutral-500 mt-1;
}
```

### Card Titles
```css
.card-title {
  @apply text-lg font-semibold text-neutral-800;
}
```

### Metric Labels
```css
.metric-label {
  @apply text-sm font-medium text-neutral-600;
}
```

### Metric Values
```css
.metric-value {
  @apply text-3xl font-bold text-neutral-800 mt-1;
}
```

## Layout Components

### Page Container
```css
.page-container {
  @apply space-y-6;
}
```

### Page Header Section
```css
.page-header-section {
  @apply mb-6;
}
```

### Action Buttons
```css
.action-buttons {
  @apply flex items-center gap-3 mb-6;
}
```

### Card Grid
```css
.card-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6;
}
```

## Buttons

### Primary Button
```css
.btn-primary {
  @apply h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white;
}
```

### Secondary Button
```css
.btn-secondary {
  @apply h-11 px-4 rounded-xl hover:bg-neutral-100 border-neutral-200;
}
```

### Small Button
```css
.btn-sm {
  @apply h-9 px-3 rounded-lg;
}
```

## Cards

### Base Card
```css
.card-base {
  @apply bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all duration-300;
}
```

### Card Header
```css
.card-header {
  @apply flex items-center justify-between mb-6;
}
```

### Card Content
```css
.card-content {
  @apply flex items-center justify-between;
}
```

## Icon Containers

### Blue Icon Container
```css
.icon-container-blue {
  @apply p-3 bg-blue-100 rounded-xl;
}
```

### Green Icon Container
```css
.icon-container-green {
  @apply p-3 bg-green-100 rounded-xl;
}
```

### Amber Icon Container
```css
.icon-container-amber {
  @apply p-3 bg-amber-100 rounded-xl;
}
```

### Neutral Icon Container
```css
.icon-container-neutral {
  @apply p-3 bg-neutral-100 rounded-xl;
}
```

## Forms

### Form Input
```css
.form-input {
  @apply w-full h-11 px-3 text-sm bg-white border border-neutral-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none;
}
```

### Form Select
```css
.form-select {
  @apply w-full h-11 px-3 text-sm bg-white border border-neutral-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none;
}
```

## Dialogs

### Dialog Content
```css
.dialog-content {
  @apply bg-white rounded-2xl border border-neutral-200;
}
```

### Dialog Title
```css
.dialog-title {
  @apply text-xl font-semibold text-neutral-800;
}
```

### Dialog Description
```css
.dialog-description {
  @apply text-neutral-500;
}
```

## Badges

### Neutral Badge
```css
.badge-neutral {
  @apply text-xs bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5;
}
```

### Green Badge
```css
.badge-green {
  @apply text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5;
}
```

### Amber Badge
```css
.badge-amber {
  @apply text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5;
}
```

### Red Badge
```css
.badge-red {
  @apply text-xs bg-red-100 text-red-800 rounded-full px-2 py-0.5;
}
```

## Progress Bars

### Progress Bar Base
```css
.progress-bar {
  @apply w-full h-2 bg-neutral-200 rounded-full overflow-hidden;
}
```

### Blue Progress Fill
```css
.progress-blue {
  @apply bg-gradient-to-r from-blue-500 to-blue-600;
}
```

### Green Progress Fill
```css
.progress-green {
  @apply bg-gradient-to-r from-green-500 to-green-600;
}
```

### Amber Progress Fill
```css
.progress-amber {
  @apply bg-gradient-to-r from-amber-500 to-amber-600;
}
```

## Animations

### Fade In
```css
.fade-in {
  @apply transition-opacity duration-200 ease-in-out;
}
```

### Slide Up
```css
.slide-up {
  @apply transition-transform duration-200 ease-out;
}
```

### Hover Lift
```css
.hover-lift {
  @apply hover:shadow-md hover:-translate-y-1 transition-all duration-200;
}
```

## Focus States

### Focus Ring
```css
.focus-ring {
  @apply focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2;
}
```

## Responsive Design

### Mobile Breakpoint (max-width: 640px)
- Page headers: `text-xl`
- Card grids: Single column
- Action buttons: Stack vertically

## Implementation Examples

### Page Header
```jsx
<div className="mb-6">
  <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800">Page Title</h1>
  <p className="text-neutral-500 mt-1">Page description</p>
</div>
```

### Action Buttons
```jsx
<div className="flex items-center gap-3 mb-6">
  <Button className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
    Primary Action
  </Button>
  <Button variant="outline" className="h-11 px-4 rounded-xl hover:bg-neutral-100 border-neutral-200">
    Secondary Action
  </Button>
</div>
```

### Metric Card
```jsx
<div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all duration-300">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-neutral-600">Metric Label</p>
      <p className="text-3xl font-bold text-neutral-800 mt-1">42</p>
      <p className="text-xs text-green-600 mt-1">+12% this month</p>
    </div>
    <div className="p-3 bg-blue-100 rounded-xl">
      <Icon className="h-6 w-6 text-blue-600" />
    </div>
  </div>
</div>
```

## Usage Guidelines

1. **Consistency**: Always use the defined color palette and typography classes
2. **Accessibility**: Ensure proper contrast ratios and focus states
3. **Responsive**: Use responsive classes for mobile-first design
4. **Performance**: Use Tailwind's utility classes for optimal performance
5. **Maintainability**: Follow the established patterns for easy maintenance

## Files Updated

The following files have been updated to use the global design system:

- `components/pages/DashboardPage.tsx` - Dashboard widgets and layout
- `components/pages/ProjectsPage.tsx` - Projects page styling
- `components/pages/SupplyChainPage.tsx` - Supply chain page styling
- `components/pages/ITTManagerPage.tsx` - ITT manager page styling
- `styles/globals.css` - Global CSS variables and base styles
- `styles/design-system.css` - Design system utilities (created)

All pages now follow the same visual language with consistent colors, typography, spacing, and component styling. 