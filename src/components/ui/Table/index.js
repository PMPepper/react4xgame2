//TODO
import { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

//Components
import TableDisplay from 'components/display/Table';

//Consts
const builtInFormats = {
    numeric: null,
    date: null,
    datetime: null,
};

const builtInSortTypes = {
    alphabetical: null,
    numeric: null,
    date: null,

};



//The component
const Table = forwardRef(function Table({
    //Required props
    columns,
    data,
    //Optional props
    sortCol = null,
    sortDir = null,
    caption = null,
    ...rest
}, ref) {
    const columnWidths = useMemo(
        () => columns.map(({width}) => width ?? 'auto').join(' '),
        [columns]
    );

    let rowIndex = 1;

    //refer to the Table diplay component as Table;
    const Table = TableDisplay;

    return <Table columns={columnWidths}>
        <Table.Head>
            <Table.Row>
                {columns.map(({name, label, sortType}) => {
                    const content = sortType ?
                        <Table.ColumnSort sortDir={sortCol === name ? sortDir : undefined}>{label}</Table.ColumnSort>
                        :
                        label;

                    return <Table.HeaderCell key={name} scope="col">{content}</Table.HeaderCell>
                })}
            </Table.Row>
        </Table.Head>

        {data.map((rows, index) => {
            return <Table.Body key={index}>
                {rows.map((row, index) => {
                    return <Table.Row even={++rowIndex%2} key={index}>
                        {columns.map((column, index) => {
                            const Cell = column.rowHeader ? Table.HeaderCell : Table.Cell;

                            const content = getFormattedCellContent(row[column.name], column);
                            
                            return <Cell key={index} scope={column.rowHeader ? 'row' : undefined}>{content}</Cell>
                        })}
                    </Table.Row>
                })}
            </Table.Body>
        })}
    </Table>
})

export default Table;

Table.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        //Required
        name: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired,
        //optional
        rowHeader: PropTypes.bool,
        format: PropTypes.oneOfType([
            PropTypes.oneOf(Object.keys(builtInFormats)),
            PropTypes.func
        ]),
        //formatProps: can be anything
        sortType: PropTypes.oneOfType([
            PropTypes.oneOf(Object.keys(builtInSortTypes)),
            PropTypes.func
        ]),
        width: PropTypes.string,//defaults to 'auto'
    })).isRequired,

    sortCol: PropTypes.string,
    sortDir: PropTypes.oneOf(['asc', 'desc']),
    caption: PropTypes.node,

};

//internal helpers
function getFormattedCellContent(value, {format, formatProps}) {
    if(!format) {
        return value;
    }

    const formatFunc = format instanceof Function ? format : builtInFormats[format];

    return formatFunc(value, formatProps);
}