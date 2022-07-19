import { forwardRef, useMemo } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

//Helpers
import combineProps from "helpers/react/combine-props";

//Other
import classes from './Form.module.scss';

//Consts


//The components
const Form = forwardRef(function Form({children, ...rest}, ref) {
    const props = combineProps(
        {
            action: '#',
            className: classes.form,
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
            className: classes.select,
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

    return <label className={classes.fieldWrapper} ref={ref}>
        <select {...props}>
            {renderedOptions}
        </select>
        <FontAwesomeIcon icon={solid('angle-down')} className={classes.icon} inert />
    </label>
})

function renderSelectOption({label, value}) {
    return <option key={value} value={value}>{label}</option>
}

//Input
export const Input = Form.Input = forwardRef(function Input({
    ...rest
}, ref) {
    const props = combineProps(
        rest,
        {
            className: classes.input
        },
    )

    return <label className={classes.fieldWrapper} ref={ref}>
        <input {...props} />
    </label>
})

Input.defaultProps = {
    type: 'text'
}

//Textarea
export const Textarea = Form.Textarea = forwardRef(function Textarea({

}, ref) {
    return 'TODO';
})

//Label
export const Label = Form.Label = forwardRef(function Label({
    children, ...rest
}, ref) {
    const props = combineProps(
        rest,
        {
            className: classes.label,
            ref,
        },
    )

    return <label {...props}>{children}</label>
})