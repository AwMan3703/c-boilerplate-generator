// CONSTANTS
var SOURCE_CODE_EXTENSION = '.c';
var COMPILER_INFO = {
    default_output_filename: 'a.out'
};
var commandOutputParagraph = document.querySelector('p#command-output');
var copyCommandOutputButton = document.querySelector('button#copy-command-output');
var commandBuilderOptionsForm = document.querySelector('form#command-builder-options');
var commandBuilderInput_useCompiler = document.querySelector('form#command-builder-options input#use-compiler');
var commandBuilderInput_platformSelector = document.querySelector('form#command-builder-options select#platform-selector');
var commandBuilderInput_compilerSelector = document.querySelector('form#command-builder-options select#compiler-selector');
var commandBuilderInput_useSourcePath = document.querySelector('form#command-builder-options input#use-source-path');
var commandBuilderInput_sourcePath = document.querySelector('form#command-builder-options input#source-path');
var commandBuilderInput_useOutputPath = document.querySelector('form#command-builder-options input#use-output-path');
var commandBuilderInput_outputPath = document.querySelector('form#command-builder-options input#output-path');
var commandBuilderInput_useVerbose = document.querySelector('form#command-builder-options input#use-verbose');
var commandBuilderInput_useStandard = document.querySelector('form#command-builder-options input#use-standard');
var commandBuilderInput_standardSelector = document.querySelector('form#command-builder-options select#standard-selector');
var commandBuilderInput_useWarningAll = document.querySelector('form#command-builder-options input#use-warning-all');
var commandBuilderInput_usePedantic = document.querySelector('form#command-builder-options input#use-pedantic');
var commandBuilderInput_usePedanticErrors = document.querySelector('form#command-builder-options input#use-pedantic-errors');
var commandBuilderInput_runBinaryAfterCompiling = document.querySelector('form#command-builder-options input#run-binary-after-compiling');
var commandBuilderInput_clearScreenBeforeRunning = document.querySelector('form#command-builder-options input#clear-screen-before-running');
var commandBuilderInput_deleteBinaryAfterRunning = document.querySelector('form#command-builder-options input#delete-binary-after-running');
var updateCommandOutputButton = document.querySelector('#update-output-button');
var copyBoilerplateButton = document.querySelector('#copy-c-boilerplate');
// FUNCTIONS
function adaptTextInputToValueLength(e) {
    var text = (!e.value || e.value === '') ? e.placeholder : e.value;
    e.size = Math.max(text.length, 5);
}
function getCommandBuilderFormData() {
    var options = {};
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
    var command = [];
    // Compiler command
    command.push("".concat(options.compilerName));
    // if no source path is specified, return just this
    if (!options.sourceCodePath)
        return command.join(' ');
    // Compiler options
    if (options.sourceCodePath)
        command.push("".concat(options.sourceCodePath));
    if (options.binaryOutputPath && options.binaryOutputPath !== COMPILER_INFO.default_output_filename)
        command.push("-o ".concat(options.binaryOutputPath));
    if (options.verbose)
        command.push("-v");
    if (options.standard)
        command.push("-std=".concat(options.standard));
    if (options.warningAll)
        command.push("-Wall");
    if (options.pedantic) {
        if (options.pedanticErrors)
            command.push("-pedantic-errors");
        else
            command.push("-pedantic");
    }
    command.push('&&');
    // Run after compiling
    if (options.runBinaryWhenCompiled) {
        // Clear
        if (options.clearScreenBeforeRunning) {
            command.push("clear");
            command.push('&&');
        }
        // Run
        command.push("".concat(options.binaryOutputPath ? options.binaryOutputPath : COMPILER_INFO.default_output_filename));
        command.push('&&');
        // Delete
        if (options.deleteBinaryAfterRunning) {
            command.push("rm ".concat(options.binaryOutputPath ? options.binaryOutputPath : COMPILER_INFO.default_output_filename));
            command.push('&&');
        }
    }
    // Lazy aah solution cz ion wanna keep track of what the last command is
    if (command[command.length - 1] === '&&')
        command.pop();
    return command.join(' ');
}
function updateCommandOutput() {
    var options = getCommandBuilderFormData();
    commandOutputParagraph.innerText = generateCommand(options);
    document.title = "".concat(options.compilerName.toUpperCase(), " command generator");
}
function copyCommandToClipboard() {
    navigator.clipboard.writeText(commandOutputParagraph.innerText)
        .then(function (_) {
        var originalLabel = copyCommandOutputButton.innerText;
        var originalEvents = copyCommandOutputButton.style.pointerEvents;
        copyCommandOutputButton.innerText = commandOutputParagraph.innerText.length > 0 ? 'Copiato!' : 'Nulla da copiare!';
        copyCommandOutputButton.style.pointerEvents = 'none';
        setTimeout(function (_) {
            copyCommandOutputButton.innerText = originalLabel;
            copyCommandOutputButton.style.pointerEvents = originalEvents;
        }, 2000);
    });
}
// SCRIPT
copyCommandOutputButton.addEventListener('click', copyCommandToClipboard);
copyCommandOutputButton.addEventListener('touchend', copyCommandToClipboard);
commandBuilderInput_sourcePath.addEventListener('input', function (_) {
    var e = commandBuilderInput_sourcePath;
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
commandBuilderInput_sourcePath.addEventListener('input', function (_) { return adaptTextInputToValueLength(commandBuilderInput_sourcePath); });
commandBuilderInput_outputPath.addEventListener('input', function (_) {
    var e = commandBuilderInput_outputPath;
    if (!e.value || e.value === '' || e.value === './') {
        e.value = '';
        commandBuilderInput_useOutputPath.checked = false;
        return;
    }
    e.value = (!e.value.startsWith('./') ? './' : '') + (e.value !== '.' ? e.value : '');
    commandBuilderInput_useOutputPath.checked = true;
});
commandBuilderInput_outputPath.addEventListener('input', function (_) { return adaptTextInputToValueLength(commandBuilderInput_outputPath); });
commandBuilderOptionsForm.addEventListener('change', updateCommandOutput);
commandBuilderOptionsForm.addEventListener('submit', function (e) {
    e.preventDefault();
    updateCommandOutput();
});
updateCommandOutputButton.addEventListener('click', updateCommandOutput);
var c_boilerplate = '' +
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
copyBoilerplateButton.addEventListener('click', function (_) {
    navigator.clipboard.writeText(c_boilerplate);
});
updateCommandOutput();
setInterval(function (_) { return commandOutputParagraph.classList.toggle('cursor'); }, 500);
