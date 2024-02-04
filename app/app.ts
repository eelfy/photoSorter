import { ARR_EN_FROM_B_TO_R, ARR_EN_FROM_E_TO_R, RAW_DIR, SORT_DIR } from './config/app.config';
import { WorkBook, WorkSheet, readFile } from 'xlsx';
import { AlbumSpread, CellContent, NewUserOption, ParseIndexes, RawPerson } from './lib/types';
import { createDirByName, createUserDirSkeleton, getFileName, getPhotoDirPath, getPortraitPath, getSpreadPath } from './lib/utils';
import { copyFileSync, writeFile } from 'fs';

const letterRgx = /[^a-zA-Z]+/g;
const numberRgx = /^\D+/g;

const getParseIndexes = (workSheet: WorkSheet): ParseIndexes => {
    const [start, end] = workSheet['!ref']!.split(":").map(str => ({
        letter: str.replace(letterRgx, ''),
        number: Number(str.replace(numberRgx, ''))
    }))

    return {
        start,
        end
    }
};
const getTargetWorkSheet = (file: WorkBook): WorkSheet => {
    const listName = file.SheetNames[0];
    const targetList = file.Sheets[listName];
    return targetList;
};

const getFioPos = (list: WorkSheet, indexes: ParseIndexes) => {
    const fioPos: number[] = []

    const { letter: startLetter, number: startNumber } = indexes.start
    const { letter: endLetter, number: endNumber } = indexes.end

    let fioCounter = startNumber;

    while (fioCounter < endNumber) {
        const currentEl = `B${fioCounter}`
        if (list[currentEl]?.v === "Имя Фамилия") {
            fioPos.push(Number(currentEl.replace(numberRgx, '')))
        }

        fioCounter += 1;
    }

    return fioPos
}

const getRawPersons = (list: WorkSheet, fioPos: number[]) => {
    const persons: RawPerson[] = []

    fioPos.forEach((pos, posInd, currArr) => {
        const person: RawPerson = {}
        let nextFioPos = currArr[posInd + 1];

        ARR_EN_FROM_B_TO_R.forEach(alphabetChr => {
            let currPosCntr = pos;
            while (currPosCntr < nextFioPos) {
                const currCell = `${alphabetChr}${currPosCntr}`
                if (list[currCell]) {
                    person[currCell] = list[currCell]
                }

                currPosCntr += 1
            }
        })
        persons.push(person)
    })

    return persons
}

const getFioFromRawPerson = (rawPerson: RawPerson) => {
    const cellValue = Object.values(rawPerson)[1]?.v
    if (typeof cellValue === 'string') return cellValue
}

const getPortraitFromRawPerson = (rawPerson: RawPerson) => {
    let rawPort = Object.values(rawPerson)[5]?.v;

    if (typeof rawPort === 'string') {
        rawPort = rawPort.trim()
    }
    return rawPort
}

const getAlbumSpreadsFromRawPersons = (rawPerson: RawPerson): AlbumSpread[] => {
    const spreads: {
        key: string
        name: string
    }[] = []

    const rawPersonEntries = Object.entries(rawPerson)

    rawPersonEntries.forEach(([key, value]) => {
        if (typeof value.v === 'string' && value.v.includes('разворот')) {
            spreads.push({
                key,
                name: value.v
            })
        }
    })

    const updatedSpreads: AlbumSpread[] = spreads.map(({ key, name }) => {
        const numberFromKey = key.replace(numberRgx, '')
        const photos: (string | number)[] = []

        ARR_EN_FROM_E_TO_R.forEach(char => {
            let rawCurrentCell = rawPerson[`${char}${numberFromKey}`]?.v

            if (typeof rawCurrentCell === 'string') {
                rawCurrentCell = rawCurrentCell.trim()
            }

            if (rawCurrentCell) {
                photos.push(rawCurrentCell)
            }
        })

        return {
            name,
            photos
        }
    })

    return updatedSpreads
}

const getUsersOptions = (list: WorkSheet, indexes: ParseIndexes) => {
    // writeFile("rawPersons.json", JSON.stringify(rawPersons), () => { });
    const fioPos = getFioPos(list, indexes)
    const rawPersons = getRawPersons(list, fioPos)

    const userOptions: NewUserOption[] = rawPersons.map(rawPerson => {
        return {
            fio: getFioFromRawPerson(rawPerson),
            portrait: getPortraitFromRawPerson(rawPerson),
            albumSpreads: getAlbumSpreadsFromRawPersons(rawPerson)
        }
    })

    return userOptions
}

const movePhotoToSortDir = (sortedDirPath: string, picked: CellContent) => {
    try {
        const oldPath = getPhotoDirPath(RAW_DIR, picked);
        const newPath = getPhotoDirPath(sortedDirPath, picked);
        copyFileSync(oldPath, newPath);
    } catch (error) {
        console.log(error);
    }
}

const fillThePortraitDir = ({ portrait, fio }: NewUserOption) => {
    if (!fio) {
        return
    }
    movePhotoToSortDir(getPortraitPath(fio), portrait)
}


const fillSpreads = ({ albumSpreads, fio }: NewUserOption) => {
    if (!fio) {
        return
    }

    albumSpreads.forEach(spread => {
        spread.photos.forEach(photo => {
            movePhotoToSortDir(
                getSpreadPath(fio, spread.name),
                photo
            )
        })
    })
}

const sortPhotos = (userOptions: NewUserOption[]) => {
    userOptions.forEach(option => {
        createUserDirSkeleton(option)

        fillThePortraitDir(option)
        fillSpreads(option)
    });
}

const start = (fileName: string) => {
    const xlsxFile = readFile(fileName);
    const targetList = getTargetWorkSheet(xlsxFile);
    const indexes = getParseIndexes(targetList)
    const userOptions = getUsersOptions(targetList, indexes);

    sortPhotos(userOptions);
};

export const APP_START = () => {
    const fileName = getFileName();

    createDirByName(SORT_DIR);

    start(fileName);

    console.log('done');
}
