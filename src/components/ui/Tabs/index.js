import { forwardRef, Children, useEffect, useRef } from "react";
import PropTypes from "prop-types";

//Components
import TabsDisplay from 'components/display/Tabs';

//Hooks
import useId from "hooks/useId";

//Helpers
import makeFocusInOut from "helpers/react/make-focus-in-out";
import combineProps from "helpers/react/combine-props";

//Prop types
import isPositiveInteger from "prop-types/is-positive-integer";

//Other
import { useTab } from "redux/factories/tab";

//The component
const Tabs = forwardRef(function Tabs({children, selectedIndex, setSelectedIndex, id, sizeToParent, ...props}, ref) {
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
                elem.querySelector(`[aria-selected="true"]`)?.focus();//focus on [aria-selected="true"]
            }
            
        },
        [selectedIndex]
    );


    return <TabsDisplay {...props} sizeToParent={sizeToParent} ref={ref}>
        <TabsDisplay.TabsList onFocus={makeFocusInOut(onFocusIn)} onKeyDown={onKeyDown} ref={tabsListElemRef}>
            {childArray.map(({key, props: {label}}, index) => <TabsDisplay.Tab
                data-tab-index={index}
                key={key}
                selected={index === selectedIndex}
                onClick={() => setSelectedIndex?.(index)}
                id={`${id}-tab-${index}`}
                aria-controls={`${id}-panel-${index}`}
                tabIndex={index === selectedIndex ? "0" : "-1"}
            >
                {label}
            </TabsDisplay.Tab>)}
        </TabsDisplay.TabsList>

        <TabsDisplay.TabContents sizeToParent={sizeToParent}>{
            childArray.map(({key, props: {children, label, ...rest}}, index) => {
                return <TabsDisplay.TabContent
                    key={key}
                    selected={index === selectedIndex}
                    id={`${id}-panel-${index}`}
                    aria-labelledby={`${id}-tab-${index}`}
                    sizeToParent={sizeToParent}
                    {...rest}
                >
                    {children}
                </TabsDisplay.TabContent>
            })
        }</TabsDisplay.TabContents>
    </TabsDisplay>
});

Tabs.defaultProps = {
    selectedIndex: 0,
    sizeToParent: false,
};

Tabs.propTypes = {
    selectedIndex: isPositiveInteger,
    sizeToParent: PropTypes.bool,
}

export default Tabs;


Tabs.Tab = function Tab({children, label}) {
    return children
}

Tabs.Tab.propTypes = {
    label: PropTypes.node
}


Tabs.Redux = forwardRef(function TabsRedux({path, ...rest}, ref) {
    const {state: selectedIndex, setSelectedIndex} = useTab(path);

    const props = combineProps(
        rest,
        {
            selectedIndex,
            setSelectedIndex,
            ref
        }
    );

    return <Tabs {...props} />
});