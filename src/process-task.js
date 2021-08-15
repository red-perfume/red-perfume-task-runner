'use strict';

/**
 * @file    Processes a single task
 * @author  TheJaredWilcurt
 */

const fs = require('fs');
const helpers = require('./helpers.js');
const css = require('./css.js');
const html = require('./html.js');

/**
 * Based on task settings concatenate all CSS inputs
 * into one string.
 *
 * @example
 * let cssData = getCssString(options, task.styles);
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
 * @example
 * let htmlData = getHtmlString(options, task.styles);
 *
 * @param  {object} options  The user's options object
 * @param  {object} item     Contains in/out/data/result for one HTML file
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
 * Saves styles to disk and/or runs the result callback.
 *
 * @example
 * outputAtomizedCSS(options, task.styles, processedStyles, cssData.styleErrors);
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
  if (taskStyles.result) {
    if (!styleErrors.length) {
      styleErrors = undefined;
    }
    taskStyles.result(processedStyles.output, styleErrors);
  }
}

/**
 * Saves markup to disk and/or runs the result callback.
 *
 * @example
 * outputAtomizedHTML(options, item, processedMarkup, htmlData.markupErrors);
 *
 * @param {object} options          The user's options object
 * @param {object} item             The in/out/data/result object for this markup file
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
  if (item.result) {
    if (!markupErrors.length) {
      markupErrors = undefined;
    }
    item.result(processedMarkup, markupErrors);
  }
}

/**
 * Saves the JSON to disk and/or runs the result callback.
 *
 * @example
 * outputAtomizedJSON(options, task.scripts, processedStyles);
 *
 * @param {object} options          The user's options object
 * @param {object} taskScripts      Script settings for this task
 * @param {object} processedStyles  The map of original CSS class names to atomized classes
 */
function outputAtomizedJSON (options, taskScripts, processedStyles) {
  let scriptErrors;
  if (taskScripts.out) {
    try {
      fs.writeFileSync(taskScripts.out, JSON.stringify(processedStyles.classMap, null, 2) + '\n');
    } catch (scriptErr) {
      helpers.throwError(options, 'Error writing script file: ' + taskScripts.out, scriptErr);
      scriptErrors = scriptErr;
    }
  }
  if (taskScripts.result) {
    taskScripts.result(processedStyles.classMap, scriptErrors);
  }
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
const processTask = function (options, task) {
  let processedStyles = {};

  if (task.styles) {
    const cssData = getCssString(options, task.styles);

    const hasStyleFiles = task.styles.in && task.styles.in.length;
    if (hasStyleFiles || task.styles.data) {
      processedStyles = css(options, cssData.cssString, task.uglify);
    }

    outputAtomizedCSS(options, task.styles, processedStyles, cssData.styleErrors);
  }

  if (task.markup) {
    task.markup.forEach((item) => {
      const htmlData = getHtmlString(options, item);

      let processedMarkup = '';
      if (item.in || item.data) {
        processedMarkup = html(options, htmlData.markupString, processedStyles.classMap);
      }

      outputAtomizedHTML(options, item, processedMarkup, htmlData.markupErrors);
    });
  }

  if (task.scripts) {
    outputAtomizedJSON(options, task.scripts, processedStyles);
  }
};

module.exports = processTask;
