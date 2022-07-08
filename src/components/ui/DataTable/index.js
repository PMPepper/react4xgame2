//TODO
//Add sticky option for header row/column ?
//Selectable row support
//Disable row support
import { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';

//Components
import Table from 'components/display/Table';
import Number from 'components/format/Number';
import Pagination from 'components/ui/Pagination';
import { OverflowTooltip } from 'components/ui/Tooltip';

//Hooks
import { useDataTable } from 'redux/factories/dataTable';

//Helpers
import reverse from 'helpers/sorting/reverse';
import sortOnProp from 'helpers/sorting/sort-on-prop';
import getNatsortCompare from 'helpers/sorting/get-natsort-compare';
import classnames from 'helpers/css/class-list-to-string';
import combineProps from 'helpers/react/combine-props';

//Other
import classes from './DataTable.module.scss';

//Consts
const builtInFormats = {
    numeric: (value, options) => <Number {...options}>{value}</Number>,
    percent: (value, options) => <Trans id="datatable.formatPercent"><Number children={value * 100} decimalPlaces={0} {...options} />%</Trans>,
    date: null,//TODO
    datetime: null,//TODO
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
const DataTable = forwardRef(function DataTable({
    //Required props
    columns,
    data,
    //Optional props
    colGroups = null,
    sortCol = null,
    sortDir = null,
    caption = null,

    tbodyClasses = null,
    rowClasses = null,

    page = 1,
    rowsPerPage = null,
    onSetPage = null,

    onSetSort = null,//function we call to apply sorting

    ...rest
}, ref) {
    
    
    const columnWidths = useMemo(
        () => columns.map(({width}) => width ?? 'auto').join(' '),
        [columns]
    );

    //normalise row data + count rows
    const [normalisedData, totalRows] = useNormalisedRowData(data)

    //sorting
    const sortedData = useSortData(normalisedData, columns, sortCol, sortDir);

    //pagination
    const hasPagination = rowsPerPage > 0 && totalRows > rowsPerPage;

    const paginatedData = usePaginatedData(hasPagination, sortedData, page, rowsPerPage);

    //Rendering
    const totalPages = hasPagination ?
        Math.ceil(totalRows / rowsPerPage)
        :
        null;
    
    let rowIndex = 0;

    const header = useRenderHead(columns, colGroups, sortCol, sortDir, onSetSort, classes, caption ? 2 : 1);

    return <Table columns={columnWidths} {...rest}>
        {caption && <Table.Caption>{caption}</Table.Caption>}
        
        {header}

        {paginatedData.map((rows, index) => {
            return <Table.Body key={index} className={getClasses(tbodyClasses)}>
                {rows.map((row, index) => {
                    ++rowIndex;

                    return <Table.Row even={rowIndex%2} key={index} className={getClasses(rowClasses, row, rowIndex)}>
                        {columns.map((column, index) => {
                            const isSortedColumn = sortCol === column.name;
                            const Cell = column.rowHeader ? Table.HeaderCell : Table.Cell;

                            const content = getFormattedCellContent(row[column.name], column);
                            
                            return <Cell
                                key={index}
                                scope={column.rowHeader ? 'row' : undefined}
                                className={classnames(isSortedColumn && classes.sortedCell, column.textAlign && classes[column.textAlign], getClasses(column.cellClasses, row, column.rowHeader))}
                            >
                                {content}
                            </Cell>
                        })}
                    </Table.Row>
                })}
            </Table.Body>
        })}

        {hasPagination && <Table.Foot>
            <Table.Row>
                <Table.Cell className={classes.paginationCell} colSpan="1 / -1">
                    <Pagination page={page} totalPages={totalPages} onSetPage={onSetPage} />
                </Table.Cell>
            </Table.Row>
        </Table.Foot>}
    </Table>
})

export default DataTable;

const classesPropType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func
]);

DataTable.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        //Required
        name: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired,
        //optional
        textAlign: PropTypes.oneOf(['left', 'right', 'center', 'start', 'end']),
        rowHeader: PropTypes.bool,
        format: PropTypes.oneOfType([
            PropTypes.oneOf(Object.keys(builtInFormats)),
            PropTypes.func
        ]),
        //formatOptions: can be anything
        sortType: PropTypes.oneOfType([
            PropTypes.oneOf(Object.keys(builtInSortTypes)),
            PropTypes.func
        ]),
        width: PropTypes.string,//defaults to 'auto'
        cellClasses: classesPropType,//func(row|null {for header}, isHeader [bool])
    })).isRequired,

    sortCol: PropTypes.string,
    sortDir: PropTypes.oneOf(['asc', 'desc']),
    caption: PropTypes.node,

    tbodyClasses: classesPropType,
    rowClasses: classesPropType,//func(row, rowIndex)
};


export const DataTableRedux = DataTable.Redux = forwardRef(function DataTableRedux({name, path, ...rest}, ref) {
    const {state, onSetSort, onSetPage} = useDataTable(path);

    const props = combineProps(
        {
            ...state,
            onSetSort,
            onSetPage,
            ref
        },
        rest
    );

    return <DataTable {...props} />
})



