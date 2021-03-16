// const util = require('util');
// const exec = util.promisify(require('child_process').exec);

// async function lsExample() {
//   const { stdout, stderr } = await exec('node-full-icu-path');
//   console.log('stdout:', stdout);
//   console.error('stderr:', `'${stderr.type}'`);

//   console.log(stdout !== null);
//   console.log(stderr.type === undefined);
//   const path = stdout.replace(/[\r\n]+$/, '');
//   stderrType = stderr.type;
//   // path = path.replace(/[\r\n]+$/, '');
//   console.log(`'${path}'`);
//   if (path && stderrType == null)
//   {
//       // --icu-data-dir="${path}"
//     const command = `node app.js`;
//     console.log(`'${command}'`);
//     // const { stdout, stderr } = await exec(command);
//     const { stdout, stderr } = await exec("npm run start");
//     console.log('stdout:', stdout);
//     console.error('stderr:', stderr);
//   }
// }
// lsExample();


const { exec,} = require('child_process');
const concurrently = require('concurrently');
let err, path;

exec('node-full-icu-path', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    err = error;
    return;
  }
  console.log(`stdout: ${stdout}`);
  path = stdout.replace(/[\r\n]+$/, '');
  console.error(`stderr: ${stderr}`);

    console.log("------------------------------");
    console.log(!err);
    console.log(path !== null);
    console.log(`'${path}'`);

    // concurrently([`npm run start -- --icu-data-dir=`], 
    //     {
    //         prefix: 'name',
    //         killOthers: ['failure', 'success'],
    //         restartTries: 3,
    //     }).then("Succesfully run script").catch(console.dir);

    // if (!err && path)
    // {
    //     // const command = `node --icu-data-dir="${path}" app.js`;
    //     // const command = `node app.js`;
    //     // >script.bat && script.bat
    //     // echo node --icu-data-dir=${path} app.js>script.bat && 
    //     const command = `node --version`;
    //     console.log(`'${command}'`);
    //     exec('npm run start -- --icu-data-dir=${path}', (error, stdout, stderr) => {
    //         if (error) {
    //             console.error(`exec error: ${error}`);
    //             return;
    //         }
    //         console.log(`stdout: ${stdout}`);
    //         console.error(`stderr: ${stderr}`);
    //     });
    // } 

});


