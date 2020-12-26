const redPerfume = require('./index.js');

redPerfume.atomize({
  tasks: [
    {
      uglify: false,
      styles: {
        in: [
          './test/input.css'
        ],
        out: './test/output.css',
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
          console.log(result, err);
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
                <h2 class="dog">
                  Woof
                </h2>
              </body>
            </html>
          `,
          out: './test/out.html',
          result: function (result, err) {
            console.log(result, err);
          }
        }
      ],
      scripts: {
        out: './test/out.json',
        result: function (result, err) {
          console.log(result, err);
        }
      }
    }
  ]
});
