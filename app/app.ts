import { RAW_DIR } from './config/app.config';
import { WorkBook, WorkSheet, readFile } from 'xlsx';
import { ParseIndexes, UserOption } from './lib/types';
import { createDirByName, getFileName, getPhotoDirPath, getSortedUserDirPath } from './lib/utils';
import { SORT_DIR } from './config';
import { copyFileSync } from 'fs';

const fileName = getFileName();

export const APP_START = () => {
    const getParseIndexes = (workSheet: WorkSheet): ParseIndexes => {
        const [start, end] = workSheet['!ref']!.split(':').map(column => column[1]);
        return {
            start: String(Number(start) + 1),
            end
        }
    };
    const getTargetWorkSheet = (file: WorkBook): WorkSheet => {
        const listName = file.SheetNames[0];
        const targetList = file.Sheets[listName];
        return targetList;
    };

    const getPicked = (rawPicked: string | number ) => {
        if(!rawPicked) return [];

        if(typeof rawPicked === 'number') return [String(rawPicked)];

        if(rawPicked.length === 1) return [rawPicked];
        
        return rawPicked.split(', ');
    }

    const getUsersOptions = (list: WorkSheet, indexes: ParseIndexes ): UserOption[] => {
        const userOptions: UserOption[] = Array();
        let start = Number(indexes.start);
        const end = Number(indexes.end);
        while(start <= end) {
            userOptions.push({
                name: list[`A${start}`].v,
                picked: getPicked(list[`B${start}`].v)
            })
            start += 1;
        }
        return userOptions;
    }

    const movePhotosToSortDir = (sortedDirPath: string, picked: UserOption['picked']) => {
        picked.forEach(pick => {
            const oldPath = getPhotoDirPath(RAW_DIR, pick);
            const newPath = getPhotoDirPath(sortedDirPath, pick);
            copyFileSync(oldPath, newPath);
        })
    }

    const sortPhotos = (userOptions: UserOption[]) => {
        userOptions.forEach(option => {
            const userSortedDirPath = getSortedUserDirPath(option);
            createDirByName(userSortedDirPath);
            movePhotosToSortDir(userSortedDirPath, option.picked)
        });
    }

    const start = (fileName: string) => {
        const xlsxFile = readFile(fileName);
        const targetList = getTargetWorkSheet(xlsxFile);
        const indexes = getParseIndexes(targetList)
        const userOptions = getUsersOptions(targetList, indexes);
       
        sortPhotos(userOptions);
    };

    createDirByName(SORT_DIR);
    start(fileName);
    console.log('done');
}
