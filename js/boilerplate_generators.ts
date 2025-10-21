
// TYPES

// How is this not built-in
type HTMLInputType = 'button'|'checkbox'|'color'|'date'|'datetime'|'datetime-local'|'email'|'file'|'hidden'|'image'|'month'|'number'|'password'|'radio'|'range'|'reset'|'search'|'submit'|'tel'|'text'|'time'|'url'|'week'
type HTMLInputTypeExtended = HTMLInputType | 'select'
// How is this not default
type HTMLInputElementExtended = HTMLInputElement | HTMLSelectElement

type BoilerplateGeneratorInputId = `i-${string}`

type BoilerplateGeneratorNativeInput = {
    // A unique ID to reference this input
    id: BoilerplateGeneratorInputId
    /* The type of input expected. If none is specified, only the
       default checkbox will be presented to the user */
    input_type?: HTMLInputTypeExtended
    // The label to assign to this input
    label: string
    // A label that will only be shown when this box is checked
    detail?: string
    // The token this input manages (e.g. "-Wall" or "int i = 0;")
    token?: string
    // Whether this input should be checked by default
    checked?: boolean
    // Whether this input should be disabled
    disabled?: boolean
    // Further inputs that depend upon this one
    dependents?: BoilerplateGeneratorInput[]
    // Additional attributes for the generated HTML input
    attributes?: { [name: string] : string }
}
type BoilerplateGeneratorSelectInput = BoilerplateGeneratorNativeInput & {
    input_type: 'select'
    /* Options for the select input, either a list of values or a dictionary,
       where the keys are option labels, associated with their value. If the
       label (key) begins with "[DISABLED]", the option will be disabled */
    options: string[] | { [label: string] : string }
}
// A boilerplate generator input
/* This is a checkbox that the user can use to choose something to include or a
   particular way to generate the boilerplate. If an `input_type` is specified, an
   additional HTML input of that type will be presented, to include additional data. */
type BoilerplateGeneratorInput =
    BoilerplateGeneratorNativeInput |
    BoilerplateGeneratorSelectInput

/* Values read from the boilerplate generator form (references to the inputs on the DOM,
   mapped to their id in the boilerplate generator) */
type BoilerplateGeneratorInputReturnValues = {
    [id: BoilerplateGeneratorInputId]: {
        checkbox: HTMLInputElement
        input?: HTMLInputElementExtended
    }
}

// A dictionary with preset values to fill out a generator's form
/* The keys are the inputs' IDs, the values specify whether each item should be checked
   and additional input value if required */
type BoilerplateGeneratorPreset = {
    label: string
    inputs: {
        [id: BoilerplateGeneratorInputId] : {
            checked: boolean
            value?: any
        }
    }
}

type BoilerplateGenerator = {
    // Human-readable label for this boilerplate generator
    label: string
    // A list of inputs for this generator
    inputs: BoilerplateGeneratorInput[]
    // A list of presets to present to the user
    presets?: BoilerplateGeneratorPreset[]
    // Whether to stylize the output like a terminal
    terminal_output?: boolean
    // The label for the "copy output" button
    copy_button_label?: string
    // A function to generate boilerplate from a set of input values
    /* This function should take in a series of input values from the boilerplate generator's form.
       The values are passed in a dictionary, where the keys are the inputs' IDs as set in the `inputs`
       field, and the values are the ones the user entered */
    generator_fn: (formValues: BoilerplateGeneratorInputReturnValues) => string
}


// CONSTANTS

const boilerplateGeneratorTemplate = document.querySelector('template#boilerplate-generator') as HTMLTemplateElement
const boilerplateGeneratorPresetButtonTemplate = document.querySelector('template#boilerplate-generator-preset-button') as HTMLTemplateElement
const boilerplateGeneratorFormInputTemplate = document.querySelector('template#boilerplate-generator-form-input') as HTMLTemplateElement


// FUNCTIONS

const getBoilerplateGeneratorId = (generator: BoilerplateGenerator) => `bpgen-${generator.presets?.length || '0'}-${generator.inputs.length}-${generator.label.toLowerCase().replace(/ /g, '_', )}`

