//TODO validation
//TODO avoid unneeded renders

import { createContext, forwardRef, useCallback, useMemo } from 'react';

//Components
import FormDisplay from 'components/display/Form';
import SelectableContext, {useContextSelector} from 'components/SelectableContext';

//Hooks
import useId from 'hooks/useId';

//Consts
const FormContext = createContext(null);
FormContext.displayName = 'FormContext';


//The component
const Form = forwardRef(function Form({children, name, state, setState, ...rest}, ref) {
    name = useId(name, 'form');

    const formContextValue = useMemo(
        () => ({
            name,
            fields: state,
            setState
        }),
        [name, state, setState]
    );

    return <FormDisplay {...rest} name={name} ref={ref}>
        <SelectableContext value={formContextValue} context={FormContext}>
            {children}
        </SelectableContext>
    </FormDisplay>
});


export default Form;


export const Text = Form.Text = forwardRef(function Text({name, ...rest}, ref) {
    name = useId(name, 'text');
    const [id, value, setValue] = useFormState(name);

    return <FormDisplay.Input {...rest} name={name} id={id} type="text" value={value} setValue={setValue} ref={ref} />
});

export const Select = Form.Select = forwardRef(function Select({name, ...rest}, ref) {
    name = useId(name, 'select');
    const [id, value, setValue] = useFormState(name);

    return <FormDisplay.Select {...rest} name={name} id={id} value={value} setValue={setValue} ref={ref} />
});

export const Label = Form.Label = forwardRef(function Label({name, ...rest}, ref) {
    const htmlFor = useGetFieldId(name);

    return <FormDisplay.Label {...rest} htmlFor={htmlFor} />
})


//Utils
function useFormState(fieldName) {
    const value = useContextSelector((state) => state.fields[fieldName], undefined, FormContext)
    const setState = useContextSelector((state) => state.setState, undefined, FormContext);

    const setValue = useCallback(
        (value) => setState((fields) => value !== fields[fieldName] ? 
            {...fields, [fieldName]: value}
            :
            fields
        ),
        [fieldName, setState]
    );

    return [useGetFieldId(fieldName), value, setValue];
}

function useGetFieldId(fieldName) {
    const formName = useContextSelector((state) => state.name, undefined, FormContext)

    return `${formName}.${fieldName}`;
}