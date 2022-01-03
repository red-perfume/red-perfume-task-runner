'use strict';

/**
 * @file    Processes all tasks
 * @author  TheJaredWilcurt
 */

const fs = require('fs');

const redPerfumeCss = require('red-perfume-css');
const redPerfumeHtml = require('red-perfume-html');

const helpers = require('./helpers.js');
const minifiers = require('./minifiers.js');

/**
 * Runs a callback hook if it exists.
 *
 * @param {object} options        The user's options object
 * @param {object} hookContainer  The object that has a key of hooks
 * @param {string} hook           The hook to run
 * @param {object} data           The data to pass in to the callback
 */
function runHook (options, hookContainer, hook, data) {
  if (hookContainer.hooks && hookContainer.hooks[hook]) {
    hookContainer.hooks[hook](options, data);
  }
}

/**
 * Based on task settings concatenate all CSS inputs
 * into one string.
 *
 * @param  {object} options      The user's options object
 * @param  {object} taskStyles   Style settings for this task
 * @param  {object} styleErrors  Array to store style related errors
 * @return {string}              The CSS String
 */
function getCssString (options, taskStyles, styleErrors) {
  let cssString = '';

  if (taskStyles.in) {
    taskStyles.in.forEach(function (file) {
      try {
        cssString = cssString + String(fs.readFileSync(file));
      } catch (err) {
        helpers.throwError(options, 'Error reading style file: ' + file, err);
        styleErrors.push(err);
      }
    });
  }
  if (taskStyles.data) {
    cssString = cssString + taskStyles.data;
  }

  return cssString;
}

/**
 * Based on task settings produce an HTML string.
 *
 * @param  {object} options       The user's options object
 * @param  {object} item          Contains in/out/data/hooks for one HTML file
 * @param  {Array}  markupErrors  Array to store markup related errors
 * @return {string}               The HTML String
 */
function getHtmlString (options, item, markupErrors) {
  let markupString = '';
  if (item.in) {
    try {
      markupString = markupString + String(fs.readFileSync(item.in));
    } catch (err) {
      helpers.throwError(options, 'Error reading markup file: ' + item.in, err);
      markupErrors.push(err);
    }
  }
  if (item.data) {
    markupString = markupString + item.data;
  }
  return markupString;
}

/**
 * Saves styles to disk.
 *
 * @param {object} options      The user's options object
 * @param {object} taskStyles   Style settings for this task
 * @param {object} atomizedCss  The atomized classes
 * @param {Array}  styleErrors  Array of errors that happened during style processing/saving
 */
function outputAtomizedCSS (options, taskStyles, atomizedCss, styleErrors) {
  if (taskStyles.out) {
    try {
      fs.writeFileSync(taskStyles.out, atomizedCss + '\n');
    } catch (err) {
      helpers.throwError(options, 'Error writing CSS file: ' + taskStyles.out, err);
      styleErrors.push(err);
    }
  }
}

/**
 * Saves markup to disk.
 *
 * @param {object} options          The user's options object
 * @param {object} item             The in/out/data/hooks object for this markup file
 * @param {string} processedMarkup  The modified markup with atomized classes
 * @param {Array}  markupErrors     Array of errors that happened during markup processing/saving
 */
function outputAtomizedHTML (options, item, processedMarkup, markupErrors) {
  if (item.out) {
    try {
      fs.writeFileSync(item.out, processedMarkup + '\n');
    } catch (err) {
      helpers.throwError(options, 'Error writing markup file: ' + item.out, err);
      markupErrors.push(err);
    }
  }
}

/**
 * Saves the JSON to disk.
 *
 * @param  {object} options      The user's options object
 * @param  {object} taskScripts  Script settings for this task
 * @param  {object} classMap     The map of original CSS class names to atomized classes
 * @return {Array}               Script errors
 */
function outputAtomizedJSON (options, taskScripts, classMap) {
  let scriptErrors = [];
  if (taskScripts.out) {
    try {
      const minifiedJSON = minifiers.json(options, classMap, taskScripts.minify, scriptErrors);
      fs.writeFileSync(taskScripts.out, minifiedJSON + '\n');
    } catch (scriptErr) {
      helpers.throwError(options, 'Error writing script file: ' + taskScripts.out, scriptErr);
      scriptErrors.push(scriptErr);
    }
  }
  return scriptErrors;
}

/**
 * Retrieves CSS string based on options.
 * Atomizes and uglifies CSS.
 * Outputs CSS to file and/or calls life cycle callback hooks.
 *
 * @param  {object} options  The user's options object
 * @param  {object} task     The task with all settings
 * @return {object}          The map of original CSS class names to atomized classes & errors
 */
