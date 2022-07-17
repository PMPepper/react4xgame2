import { forwardRef, useMemo } from "react"

//Helpers
import combineProps from "helpers/react/combine-props";


const Form = forwardRef(function Form({children, ...rest}, ref) {
    const props = combineProps(
        {
            action: '#',
        },
        rest,
        {
            ref,
            noValidate: true,
        },
    )

    return <form {...props}>{children}</form>
})

export default Form;

//Select
export const Select = Form.Select = forwardRef(function Select({
    options,
    ...rest
}, ref) {
    const props = combineProps(
        {
            ref,
        },
        rest
    );

    const renderedOptions = useMemo(
        () => options.reduce((output, option, index) => {
            if(option.options) {
                output.push(<optgroup label={option.label} key={index}>
                    {option.options.map(renderSelectOption)}
                </optgroup>);
            } else {
                output.push(renderSelectOption(option))
            }

            return output;
        }, []),
        [options]
    );

    return <select {...props}>
        {renderedOptions}
    </select>
})

function renderSelectOption({label, value}) {
    return <option key={value} value={value}>{label}</option>
}

//Input
export const Input = Form.Input = forwardRef(function Input({

}, ref) {
    return 'TODO';
})

//Textarea
export const Textarea = Form.Textarea = forwardRef(function Textarea({

}, ref) {
    return 'TODO';
})