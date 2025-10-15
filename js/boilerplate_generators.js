"use strict";
// TYPES
// CONSTANTS
const boilerplateGeneratorTemplate = document.querySelector('template#boilerplate-generator');
const boilerplateGeneratorPresetButtonTemplate = document.querySelector('template#boilerplate-generator-preset-button');
const boilerplateGeneratorFormInputTemplate = document.querySelector('template#boilerplate-generator-form-input');
// FUNCTIONS
const getBoilerplateGeneratorId = (generator) => { var _a; return `bpgen-${((_a = generator.presets) === null || _a === void 0 ? void 0 : _a.length) || '0'}-${generator.inputs.length}-${generator.label.toLowerCase().replace(/ /g, '_')}`; };
const getBoilerplateGeneratorInputId = (input) => { var _a; return `bpgeninput-${input.id.toLowerCase()}-${((_a = input.input_type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'default'}`; };
function applyPreset(preset, generator) {
    generator.inputs.forEach(input => {
        const e = document.querySelector(getBoilerplateGeneratorInputId(input));
        e.checked = preset.inputs[input.id].checked;
        if (!!preset.inputs[input.id].value) {
            const secondaryInput = e.querySelector('label > .secondary-input');
            secondaryInput.value = preset.inputs[input.id].value;
        }
    });
}
function makeBoilerplateGeneratorPresetButtonHTML(preset, generator) {
    const e = boilerplateGeneratorPresetButtonTemplate.content.cloneNode(true).firstChild;
    e.innerText = preset.label;
    e.addEventListener('click', _ => applyPreset(preset, generator));
    return e;
}
function makeBoilerplateGeneratorInputHTML(input, generator) {
    const e = boilerplateGeneratorFormInputTemplate.content.cloneNode(true).firstChild;
    const checkboxElement = e.querySelector('input[type="checkbox"]');
    const labelElement = e.querySelector('label');
    checkboxElement.id = `${getBoilerplateGeneratorInputId(input)}-checkbox`;
    labelElement.id = `${getBoilerplateGeneratorInputId(input)}-label`;
    labelElement.setAttribute('for', checkboxElement.id);
    if (!!input.input_type) {
        let secondaryInputElement = document.createElement(input.input_type === 'select' ? 'select' : 'input');
        if (input.input_type === 'select') {
            secondaryInputElement = secondaryInputElement;
            Object.entries(input.options).forEach(([label, value]) => {
                const optionElement = document.createElement('option');
                // If options are in array form, use the value - else use the specified label
                optionElement.innerText = Array.isArray(input.options) ? value : label;
                optionElement.value = value;
                secondaryInputElement.appendChild(optionElement);
            });
        }
        else {
            secondaryInputElement.setAttribute('type', input.input_type);
        }
        if (input.attributes)
            Object.entries(input.attributes).forEach(([name, value]) => {
                secondaryInputElement.setAttribute(name, value);
            });
        labelElement === null || labelElement === void 0 ? void 0 : labelElement.appendChild(secondaryInputElement);
    }
    checkboxElement.checked = input.checked || false;
    if (!!input.disabled)
        checkboxElement.disabled = true;
    // TODO : implement recursion for input.dependants
    return e;
}
function makeBoilerplateGeneratorHTML(generator) {
    var _a;
    const e = boilerplateGeneratorTemplate.content.cloneNode(true).firstChild;
    const presetButtons = [];
    const formInputs = [];
    const titleElement = e.querySelector('.boilerplate-generator-title');
    const copyOutputButtonElement = e.querySelector('.boilerplate-generator-output-copy-button');
    const outputElement = e.querySelector('.boilerplate-generator-output');
    const outputErrorListElement = e.querySelector('.boilerplate-generator-error-list');
    const presetButtonsListElement = e.querySelector('.boilerplate-generator-presets');
    const formElement = e.querySelector('.boilerplate-form');
    titleElement.innerText = generator.label;
    const copyOutputButtonFeedback = (text) => {
        const oldText = copyOutputButtonElement.innerText;
        copyOutputButtonElement.disabled = true;
        copyOutputButtonElement.innerText = text;
        setTimeout(() => {
            copyOutputButtonElement.disabled = true;
            copyOutputButtonElement.innerText = oldText;
        }, 1000);
    };
    copyOutputButtonElement.addEventListener('click', _ => {
        navigator.clipboard.writeText(outputElement.innerText).then(r => copyOutputButtonFeedback('Copiato!'));
    });
    (_a = generator.presets) === null || _a === void 0 ? void 0 : _a.forEach(preset => presetButtons.push(makeBoilerplateGeneratorPresetButtonHTML(preset, generator)));
    generator.inputs.forEach(input => formInputs.push(makeBoilerplateGeneratorInputHTML(input, generator)));
    presetButtons.forEach(button => presetButtonsListElement === null || presetButtonsListElement === void 0 ? void 0 : presetButtonsListElement.appendChild(button));
    formInputs.forEach(input => formElement === null || formElement === void 0 ? void 0 : formElement.appendChild(input));
    return e;
}
