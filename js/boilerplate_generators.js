"use strict";
// TYPES
// CONSTANTS
const boilerplateGeneratorTemplate = document.querySelector('template#boilerplate-generator');
const boilerplateGeneratorPresetButtonTemplate = document.querySelector('template#boilerplate-generator-preset-button');
const boilerplateGeneratorFormInputTemplate = document.querySelector('template#boilerplate-generator-form-input');
// FUNCTIONS
const getBoilerplateGeneratorId = (generator) => { var _a; return `bpgen-${((_a = generator.presets) === null || _a === void 0 ? void 0 : _a.length) || '0'}-${generator.inputs.length}-${generator.label.toLowerCase().replace(/ /g, '_')}`; };
const getBoilerplateGeneratorInputId = (input) => { var _a; return `bpgeninput-${input.id.toLowerCase()}-${((_a = input.input_type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'default'}`; };
const getBoilerplateGeneratorInputCheckboxId = (input) => `${getBoilerplateGeneratorInputId(input)}-checkbox`;
const getBoilerplateGeneratorInputLabelId = (input) => `${getBoilerplateGeneratorInputId(input)}-label`;
const getBoilerplateGeneratorInputSecondaryId = (input) => `${getBoilerplateGeneratorInputId(input)}-secondary`;
const getBoilerplateGeneratorInputDependentsWrapperId = (input) => `${getBoilerplateGeneratorInputId(input)}-dependent`;
function applyPreset(preset, generator) {
    generator.inputs.forEach(input => {
        if (typeof preset === 'object' && !preset.inputs[input.id])
            return;
        const e = document.querySelector(`#${getBoilerplateGeneratorInputId(input)}`);
        if (!e)
            return;
        const c = e.querySelector('input[type="checkbox"]');
        c.checked = preset === 'UNCHECK-ALL' ? false : preset.inputs[input.id].checked;
        c.dispatchEvent(new Event('change', { bubbles: true }));
        if (preset === 'UNCHECK-ALL')
            return;
        const secondaryInput = e.querySelector('label > .secondary-input');
        if (preset.inputs[input.id].value !== undefined && preset.inputs[input.id].value !== null && !!secondaryInput) {
            secondaryInput.value = preset.inputs[input.id].value;
            secondaryInput.dispatchEvent(new Event('input', { bubbles: true }));
            secondaryInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}
function collectBoilerplateGeneratorFormValues(inputsWrapper, generator) {
    const values = {};
    generator.inputs.forEach(input => {
        const e = inputsWrapper.querySelector(`#${getBoilerplateGeneratorInputId(input)}`);
        if (!e)
            throw new Error(`Could not find input wrapper for input: ${input.label}`);
        const checkbox = e.querySelector(`#${getBoilerplateGeneratorInputCheckboxId(input)}`);
        if (!checkbox)
            throw new Error(`Could not find checkbox for input: ${input.label}`);
        const secondaryInput = e.querySelector(`#${getBoilerplateGeneratorInputSecondaryId(input)}`);
        const dependentsWrapper = e.querySelector(`#${getBoilerplateGeneratorInputDependentsWrapperId(input)}`);
        const result = { checkbox: checkbox };
        if (input.input_type && secondaryInput)
            result.input = secondaryInput;
        values[input.id] = result;
        if (!!input.dependents) {
            const dependentValues = collectBoilerplateGeneratorFormValues(dependentsWrapper, { inputs: input.dependents });
            Object.entries(dependentValues).forEach(([k, v]) => {
                values[k] = v;
            });
        }
    });
    return values;
}
function updateBoilerplateOutput(form, outputElement, generator) {
    const values = collectBoilerplateGeneratorFormValues(form, generator);
    if (!values)
        throw new Error(`Couldn't read boilerplate generator form values for "${generator.label}"`);
    outputElement.innerText = generator.generator_fn(values);
}
function makeBoilerplateGeneratorPresetButtonHTML(preset, generator) {
    const e = boilerplateGeneratorPresetButtonTemplate.content.cloneNode(true).firstChild;
    if (preset === 'UNCHECK-ALL') {
        e.innerText = '✕';
    }
    else
        e.innerText = preset.label;
    e.addEventListener('click', _ => applyPreset(preset, generator));
    return e;
}
function makeBoilerplateGeneratorInputHTML(input, ancestorsLast = []) {
    var _a;
    const e = boilerplateGeneratorFormInputTemplate.content.cloneNode(true).firstChild;
    e.id = getBoilerplateGeneratorInputId(input);
    const checkboxElement = e.querySelector('input[type="checkbox"]');
    const labelElement = e.querySelector('label');
    const dependentInputsWrapper = e.querySelector('.boilerplate-generator-dependent-inputs');
    checkboxElement.id = getBoilerplateGeneratorInputCheckboxId(input);
    labelElement.id = getBoilerplateGeneratorInputLabelId(input);
    labelElement.setAttribute('for', checkboxElement.id);
    labelElement.innerText = `${input.label}${!!input.input_type ? ': ' : ''}`;
    if (input.token)
        labelElement.dataset.token = input.token;
    dependentInputsWrapper.id = getBoilerplateGeneratorInputDependentsWrapperId(input);
    if (!!input.input_type) {
        let secondaryInputElement = document.createElement(input.input_type === 'select' ? 'select' : 'input');
        secondaryInputElement.id = getBoilerplateGeneratorInputSecondaryId(input);
        secondaryInputElement.classList.add('secondary-input');
        if (input.input_type === 'select') {
            secondaryInputElement = secondaryInputElement;
            Object.entries(input.options).forEach(([label, value]) => {
                const optionElement = document.createElement('option');
                optionElement.value = value;
                if (label.startsWith("[DISABLED]")) {
                    optionElement.setAttribute('disabled', 'true');
                    label = label.replace("[DISABLED]", '').trim();
                }
                // If options are in array form, use the value - else use the specified label
                optionElement.innerText = Array.isArray(input.options) ? value : label;
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
        labelElement.appendChild(secondaryInputElement);
    }
    checkboxElement.checked = input.checked || false;
    if (!!input.disabled)
        checkboxElement.disabled = true;
    (_a = input.dependents) === null || _a === void 0 ? void 0 : _a.forEach((dependentInput, index) => {
        var _a, _b;
        const isLast = index >= (((_a = input.dependents) === null || _a === void 0 ? void 0 : _a.length) ? ((_b = input.dependents) === null || _b === void 0 ? void 0 : _b.length) - 1 : 0);
        const dependentInputElement = makeBoilerplateGeneratorInputHTML(dependentInput, [...ancestorsLast, isLast]);
        const ancestorBranch = ancestorsLast.map(aIsLast => aIsLast ? '   ' : ' │ ').join('');
        const currentBranch = isLast ? ' └─' : ' ├─';
        dependentInputElement.dataset.treeviewBranch = ancestorBranch + currentBranch;
        dependentInputsWrapper.appendChild(dependentInputElement);
    });
    return e;
}
function makeBoilerplateGeneratorHTML(generator) {
    var _a;
    const e = boilerplateGeneratorTemplate.content.cloneNode(true).firstChild;
    e.id = getBoilerplateGeneratorId(generator);
    const titleElement = e.querySelector('.boilerplate-generator-title');
    const copyOutputButtonElement = e.querySelector('.boilerplate-generator-output-copy-button');
    const outputElement = e.querySelector('.boilerplate-generator-output');
    const outputErrorListElement = e.querySelector('.boilerplate-generator-error-list');
    const presetButtonsListElement = e.querySelector('.boilerplate-generator-presets');
    const formElement = e.querySelector('.boilerplate-generator-form');
    titleElement.innerText = generator.label;
    if (generator.terminal_output)
        outputElement.classList.add('terminal');
    copyOutputButtonElement.addEventListener('click', _ => {
        navigator.clipboard.writeText(outputElement.innerText).then(_ => temporaryText(copyOutputButtonElement, !!outputElement.innerText ? 'Copiato!' : 'Nulla da copiare!'));
    });
    copyOutputButtonElement.innerText = generator.copy_button_label || 'Copia output';
    if (!!generator.presets && generator.presets.length > 0)
        presetButtonsListElement.appendChild(makeBoilerplateGeneratorPresetButtonHTML('UNCHECK-ALL', generator));
    (_a = generator.presets) === null || _a === void 0 ? void 0 : _a.forEach(preset => presetButtonsListElement.appendChild(makeBoilerplateGeneratorPresetButtonHTML(preset, generator)));
    generator.inputs.forEach(input => formElement.appendChild(makeBoilerplateGeneratorInputHTML(input)));
    formElement.addEventListener('change', _ => updateBoilerplateOutput(formElement, outputElement, generator));
    updateBoilerplateOutput(formElement, outputElement, generator);
    return e;
}
