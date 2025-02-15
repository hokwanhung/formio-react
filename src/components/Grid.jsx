import _get from 'lodash/get';
import _isObject from 'lodash/isObject';
import _isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React from 'react';

import {defaultPageSizes} from '../constants';
import {AllItemsPerPage, PageSizes} from '../types';

import Pagination from './Pagination';

function normalizePageSize(pageSize) {
  if (_isObject(pageSize)) {
    return pageSize;
  }

  if (pageSize === AllItemsPerPage) {
    return {
      label: 'All',
      value: 999999,
    };
  }

  return {
    label: pageSize,
    value: pageSize,
  };
}

const renderPagination = ({
  pages,
  onPage,
}) => pages && onPage;

const renderPageSizeSelector = ({
  pageSize,
  pageSizes,
  onPageSizeChanged,
}) => pageSize && pageSizes && pageSizes.length && onPageSizeChanged;

const renderItemCounter = ({
  firstItem,
  lastItem,
  total,
}) => firstItem && lastItem && total;

const renderFooter = (props) => renderPagination(props) || renderItemCounter(props);

function Grid(props) {
  const {
    Cell = ({column, row}) => (<span>{_get(row, column.key, '')}</span>),
    activePage = 1,
    emptyText = 'No data found',
    firstItem = 0,
    lastItem = 0,
    onAction = () => {},
    onPage = () => {},
    onPageSizeChanged = () => {},
    onSort = () => {},
    pageNeighbours = 1,
    pageSize = 0,
    pageSizes = defaultPageSizes,
    pages = 0,
    sortOrder = '',
    total = 0,
    columns,
    items,
  } = props;
  const normalizedPageSizes = pageSizes.map(normalizePageSize);

  const getColumn = (column) => {
    const {
      key,
      sort = false,
      title = '',
      width,
    } = column;
    const className = `col col-md-${width}`;

    const columnProps = {
      key,
      className,
    };

    if (!title) {
      return (
        <div {...columnProps} />
      );
    }

    if (!sort) {
      return (
        <div {...columnProps}>
          <strong>{title}</strong>
        </div>
      );
    }

    const sortKey = _isString(sort) ? sort : key;
    const ascSort = sortKey;
    const descSort = `-${sortKey}`;

    let sortClass = '';
    if (sortOrder === ascSort) {
      sortClass = 'fa fa-caret-up bi bi-caret-up';
    }
    else if (sortOrder === descSort) {
      sortClass = 'fa fa-caret-down bi bi-caret-down';
    }

    return (
      <div {...columnProps}>
        <span
          style={{cursor: 'pointer'}}
          onClick={() => onSort(column)}
        >
          <strong>{title} <span className={sortClass}/></strong>
        </span>
      </div>
    );
  };

  const getItem = (item) => (
    <li className="list-group-item" key={item._id}>
      <div className="row" onClick={() => onAction(item, 'row')}>
        {
          columns.map((column) => (
            <div key={column.key} className={`col col-md-${column.width}`}>
              <Cell row={item} column={column} />
            </div>
          ))
        }
      </div>
    </li>
  );

  const PageSizeSelector = () => (
    <div className="col-auto">
      <div className="row align-items-center">
        <div className="col-auto">
          <select
            className="form-control"
            value={pageSize}
            onChange={(event) => onPageSizeChanged(event.target.value)}
          >
            {
              normalizedPageSizes.map(({
                label,
                value,
              }) => (
                <option key={value} value={value}>{label}</option>
              ))
            }
          </select>
        </div>
        <span className="col-auto">
          items per page
        </span>
      </div>
    </div>
  );

  const FooterPagination = () => (
    <div className="col-auto">
      <div className="row align-items-center">
        <div className="col-auto">
          <Pagination
            pages={pages}
            activePage={activePage}
            pageNeighbours={pageNeighbours}
            prev="Previous"
            next="Next"
            onSelect={onPage}
          />
        </div>
        {
          renderPageSizeSelector(props)
            ? <PageSizeSelector></PageSizeSelector>
            : null
        }
      </div>
    </div>
  );

  const ItemCounter = () => (
    <div className="col-auto ml-auto">
      <span className="item-counter float-end">
        <span className="page-num">{ firstItem } - { lastItem }</span> / { total } total
      </span>
    </div>
  );

  const Footer = () => (
    <li className="list-group-item">
      <div className="row align-items-center">
        {
          renderPagination(props)
            ? <FooterPagination></FooterPagination>
            : null
        }
        {
          renderItemCounter(props)
            ? <ItemCounter></ItemCounter>
            : null
        }
      </div>
    </li>
  );

  return (
    <div>
      {
        items.length
          ? (
            <ul className="list-group list-group-striped">
              <li className="list-group-item list-group-header hidden-xs hidden-md">
                <div className="row">
                  {columns.map(getColumn)}
                </div>
              </li>
              {items.map(getItem)}
              {
                renderFooter(props)
                  ? <Footer></Footer>
                  : null
              }
            </ul>
          )
          : <div>{emptyText}</div>
      }
    </div>
  );
}

Grid.propTypes = {
  Cell: PropTypes.func,
  activePage: PropTypes.number,
  columns: PropTypes.array.isRequired,
  emptyText: PropTypes.string,
  firstItem: PropTypes.number,
  items: PropTypes.array.isRequired,
  lastItem: PropTypes.number,
  onAction: PropTypes.func,
  onPage: PropTypes.func,
  onPageSizeChanged: PropTypes.func,
  onSort: PropTypes.func,
  pageNeighbours: PropTypes.number,
  pageSize: PropTypes.number,
  pageSizes: PageSizes,
  pages: PropTypes.number,
  sortOrder: PropTypes.string,
  total: PropTypes.number,
};

export default Grid;
