import React, { FC } from "react"

export default function TSTest({children}) {
    return <div>
        <h2>TS Tests</h2>
        <Ex1 wibble={2}></Ex1>
        {/* <TestComponent wobble={3} id="12" color="" className="" href=""></TestComponent> <--Errors! */}
        <TestComponent wobble={3} as="a" id="12" color="" className="" href=""></TestComponent>
        <TestComponent wibble={3} wobble={4} as={Ex1}></TestComponent>
    </div>
}

const Ex1: FC<React.PropsWithChildren<{wibble: number}>> = (props) => {
    return <span>{props.children}</span>
}

//Polymorhpic stuff

type AsProp<C extends React.ElementType> = {as?: C;};
type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
    C extends React.ElementType,
    Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
    Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;


type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>["ref"];

type PolymorphicComponentPropWithRef<
    C extends React.ElementType,
    Props = {}
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> };

// type PolymorphicProps<Props> = <C extends React.ElementType> = 
// PolymorphicComponentPropWithRef<
//     C,
//     BaseProps
// >;

//Example

// /**
// * This is the updated component props using PolymorphicComponentPropWithRef
// */
// type TextProps<C extends React.ElementType> = PolymorphicComponentPropWithRef<C, { wibble: number }>;

// /**
// * This is the type used in the type annotation for the component
// */
// type TextComponent = <C extends React.ElementType = "span">(props: TextProps<C>) => React.ReactElement | null;


// export const Text: TextComponent = React.forwardRef(
//     <C extends React.ElementType = "span">(
//       { as, color, children }: TextProps<C>,
//       ref?: PolymorphicRef<C>
//     ) => {
//       const Component = as || "span";
  
//       const style = color ? { style: { color } } : {};
  
//       return (
//         <Component {...style} ref={ref}>
//           {children}
//         </Component>
//       );
//     }
//   );

//   export const Text2: TextComponent = React.forwardRef(
//     <C extends React.ElementType = "span">(
//       { as, color, children }: TextProps<C>,
//       ref?: PolymorphicRef<C>
//     ) => {
//       const Component = as || "span";
  
//       const style = color ? { style: { color } } : {};
  
//       return (
//         <Component {...style} ref={ref}>
//           {children}
//         </Component>
//       );
//     }
//   );

export function polymorphicForwardRef<Props, DefaultElementType extends React.ElementType>(component: <C extends React.ElementType>(props: PolymorphicComponentPropWithRef<C, Props>, ref: PolymorphicRef<C>) => React.ReactElement | null) {
    type PolymorphicProps<C extends React.ElementType> = PolymorphicComponentPropWithRef<C, Props>;
    type PolymorphicComponent = <C extends React.ElementType = DefaultElementType>(props: PolymorphicProps<C>) => React.ReactElement | null;

    return React.forwardRef(component) as PolymorphicComponent;
}

//What about constraining the type to something that includes required props

const TestComponent = polymorphicForwardRef<{wobble: number}, 'div'>(({wibble, as: As = 'div', ...rest}, ref) => {
    return <As ref={ref} {...rest}>{wibble}</As>
});

// //Typechecking of children does not work

// export default function TSTest({children}) {
//     return <div>
//         <h2>TS Tests</h2>
//         <Ex1 wibble={2}></Ex1>
//         <TypedChild1><p>Example!</p></TypedChild1>
//         <TypedChild1>Example!</TypedChild1>
//         <TypedChild1><Ex1 wibble={2}></Ex1></TypedChild1>

        
//         <TypedChild2><p>Example!</p></TypedChild2>
//         <TypedChild2>Example!</TypedChild2>
//         <TypedChild2><Ex1 wibble={2}></Ex1></TypedChild2>
//     </div>
// }

// const Ex1: FC<React.PropsWithChildren<{wibble: number}>> = (props) => {
//     return <span>{props.children}</span>
// }


// function TypedChild1({children}: {children: React.ReactElement<'img'>}) {
//     return <article>
//         {children}
//     </article>
// }

// function TypedChild2({children}: {children: React.ReactElement<typeof Ex1>}) {
//     return <article>
//         {children}
//     </article>
// }



////

// interface ComponentProps {
//     // Define the specific properties required for the component
//     id: string;
//     name: string;
//     // ...
//   }
  
//   function doSomething<T extends React.ElementType<ComponentProps>>(Component: T) {
//     // Use the properties of the component
//     // ...
//   }
  
//   // Example usage
//   const ValidComponent: React.FC<ComponentProps> = ({ id, name }) => {
//     // Component implementation
//     return null;
//   };
  
//   doSomething(ValidComponent);
  
//   const InvalidComponent: React.FC = () => {
//     // Component implementation
//     return null;
//   };
  
//   doSomething(InvalidComponent); // This will result in a TypeScript error < it does not.
