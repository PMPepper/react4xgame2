const { memo } = require("react");

//Either call with 'useChildren' = true, and memoise children as required in calling component,
//OR call with 'args' prop, which is array of values, that gets shallow value compared with the prev to decide to rerender or not


function skipRerender(prevProps, nextProps) {
    if(nextProps.useChildren) {
        return prevProps.children === nextProps.children;
    }

    const {args: prevArgs} = prevProps;
    const {args: nextArgs} = nextProps;

    if(prevArgs.length != nextArgs.length) {
        return false;
    }

    return prevArgs.every((val, i) => val === nextArgs[i]);
}

const Memo = memo(function Memo({children}) {
    return children;
}, skipRerender);

export default Memo;