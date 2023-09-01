//TODO needs loads more TS types, especially for the FormDisplay components
//TODO validation
//TODO avoid unneeded renders
import React, { PropsWithChildren } from 'react';
import { forwardRef, useCallback, useMemo } from 'react';

//Components
import FormDisplay from 'components/display/Form';

//Hooks
import useId from 'hooks/useId';
import { createContext, useContextSelector } from 'use-context-selector';

//Types
type WithName<T> = {name: string} & Omit<T, 'name'>;
type FieldState = any;//TODO
type FieldsState = Record<string, FieldState>;

type FormState = {
    name: string;
    fields: FieldsState;
    setState: (newState: FieldsState) => void
};

type FormProps = PropsWithChildren<{
    state: any;//TODO way better typing is needed here
    setState: (newState: any) => void;
}> & JSX.IntrinsicElements['form'];

//Consts
const FormContext = createContext<FormState>(undefined);
FormContext.displayName = 'FormContext';


//The component
const FormComponent = forwardRef<HTMLFormElement, FormProps>(function Form({children, name, state, setState, ...rest}, ref) {
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
        <FormContext.Provider value={formContextValue}>
            {children}
        </FormContext.Provider>
    </FormDisplay>
});








export const Text = forwardRef<HTMLInputElement, WithName<Omit<JSX.IntrinsicElements['input'], 'id' | 'type' | 'value'>>>(function Text({name, ...rest}, ref) {
    name = useId(name, 'text');
    const [id, value, setValue] = useFormState(name);

    return <FormDisplay.Input {...rest} name={name} id={id} type="text" value={value} setValue={setValue} ref={ref} />
});

export const Select = forwardRef<HTMLSelectElement, WithName<Omit<JSX.IntrinsicElements['select'], 'id' | 'children'>>>(function Select({name, ...rest}, ref) {
    name = useId(name, 'select');
    const [id, value, setValue] = useFormState(name);

    return <FormDisplay.Select {...rest} name={name} id={id} value={value} setValue={setValue} ref={ref} />
});

export const Label = forwardRef<HTMLLabelElement, WithName<Omit<JSX.IntrinsicElements['label'], 'htmlFor'>>>(function Label({name, ...rest}, ref) {
    const htmlFor = useGetFieldId(name);

    return <FormDisplay.Label {...rest} htmlFor={htmlFor} ref={ref} />
});

const Form = Object.assign(FormComponent, {
    Text, Select, Label
})


export default Form;



//Utils
function useFormState(fieldName: string) {
    const value = useContextSelector(FormContext, (state) => state.fields[fieldName])
    const setState = useContextSelector(FormContext, (state) => state.setState);

    const setValue = useCallback(
        (value) => setState((fields) => value !== fields[fieldName] ? 
            {...fields, [fieldName]: value}
            :
            fields
        ),
        [fieldName, setState]
    );

    return [useGetFieldId(fieldName), value, setValue] as const;
}

function useGetFieldId(fieldName: string) {
    const formName = useContextSelector(FormContext, (state) => state.name);

    return `${formName}.${fieldName}`;
}