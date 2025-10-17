"use strict";
function temporaryText(element, text, timeout) {
    const oldText = element.innerText;
    element.classList.add('temporary-text-visible');
    element.innerText = text;
    setTimeout(() => {
        element.classList.remove('temporary-text-visible');
        element.innerText = oldText;
    }, timeout || 1000);
}
function adaptTextInputToValueLength(e) {
    const text = (!e.value || e.value === '') ? e.placeholder : e.value;
    e.size = Math.max(text.length, 5);
}
