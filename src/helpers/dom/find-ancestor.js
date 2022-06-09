

export default function findAncestor(elem, match) {
    console.log(elem);
    const test = (typeof(match) === 'string') ?
        (e) => e.matches(match)
        :
        match;
    
    while(elem && !test(elem)) {
        elem = elem.parentElement;
    }

    return elem ?? null;
}