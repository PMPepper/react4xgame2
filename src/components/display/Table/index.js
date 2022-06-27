import { forwardRef } from 'react';

//Utils
import combineProps from 'helpers/react/combine-props';

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
export const TableRow = Table.Row = forwardRef(function TableRow({children, ...rest}, ref) {
    const props = combineProps(
        {
            className: classes.tr,
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