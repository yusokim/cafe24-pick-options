import { clearElement, createElement } from '../utils/dom.js';

export function createOptionPickerView({ root, groups }) {
  let cards = new Map();

  return {
    render(onGroupRequest) {
      clearElement(root);
      cards = new Map();

      const header = createElement('div', { className: 'option-picker__header' });
      header.append(
        createElement('strong', { className: 'option-picker__title', text: '옵션 선택 (필수)' }),
        createElement('span', { className: 'option-picker__chevron', 'aria-hidden': 'true' })
      );

      const list = createElement('div', { className: 'option-picker__list' });
      groups.forEach((group) => {
        const button = createElement('button', {
          className: 'option-picker__card',
          type: 'button',
          dataset: { optionPickerGroup: group.id },
          'aria-pressed': 'false'
        });

        const priceLine = createElement('span', { className: 'option-picker__price-line' });
        priceLine.append(
          createElement('strong', { className: 'option-picker__price-value', text: group.displayPrice || '' }),
          createElement('span', { className: 'option-picker__badge', text: group.badge || '' })
        );

        const price = createElement('span', { className: 'option-picker__price' });
        price.append(
          priceLine,
          createElement('span', { className: 'option-picker__description', text: group.unitPrice || '' }),
          createElement('span', { className: 'option-picker__count', text: '' })
        );

        const choice = createElement('span', { className: 'option-picker__choice' });
        choice.append(
          createElement('span', { className: 'option-picker__radio', 'aria-hidden': 'true' }),
          createElement('strong', { className: 'option-picker__label', text: group.label })
        );

        button.append(choice, price);

        button.addEventListener('click', () => onGroupRequest(group.id));
        cards.set(group.id, button);
        list.append(button);
      });

      root.append(list);
    },
    updateStates(states) {
      states.forEach(({ id, selectedCount, limit, isDisabled }) => {
        const card = cards.get(id);
        if (!card) return;

        card.disabled = isDisabled;
        card.classList.toggle('is-selected', selectedCount > 0);
        card.classList.toggle('is-disabled', isDisabled);
        card.setAttribute('aria-pressed', String(selectedCount > 0));
        card.setAttribute(
          'aria-label',
          `${card.querySelector('.option-picker__label').textContent}, ${selectedCount} / ${limit} 선택`
        );
        card.querySelector('.option-picker__count').textContent = `${selectedCount} / ${limit} 선택`;
      });
    },
    destroy() {
      clearElement(root);
      cards.clear();
    }
  };
}
