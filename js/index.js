"use strict";
// CONSTANTS
const SOURCE_CODE_EXTENSION = '.c';
const COMPILER_INFO = {
    default_output_filename: 'a.out'
};
const commandOutputParagraph = document.querySelector('p#command-output');
const copyCommandOutputButton = document.querySelector('button#copy-command-output');
const commandBuilderOptionsForm = document.querySelector('form#command-builder-options');
const commandBuilderInput_useCompiler = document.querySelector('form#command-builder-options input#use-compiler');
const commandBuilderInput_platformSelector = document.querySelector('form#command-builder-options select#platform-selector');
const commandBuilderInput_compilerSelector = document.querySelector('form#command-builder-options select#compiler-selector');
const commandBuilderInput_useSourcePath = document.querySelector('form#command-builder-options input#use-source-path');
const commandBuilderInput_sourcePath = document.querySelector('form#command-builder-options input#source-path');
const commandBuilderInput_useOutputPath = document.querySelector('form#command-builder-options input#use-output-path');
const commandBuilderInput_outputPath = document.querySelector('form#command-builder-options input#output-path');
const commandBuilderInput_useVerbose = document.querySelector('form#command-builder-options input#use-verbose');
const commandBuilderInput_useStandard = document.querySelector('form#command-builder-options input#use-standard');
const commandBuilderInput_standardSelector = document.querySelector('form#command-builder-options select#standard-selector');
const commandBuilderInput_useWarningAll = document.querySelector('form#command-builder-options input#use-warning-all');
const commandBuilderInput_usePedantic = document.querySelector('form#command-builder-options input#use-pedantic');
const commandBuilderInput_usePedanticErrors = document.querySelector('form#command-builder-options input#use-pedantic-errors');
const commandBuilderInput_runBinaryAfterCompiling = document.querySelector('form#command-builder-options input#run-binary-after-compiling');
const commandBuilderInput_clearScreenBeforeRunning = document.querySelector('form#command-builder-options input#clear-screen-before-running');
const commandBuilderInput_deleteBinaryAfterRunning = document.querySelector('form#command-builder-options input#delete-binary-after-running');
const updateCommandOutputButton = document.querySelector('#update-output-button');
const copyBoilerplateButton = document.querySelector('#copy-c-boilerplate');
// FUNCTIONS
function adaptTextInputToValueLength(e) {
    const text = (!e.value || e.value === '') ? e.placeholder : e.value;
    e.size = Math.max(text.length, 5);
}
function getCommandBuilderFormData() {
    const options = {};
    options.platformName = commandBuilderInput_platformSelector.selectedOptions[0].value;
    options.compilerName = commandBuilderInput_useCompiler ? commandBuilderInput_compilerSelector.selectedOptions[0].value : '';
    options.sourceCodePath = commandBuilderInput_useSourcePath.checked ? commandBuilderInput_sourcePath.value : '';
    options.binaryOutputPath = commandBuilderInput_useOutputPath.checked ? commandBuilderInput_outputPath.value : '';
    options.verbose = commandBuilderInput_useVerbose.checked;
    options.standard = commandBuilderInput_useStandard.checked ? commandBuilderInput_standardSelector.selectedOptions[0].value : '';
    options.warningAll = commandBuilderInput_useWarningAll.checked;
    options.pedantic = commandBuilderInput_usePedantic.checked;
    options.pedanticErrors = commandBuilderInput_usePedanticErrors.checked;
    options.runBinaryWhenCompiled = commandBuilderInput_runBinaryAfterCompiling.checked;
    options.clearScreenBeforeRunning = commandBuilderInput_clearScreenBeforeRunning.checked;
    options.deleteBinaryAfterRunning = commandBuilderInput_deleteBinaryAfterRunning.checked;
    return options;
}
// EXAMPLE: clear && gcc my/source/code.c -o my/binary && ./my/binary && rm ./my/binary
function generateCommand(options) {
    let command = [];
    // Compiler command
    command.push(`${options.compilerName}`);
    // if no source path is specified, return just this
    if (!options.sourceCodePath)
        return command.join(' ');
    // Compiler options
    if (options.sourceCodePath)
        command.push(`${options.sourceCodePath}`);
    if (options.binaryOutputPath && options.binaryOutputPath !== COMPILER_INFO.default_output_filename)
        command.push(`-o ${options.binaryOutputPath}`);
    if (options.verbose)
        command.push(`-v`);
    if (options.standard)
        command.push(`-std=${options.standard}`);
    if (options.warningAll)
        command.push(`-Wall`);
    if (options.pedantic) {
        if (options.pedanticErrors)
            command.push(`-pedantic-errors`);
        else
            command.push(`-pedantic`);
    }
    command.push('&&');
    // Run after compiling
    if (options.runBinaryWhenCompiled) {
        // Clear
        if (options.clearScreenBeforeRunning) {
            command.push(`clear`);
            command.push('&&');
        }
        // Run
        command.push(`${options.binaryOutputPath ? options.binaryOutputPath : COMPILER_INFO.default_output_filename}`);
        command.push('&&');
        // Delete
        if (options.deleteBinaryAfterRunning) {
            command.push(`rm ${options.binaryOutputPath ? options.binaryOutputPath : COMPILER_INFO.default_output_filename}`);
            command.push('&&');
        }
    }
    // Lazy aah solution cz ion wanna keep track of what the last command is
    if (command[command.length - 1] === '&&')
        command.pop();
    return command.join(' ');
}
function updateCommandOutput() {
    const options = getCommandBuilderFormData();
    commandOutputParagraph.innerText = generateCommand(options);
    document.title = `${options.compilerName.toUpperCase()} command generator`;
}
function copyCommandToClipboard() {
    navigator.clipboard.writeText(commandOutputParagraph.innerText)
        .then(_ => {
        const originalLabel = copyCommandOutputButton.innerText;
        const originalEvents = copyCommandOutputButton.style.pointerEvents;
        copyCommandOutputButton.innerText = commandOutputParagraph.innerText.length > 0 ? 'Copiato!' : 'Nulla da copiare!';
        copyCommandOutputButton.style.pointerEvents = 'none';
        setTimeout(_ => {
            copyCommandOutputButton.innerText = originalLabel;
            copyCommandOutputButton.style.pointerEvents = originalEvents;
        }, 2000);
    });
}
// SCRIPT
copyCommandOutputButton.addEventListener('click', copyCommandToClipboard);
copyCommandOutputButton.addEventListener('touchend', copyCommandToClipboard);
commandBuilderInput_sourcePath.addEventListener('input', _ => {
    const e = commandBuilderInput_sourcePath;
    if (!e.value || e.value === '' || e.value === SOURCE_CODE_EXTENSION) {
        e.value = '';
        return;
    }
    if (e.value.endsWith(SOURCE_CODE_EXTENSION) && e.value !== SOURCE_CODE_EXTENSION) {
        return;
    }
    e.value += SOURCE_CODE_EXTENSION;
    e.selectionStart = e.selectionEnd = e.value.length - 2;
});
commandBuilderInput_sourcePath.addEventListener('input', _ => adaptTextInputToValueLength(commandBuilderInput_sourcePath));
commandBuilderInput_outputPath.addEventListener('input', _ => {
    const e = commandBuilderInput_outputPath;
    if (!e.value || e.value === '' || e.value === './') {
        e.value = '';
        commandBuilderInput_useOutputPath.checked = false;
        return;
    }
    e.value = (!e.value.startsWith('./') ? './' : '') + (e.value !== '.' ? e.value : '');
    commandBuilderInput_useOutputPath.checked = true;
});
commandBuilderInput_outputPath.addEventListener('input', _ => adaptTextInputToValueLength(commandBuilderInput_outputPath));
commandBuilderOptionsForm.addEventListener('change', updateCommandOutput);
commandBuilderOptionsForm.addEventListener('submit', e => {
    e.preventDefault();
    updateCommandOutput();
});
updateCommandOutputButton.addEventListener('click', updateCommandOutput);
const c_boilerplate = '' +
    '/*\n' +
    '\t\n' +
    '*/\n' +
    '\n' +
    '#include <stdio.h>\n' +
    '\n' +
    'int main(int argc, char * argv[]) {\n' +
    '\n' +
    '\treturn 0;\n' +
    '}';
copyBoilerplateButton.addEventListener('click', _ => {
    navigator.clipboard.writeText(c_boilerplate);
});
updateCommandOutput();
setInterval(_ => commandOutputParagraph.classList.toggle('cursor'), 500);
