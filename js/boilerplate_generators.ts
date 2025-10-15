
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
    dependants?: BoilerplateGeneratorInput[]
    // Additional attributes for the generated HTML input
    attributes?: { [name: string] : string }
}
type BoilerplateGeneratorSelectInput = BoilerplateGeneratorNativeInput & {
    input_type: 'select'
    /* Options for the select input, either a list of values or a dictionary,
       where the keys are option labels, associated with their value */
    options: string[] | { [label: string] : string }
}
// A boilerplate generator input
/* This is a checkbox that the user can use to choose something to include or a
   particular way to generate the boilerplate. If an `input_type` is specified, an
   additional HTML input of that type will be presented, to include additional data. */
type BoilerplateGeneratorInput =
    BoilerplateGeneratorNativeInput |
    BoilerplateGeneratorSelectInput

// Values read from the boilerplate generator form
type BoilerplateGeneratorInputReturnValues = { [id: BoilerplateGeneratorInputId]: any }

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
    // A function to generate boilerplate from a set of input values
    /* This function should take in a series of input values from the boilerplate generator's form.
       the values are passed in a dictionary, where the keys are the inputs' IDs as set in the `inputs`
       field, and the values are the ones the user entered */
    generatorFn: (formValues: BoilerplateGeneratorInputReturnValues) => string
}


// CONSTANTS

const boilerplateGeneratorTemplate = document.querySelector('template#boilerplate-generator') as HTMLTemplateElement
const boilerplateGeneratorPresetButtonTemplate = document.querySelector('template#boilerplate-generator-preset-button') as HTMLTemplateElement
const boilerplateGeneratorFormInputTemplate = document.querySelector('template#boilerplate-generator-form-input') as HTMLTemplateElement


// FUNCTIONS

const getBoilerplateGeneratorId = (generator: BoilerplateGenerator) => `bpgen-${generator.presets?.length || '0'}-${generator.inputs.length}-${generator.label.toLowerCase().replace(/ /g, '_', )}`

const getBoilerplateGeneratorInputId = (input: BoilerplateGeneratorInput) => `bpgeninput-${input.id.toLowerCase()}-${input.input_type?.toLowerCase() || 'default'}`

function applyPreset(preset: BoilerplateGeneratorPreset, generator: BoilerplateGenerator) {
    generator.inputs.forEach(input => {
        const e = document.querySelector(getBoilerplateGeneratorInputId(input)) as HTMLInputElement

        e.checked = preset.inputs[input.id].checked

        if (!!preset.inputs[input.id].value) {
            const secondaryInput = e.querySelector('label > .secondary-input') as HTMLInputElementExtended
            secondaryInput.value = preset.inputs[input.id].value
        }
    })
}

function makeBoilerplateGeneratorPresetButtonHTML(preset: BoilerplateGeneratorPreset, generator: BoilerplateGenerator) {
    const e = (boilerplateGeneratorPresetButtonTemplate.content.cloneNode(true) as HTMLTemplateElement).firstChild as HTMLButtonElement

    e.innerText = preset.label
    e.addEventListener('click', _ => applyPreset(preset, generator))

    return e
}

function makeBoilerplateGeneratorInputHTML(input: BoilerplateGeneratorInput, generator: BoilerplateGenerator) {
    const e = (boilerplateGeneratorFormInputTemplate.content.cloneNode(true) as HTMLTemplateElement).firstChild as HTMLElement

    const checkboxElement = e.querySelector('input[type="checkbox"]') as HTMLInputElement
    const labelElement = e.querySelector('label') as HTMLLabelElement

    checkboxElement.id = `${getBoilerplateGeneratorInputId(input)}-checkbox`
    labelElement.id = `${getBoilerplateGeneratorInputId(input)}-label`
    labelElement.setAttribute('for', checkboxElement.id)

    if (!!input.input_type) {
        let secondaryInputElement = document.createElement(input.input_type === 'select' ? 'select' : 'input')
        if (input.input_type === 'select') {
            secondaryInputElement = secondaryInputElement as HTMLSelectElement
            Object.entries((input as BoilerplateGeneratorSelectInput).options).forEach(([label, value]) => {
                const optionElement = document.createElement('option')
                // If options are in array form, use the value - else use the specified label
                optionElement.innerText = Array.isArray((input as BoilerplateGeneratorSelectInput).options) ? value : label
                optionElement.value = value
                secondaryInputElement.appendChild(optionElement)
            })
        } else {
            secondaryInputElement.setAttribute('type', input.input_type)
        }
        if (input.attributes) Object.entries(input.attributes).forEach(([name, value]) => {
            secondaryInputElement.setAttribute(name, value)
        })

        labelElement?.appendChild(secondaryInputElement)
    }

    checkboxElement.checked = input.checked || false
    if (!!input.disabled) checkboxElement.disabled = true

    // TODO : implement recursion for input.dependants

    return e
}

function makeBoilerplateGeneratorHTML(generator: BoilerplateGenerator) {
    const e = (boilerplateGeneratorTemplate.content.cloneNode(true) as HTMLTemplateElement).firstChild as HTMLDivElement
    const presetButtons: HTMLButtonElement[] = []
    const formInputs: HTMLElement[] = []

    const titleElement = e.querySelector('.boilerplate-generator-title') as HTMLHeadingElement
    const copyOutputButtonElement = e.querySelector('.boilerplate-generator-output-copy-button') as HTMLButtonElement
    const outputElement = e.querySelector('.boilerplate-generator-output') as HTMLParagraphElement
    const outputErrorListElement = e.querySelector('.boilerplate-generator-error-list') as HTMLUListElement
    const presetButtonsListElement = e.querySelector('.boilerplate-generator-presets') as HTMLUListElement
    const formElement = e.querySelector('.boilerplate-form') as HTMLFormElement

    titleElement.innerText = generator.label

    const copyOutputButtonFeedback = (text: string) => {
        const oldText = copyOutputButtonElement.innerText
        copyOutputButtonElement.disabled = true
        copyOutputButtonElement.innerText = text
        setTimeout(() => {
            copyOutputButtonElement.disabled = true
            copyOutputButtonElement.innerText = oldText
        }, 1000)
    }
    copyOutputButtonElement.addEventListener('click', _ => {
        navigator.clipboard.writeText(outputElement.innerText).then(r => copyOutputButtonFeedback('Copiato!'))
    })

    generator.presets?.forEach(preset => presetButtons.push(makeBoilerplateGeneratorPresetButtonHTML(preset, generator)))

    generator.inputs.forEach(input => formInputs.push(makeBoilerplateGeneratorInputHTML(input, generator)))

    presetButtons.forEach(button => presetButtonsListElement?.appendChild(button))
    formInputs.forEach(input => formElement?.appendChild(input))
    return e
}

