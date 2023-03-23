import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
    element;
    subElements;
    page = 0;
    rowsPerPage = 30;
    status = 'pending';
    isLoaded = false;

    handleClick = (event) => {
        this.handleClickSort(event);
    }

    handleScroll = () => {
        this.handleInfinityScroll();
    };

    constructor(headerConfig = [], {
        url = '',
        isSortLocally = false,
        data = [],
        sorted = { id: 'title', order: 'asc' }
    } = {}) {
        this.url = url;
        this.isSortLocally = isSortLocally;
        this.headerConfig = headerConfig;
        this.data = data;
        this.sorted = sorted;

        this.render();
        this.initEventListeners();
        this.update(this.sorted);
    }

    initEventListeners() {
        this.subElements.header.addEventListener('pointerdown', this.handleClick);
        document.addEventListener('scroll', this.handleScroll);
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();
        this.element = wrapper.firstElementChild;

        this.subElements = this.getSubElements();

        this.subElements.header.innerHTML = this.getHeaderTemplate();
        this.subElements.body.innerHTML = this.getRowTemplate();
        this.subElements.arrow = this.subElements.header.querySelector('[data-element="arrow"]');
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
        const arrow = `
          <span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow">
          </span>
        `;

        return this.headerConfig.map(({ id = '', title = '', sortable = false }) => `
            <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}"${sortable ? ' data-order="asc"' : ''}>
                <span>${title}</span>
                ${id === this.sorted.id ? arrow : ''}
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

    async handleInfinityScroll() {
        if (this.status === 'loading') return;

        if (this.element.getBoundingClientRect().bottom < document.documentElement.clientHeight) {
            this.page += 1;
            this.status = 'loading';

            const data = await this.loadData();
            await this.renderRows(data);

            this.data = [ ...this.data, ...data ];
            this.status = 'pending';
        }
    }

    handleClickSort(event) {
        const sortableElem = event.target.closest('[data-sortable="true"]');

        if (!sortableElem) return;

        this.sorted = {
            id: sortableElem.dataset.id,
            order: sortableElem.dataset.order === 'asc' ? 'desc' : 'asc'
        };

        const { id, order } = this.sorted;
        sortableElem.dataset.order = order;
        sortableElem.append(this.subElements.arrow);

        if (this.isSortLocally) {
            this.sortOnClient(id, order);
        } else {
            this.sortOnServer(id, order);
        }
    }

    renderRows(data) {
        const rows = this.getRowTemplate(data);
        this.subElements.body.insertAdjacentHTML('beforeend', rows);
    }

    async loadData({ id, order } = this.sorted) {
        const url = new URL(`${BACKEND_URL}/${this.url}`);

        url.searchParams.set('_sort', id);
        url.searchParams.set('_order', order);
        url.searchParams.set('_start', String(this.page * this.rowsPerPage));
        url.searchParams.set('_end', String((this.page + 1) * this.rowsPerPage));

        return await fetchJson(url);
    }

    sortOnClient(id, order) {
        const data = this.sortData(id, order);
        this.subElements.body.innerHTML = this.getRowTemplate(data);
    }

    sortOnServer(id, order) {
        this.page = 0;
        this.isLoaded = false;
        this.update({ id, order });
    }

    sortData(id, order) {
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

    async update({ id, order } = this.sorted) {
        if (this.url && !this.isLoaded) {
            this.data = await this.loadData({ id, order });
            this.isLoaded = true;
        }

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
        this.page = 0;
        this.status = 'pending';
        this.isLoaded = false;

        document.removeEventListener('scroll', this.handleScroll);
    }
}
