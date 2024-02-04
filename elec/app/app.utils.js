const { mkdirSync, existsSync, rmSync } = require('fs');
const { PHOTOS_EXTENSION, SORT_DIR } = require('./app.config')

const getFileName = () => 'spread2.xlsx';

const getPhotoDirPath = (parentDirName, photoName) => `${parentDirName}/${photoName}.${PHOTOS_EXTENSION}`;

const getMainDirName = (fio) => `${SORT_DIR}/${fio}`;
const getPortraitPath = (fio) => `${getMainDirName(fio)}/Портрет`;
const getSpreadPath = (fio, spreadName) => `${getMainDirName(fio)}/${spreadName}`

const createDirByName = (dirName) => {
    if (existsSync(dirName)) rmSync(dirName, { force: true, recursive: true });
    mkdirSync(dirName, { recursive: true });
};

const createUserDirSkeleton = ({ fio, albumSpreads }) => {
    if (!fio) {
        return
    }
    mkdirSync(getMainDirName(fio))

    mkdirSync(getPortraitPath(fio))

    albumSpreads.forEach(spread => {
        mkdirSync(getSpreadPath(fio, spread.name))
    })
}


module.exports = {
    getFileName,
    getPhotoDirPath,
    getMainDirName,
    getPortraitPath,
    getSpreadPath,
    createDirByName,
    createUserDirSkeleton,
  };