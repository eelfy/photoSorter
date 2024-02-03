import { PHOTOS_EXTENSION, SORT_DIR } from "../../config";
import { NewUserOption, CellContent } from "../types";
import { mkdirSync, existsSync, rmSync } from 'fs'

export const getFileName = () => 'spread2.xlsx';

export const getPhotoDirPath = (parentDirName: string, photoName: CellContent) => `${parentDirName}/${photoName}.${PHOTOS_EXTENSION}`;

export const getMainDirName = (fio: string) => `${SORT_DIR}/${fio}`;
export const getPortraitPath = (fio: string) => `${getMainDirName(fio)}/Портрет`;
export const getSpreadPath = (fio: string, spreadName: string) => `${getMainDirName(fio)}/${spreadName}`

export const createDirByName = (dirName: string) => {
    if (existsSync(dirName)) rmSync(dirName, { force: true, recursive: true });
    mkdirSync(dirName, { recursive: true });
};

export const createUserDirSkeleton = ({ fio, albumSpreads }: NewUserOption) => {
    if (!fio) {
        return
    }
    mkdirSync(getMainDirName(fio))

    mkdirSync(getPortraitPath(fio))

    albumSpreads.forEach(spread => {
        mkdirSync(getSpreadPath(fio, spread.name))
    })
}
