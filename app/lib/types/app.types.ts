type Index = { letter: string; number: number; }
export type CellContent = string | number
export type ParseIndexes = {
    start: Index,
    end: Index
}

export interface UserOption {
    name: string;
    picked: string[]
}

export interface AlbumSpread {
    name: string,
    photos: CellContent[]
}
export interface NewUserOption {
    fio?: string,
    portrait: CellContent,
    albumSpreads: AlbumSpread[]
}

export interface ParsedXlsxCell {
    v: CellContent
}

export type RawPerson = Record<string, ParsedXlsxCell>
