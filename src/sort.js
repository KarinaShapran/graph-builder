
const sortByID = (arr) => {
    return arr.sort((a, b) => {
        const aId = a.id;
        const bId = b.id;

        return aId - bId
    });
};

const sortByLabel = (arr) => {
    return arr.sort((a, b) => {
        const aLabel = a.label;
        const bLabel = b.label;

        return bLabel - aLabel
    });
};

const sortByMaxLength = (arr) => {
    return arr.sort((a, b) => {
        const aLength = a.maxLength;
        const bLength = b.maxLength;

        return aLength - bLength
    });
};

const sortByLength = (arr) => {
    return arr.sort((a, b) => {
        const aLength = a.maxLength;
        const bLength = b.maxLength;

        return bLength - aLength
    });
};

export { sortByID, sortByLabel, sortByMaxLength, sortByLength }