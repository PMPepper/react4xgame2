import { forwardRef, Children, useEffect, useRef } from "react";
import PropTypes from "prop-types";

//Components
import TabsDisplay from 'components/display/Tabs';

//Hooks
import useId from "hooks/useId";

//Helpers
import makeFocusInOut from "helpers/react/make-focus-in-out";

//Prop types
import isPositiveInteger from "prop-types/is-positive-integer";


//The component
const Tabs = forwardRef(function Tabs({children, selectedIndex, setSelectedIndex, id, ...props}, ref) {
    id = useId(id, 'tab');
    const tabsListElemRef = useRef();
    const childArray = Children.toArray(children);

    const onFocusIn = (e) => {
        if(e.target === e.currentTarget && selectedIndex !== null) {
            e.target.querySelector(`[data-tab-index="${selectedIndex}"]`).focus();
        }
    }

    const onKeyDown = (e) => {
        switch(e.which) {
            case 39: {//right
                setSelectedIndex(selectedIndex + 1 >= childArray.length ? 0 : selectedIndex + 1)
                break;
            }
            case 37: {//left
                setSelectedIndex(selectedIndex === 0 ? childArray.length - 1 : selectedIndex - 1)
                break;
            }
            default: 
                return;
        }

        e.preventDefault();
        e.stopPropagation();
    };

    //Side effects
    useEffect(
        () => {
            //keep focus on correct element
            const {current: elem} = tabsListElemRef;

            if(elem?.contains(document.activeElement)){
                //elem.querySelector(`[data-tab-index="${selectedIndex}"]`).focus();//focus on [aria-selected="true"]
                elem.querySelector(`[aria-selected="true"]`).focus();//focus on [aria-selected="true"]
            }
            
        },
        [selectedIndex]
    );


    return <TabsDisplay {...props} ref={ref}>
        <TabsDisplay.TabsList onFocus={makeFocusInOut(onFocusIn)} onKeyDown={onKeyDown} ref={tabsListElemRef}>
            {childArray.map(({key, props: {label}}, index) => <TabsDisplay.Tab
                data-tab-index={index}
                key={key}
                selected={index === selectedIndex}
                onClick={() => setSelectedIndex?.(index)}
                id={`${id}-tab-${index}`}
                aria-controls={`${id}-panel-${index}`}
            >
                {label}
            </TabsDisplay.Tab>)}
        </TabsDisplay.TabsList>

        <TabsDisplay.TabContents>{
            childArray.map(({key, props: {children, label, ...rest}}, index) => {
                return <TabsDisplay.TabContent
                    key={key}
                    selected={index === selectedIndex}
                    id={`${id}-panel-${index}`}
                    aria-labelledby={`${id}-tab-${index}`}
                    {...rest}
                >
                    {children}
                </TabsDisplay.TabContent>
            })
        }</TabsDisplay.TabContents>
    </TabsDisplay>
});

Tabs.defaultProps = {
    selectedIndex: 0
};

Tabs.propTypes = {
    selectedIndex: isPositiveInteger
}

export default Tabs;


Tabs.Tab = function Tab({children, label}) {
    return children
}

Tabs.Tab.propTypes = {
    label: PropTypes.node
}