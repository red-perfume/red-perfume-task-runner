const fs = require('fs');
const helpers = require('./helpers.js');
const css = require('./css.js');
const html = require('./html.js');

/**
 * Based on task settings concatenate all CSS inputs
 * into one string.
 *
 * @param  {object} options     The user's options object
 * @param  {object} taskStyles  Style settings for this task
 * @return {object}             The CSS String and any style errors
 * @example
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
 * @param  options
 * @param  item
 * @example
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
 * @param  options
 * @param  taskStyles
 * @param  processedStyles
 * @param  styleErrors
 * @example
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
 * @param  options
 * @param  item
 * @param  processedMarkup
 * @param  markupErrors
 * @example
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
 * @param  options
 * @param  taskScripts
 * @param  processedStyles
 * @example
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
 * @param  options
 * @param  task
 * @example
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
