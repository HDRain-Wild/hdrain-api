const shell = require('shelljs');
require('dotenv').config();

const destinationPathList = process.env.HD_RAIN_LOCATION_LIST.split(',');
const serverAddressList = process.env.HD_RAIN_SERVER_LIST.split(',');

const target = process.env.LOCAL_TARGET;
const source = process.env.HD_RAIN_SOURCE;

// Returns a shell command to copy the file server's content to our server (using rsync through ssh)
const command = (path, address) =>
  `rsync -vrzh --rsh='sshpass -p ${process.env.HD_RAIN_SERVER_PWD} ssh -o "StrictHostKeyChecking no"' wild@${address}:${source} ${target}/${path}`;

// Function to execute the shell command to copy the data to our server
const copyData = async () => {
  console.log('Copy started at ', new Date());
  return Promise.all(
    destinationPathList.map((path, index) =>
      shell.exec(command(path, serverAddressList[index]), { async: true })
    )
  );
};

module.exports = copyData;

// To install sshpass on Linux: apt-get install sshpass
