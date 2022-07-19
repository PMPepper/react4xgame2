import { forwardRef } from "react";
import PropTypes from 'prop-types';

//Helpers
import combineProps from "helpers/react/combine-props";
import classnames from "helpers/css/class-list-to-string";

//Other
import classes from './Grid.module.scss';


//The components
const Grid = forwardRef(function Grid({children, columns, rows, rowGap, columnGap, component: Component, ...rest}, ref) {
    const props = combineProps(
        rest,
        {
            style: {
                gridTemplateColumns: columns.join(' '),//TODO probably want to do something smarter here?
                gridTemplateRows: rows ? rows.join(' ') : undefined
            },
            className: classnames(classes.grid, classes[`${columnGap}ColumnGap`], classes[`${rowGap}RowGap`]),
            ref
        }
    );

    return <Component {...props}>
        {children}
    </Component>
});

Grid.defaultProps = {
    columnGap: 'standard',
    rowGap: 'standard',
    component: 'div',
    rows: null
};

const gapTypes = PropTypes.oneOf(['standard', 'small', 'large']);

Grid.propTypes = {
    columnGap: gapTypes,
    rowGap: gapTypes,
    component: PropTypes.node,
    rows: PropTypes.arrayOf(PropTypes.string),
}


export default Grid;


export const Cell = Grid.Cell = forwardRef(function Cell({children, column, row, component: Component, ...rest}, ref) {
    const props = combineProps(
        rest,
        {
            style: {
                gridColumn: column ?? undefined,
                gridRow: row ?? undefined,
            },
            className: classes.cell,
            ref
        }
    );

    return <Component {...props}>
        {children}
    </Component>
});

Cell.defaultProps = {
    column: null,
    row: null,
    component: 'div',
};