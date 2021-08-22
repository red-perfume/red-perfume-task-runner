'use strict';

/**
 * @file    Processes all tasks
 * @author  TheJaredWilcurt
 */

const fs = require('fs');
const helpers = require('./helpers.js');
const css = require('./css.js');
const html = require('./html.js');

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
 * @param  {object} options     The user's options object
 * @param  {object} taskStyles  Style settings for this task
 * @return {object}             The CSS String and any style errors
 */
function getCssString (options, taskStyles) {
  let cssString = '';
  let styleErrors = [];

  if (taskStyles.in) {
    taskStyles.in.forEach((file) => {
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

  return { cssString, styleErrors };
}

/**
 * Based on task settings produce an HTML string.
 *
 * @param  {object} options  The user's options object
 * @param  {object} item     Contains in/out/data/hooks for one HTML file
 * @return {object}          The HTML String and any markup errors
 */
function getHtmlString (options, item) {
  let markupString = '';
  let markupErrors = [];
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
  return { markupString, markupErrors };
}

/**
 * Saves styles to disk.
 *
 * @param {object} options          The user's options object
 * @param {object} taskStyles       Style settings for this task
 * @param {object} processedStyles  The map of original CSS class names to atomized classes
 * @param {Array}  styleErrors      Array of errors that happened during style processing/saving
 */
function outputAtomizedCSS (options, taskStyles, processedStyles, styleErrors) {
  if (taskStyles.out) {
    try {
      fs.writeFileSync(taskStyles.out, processedStyles.output + '\n');
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
 * @param  {object} options          The user's options object
 * @param  {object} taskScripts      Script settings for this task
 * @param  {object} processedStyles  The map of original CSS class names to atomized classes
 * @return {Array}                   Script errors
 */
function outputAtomizedJSON (options, taskScripts, processedStyles) {
  let scriptErrors = [];
  if (taskScripts.out) {
    try {
      fs.writeFileSync(taskScripts.out, JSON.stringify(processedStyles.classMap, null, 2) + '\n');
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
  runHook(options, task.styles, 'beforeRead', { task });
  const cssData = getCssString(options, task.styles);
  runHook(options, task.styles, 'afterRead', { task, cssData });

  let processedStyles = {};

  const hasStyleFiles = task.styles.in && task.styles.in.length;
  if (hasStyleFiles || task.styles.data) {
    processedStyles = css(options, cssData.cssString, task.uglify);
  }
  runHook(options, task.styles, 'afterProcessed', { task, cssData, processedStyles });

  outputAtomizedCSS(options, task.styles, processedStyles, cssData.styleErrors);
  runHook(options, task.styles, 'afterOutput', { task, cssData, processedStyles });

  return processedStyles;
}

/**
 * Retrieves HTML string based on options.
 * Replaces atomized class names in markup.
 * Outputs HTML to file and/or calls life cycle callback hooks.
 *
 * @param  {object} options          The user's options object
 * @param  {object} task             The task with all settings
 * @param  {object} processedStyles  The map of original CSS class names to atomized classes
 * @return {Array}                   Array of the atomized markup strings from each item.
 */
function processMarkup (options, task, processedStyles) {
  let allProcessedMarkup = [];
  task.markup.forEach(function (item) {
    runHook(options, item, 'beforeRead', { task, item, processedStyles });
    const htmlData = getHtmlString(options, item);
    runHook(options, item, 'afterRead', { task, item, processedStyles, htmlData });


    let processedMarkup = '';
    if (item.in || item.data) {
      processedMarkup = html(options, htmlData.markupString, processedStyles.classMap);
    }
    runHook(options, item, 'afterProcessed', { task, item, processedStyles, htmlData, processedMarkup });

    outputAtomizedHTML(options, item, processedMarkup, htmlData.markupErrors);
    runHook(options, item, 'afterOutput', { task, item, processedStyles, htmlData, processedMarkup });

    allProcessedMarkup.push(processedMarkup);
  });
  return allProcessedMarkup;
}

/**
 * Ouputs atomized CSS to original class name JSON map
 * to file and/or calls life cycle callback hooks.
 *
 * @param  {object} options          The user's options object
 * @param  {object} task             The task with all settings
 * @param  {object} processedStyles  The map of original CSS class names to atomized classes
 * @return {object}                  Object containing script errors
 */
function processScripts (options, task, processedStyles) {
  runHook(options, task.scripts, 'beforeOutput', { task, processedStyles });
  const scriptErrors = outputAtomizedJSON(options, task.scripts, processedStyles);
  const processedScripts = { scriptErrors };
  runHook(options, task.scripts, 'afterOutput', { task, processedStyles, processedScripts });
  return processedScripts;
}

/**
 * Processes a single Red Perfume task including
 * Style, Markup, and Scripts.
 *
 * @example
 * processTask(options, task);
 *
 * @param {object} options  The user's options object
 * @param {object} task     The task with all settings
 */
function processTask (options, task) {
  runHook(options, task, 'beforeTask', { task });

  let processedStyles = {};
  let allProcessedMarkup = [];
  let processedScripts = {};

  if (task.styles) {
    processedStyles = processStyles(options, task);
  }
  if (task.markup) {
    allProcessedMarkup = processMarkup(options, task, processedStyles);
  }
  if (task.scripts) {
    processedScripts = processScripts(options, task, processedStyles);
  }

  runHook(options, task, 'afterTask', { task, processedStyles, allProcessedMarkup, processedScripts });
};

/**
 * Processes all Red Perfume tasks including
 * Style, Markup, and Scripts.
 *
 * @example
 * processTasks(options);
 *
 * @param {object} options  The user's options object
 */
function processTasks (options) {
  options = options || {};
  options.tasks = options.tasks || [];

  options.tasks.forEach(function (task) {
    processTask(options, task);
  });
}

module.exports = processTasks;
