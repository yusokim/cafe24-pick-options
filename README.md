# Cafe24 product-detail option picker

Cafe24 Smart Design assets for a configurable, product-detail "pick and add" option UI.

## Architecture

- `product/detail/config/catalog.js`: per-product display data and mappings to actual Cafe24 option values.
- `product/detail/option-picker.js`: small entry point that creates the picker.
- `product/detail/adapters/cafe24-product.js`: the only Cafe24 DOM selector/event boundary.
- `product/detail/services/selection-reconciler.js`: derives card state from Cafe24's selected-product list.
- `product/detail/ui/option-picker-view.js`: card rendering and accessible state display.
- `product/detail/core/create-option-picker.js`: composes the adapter, synchronisation service, and UI.
- `product/detail/option-picker.css`: scoped PC/mobile styles.
- `product/detail/detail-snippet.html`: markup and asset tags to paste into Cafe24's `/product/detail.html`.
- `product/detail/INTEGRATION.md`: exact template markers and insertion instructions.

The custom UI is presentation and interaction only. It invokes Cafe24's native option controls, while Cafe24 remains responsible for selected-item rows, price calculation, stock, quantity, cart, and checkout.

## Development workflow

1. Configure the test product with the required independent text-button options.
2. Paste the snippet and upload/update the three asset files in Smart Design.
3. Inspect the rendered native option and selected-product DOM, then update the adapter selectors in `option-picker.js` if the Basic skin differs.
4. Test the storefront URL in a logged-out/incognito window after setting the edited skin as the representative design.

## Status

Project rules and source layout are initialized. The implementation files will be added after inspecting the actual Basic-skin option DOM.
