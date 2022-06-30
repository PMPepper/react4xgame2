import {forwardRef} from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { t, Trans } from "@lingui/macro";

//Helpers
import combineProps from "helpers/react/combine-props";

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
const Pagination = forwardRef(function Pagination({page, totalPages, onClickPage, firstAndLast, component: Component, ...rest}, ref) {
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
            {firstAndLast && <li className={classes.item}>
                <button className={classes.btn} disabled={isFirstPage} aria-current={isFirstPage ? true : undefined}>
                    {firstPageIcon}
                    <span className="offscreen">{t`First page`}</span>
                </button>
            </li>}

            <li className={classes.item}>
                <button className={classes.btn}  disabled={isFirstPage} aria-current={isFirstPage ? true : undefined}>
                    {prevPageIcon}
                    <span className="offscreen">{t`Previous page`}</span>
                </button>
            </li>

            {make(1, totalPages).map((curPage) => {
                const isCurPage = curPage === page;

                return <li className={classes.item} key={curPage}>
                    <button className={classes.btn}  disabled={isCurPage} aria-current={isCurPage ? true : undefined}>
                        <Trans id="pagination-selectPage">
                            <span className="offscreen">Page</span>
                            <Number children={curPage} />
                        </Trans>
                    </button>
                </li>
            })}

            <li className={classes.item}>
                <button className={classes.btn}  disabled={isLastPage} aria-current={isLastPage ? true : undefined}>
                    {nextPageIcon}
                    <span className="offscreen">{t`Next page`}</span>
                </button>
            </li>

            {firstAndLast && <li className={classes.item}>
                <button className={classes.btn}  disabled={isLastPage} aria-current={isLastPage ? true : undefined}>
                    {lastPageIcon}
                    <span className="offscreen">{t`Last page`}</span>
                </button>
           </li>}
        </ul>
    </Component>
});

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
    onClickPage: PropTypes.func,
}
