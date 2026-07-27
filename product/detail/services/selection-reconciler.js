/**
 * Converts Cafe24's selected option values into card counts and availability.
 * It owns no DOM and never calculates final prices.
 */
export function createSelectionReconciler({ config, adapter, view }) {
  let stopObserving = null;

  function getGroup(groupId) {
    return config.groups.find((group) => group.id === groupId);
  }

  function sync() {
    const selectedValues = new Set(adapter.getSelectedOptionValues());
    const states = config.groups.map((group) => {
      const selectedCount = group.optionValues.filter((value) => selectedValues.has(value)).length;

      return {
        id: group.id,
        selectedCount,
        limit: group.maxSelectable ?? group.optionValues.length,
        isDisabled: selectedCount >= (group.maxSelectable ?? group.optionValues.length)
      };
    });

    view.updateStates(states);
  }

  return {
    getNextAvailableOptionValue(groupId) {
      const group = getGroup(groupId);
      if (!group) return null;

      const selectedValues = new Set(adapter.getSelectedOptionValues());
      const limit = group.maxSelectable ?? group.optionValues.length;
      const selectedCount = group.optionValues.filter((value) => selectedValues.has(value)).length;

      if (selectedCount >= limit) return null;

      return group.optionValues.find((value) => !selectedValues.has(value)) || null;
    },
    start() {
      sync();
      stopObserving = adapter.observeSelectedProducts(sync);
    },
    stop() {
      stopObserving?.();
      stopObserving = null;
    }
  };
}
