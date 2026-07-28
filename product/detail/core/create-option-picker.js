import { createOptionPickerView } from '../ui/option-picker-view.js?v=20260728-18';
import { createSelectionReconciler } from '../services/selection-reconciler.js?v=20260728-18';

/**
 * Coordinates rendering and synchronisation. It contains no Cafe24 selector
 * knowledge and no product-specific content.
 */
export function createOptionPicker({ root, config, adapter, createView = createOptionPickerView }) {
  const view = createView({ root, groups: config.groups });
  const reconciler = createSelectionReconciler({ config, adapter, view });

  return {
    mount() {
      if (!adapter.isReady()) {
        console.warn('[option-picker] Native Cafe24 option or total area was not found.');
        return false;
      }

      view.render({
        onGroupRequest: (groupId) => reconciler.requestInitialOption(groupId),
        onGroupIncrement: (groupId) => reconciler.incrementGroup(groupId),
        onGroupDecrement: (groupId) => reconciler.decrementGroup(groupId),
        onGroupRemove: (groupId) => reconciler.clearGroup(groupId)
      });
      adapter.hideSelectedProducts?.();
      reconciler.start();
      return true;
    },
    destroy() {
      reconciler.stop();
      view.destroy();
    },
    view() {
      return view;
    }
  };
}
