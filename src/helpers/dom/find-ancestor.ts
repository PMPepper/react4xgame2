

export default function findAncestor(elem: Element, match: string | ((elem: Element) => boolean)): Element | undefined {
    const test = (typeof(match) === 'string') ?
        (e: Element) => e.matches(match)
        :
        match;
    let checkingElement = elem;

    while(checkingElement && !test(checkingElement)) {
        checkingElement = checkingElement.parentElement;
    }

    return checkingElement ?? undefined;
}