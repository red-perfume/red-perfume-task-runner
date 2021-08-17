'use strict';

/**
 * @file    A place to play around with/try to out Red Perfume
 * @author  TheJaredWilcurt
 */

const redPerfume = require('./index.js');

redPerfume.atomize({
  tasks: [
    {
      uglify: false,
      styles: {
        in: [
          './manual-test/input.css'
        ],
        out: './manual-test/output.css',
        data: `
          .cow,
          .cat {
              font-size: 12px;
              padding: 8px;
          }
          .dog {
              font-size: 12px;
              background: #F00;
              padding: 8px;
          }
        `,
        result: function (result, err) {
          console.log(result);
          if (err) {
            console.log(err);
          }
        }
      },
      markup: [
        {
          data: `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Test</title>
              </head>
              <body>
                <p class="cool cow moo">
                  Hi there!
                </p>
                <!--
                  <span class="dog">comments are skipped</span>
                -->
                <h1 class="cool cat nice wow">
                  Meow
                </h1>
                <h2 class="dog hover">
                  Woof
                </h2>
              </body>
            </html>
          `,
          out: './manual-test/out.html',
          result: function (result, err) {
            console.log(result);
            if (err) {
              console.log(err);
            }
          }
        }
      ],
      scripts: {
        out: './manual-test/out.json',
        result: function (result, err) {
          console.log(result);
          if (err) {
            console.log(err);
          }
        }
      }
    }
  ]
});
