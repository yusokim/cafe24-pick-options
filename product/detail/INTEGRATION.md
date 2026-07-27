# Cafe24 template integration

The Basic-skin template already contains the two Cafe24 areas the option picker needs. Do not replace either one.

## 1. Mark the native option table (optional)

In the template's existing option table, add the marked attribute only:

```html
<table border="1" summary="" module="product_option" data-option-picker-native-options>
```

Its native option row contains `{$form.option}`. It must remain in the HTML even when the custom UI eventually hides it visually. The tested Basic skin is also found automatically through `table.xans-product-option .ec-product-button`, so this marker is only needed if the skin markup differs.

## 2. Insert the custom row

Inside the first `<tbody module="product_option">`, insert the contents of `detail-snippet.html` immediately after the existing native option `<tr>`. It is a `<tr>`, so it keeps the table markup valid.

## 3. Mark Cafe24's selected-product area (optional)

Add the attribute to the existing total container:

```html
<div id="{$total.total_id}" class="{$total.total_display|display}" data-option-picker-selected-list>
```

Cafe24 appends selected option rows inside this container. The picker observes it and never creates or removes those rows itself. The tested Basic skin uses `#totalProducts`, which is detected automatically.

## 4. Load assets

Upload the JS/CSS files while preserving their import paths, or change the asset paths in `detail-snippet.html` to match the Smart Design asset location. Test that the browser accepts `type="module"` for the uploaded JavaScript before adding product configuration.

## 5. Verify the DOM adapter from the storefront

The test product (product number `11`) renders text-button options as `.ec-product-button > li` and its selected-product container as `#totalProducts`. Inspect the live storefront after upload and adjust `adapters/cafe24-product.js` only if the rendered structure differs:

- Locate and invoke the real native control for an exact option value.
- Read exact option values from Cafe24-generated selected-product rows.

The rest of the modules should not need Cafe24 selector changes.