const getBoilerplateGeneratorInputId = (input: BoilerplateGeneratorInput) => `bpgeninput-${input.id.toLowerCase()}-${input.input_type?.toLowerCase() || 'default'}`
const getBoilerplateGeneratorInputCheckboxId = (input: BoilerplateGeneratorInput) => `${getBoilerplateGeneratorInputId(input)}-checkbox`
const getBoilerplateGeneratorInputLabelId = (input: BoilerplateGeneratorInput) => `${getBoilerplateGeneratorInputId(input)}-label`
const getBoilerplateGeneratorInputSecondaryId = (input: BoilerplateGeneratorInput) => `${getBoilerplateGeneratorInputId(input)}-secondary`
const getBoilerplateGeneratorInputDependentsWrapperId = (input: BoilerplateGeneratorInput) => `${getBoilerplateGeneratorInputId(input)}-dependent`

function applyPreset(preset: BoilerplateGeneratorPreset | 'UNCHECK-ALL', generator: BoilerplateGenerator) {
    generator.inputs.forEach(input => {
        if (typeof preset === 'object' && !preset.inputs[input.id]) return

        const e = document.querySelector(`#${getBoilerplateGeneratorInputId(input)}`) as HTMLElement
        if (!e) return
        const c = e.querySelector('input[type="checkbox"]') as HTMLInputElement

        c.checked = preset === 'UNCHECK-ALL' ? false : preset.inputs[input.id].checked
        c.dispatchEvent(new Event('change', {bubbles: true}))

        if (preset === 'UNCHECK-ALL') return

        const secondaryInput = e.querySelector('label > .secondary-input') as HTMLInputElementExtended
        if (preset.inputs[input.id].value !== undefined && preset.inputs[input.id].value !== null && !!secondaryInput) {
            secondaryInput.value = preset.inputs[input.id].value

            secondaryInput.dispatchEvent(new Event('input', { bubbles: true }))
            secondaryInput.dispatchEvent(new Event('change', { bubbles: true }))
        }
    })
}

function collectBoilerplateGeneratorFormValues(inputsWrapper: HTMLElement, generator: BoilerplateGenerator | {inputs: BoilerplateGeneratorInput[]}) {
    const values: BoilerplateGeneratorInputReturnValues = {}

    generator.inputs.forEach(input => {
        const e = inputsWrapper.querySelector(`#${getBoilerplateGeneratorInputId(input)}`) as HTMLElement
        if (!e) throw new Error(`Could not find input wrapper for input: ${input.label}`)
        const checkbox = e.querySelector(`#${getBoilerplateGeneratorInputCheckboxId(input)}`) as HTMLInputElement
        if (!checkbox) throw new Error(`Could not find checkbox for input: ${input.label}`)
        const secondaryInput = e.querySelector(`#${getBoilerplateGeneratorInputSecondaryId(input)}`) as HTMLInputElementExtended
        const dependentsWrapper = e.querySelector(`#${getBoilerplateGeneratorInputDependentsWrapperId(input)}`) as HTMLElement

        const result: { checkbox: HTMLInputElement, input?: HTMLInputElementExtended } = { checkbox: checkbox }
        if (input.input_type && secondaryInput) result.input = secondaryInput

        values[input.id] = result

        if (!!input.dependents) {
            const dependentValues = collectBoilerplateGeneratorFormValues(dependentsWrapper, {inputs: input.dependents})
            Object.entries(dependentValues).forEach(([k,v]) => {
                values[k as BoilerplateGeneratorInputId] = v
            })
        }
    })

    return values
}

function updateBoilerplateOutput(form: HTMLFormElement, outputElement: HTMLElement, generator: BoilerplateGenerator) {
    const values = collectBoilerplateGeneratorFormValues(form, generator)
    if (!values) throw new Error(`Couldn't read boilerplate generator form values for "${generator.label}"`)
    outputElement.innerText = generator.generator_fn(values)
}

function makeBoilerplateGeneratorPresetButtonHTML(preset: BoilerplateGeneratorPreset | 'UNCHECK-ALL', generator: BoilerplateGenerator) {
    const e = (boilerplateGeneratorPresetButtonTemplate.content.cloneNode(true) as HTMLTemplateElement).firstChild as HTMLButtonElement

    if (preset === 'UNCHECK-ALL') {
        e.innerText = '✕'
    } else
        e.innerText = preset.label

    e.addEventListener('click', _ => applyPreset(preset, generator))

    return e
}

