const {
  ARR_EN_FROM_B_TO_R,
  ARR_EN_FROM_E_TO_R,
  SORT_DIR
} = require('./app.config');
const {readFile} = require('xlsx');
const {
  createDirByName,
  createUserDirSkeleton,
  getFileName,
  getPhotoDirPath,
  getPortraitPath,
  getSpreadPath
}  = require('./app.utils');
const {copyFileSync} = require('fs');

const letterRgx = /[^a-zA-Z]+/g
const numberRgx = /^\D+/g

let photos = {}

const getParseIndexes = workSheet => {
  const [start, end] = workSheet["!ref"].split(":").map(str => ({
    letter: str.replace(letterRgx, ""),
    number: Number(str.replace(numberRgx, ""))
  }))

  return {
    start,
    end
  }
}
const getTargetWorkSheet = file => {
  const listName = file.SheetNames[0]
  const targetList = file.Sheets[listName]
  return targetList
}

const getFioPos = (list, indexes) => {
  const fioPos = []

  const { letter: startLetter, number: startNumber } = indexes.start
  const { letter: endLetter, number: endNumber } = indexes.end

  let fioCounter = startNumber

  while (fioCounter < endNumber) {
    const currentEl = `B${fioCounter}`
    if (list[currentEl]?.v === "Имя Фамилия") {
      fioPos.push(Number(currentEl.replace(numberRgx, "")))
    }

    fioCounter += 1
  }

  return fioPos
}

const getRawPersons = (list, fioPos) => {
  const persons = []

  fioPos.forEach((pos, posInd, currArr) => {
    const person = {}
    let nextFioPos = currArr[posInd + 1]

    ARR_EN_FROM_B_TO_R.forEach(alphabetChr => {
      let currPosCntr = pos
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

const getFioFromRawPerson = rawPerson => {
  const cellValue = Object.values(rawPerson)[1]?.v
  if (typeof cellValue === "string") return cellValue
}

const getPortraitFromRawPerson = rawPerson => {
  let rawPort = Object.values(rawPerson)[5]?.v

  if (typeof rawPort === "string") {
    rawPort = rawPort.trim()
  }
  return rawPort
}

const getAlbumSpreadsFromRawPersons = rawPerson => {
  const spreads = []

  const rawPersonEntries = Object.entries(rawPerson)

  rawPersonEntries.forEach(([key, value]) => {
    if (typeof value.v === "string" && value.v.includes("разворот")) {
      spreads.push({
        key,
        name: value.v
      })
    }
  })

  const updatedSpreads = spreads.map(({ key, name }) => {
    const numberFromKey = key.replace(numberRgx, "")
    const photos = []

    ARR_EN_FROM_E_TO_R.forEach(char => {
      let rawCurrentCell = rawPerson[`${char}${numberFromKey}`]?.v

      if (typeof rawCurrentCell === "string") {
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

const getUsersOptions = (list, indexes) => {
  // writeFile("rawPersons.json", JSON.stringify(rawPersons), () => { });
  const fioPos = getFioPos(list, indexes)
  const rawPersons = getRawPersons(list, fioPos)

  const userOptions = rawPersons.map(rawPerson => {
    return {
      fio: getFioFromRawPerson(rawPerson),
      portrait: getPortraitFromRawPerson(rawPerson),
      albumSpreads: getAlbumSpreadsFromRawPersons(rawPerson)
    }
  })

  return userOptions
}

const movePhotoToSortDir = (sortedDirPath, picked) => {
  try {
    

    const oldPath = photos[picked]
    const newPath = getPhotoDirPath(sortedDirPath, picked)
    copyFileSync(oldPath, newPath)
  } catch (error) {
    console.log(error)
  }
}

const fillThePortraitDir = ({ portrait, fio }) => {
  if (!fio) {
    return
  }
  movePhotoToSortDir(getPortraitPath(fio), portrait)
}

const fillSpreads = ({ albumSpreads, fio }) => {
  if (!fio) {
    return
  }

  albumSpreads.forEach(spread => {
    spread.photos.forEach(photo => {
      const spreadPath = getSpreadPath(fio, spread.name)
      movePhotoToSortDir(spreadPath, photo)
    })
  })
}

const sortPhotos = userOptions => {
  userOptions.forEach(option => {
    createUserDirSkeleton(option)

    fillThePortraitDir(option)
    
    fillSpreads(option)
  })
}

const start = (spreadPath) => {
  const xlsxFile = readFile(spreadPath)
  const targetList = getTargetWorkSheet(xlsxFile)
  const indexes = getParseIndexes(targetList)
  const userOptions = getUsersOptions(targetList, indexes)
  
  console.log(userOptions);
  sortPhotos(userOptions)
}


const APP_START = async (spreadPath, photosInfo) => {
  createDirByName(SORT_DIR)
  photos = photosInfo
  console.log('photos',photos);
  start(spreadPath)

  console.log("done")
}

module.exports = {
  APP_START
};