//internal helpers
function useRenderHead(columns, colGroups, sortCol, sortDir, onSetSort, classes, startRow = 1) {
    const [groupCells, colHasGroup] = useMemo(
        () => {
            if(!colGroups || colGroups.length == 0) {
                return [null, null];
            }

            const groupCells = [];
            const colHasGroup = [];

            if(colGroups?.length > 0) {
                colGroups.forEach(({label, colSpan, startColumn}) => {
                    startColumn = typeof(startColumn) === 'string' ? 
                        getColumnIndexByName(columns, startColumn) + 1
                        :
                        startColumn;
                    
                    const endColumn = colSpan ?
                        startColumn + colSpan - 1
                        :
                        startColumn + 1;
                    
                    const cell = <Table.HeaderCell
                        key={`${startColumn} / ${endColumn + 1}`}
                        scope="col"
                        rowSpan={`${startRow} / ${startRow + 1}`}
                        colSpan={`${startColumn} / ${endColumn + 1}`}
                    >
                        {label}
                    </Table.HeaderCell>

                    groupCells[startColumn - 1] = cell;

                    for(let i = startColumn - 1; i < endColumn; i++) {
                        colHasGroup[i] = true;
                    }
                })
            }

            return [groupCells, colHasGroup];
        },
        [columns, colGroups]
    );

    return useMemo(
        () => {
            const headerCells = [];
            const hasColGroups = groupCells !== null;

            columns.forEach(({name, label, sortType, cellClasses, textAlign}, index) => {
                const hasGroup = !!colHasGroup?.[index];
                const isSortedColumn = sortCol === name;
                label = <OverflowTooltip>{label}</OverflowTooltip>;
                const content = sortType ?
                    <Table.ColumnSort
                        sortDir={isSortedColumn ? sortDir : undefined}
                        onClick={onSetSort ? () => onSetSort(name, isSortedColumn && sortDir === 'asc' ? 'desc' : 'asc') : null}
                    >
                        {label}
                    </Table.ColumnSort>
                    :
                    label;

                const cell = <Table.HeaderCell
                    key={name}
                    scope="col"
                    aria-sort={isSortedColumn ? sortDir === 'asc' ? 'ascending' : 'descending' : undefined}
                    className={classnames(isSortedColumn && classes.sortedCell, textAlign && classes[textAlign], getClasses(cellClasses, null, true))}
                    rowSpan={hasColGroups && !hasGroup ? `${startRow} / ${startRow + 2}` : undefined}
                >
                    {content}
                </Table.HeaderCell>

                if(hasColGroups && !hasGroup) {
                    groupCells[index] = cell;
                } else {
                    headerCells.push(cell);
                }
            });

            return <Table.Head>
                {groupCells?.length > 0 && <Table.Row>
                    {groupCells}
                </Table.Row>}
                <Table.Row>
                    {headerCells}
                </Table.Row>
            </Table.Head>
        },
        [columns, groupCells, colHasGroup, sortCol, sortDir, onSetSort, classes, startRow]
    )
}
function getClasses(cellClasses, ...args) {
    if(!cellClasses) {
        return null;
    }

    if(typeof(cellClasses) === 'string') {
        return cellClasses;
    }

    return cellClasses();
}

function getFormattedCellContent(value, {format, formatOptions}) {
    if(!format) {
        return value;
    }

    const formatFunc = format instanceof Function ? format : builtInFormats[format];

    return formatFunc(value, formatOptions);
}


function useNormalisedRowData(data) {
    return useMemo(
        () => {
            if(data[0] instanceof Array) {
                return [
                    data,
                    data.reduce((count, rows) => count + rows.length, 0)
                ]
            }
        
            return [
                [data],
                data.length
            ]
        },
        [data]
    )
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

function usePaginatedData(hasPagination, sortedData, page, rowsPerPage) {
    return useMemo(
        () => {
            if(!hasPagination) {
                return sortedData;
            }

            const startIndex = (page - 1) * rowsPerPage;
            const endIndex = page * rowsPerPage;
            let curIndex = 0;
            let curGroup = null;

            const paginatedData = [];

            for(let i = 0; i < sortedData.length; i++) {
                const rows = sortedData[i];

                if(curIndex + rows.length < startIndex) {
                    curIndex += rows.length;
                } else {
                    curGroup = [];
                    paginatedData.push(curGroup);

                    for(let j = 0; j < rows.length; j++) {
                        if(curIndex >= endIndex) {
                            return paginatedData;
                        }

                        if(curIndex >= startIndex) {
                            curGroup.push(rows[j])
                        }

                        curIndex++;
                    }

                    if(curIndex >= endIndex) {
                        return paginatedData;
                    }
                }
            }

            return paginatedData;
        },
        [hasPagination, sortedData, page, rowsPerPage]
    );
}

function getColumnByName(columns, name) {
    return columns.find((column) => column.name === name);
}

function getColumnIndexByName(columns, name) {
    return columns.findIndex((column) => column.name === name);
}
