//TODO display very large number of pages
import {forwardRef} from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { t, Trans } from "@lingui/macro";

//Helpers
import combineProps from "helpers/react/combine-props";
import classnames from "helpers/css/class-list-to-string";

//Other
import classes from './Pagination.module.scss';
import isPositiveNonzeroInteger from "prop-types/is-positive-nonzero-integer";
import Number from "components/format/Number";
import make from "helpers/array/make";

//Consts
const firstPageIcon = <FontAwesomeIcon icon={solid('backward-step')} />;
const prevPageIcon = <FontAwesomeIcon icon={solid('angle-left')} />;
const nextPageIcon = <FontAwesomeIcon icon={solid('angle-right')} />;
const lastPageIcon = <FontAwesomeIcon icon={solid('forward-step')} />;


//The component
const Pagination = forwardRef(function Pagination({page, totalPages, onSetPage, firstAndLast, component: Component, ...rest}, ref) {
    const isFirstPage = page <= 1;
    const isLastPage = page >= totalPages;

    const props = combineProps(
        {
            className: classes.pagination,
            ref
        },
        rest
    );

    return <Component {...props}>
        <ul className={classes.list}>
            {firstAndLast && <Item isCurrent={false} isDisabled={isFirstPage} onClick={onSetPage ? () => onSetPage(1) : null}>
                {firstPageIcon}
                <span className="offscreen">{t`First page`}</span>
            </Item>}
            
            <Item isCurrent={false} isDisabled={isFirstPage} onClick={onSetPage ? () => onSetPage(page - 1) : null}>
                {prevPageIcon}
                <span className="offscreen">{t`Previous page`}</span>
            </Item>


            {make(1, totalPages).map((curPage) => {
                const isCurPage = curPage === page;

                return <Item key={curPage} isCurrent={isCurPage} onClick={onSetPage ? () => onSetPage(curPage) : null}>
                    <Trans id="pagination-selectPage">
                        <span className="offscreen">Page</span>
                        <Number children={curPage} />
                    </Trans>
                </Item>
            })}

            <Item isDisabled={isLastPage} onClick={onSetPage ? () => onSetPage(page + 1) : null}>
                {nextPageIcon}
                <span className="offscreen">{t`Next page`}</span>
            </Item>

            {firstAndLast && <Item isDisabled={isLastPage} onClick={onSetPage ? () => onSetPage(totalPages) : null}>
                {lastPageIcon}
                <span className="offscreen">{t`Last page`}</span>
            </Item>}
        </ul>
    </Component>
});

function Item({children, isCurrent = false, isDisabled = false, onClick = null}) {
    return <li className={classnames(classes.item, isDisabled && classes.disabled)}  aria-current={isCurrent ? true : undefined}>
        <button type="button" className={classnames(classes.btn, isDisabled && classes.disabled)} onClick={!isCurrent ? onClick : null}>
            {children}
        </button>
    </li>
}

Item.propTypes = {
    isCurrent: PropTypes.bool,
    isDisabled: PropTypes.bool,
    onClick: PropTypes.func
}

export default Pagination;

Pagination.defaultProps = {
    component: 'div',
    firstAndLast: true
};

Pagination.propTypes = {
    page: isPositiveNonzeroInteger.isRequired,
    totalPages: isPositiveNonzeroInteger.isRequired,

    component: PropTypes.elementType,
    firstAndLast: PropTypes.bool,
    onSetPage: PropTypes.func,
}
