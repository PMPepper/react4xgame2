//TODO
import { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

//Components
import TableDisplay from 'components/display/Table';
import Number from 'components/format/Number';

//Helpers
import reverse from 'helpers/sorting/reverse';
import sortOnProp from 'helpers/sorting/sort-on-prop';
import getNatsortCompare from 'helpers/sorting/get-natsort-compare';

//Consts
const builtInFormats = {
    numeric: (value) => <Number>{value}</Number>,
    date: null,
    datetime: null,
};

const builtInSortTypes = {
    alphabetical: ({langcode, collatorOptions} = {}) => {
        //TODO use current langcode as default
        return getNatsortCompare(langcode, collatorOptions);
    },
    numeric: () => {
        return (a, b) => {
            return a - b;
        }
    },
    date: () => {
        return (a, b) => {
            return a.valueOf() - b.valueOf();
        }
    },

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

    onSort = null,//function we call to apply sorting

    ...rest
}, ref) {
    const columnWidths = useMemo(
        () => columns.map(({width}) => width ?? 'auto').join(' '),
        [columns]
    );

    //sorting
    const sortedData = useSortData(data, columns, sortCol, sortDir);

    //TODO pagination
    const paginatedData = sortedData;

    //Rendering
    let rowIndex = 1;

    //refer to the Table diplay component as Table;
    const Table = TableDisplay;

    return <Table columns={columnWidths}>
        {caption && <Table.Caption>{caption}</Table.Caption>}
        <Table.Head>
            <Table.Row>
                {columns.map(({name, label, sortType}) => {
                    const isSortedColumn = sortCol === name;
                    const content = sortType ?
                        <Table.ColumnSort
                            sortDir={isSortedColumn ? sortDir : undefined}
                            onClick={onSort ? () => onSort(name, isSortedColumn && sortDir === 'asc' ? 'desc' : 'asc') : null}
                        >
                            {label}
                        </Table.ColumnSort>
                        :
                        label;
                    

                    return <Table.HeaderCell
                        key={name}
                        scope="col"
                        aria-sort={isSortedColumn ? sortDir === 'asc' ? 'ascending' : 'descending' : undefined}
                    >
                        {content}
                    </Table.HeaderCell>
                })}
            </Table.Row>
        </Table.Head>

        {paginatedData.map((rows, index) => {
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


function useSortData(data, columns, sortCol, sortDir) {
    return useMemo(
        () => {
            if(!sortCol) {
                return data;
            }

            const column = getColumnByName(columns, sortCol);
            const getColSortMethod = column?.sortType instanceof Function ?
                column?.sortType
                :
                builtInSortTypes[column?.sortType]
            
            if(!getColSortMethod) {//something has gone wrong - set to sort on a non-existent column, OR a column that is not sortable, OR column is set to sort using a non-existent sorting type
                return data;//just return unsorted data for now
            }

            const colSortMethod = getColSortMethod(column.sortOptions);
            const sortColPropMethod = sortDir === 'desc' ?
                reverse(sortOnProp(colSortMethod, sortCol))
                :
                sortOnProp(colSortMethod, sortCol);

            return data.map(rows => {
                return rows.sort(sortColPropMethod);
            })
        },
        [data, columns, sortCol, sortDir]
    );
}

function getColumnByName(columns, name) {
    return columns.find((column) => column.name === name);
}