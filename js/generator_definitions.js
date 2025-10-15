"use strict";
const compile_command_generator = {
    label: 'Comando di Compilazione',
    inputs: [
        {
            id: 'i-platform',
            input_type: "select",
            options: { 'macOS': 'macos', 'Linux & WSL': 'linux', 'Windows': 'windows' },
            label: 'Piattaforma',
            checked: true,
            disabled: true
        }, {
            id: 'i-use-compiler',
            input_type: "select",
            options: { 'GCC': 'gcc', 'CLang': 'clang' },
            label: 'Compiler',
            checked: true,
            disabled: true
        }, {
            id: 'i-source-path',
            input_type: "text",
            label: 'Percorso codice sorgente',
            attributes: { 'placeholder': 'relativo a cwd' },
            checked: true,
            disabled: true
        }, {
            id: 'i-output-path',
            input_type: "text",
            label: 'Percorso eseguibile',
            token: '-o',
            attributes: { 'placeholder': 'relativo a cwd' }
        }, {
            id: 'i-verbose-output',
            label: 'Output prolisso'
        }, {
            id: 'i-standard',
            input_type: "select",
            label: 'Standard',
            options: { 'C89 (ANSI)': 'c89', 'C90': 'c90', 'C95': 'c95', 'C99': 'c99', 'C11': 'c11', 'C17': 'c17', 'C23': 'c23' },
            token: '-std'
        }, {
            id: 'i-all-warnings',
            label: 'Visualizza tutti i warning',
            token: '-Wall'
        }, {
            id: 'i-pedantic',
            label: 'Modalità pedantic',
            token: '-pedantic',
            dependants: [{
                    id: 'i-pedantic-errors',
                    label: '(come errori)',
                    token: '-pedantic-errors'
                }]
        }, {
            id: 'i-run-after-compiling',
            label: 'Esegui dopo la compilazione',
            dependants: [{
                    id: 'i-clear-before-running',
                    label: 'Pulisci il terminale prima di eseguire'
                }, {
                    id: 'i-delete-after-running',
                    label: 'Rimuovi l\'eseguibile dopo l\'esecuzione'
                }]
        }
    ],
    generatorFn: (formValues) => {
        for (const [k, v] of Object.entries(formValues)) { }
        return '';
    }
};
console.log(makeBoilerplateGeneratorHTML(compile_command_generator));
