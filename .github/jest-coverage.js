const exec = require('child_process').execSync;
const report = String(exec('npx jest --coverage --coverageReporters=\'text-summary\''));

// [
//   '',
//   '=============================== Coverage summary ===============================',
//   'Statements   : 32.5% ( 39/120 )',
//   'Branches     : 38.89% ( 21/54 )',
//   'Functions    : 21.74% ( 5/23 )',
//   'Lines        : 31.93% ( 38/119 )',
//   '================================================================================',
//   ''
// ]
let lines = report.split('\n');

// 'Lines        : 31.93% ( 38/119 )' => '31.93%'
let coverage = lines[5].split(':')[1].split('(')[0].trim();

process.env.JEST_COVERAGE = coverage;
