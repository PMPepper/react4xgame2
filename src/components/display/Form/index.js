import { forwardRef, useMemo } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

//Hooks
import useCombineProps from "hooks/useCombineProps";
import useId from "hooks/useId";

//Helpers
import classnames from "helpers/css/class-list-to-string";

//Other
import classes from './Form.module.scss';


//The components
const Form = forwardRef(function Form({children, ...rest}, ref) {
    const props = useCombineProps(() => ([
            {
                action: '#',
                className: classes.form,
            },
            rest,
            {
                ref,
                noValidate: true,
            },
        ]),
        [rest, ref]
    )

    return <form {...props}>{children}</form>
})

export default Form;

//FieldWrapper
const FieldWrapper = forwardRef(function FieldWrapper({children, error, focus, hover, ...rest}, ref) {
    return <label {...useCombineProps(() => ([
        {
            className: classnames(classes.fieldWrapper, error && classes.error, focus && classes.focus, hover && classes.hover),
            ref,
        },
        rest
    ]), [rest, ref, error, focus, hover])}>
        {children}
    </label>
});

//Select
export const Select = Form.Select = forwardRef(function Select({
    //field options
    id,
    name,
    autoComplete,
    autoFocus,
    disabled,
    form,
    required,
    options,
    
    value,
    setValue,

    inputProps,
    //other props for the wrapper
    wrapperId,
    ...rest
}, ref) {
    id = useId(id, 'select');
    wrapperId = wrapperId || `${id}-wrapper`;

    const selectProps = useCombineProps(() => ([
            {
                className: classes.select,
                id,
                name,
                autoComplete,
                autoFocus,
                disabled,
                form,
                value,
                onChange: (e) => setValue(e.target.value),
            },
            inputProps
        ]),
        [
            id,
            name,
            autoComplete,
            autoFocus,
            disabled,
            form,
            inputProps,
            value, setValue
        ]
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

    return <FieldWrapper id={wrapperId} {...rest} ref={ref}>
        <select {...selectProps}>
            {renderedOptions}
        </select>
        <FontAwesomeIcon icon={solid('angle-down')} className={classes.icon} inert="inert" />
    </FieldWrapper>
})

function renderSelectOption({label, value}) {
    return <option key={value || 'null'} value={value}>{label}</option>
}

//Input
export const Input = Form.Input = forwardRef(function Input({
    //field options
    id,
    name,
    autoComplete,
    checked,
    dirname,
    disabled,
    form,
    list,
    max,
    maxLength,
    min,
    minLength,
    pattern,
    placeholder,
    readOnly,
    required,
    size,
    step,
    type,
    value,
    setValue,

    inputProps,

    //wrapper options
    wrapperId,
    ...rest
}, ref) {
    id = useId(id, 'input');
    wrapperId = wrapperId || `${id}-wrapper`;

    const fieldProps = useCombineProps(() => ([
            inputProps,
            {
                className: classes.input,
                id,
                name,
                autoComplete,
                checked,
                dirname,
                disabled,
                form,
                list,
                max,
                maxLength,
                min,
                minLength,
                pattern,
                placeholder,
                readOnly,
                required,
                size,
                step,
                type,
                value,
                onChange: (e) => setValue(e.target.value),
            },
        ]),
        [
            inputProps,
            id,
            name,
            autoComplete,
            checked,
            dirname,
            disabled,
            form,
            list,
            max,
            maxLength,
            min,
            minLength,
            pattern,
            placeholder,
            readOnly,
            required,
            size,
            step,
            type,
            value,
            setValue,
        ]
    );

    return <FieldWrapper id={wrapperId} {...rest} ref={ref}>
        <input {...fieldProps} />
    </FieldWrapper>
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
    const props = useCombineProps(() => ([
            rest,
            {
                className: classes.label,
                ref,
            },
        ]),
        [rest, ref]
    )

    return <label {...props}>{children}</label>
})