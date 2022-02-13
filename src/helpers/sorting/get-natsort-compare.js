const defaultCollatorOptions = {numeric: true, sensitivity: 'base'}


export default function getNatsortCompare(locale = undefined, collatorOptions = defaultCollatorOptions) {
    const collator = new Intl.Collator(locale, collatorOptions);

    return collator.compare;
}