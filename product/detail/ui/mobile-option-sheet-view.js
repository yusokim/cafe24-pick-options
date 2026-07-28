import { clearElement, createElement } from '../utils/dom.js';

function createIcon(pathData) {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.8');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  icon.append(path);
  return icon;
}

function createBadge(badge) {
  const element = createElement('span', {
    className: 'option-picker-sheet__badge',
    text: typeof badge === 'string' ? badge : badge?.label || ''
  });
  if (badge && typeof badge === 'object') {
    if (badge.color) element.style.setProperty('--option-picker-sheet-badge-color', badge.color);
    if (badge.backgroundColor) element.style.setProperty('--option-picker-sheet-badge-background', badge.backgroundColor);
  }
  return element;
}

export function createMobileOptionSheetView({ root, groups }) {
  let cards = new Map();
  let selections = new Map();
  let layer;
  let trigger;
  let selectedTotal = 0;
  let isUpdating = false;
  let showEmptyTrigger = false;
  let lastFocusedElement;
  let closeButton;

  function getFocusableElements() {
    return Array.from(layer?.querySelectorAll(
      'button:not([disabled]):not([tabindex="-1"]), [href]:not([tabindex="-1"])'
    ) || []).filter((element) => !element.hidden && !element.closest('[hidden]'));
  }

  function setOpen(isOpen, origin = trigger) {
    if (!layer) return;
    layer.hidden = !isOpen;
    trigger.setAttribute('aria-expanded', String(isOpen));
    document.documentElement.classList.toggle('option-picker-sheet-open', isOpen);

    if (isOpen) {
      lastFocusedElement = origin;
      requestAnimationFrame(() => closeButton?.focus());
    } else if (lastFocusedElement?.isConnected && !lastFocusedElement.hidden) {
      lastFocusedElement.focus();
    }
  }

  return {
    render({ onGroupRequest, onGroupIncrement, onGroupDecrement, onGroupRemove }) {
      clearElement(root);
      cards = new Map();
      selections = new Map();

      trigger = createElement('button', {
        className: 'option-picker-sheet__trigger',
        type: 'button',
        'aria-expanded': 'false',
        'aria-controls': 'option-picker-sheet'
      });
      trigger.append(
        createElement('strong', { className: 'option-picker-sheet__trigger-label', text: '옵션 선택 (필수)' }),
        createIcon('M6 14L12 8L18 14')
      );
      trigger.addEventListener('click', () => setOpen(true));

      layer = createElement('div', {
        className: 'option-picker-sheet__layer',
        id: 'option-picker-sheet',
        hidden: ''
      });
      const backdrop = createElement('button', {
        className: 'option-picker-sheet__backdrop',
        type: 'button',
        'aria-label': '옵션 선택 닫기',
        tabindex: '-1'
      });
      backdrop.addEventListener('click', () => setOpen(false));
      const sheet = createElement('section', {
        className: 'option-picker-sheet__panel',
        role: 'dialog',
        'aria-label': '옵션 선택',
        'aria-modal': 'true'
      });
      const header = createElement('div', { className: 'option-picker-sheet__header' });
      closeButton = createElement('button', {
        className: 'option-picker-sheet__close', type: 'button', 'aria-label': '옵션 선택 닫기'
      });
      closeButton.append(createIcon('M5 5L19 19M19 5L5 19'));
      closeButton.addEventListener('click', () => setOpen(false));
      header.append(
        createElement('span', { className: 'option-picker-sheet__handle', 'aria-hidden': 'true' }),
        createElement('strong', { className: 'option-picker-sheet__title', text: '옵션 선택 (필수)' }),
        closeButton
      );

      const list = createElement('div', { className: 'option-picker-sheet__list' });
      groups.forEach((group) => {
        const card = createElement('button', {
          className: 'option-picker-sheet__card', type: 'button',
          dataset: { optionPickerGroup: group.id }, 'aria-pressed': 'false'
        });
        const choice = createElement('span', { className: 'option-picker-sheet__choice' });
        choice.append(
          createElement('span', { className: 'option-picker-sheet__radio', 'aria-hidden': 'true' }),
          createElement('strong', { className: 'option-picker-sheet__label', text: group.label })
        );
        const priceLine = createElement('span', { className: 'option-picker-sheet__price-line' });
        priceLine.append(
          createElement('strong', { className: 'option-picker-sheet__price-value', text: group.displayPrice || '' }),
          createElement('span', { className: 'option-picker-sheet__discount-rate', text: group.discountRate || '' }),
          createBadge(group.badge)
        );
        const price = createElement('span', { className: 'option-picker-sheet__price' });
        price.append(priceLine, createElement('span', {
          className: 'option-picker-sheet__description', text: group.unitPrice || ''
        }));
        card.append(choice, price);
        card.addEventListener('click', () => onGroupRequest(group.id));
        cards.set(group.id, card);
        list.append(card);
      });

      const selectedList = createElement('div', { className: 'option-picker-sheet__selected-list', hidden: '' });
      groups.forEach((group) => {
        const item = createElement('div', { className: 'option-picker-sheet__selected-item', hidden: '' });
        const count = createElement('strong', { className: 'option-picker-sheet__count', text: '0' });
        const decrement = createElement('button', { className: 'option-picker-sheet__quantity-button', type: 'button', text: '−' });
        const increment = createElement('button', { className: 'option-picker-sheet__quantity-button', type: 'button', text: '+' });
        const remove = createElement('button', { className: 'option-picker-sheet__remove', type: 'button', 'aria-label': `${group.label} 선택 삭제` });
        remove.append(createIcon('M5 5L19 19M19 5L5 19'));
        const controls = createElement('span', { className: 'option-picker-sheet__quantity-controls' });
        controls.append(decrement, count, increment);
        const footer = createElement('div', { className: 'option-picker-sheet__selected-footer' });
        const price = createElement('strong', { className: 'option-picker-sheet__summary-price' });
        footer.append(controls, price);
        const itemHeader = createElement('div', { className: 'option-picker-sheet__selected-header' });
        itemHeader.append(createElement('strong', { className: 'option-picker-sheet__selected-label', text: group.label }), remove);
        item.append(itemHeader, footer);
        decrement.addEventListener('click', () => onGroupDecrement(group.id));
        increment.addEventListener('click', () => onGroupIncrement(group.id));
        remove.addEventListener('click', () => onGroupRemove(group.id));
        selections.set(group.id, { item, count, decrement, increment, remove, price, group });
        selectedList.append(item);
      });

      sheet.append(header, list, selectedList);
      sheet.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setOpen(false);
          return;
        }
        if (event.key !== 'Tab') return;

        const focusableElements = getFocusableElements();
        const first = focusableElements[0];
        const last = focusableElements.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
      layer.append(backdrop, sheet);
      root.append(trigger, layer);
    },
    updateStates(states) {
      selectedTotal = states.reduce((total, state) => total + state.selectedCount, 0);
      isUpdating = states.some((state) => state.isUpdating);
      trigger.querySelector('.option-picker-sheet__trigger-label').textContent = selectedTotal
        ? `선택한 옵션 ${selectedTotal}개` : '옵션 선택 (필수)';
      trigger.hidden = selectedTotal === 0 && !showEmptyTrigger;
      layer.querySelector('.option-picker-sheet__selected-list').hidden = selectedTotal === 0;
      states.forEach(({ id, selectedCount, limit, isSelectionDisabled, isUpdating }) => {
        const card = cards.get(id);
        const selection = selections.get(id);
        if (!card || !selection) return;
        card.disabled = isSelectionDisabled;
        card.classList.toggle('is-selected', selectedCount > 0);
        card.setAttribute('aria-pressed', String(selectedCount > 0));
        selection.item.hidden = selectedCount === 0;
        selection.count.textContent = String(selectedCount);
        selection.decrement.disabled = isUpdating || selectedCount === 0;
        selection.increment.disabled = isUpdating || selectedCount >= limit;
        selection.remove.disabled = isUpdating;
        selection.price.textContent = selection.group.summaryPrices?.[selectedCount - 1] || '';
      });
    },
    hasSelectedOptions() { return selectedTotal > 0; },
    isUpdating() { return isUpdating; },
    setPurchaseActionAvailable(isAvailable) {
      showEmptyTrigger = !isAvailable;
      trigger.hidden = selectedTotal === 0 && !showEmptyTrigger;
    },
    open(origin) { setOpen(true, origin); },
    destroy() {
      document.documentElement.classList.remove('option-picker-sheet-open');
      clearElement(root);
      cards.clear();
      selections.clear();
    }
  };
}
