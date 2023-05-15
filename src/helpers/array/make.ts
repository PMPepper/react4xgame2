


export default function make(start: number, end: number, step: number = 1): number[] {
    start = +start;
    end = +end;
    step = +step;

    if(isNaN(start) || isNaN(end) || isNaN(step)) {
        throw new Error('The arguments "start", "end" and "step" must be number');
    }

    if(step === 0) {
        throw new Error('The arguments "step" cannot be zero');
    }
    if(end > start && step < 0) {
        throw new Error('If "end" is greater than "start", "step" must be greater than zero');
    }

    if(end < start && step > 0) {
        throw new Error('If "start" is greater than "end", "step" must be less than zero');
    }

    const arr: number[] = [];

    for(let i = start; i <= end; i += step) {
        arr.push(i);
    }

    return arr;
}