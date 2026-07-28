/**
 * Keeps one Cafe24 suffix option selected for each pack group.
 * The suffix index is the pack count: `_1` means 1, `_2` means 2.
 *
 * Cafe24 rebuilds the selected-product DOM asynchronously. Every native
 * remove/select operation is therefore processed through one global queue.
 */
const TRANSITION_TIMEOUT_MS = 1500;

export function createSelectionReconciler({ config, adapter, view }) {
  let stopObserving = null;
  let activeTransition = null;
  const pendingTargets = new Map();

  function getGroup(groupId) {
    return config.groups.find((group) => group.id === groupId);
  }

  function getSelectedOptionValues(group, selectedValues) {
    return group.optionValues.filter((value) => selectedValues.has(value));
  }

  function getSelectedOptionValue(group, selectedValues) {
    return [...getSelectedOptionValues(group, selectedValues)].reverse()[0] || null;
  }

  function getSelectedCount(group, selectedValues) {
    const optionValue = getSelectedOptionValue(group, selectedValues);
    return optionValue ? group.optionValues.indexOf(optionValue) + 1 : 0;
  }

  function isCanonicalSelection(group, selectedValues) {
    return getSelectedOptionValues(group, selectedValues).length <= 1;
  }

  function getGroupState(group, selectedValues) {
    const activeForGroup = activeTransition?.groupId === group.id ? activeTransition : null;
    const selectedCount = activeForGroup
      ? activeForGroup.targetCount
      : getSelectedCount(group, selectedValues);

    return {
      id: group.id,
      selectedCount,
      limit: group.maxSelectable ?? group.optionValues.length,
      isSelectionDisabled: selectedCount > 0,
      isUpdating: Boolean(activeTransition)
    };
  }

  function render(selectedValues = new Set(adapter.getSelectedOptionValues())) {
    view.updateStates(config.groups.map((group) => getGroupState(group, selectedValues)));
  }

  function clearActiveTransition() {
    if (!activeTransition) return;
    clearTimeout(activeTransition.timeoutId);
    activeTransition = null;
  }

  function failActiveTransition(reason) {
    const transition = activeTransition;
    if (!transition) return;

    console.warn('[option-picker] Cafe24 option transition failed.', {
      groupId: transition.groupId,
      targetCount: transition.targetCount,
      reason
    });
    clearActiveTransition();
  }

  function createTransition(group, targetCount, selectedValues) {
    const selectedOptionValues = getSelectedOptionValues(group, selectedValues);
    const targetOptionValue = targetCount > 0 ? group.optionValues[targetCount - 1] : null;
    const removeOptionValues = selectedOptionValues.filter((value) => value !== targetOptionValue).reverse();
    const steps = removeOptionValues.map((value) => ({ type: 'remove', value }));

    if (targetOptionValue && !selectedValues.has(targetOptionValue)) {
      steps.push({ type: 'select', value: targetOptionValue });
    }

    return {
      groupId: group.id,
      targetCount,
      steps,
      timeoutId: null,
      waiting: false
    };
  }

  function getRepairTarget(selectedValues) {
    const invalidGroup = config.groups.find((group) => !isCanonicalSelection(group, selectedValues));
    if (!invalidGroup) return null;

    return {
      groupId: invalidGroup.id,
      targetCount: getSelectedCount(invalidGroup, selectedValues)
    };
  }

  function startNextTransition(selectedValues) {
    if (activeTransition) return;

    const repairTarget = getRepairTarget(selectedValues);
    const nextTarget = repairTarget || pendingTargets.entries().next().value;
    if (!nextTarget) return;

    const [groupId, targetCount] = Array.isArray(nextTarget)
      ? nextTarget
      : [nextTarget.groupId, nextTarget.targetCount];
    pendingTargets.delete(groupId);

    const group = getGroup(groupId);
    if (!group) return;

    const limit = group.maxSelectable ?? group.optionValues.length;
    if (targetCount < 0 || targetCount > limit) return;

    const currentCount = getSelectedCount(group, selectedValues);
    if (targetCount === currentCount && isCanonicalSelection(group, selectedValues)) {
      startNextTransition(selectedValues);
      return;
    }

    activeTransition = createTransition(group, targetCount, selectedValues);
    advanceActiveTransition(selectedValues);
  }

  function scheduleSync() {
    queueMicrotask(sync);
  }

  function runActiveStep(step) {
    if (!activeTransition || activeTransition.waiting) return;

    activeTransition.waiting = true;
    const succeeded = step.type === 'remove'
      ? adapter.removeOptionValue(step.value)
      : adapter.selectOptionValue(step.value);

    if (!succeeded) {
      failActiveTransition(`${step.type}:${step.value}`);
      scheduleSync();
      return;
    }

    activeTransition.timeoutId = setTimeout(() => {
      failActiveTransition(`timeout:${step.type}:${step.value}`);
      sync();
    }, TRANSITION_TIMEOUT_MS);
    scheduleSync();
  }

  function advanceActiveTransition(selectedValues) {
    if (!activeTransition) return;

    const step = activeTransition.steps[0];
    if (!step) {
      clearActiveTransition();
      startNextTransition(selectedValues);
      return;
    }

    const stepCompleted = step.type === 'remove'
      ? !selectedValues.has(step.value)
      : selectedValues.has(step.value);

    if (stepCompleted) {
      clearTimeout(activeTransition.timeoutId);
      activeTransition.timeoutId = null;
      activeTransition.waiting = false;
      activeTransition.steps.shift();
      advanceActiveTransition(selectedValues);
      return;
    }

    runActiveStep(step);
  }

  function sync() {
    const selectedValues = new Set(adapter.getSelectedOptionValues());

    if (activeTransition) advanceActiveTransition(selectedValues);
    if (!activeTransition) startNextTransition(selectedValues);

    render(new Set(adapter.getSelectedOptionValues()));
  }

  function requestCount(groupId, targetCount) {
    const group = getGroup(groupId);
    if (!group || activeTransition?.groupId === groupId) return false;

    const selectedValues = new Set(adapter.getSelectedOptionValues());
    const limit = group.maxSelectable ?? group.optionValues.length;
    const currentCount = getSelectedCount(group, selectedValues);
    if (targetCount < 0 || targetCount > limit) return false;
    if (targetCount === currentCount && isCanonicalSelection(group, selectedValues)) return false;

    pendingTargets.set(groupId, targetCount);
    sync();
    return true;
  }

  return {
    requestInitialOption(groupId) {
      return requestCount(groupId, 1);
    },
    incrementGroup(groupId) {
      const group = getGroup(groupId);
      if (!group) return false;
      return requestCount(groupId, getSelectedCount(group, new Set(adapter.getSelectedOptionValues())) + 1);
    },
    decrementGroup(groupId) {
      const group = getGroup(groupId);
      if (!group) return false;
      return requestCount(groupId, getSelectedCount(group, new Set(adapter.getSelectedOptionValues())) - 1);
    },
    clearGroup(groupId) {
      return requestCount(groupId, 0);
    },
    start() {
      sync();
      stopObserving = adapter.observeSelectedProducts(sync);
    },
    stop() {
      stopObserving?.();
      stopObserving = null;
      clearActiveTransition();
      pendingTargets.clear();
    }
  };
}
