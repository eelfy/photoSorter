import { PHOTOS_EXTENSION, SORT_DIR } from "../../config";
import { UserOption } from "../types";
import {mkdirSync, existsSync} from 'fs'

export const getFileName = () => 'spread.xlsx';

export const getPhotoDirPath = (parentDirName: string, photoName: string) => `${parentDirName}/${photoName}.${PHOTOS_EXTENSION}`;

export const getSortedUserDirPath = (option: UserOption) => `${SORT_DIR}/${option.name}`;

export const createDirByName = (dirName: string) => {
    if(existsSync(dirName)) return;
    mkdirSync(dirName, { recursive: true });
};