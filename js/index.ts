// CONSTANTS

const SOURCE_CODE_EXTENSION = '.c'
const COMPILER_INFO = {
    default_output_filename: 'a.out'
}

const boilerplateGeneratorsParent = document.body.querySelector('.boilerplate-generators-list') as HTMLElement
const boilerplateGenerators = () => boilerplateGeneratorsParent.querySelectorAll('.boilerplate-generator')


// BOILERPLATE GENERATOR DEFINITIONS

const generators: BoilerplateGenerator[] = [
    {
        label: 'Comando di Compilazione',
        terminal_output: true,
        copy_button_label: 'Copia comando',
        inputs: [
            {
                id: 'i-platform',
                label: 'Piattaforma',
                input_type: "select",
                options: {'macOS':'macos','Linux & WSL':'linux','[DISABLED]Windows':'windows'},
                checked: true,
                disabled: true
            }, {
                id: 'i-use-compiler',
                label: 'Compiler',
                input_type: "select",
                options: {'GCC':'gcc','[DISABLED]CLang':'clang'},
                checked: true,
                disabled: true
            }, {
                id: 'i-source-path',
                label: 'Percorso codice sorgente',
                input_type: "text",
                attributes: {'placeholder':'relativo a cwd'},
                checked: true,
                disabled: true
            }, {
                id: 'i-output-path',
                label: 'Percorso eseguibile',
                input_type: "text",
                token: '-o',
                attributes: {'placeholder':'relativo a cwd'}
            }, {
                id: 'i-verbose-output',
                label: 'Output prolisso',
                token: '-v'
            }, {
                id: 'i-standard',
                input_type: "select",
                label: 'Standard',
                options: {'C89 (ANSI)':'c89','C90':'c90','C95':'c95','C99':'c99','C11':'c11','C17':'c17','C23':'c23'},
                token: '-std'
            }, {
                id: 'i-all-warnings',
                label: 'Visualizza tutti i warning',
                token: '-Wall'
            }, {
                id: 'i-pedantic',
                label: 'Modalità pedantic',
                token: '-pedantic',
                dependents: [{
                    id: 'i-pedantic-errors',
                    label: '(come errori)',
                    token: '-pedantic-errors'
                }]
            }, {
                id: 'i-run-after-compiling',
                label: 'Esegui dopo la compilazione',
                dependents: [{
                    id: 'i-clear-before-running',
                    label: 'Pulisci il terminale prima di eseguire',
                    token: 'clear'
                }, {
                    id: 'i-delete-after-running',
                    label: 'Rimuovi l\'eseguibile dopo l\'esecuzione',
                    token: 'rm'
                }]
            },
        ],
        generator_fn: formValues => {
            // FORM FEEDBACK
            const sourcePathInput = formValues['i-source-path'].input as HTMLInputElement
            if (!sourcePathInput.value || sourcePathInput.value === '' || sourcePathInput.value === SOURCE_CODE_EXTENSION) {
                sourcePathInput.value = ''
            } else {
                if (sourcePathInput.value.endsWith(SOURCE_CODE_EXTENSION) && sourcePathInput.value !== SOURCE_CODE_EXTENSION) {
                } else {
                    sourcePathInput.value += SOURCE_CODE_EXTENSION
                    sourcePathInput.selectionStart = sourcePathInput.selectionEnd = sourcePathInput.value.length - 2
                }
            }
            adaptTextInputToValueLength(sourcePathInput)
            sourcePathInput.classList.toggle('invalid-input', !sourcePathInput.value)

            const outputPathCheckbox = formValues['i-output-path'].checkbox as HTMLInputElement
            const outputPathInput = formValues['i-output-path'].input as HTMLInputElement
            if (!outputPathInput.value || outputPathInput.value === '' || outputPathInput.value === './') {
                outputPathInput.value = ''
                outputPathCheckbox.checked = false
            } else {
                outputPathInput.value = (!outputPathInput.value.startsWith('./') ? './' : '') + (outputPathInput.value !== '.' ? outputPathInput.value : '')
                outputPathCheckbox.checked = true
            }
            adaptTextInputToValueLength(outputPathInput)

            // BUILD COMMAND
            const command: string[] = []

            // Compiler command
            command.push(`${formValues['i-use-compiler'].input?.value}`)
            // if no source path is specified, return just this
            if (!sourcePathInput.value) return command.join(' ')
            // Compiler options
            else command.push(`${sourcePathInput.value}`)
            if (formValues['i-output-path'].checkbox.checked && formValues['i-output-path'].input?.value && formValues['i-output-path'].input?.value !== COMPILER_INFO.default_output_filename) command.push(`-o ${formValues['i-output-path'].input?.value}`)
            if (formValues['i-verbose-output'].checkbox.checked) command.push(`-v`)
            if (formValues['i-standard'].checkbox.checked) command.push(`-std=${formValues['i-standard'].input?.value}`)
            if (formValues['i-all-warnings'].checkbox.checked) command.push(`-Wall`)
            if (formValues['i-pedantic'].checkbox.checked) { if (formValues['i-pedantic-errors'].checkbox.checked) command.push(`-pedantic-errors`); else command.push(`-pedantic`) }
            command.push('&&')
            // Run after compiling
            if (formValues['i-run-after-compiling'].checkbox.checked) {
                // Clear
                if (formValues['i-clear-before-running'].checkbox.checked) {
                    command.push(`clear`)
                    command.push('&&')
                }
                // Run
                command.push(`${formValues['i-output-path'].input?.value ? formValues['i-output-path'].input?.value : COMPILER_INFO.default_output_filename}`)
                command.push('&&')
                // Delete
                if (formValues['i-delete-after-running'].checkbox.checked) {
                    command.push(`rm ${formValues['i-output-path'].input?.value ? formValues['i-output-path'].input?.value : COMPILER_INFO.default_output_filename}`)
                    command.push('&&')
                }
            }

            // Lazy aah solution cz ion wanna keep track of which one is the last piece
            if (command[command.length-1] === '&&') command.pop()
            return command.join(' ')
        }
    }, {
        label: 'Base per programmi C',
        copy_button_label: 'Copia codice',
        inputs: [
            {
                id: 'i-initial-comment',
                label: 'Commento iniziale',
                token: '/* */'
            }, {
                id: 'i-include-stdio',
                label: 'Includi <stdio.h>',
                token: '#include <stdio.h>'
            }, {
                id: 'i-include-stdlib',
                label: 'Includi <stdlib.h>',
                token: '#include <stdlib.h>'
            }, {
                id: 'i-add-i-variable',
                label: 'Aggiungi variabile iterativa',
                token: 'int i;'
            }, {
                id: 'i-return-zero',
                label: 'Restituisci zero',
                token: 'return 0;',
                checked: true
            }
        ],
        presets: [
            {
                label: 'Esercizio università',
                inputs: {
                    'i-initial-comment':{checked:true},
                    'i-include-stdio':{checked:true},
                    'i-include-stdlib':{checked:false},
                    'i-add-i-variable':{checked:false},
                    'i-return-zero':{checked:true}
                }
            }
        ],
        generator_fn: formValues => {
            const code: string[] = []

            if (formValues['i-initial-comment'].checkbox.checked) {
                code.push(`/*`)
                code.push(`\t`)
                code.push(`*/`)
                code.push(``)
            }
            if (formValues['i-include-stdio'].checkbox.checked) code.push(`#include <stdio.h>`)
            if (formValues['i-include-stdlib'].checkbox.checked) code.push(`#include <stdlib.h>`)
            if (formValues['i-include-stdio'].checkbox.checked || formValues['i-include-stdlib'].checkbox.checked) code.push(``)
            // Main function body
            code.push(`int main(int argc, char * argv[]) {`)
            if (formValues['i-add-i-variable'].checkbox.checked) code.push(`\tint i;`)
            code.push(`\t`)
            if (formValues['i-return-zero'].checkbox.checked) code.push(`\treturn 0;`)
            code.push(`}`)

            return code.join('\n')
        }
    }
]


