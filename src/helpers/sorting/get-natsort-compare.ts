const defaultCollatorOptions = {numeric: true, sensitivity: 'base'}


export default function getNatsortCompare(locale: string | string[] = undefined, collatorOptions: Intl.CollatorOptions = defaultCollatorOptions) {
    const collator = new Intl.Collator(locale, collatorOptions);

    return collator.compare;
}