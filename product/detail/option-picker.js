import { getOptionPickerConfig } from './config/catalog.js?v=20260727-4';
import { createCafe24Adapter } from './adapters/cafe24-product.js';
import { createOptionPicker } from './core/create-option-picker.js?v=20260727-4';

function bootstrap() {
  const root = document.querySelector('[data-option-picker-root]');
  const config = getOptionPickerConfig();

  if (!root || !config.enabled || root.dataset.optionPickerInitialized === 'true') {
    return;
  }

  const adapter = createCafe24Adapter(document);
  const picker = createOptionPicker({ root, config, adapter });

  picker.mount();
  root.dataset.optionPickerInitialized = 'true';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