function makeBoilerplateGeneratorInputHTML(input: BoilerplateGeneratorInput, ancestorsLast: boolean[] = []) {
    const e = (boilerplateGeneratorFormInputTemplate.content.cloneNode(true) as HTMLTemplateElement).firstChild as HTMLElement

    e.id = getBoilerplateGeneratorInputId(input)

    const checkboxElement = e.querySelector('input[type="checkbox"]') as HTMLInputElement
    const labelElement = e.querySelector('label') as HTMLLabelElement
    const dependentInputsWrapper = e.querySelector('.boilerplate-generator-dependent-inputs') as HTMLElement

    checkboxElement.id = getBoilerplateGeneratorInputCheckboxId(input)
    labelElement.id = getBoilerplateGeneratorInputLabelId(input)
    labelElement.setAttribute('for', checkboxElement.id)
    labelElement.innerText = `${input.label}${!!input.input_type ? ': ' : ''}`
    if (input.token) labelElement.dataset.token = input.token
    dependentInputsWrapper.id = getBoilerplateGeneratorInputDependentsWrapperId(input)

    if (!!input.input_type) {
        let secondaryInputElement = document.createElement(input.input_type === 'select' ? 'select' : 'input')
        secondaryInputElement.id = getBoilerplateGeneratorInputSecondaryId(input)
        secondaryInputElement.classList.add('secondary-input')

        if (input.input_type === 'select') {
            secondaryInputElement = secondaryInputElement as HTMLSelectElement
            Object.entries((input as BoilerplateGeneratorSelectInput).options).forEach(([label, value]) => {
                const optionElement = document.createElement('option')
                optionElement.value = value
                if (label.startsWith("[DISABLED]")) {
                    optionElement.setAttribute('disabled', 'true')
                    label = label.replace("[DISABLED]", '').trim()
                }
                // If options are in array form, use the value - else use the specified label
                optionElement.innerText = Array.isArray((input as BoilerplateGeneratorSelectInput).options) ? value : label
                secondaryInputElement.appendChild(optionElement)
            })
        } else {
            secondaryInputElement.setAttribute('type', input.input_type)
        }
        if (input.attributes) Object.entries(input.attributes).forEach(([name, value]) => {
            secondaryInputElement.setAttribute(name, value)
        })

        labelElement.appendChild(secondaryInputElement)
    }

    checkboxElement.checked = input.checked || false
    if (!!input.disabled) checkboxElement.disabled = true

    input.dependents?.forEach((dependentInput, index) => {
        const isLast = index >= (input.dependents?.length ? input.dependents?.length - 1 : 0)
        const dependentInputElement = makeBoilerplateGeneratorInputHTML(dependentInput, [...ancestorsLast, isLast]);

        const ancestorBranch = ancestorsLast.map(aIsLast => aIsLast ? '   ' : ' │ ').join('')
        const currentBranch = isLast ? ' └─' : ' ├─'
        dependentInputElement.dataset.treeviewBranch = ancestorBranch + currentBranch

        dependentInputsWrapper.appendChild(dependentInputElement)
    })

    return e
}


function makeBoilerplateGeneratorHTML(generator: BoilerplateGenerator) {
    const e = (boilerplateGeneratorTemplate.content.cloneNode(true) as HTMLTemplateElement).firstChild as HTMLDivElement
    e.id = getBoilerplateGeneratorId(generator)

    const titleElement = e.querySelector('.boilerplate-generator-title') as HTMLHeadingElement
    const copyOutputButtonElement = e.querySelector('.boilerplate-generator-output-copy-button') as HTMLButtonElement
    const outputElement = e.querySelector('.boilerplate-generator-output') as HTMLParagraphElement
    const outputErrorListElement = e.querySelector('.boilerplate-generator-error-list') as HTMLUListElement
    const presetButtonsListElement = e.querySelector('.boilerplate-generator-presets') as HTMLUListElement
    const formElement = e.querySelector('.boilerplate-generator-form') as HTMLFormElement

    titleElement.innerText = generator.label

    if (generator.terminal_output) outputElement.classList.add('terminal')

    copyOutputButtonElement.addEventListener('click', _ => {
        navigator.clipboard.writeText(outputElement.innerText).then(r => temporaryText(copyOutputButtonElement, !!outputElement.innerText ? 'Copiato!' : 'Nulla da copiare!'))
    })
    copyOutputButtonElement.innerText = generator.copy_button_label || 'Copia output'

    if (!!generator.presets && generator.presets.length > 0) presetButtonsListElement.appendChild(makeBoilerplateGeneratorPresetButtonHTML('UNCHECK-ALL', generator))
    generator.presets?.forEach(preset => presetButtonsListElement.appendChild(makeBoilerplateGeneratorPresetButtonHTML(preset, generator)))

    generator.inputs.forEach(input => formElement.appendChild(makeBoilerplateGeneratorInputHTML(input)))
    formElement.addEventListener('change', _ => updateBoilerplateOutput(formElement, outputElement, generator))

    updateBoilerplateOutput(formElement, outputElement, generator)
    return e
}