function processStyles (options, task) {
  let atomizedCss = '';
  let classMap = {};
  runHook(options, task.styles, 'beforeRead', { task });
  let styleErrors = [];
  const inputCss = getCssString(options, task.styles, styleErrors);
  runHook(options, task.styles, 'afterRead', { task, inputCss, styleErrors });

  if (inputCss) {
    const redPerfumeCssResult = redPerfumeCss({
      verbose: options.verbose,
      customLogger: options.customLogger,
      input: inputCss,
      uglify: task.uglify
    });
    styleErrors = [
      ...styleErrors,
      ...redPerfumeCssResult.styleErrors
    ];
    atomizedCss = redPerfumeCssResult.atomizedCss;
    classMap = redPerfumeCssResult.classMap;
  }

  if (task.styles && task.styles.minify) {
    atomizedCss = minifiers.css(options, atomizedCss, task.styles.minify, styleErrors);
  }

  runHook(options, task.styles, 'afterProcessed', { task, inputCss, atomizedCss, classMap, styleErrors });

  outputAtomizedCSS(options, task.styles, atomizedCss, styleErrors);
  runHook(options, task.styles, 'afterOutput', { task, inputCss, atomizedCss, classMap, styleErrors });

  return { inputCss, atomizedCss, classMap, styleErrors };
}

/**
 * Retrieves HTML string based on options.
 * Replaces atomized class names in markup.
 * Outputs HTML to file and/or calls life cycle callback hooks.
 *
 * @param  {object} options   The user's options object
 * @param  {object} task      The task with all settings
 * @param  {object} classMap  The map of original CSS class names to atomized classes
 * @return {Array}            Array of the atomized markup strings from each item.
 */
function processMarkup (options, task, classMap) {
  const allAtomizedMarkup = [];
  const allInputMarkup = [];
  let markupErrors = [];
  task.markup.forEach(function (subTask) {
    let atomizedHtml = '';
    runHook(options, subTask, 'beforeRead', { task, subTask, classMap });
    const inputHtml = getHtmlString(options, subTask, markupErrors);
    runHook(options, subTask, 'afterRead', { task, subTask, classMap, inputHtml, markupErrors });

    if (inputHtml) {
      const atomizedHtmlResult = redPerfumeHtml({
        verbose: options.verbose,
        customLogger: options.customLogger,
        input: inputHtml,
        classMap
      });
      atomizedHtml = atomizedHtmlResult.atomizedHtml;
      markupErrors = [
        ...markupErrors,
        ...atomizedHtmlResult.markupErrors
      ];
    }

    if (subTask.minify) {
      atomizedHtml = minifiers.html(options, atomizedHtml, subTask.minify, markupErrors);
    }

    runHook(options, subTask, 'afterProcessed', { task, subTask, classMap, inputHtml, atomizedHtml, markupErrors });

    outputAtomizedHTML(options, subTask, atomizedHtml, markupErrors);
    runHook(options, subTask, 'afterOutput', { task, subTask, classMap, inputHtml, atomizedHtml, markupErrors });

    allInputMarkup.push(inputHtml);
    allAtomizedMarkup.push(atomizedHtml);
  });
  return { allInputMarkup, allAtomizedMarkup, markupErrors };
}

/**
 * Ouputs atomized CSS to original class name JSON map
 * to file and/or calls life cycle callback hooks.
 *
 * @param  {object} options   The user's options object
 * @param  {object} task      The task with all settings
 * @param  {object} classMap  The map of original CSS class names to atomized classes
 * @return {object}           Object containing script errors
 */
function processScripts (options, task, classMap) {
  runHook(options, task.scripts, 'beforeOutput', { task, classMap });
  const scriptErrors = outputAtomizedJSON(options, task.scripts, classMap);
  runHook(options, task.scripts, 'afterOutput', { task, classMap, scriptErrors });
  return { scriptErrors };
}

/**
 * Processes a single Red Perfume task including
 * Style, Markup, and Scripts.
 *
 * @example
 * processTask(options, task);
 *
 * @param  {object} options  The user's options object
 * @param  {object} task     The task with all settings
 * @return {object}          All the variables to be emitted from final callback hook
 */
function processTask (options, task) {
  runHook(options, task, 'beforeTask', { task });

  let inputCss;
  let atomizedCss;
  let classMap;
  let styleErrors;
  if (task.styles) {
    ({ inputCss, atomizedCss, classMap, styleErrors } = processStyles(options, task));
  }

  let allInputMarkup;
  let allAtomizedMarkup;
  let markupErrors;
  if (task.markup) {
    ({ allInputMarkup, allAtomizedMarkup, markupErrors } = processMarkup(options, task, classMap));
  }

  let scriptErrors;
  if (task.scripts) {
    ({ scriptErrors } = processScripts(options, task, classMap));
  }

  const finalOutput = { task, inputCss, atomizedCss, classMap, allInputMarkup, allAtomizedMarkup, styleErrors, markupErrors, scriptErrors };
  runHook(options, task, 'afterTask', finalOutput);
  return finalOutput;
};

/**
 * Processes all Red Perfume tasks including
 * Style, Markup, and Scripts.
 *
 * @example
 * processTasks(options);
 *
 * @param  {object} options  The user's options object
 * @return {object}          All the variables to be emitted from final callback hook
 */
function processTasks (options) {
  options = options || {};
  options.tasks = options.tasks || [];

  const finalOutputs = [];
  options.tasks.forEach(function (task) {
    finalOutputs.push(processTask(options, task));
  });

  return finalOutputs;
}

module.exports = processTasks;
