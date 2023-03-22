import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements;
  rowsPerPage = 30;

  constructor(headerConfig = [], {
    url = '',
    isSortLocally = false,
    data = [],
    sorted = {}
  } = {}) {
    this.url= url;
    this.isSortLocally = isSortLocally;
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
    this.initEventListeners();
    // this.sort(this.sorted);
  }

  initEventListeners() {
    const sortableCellElems = this.subElements.header.querySelectorAll('[data-sortable="true"]');

    for (const elem of sortableCellElems) {
      elem.addEventListener('pointerdown', () => {
        this.sort({
          id: elem.dataset.id,
          order: !elem.dataset.order || elem.dataset.order === 'asc' ? 'desc' : 'asc',
        });
      });
    }
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    await this.update();

    this.subElements.header.innerHTML = this.getHeaderTemplate();
    this.subElements.body.innerHTML = this.getRowTemplate();
  }

  getSubElements() {
    const subElements = {};

    for (const elem of this.element.querySelectorAll('[data-element]')) {
      const name = elem.dataset.element;
      subElements[name] = elem;
    }

    return subElements;
  }

  getTemplate() {
    return `
            <div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row"></div>
                <div data-element="body" class="sortable-table__body"></div>
                <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
                <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                    <div>
                        <p>No products satisfies your filter criteria</p>
                        <button type="button" class="button-primary-outline">Reset all filters</button>
                    </div>
                </div>
            </div>
        `;
  }

  getHeaderTemplate() {
    return this.headerConfig.map(({ id = '', title = '', sortable = false }) => `
            <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
                <span>${title}</span>
                <span data-element="arrow" class="sortable-table__sort-arrow">
                    <span class="sort-arrow">
                </span>
            </div>
      `).join('');
  }

  getRowTemplate(data = this.data) {
    const cellTemplate = (product) => {
      return this.headerConfig.map(({ id, title, template }) => {
        if (template) {
          return template(product[id]);
        }

        return `<div class="sortable-table__cell">${product[id]}</div>`;
      }).join('');
    };

    return data.map(product => {
      return `
                <a href="/products/${product.id}" class="sortable-table__row">
                    ${cellTemplate(product)}
                </a>
            `;
    }).join('');
  }

  async loadData({ id, order, from, to }) {
    const url = new URL(`${BACKEND_URL}/${this.url}`);

    // url.searchParams.set('from', from);
    // url.searchParams.set('to', to);
    url.searchParams.set('_sort', id);
    url.searchParams.set('_order', order);
    url.searchParams.set('_start', '0');
    url.searchParams.set('_end', this.rowsPerPage);

    return await fetchJson(url);
  }

  sort(sorted) {
    const { id, data } = sorted;

    if (this.isSortLocally) {
      this.sortOnClient(id, data);
    } else {
      this.sortOnServer(id, data);
    }
  }

  sortOnClient (id, order) {
    const sortedData = this.sortData(this.sorted);

    this.subElements.body.innerHTML = this.getRowTemplate(sortedData);

    const sortHeaderCellElems = this.subElements.header.querySelectorAll('[data-sortable="true"]');

    for (const elem of sortHeaderCellElems) {
      elem.dataset.order = elem.dataset.id === id ? order : '';
    }
  }

  sortOnServer (id, order) {

  }

  sortData({ id, order }) {
    const sortData = [ ...this.data ];
    const sortType = this.headerConfig.find(item => item.id === id).sortType;

    const compare = (a, b, sortType) => {
      if (sortType === 'string') {
        return a[id].localeCompare(b[id], 'ru', { caseFirst: 'upper' });
      }
      if (sortType === 'number') {
        return a[id] - b[id];
      }
    };

    sortData.sort((a, b) => {
      if (order === 'asc') {
        return compare(a, b, sortType);
      }
      if (order === 'desc') {
        return compare(b, a, sortType);
      }
    });

    return sortData;
  }

  async update() {
    const data = await this.loadData({
      id: this.sorted.id,
      order: this.sorted.order,
    });

    this.data = data;

    this.subElements.header.innerHTML = this.getHeaderTemplate();
    this.subElements.body.innerHTML = this.getRowTemplate();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