// FUNCTIONS

function collapseAllBoilerplateGenerators() {
    const uncollapsedElements = boilerplateGeneratorsParent.querySelectorAll('.boilerplate-generator:not(.collapsed)')
    uncollapsedElements.forEach(uncollapsed => uncollapsed.classList.add('collapsed'))
}

function setUncollapsedBoilerplateGenerator(index: number): boolean {
    collapseAllBoilerplateGenerators()
    const target = boilerplateGeneratorsParent.querySelector(`.boilerplate-generator[data-index="${index}"]`)
    target?.classList.remove('collapsed')
    return !!target && !target.classList.contains('collapsed')
}


// SCRIPT

let generatorIndex = 0
let uncollapsedGeneratorIndex = 0

generators.forEach(g => {
    const generatorHTML = makeBoilerplateGeneratorHTML(g)
    const thisIndex = generatorIndex
    generatorHTML.dataset.index = `${thisIndex}`
    generatorHTML.querySelector('.boilerplate-generator-title')?.addEventListener('click', _ => {
        setUncollapsedBoilerplateGenerator(thisIndex)
        uncollapsedGeneratorIndex = thisIndex
    })
    boilerplateGeneratorsParent.appendChild(generatorHTML)
    generatorIndex++
})

window.addEventListener('keydown', e => {
    let direction
    if (e.key === 'ArrowUp' || e.keyCode === 38)
        direction = -1
    else if (e.key === 'ArrowDown' || e.keyCode === 40)
        direction = 1
    else
        return

    const boilerplateGeneratorsList = boilerplateGenerators()
    let newIndex = uncollapsedGeneratorIndex + direction
    if (newIndex < 0) newIndex = boilerplateGeneratorsList.length - 1
    else if (newIndex > boilerplateGeneratorsList.length - 1) newIndex = 0
    const success = setUncollapsedBoilerplateGenerator(newIndex)
    if (success) uncollapsedGeneratorIndex = newIndex
})

setUncollapsedBoilerplateGenerator(uncollapsedGeneratorIndex)
setInterval(() => document.body.classList.toggle('cursor'), 500)