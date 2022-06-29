//TODO 'sticky' table headers?

import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

//Components
import IconStack from 'components/display/IconStack';

//Utils
import combineProps from 'helpers/react/combine-props';
import classnames from 'helpers/css/class-list-to-string';

//Other
import classes from './Table.module.scss';


//The component
const Table = forwardRef(function Table({children, columns, ...rest}, ref) {
    const props = combineProps(
        {
            className: classes.table,
            style: {
                gridTemplateColumns: columns
            },
            ref
        },
        rest
    )

    return <table {...props}>
        {children}
    </table>
});

export default Table;

//Table head
export const TableHead = Table.Head = forwardRef(function Table({children, ...rest}, ref) {
    const props = combineProps(
        {
            className: classes.thead,
            ref
        },
        rest
    )

    return <thead {...props}>
        {children}
    </thead>
});

//Table body
export const TableBody = Table.Body = forwardRef(function TableHead({children, ...rest}, ref) {
    const props = combineProps(
        {
            className: classes.tbody,
            ref
        },
        rest
    )

    return <tbody {...props}>
        {children}
    </tbody>
});

//Table body
export const TableFoot = Table.Foot = forwardRef(function TableFoot({children, ...rest}, ref) {
    const props = combineProps(
        {
            className: classes.tfoot,
            ref
        },
        rest
    )

    return <tfoot {...props}>
        {children}
    </tfoot>
});

//Table row
export const TableRow = Table.Row = forwardRef(function TableRow({children, even, ...rest}, ref) {
    const props = combineProps(
        {
            className: classnames(classes.tr, even && classes.even),
            ref
        },
        rest
    )

    return <tr {...props}>
        {children}
    </tr>
});

//Table header cell
export const TableHeaderCell = Table.HeaderCell = forwardRef(function TableHeaderCell({children, ...rest}, ref) {
    const props = combineProps(
        {
            className: classes.th,
            ref
        },
        rest
    )

    return <th {...props}>
        {children}
    </th>
});

//Table header cell
export const TableCell = Table.Cell = forwardRef(function TableCell({children, ...rest}, ref) {
    const props = combineProps(
        {
            className: classes.td,
            ref
        },
        rest
    )

    return <td {...props}>
        {children}
    </td>
});

//Caption
export const Caption = Table.Caption = forwardRef(function Caption({children, ...rest}, ref) {
    const props = combineProps(
        {
            className: classes.caption,
            ref
        },
        rest
    )

    return <caption {...props}>
        {children}
    </caption>
});

//sortDir being set means this is being sorted on
export const ColumnSort = Table.ColumnSort = forwardRef(function ColumnSort({children, sort, sortDir, ...rest}, ref) {
    const props = combineProps(
        {
            className: classnames(classes.columnSort, classes[`sortDir-${sortDir}`]) ,
            ref
        },
        rest
    );

    const icon = sortDir === 'asc' ?
        sortAscIcon
        :
        sortDir === 'desc' ?
            sortDescIcon
            :
            sortIcon

    return <button {...props}>
        {children}
        <span className={classes.icon}>{icon}</span>
    </button>
});

ColumnSort.propTypes = {
    sortDir: PropTypes.oneOf(['asc', 'desc'])
}

const sortIcon = <FontAwesomeIcon icon={solid('sort')} />

const sortAscIcon = <IconStack>
    <FontAwesomeIcon icon={solid('sort-down')} className={classes.faint} />
    <FontAwesomeIcon icon={solid('sort-up')} />
</IconStack>

const sortDescIcon = <IconStack>
    <FontAwesomeIcon icon={solid('sort-down')} />
    <FontAwesomeIcon icon={solid('sort-up')} className={classes.faint} />
</IconStack>