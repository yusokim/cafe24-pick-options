export function clearElement(element) {
  element.replaceChildren();
}

export function createElement(tagName, { className, text, dataset, ...attributes } = {}) {
  const element = document.createElement(tagName);

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  if (dataset) Object.assign(element.dataset, dataset);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));

  return element;
}
