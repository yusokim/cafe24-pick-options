# Cafe24 template integration

The Basic-skin template already contains the two Cafe24 areas the option picker needs. Do not replace either one.

## 1. Mark the native option table

In the template's existing option table, add the marked attribute only:

```html
<table border="1" summary="" module="product_option" data-option-picker-native-options>
```

Its native option row contains `{$form.option}`. It must remain in the HTML even when the custom UI eventually hides it visually.

## 2. Insert the custom row

Inside the first `<tbody module="product_option">`, insert the contents of `detail-snippet.html` immediately after the existing native option `<tr>`. It is a `<tr>`, so it keeps the table markup valid.

## 3. Mark Cafe24's selected-product area

Add the attribute to the existing total container:

```html
<div id="{$total.total_id}" class="{$total.total_display|display}" data-option-picker-selected-list>
```

Cafe24 appends selected option rows inside this container. The picker observes it and never creates or removes those rows itself.

## 4. Load assets

Upload the JS/CSS files while preserving their import paths, or change the asset paths in `detail-snippet.html` to match the Smart Design asset location. Test that the browser accepts `type="module"` for the uploaded JavaScript before adding product configuration.

## 5. Complete the DOM adapter from the storefront

Inspect a live Basic-skin product with the required text-button options, then implement only the TODOs in `adapters/cafe24-product.js`:

- Locate and invoke the real native control for an exact option value.
- Read exact option values from Cafe24-generated selected-product rows.

The rest of the modules should not need Cafe24 selector changes.
