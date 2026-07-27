import { clearElement, createElement } from '../utils/dom.js';

export function createOptionPickerView({ root, groups }) {
  let cards = new Map();

  return {
    render(onGroupRequest) {
      clearElement(root);
      cards = new Map();

      const list = createElement('div', { className: 'option-picker__list' });
      groups.forEach((group) => {
        const button = createElement('button', {
          className: 'option-picker__card',
          type: 'button',
          dataset: { optionPickerGroup: group.id },
          'aria-pressed': 'false'
        });

        const heading = createElement('span', { className: 'option-picker__heading' });
        heading.append(
          createElement('strong', { className: 'option-picker__label', text: group.label }),
          createElement('span', { className: 'option-picker__badge', text: group.badge || '' })
        );

        const price = createElement('span', { className: 'option-picker__price' });
        price.append(
          createElement('strong', { className: 'option-picker__price-value', text: group.displayPrice || '' }),
          createElement('span', { className: 'option-picker__description', text: group.unitPrice || '' })
        );

        const content = createElement('span', { className: 'option-picker__content' });
        content.append(
          heading,
          price,
          createElement('span', { className: 'option-picker__count', text: '' })
        );

        button.append(
          createElement('span', { className: 'option-picker__radio', 'aria-hidden': 'true' }),
          content
        );

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
        card.querySelector('.option-picker__count').textContent = `${selectedCount} / ${limit} 선택`;
      });
    },
    destroy() {
      clearElement(root);
      cards.clear();
    }
  };
}
