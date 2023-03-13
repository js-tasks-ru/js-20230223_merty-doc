export default class SortableTable {
    sortParams = {};

    constructor(headerConfig = [], data = []) {
        this.headerConfig = headerConfig;
        this.data = data;

        this.render();
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();
        this.element = wrapper.firstElementChild;

        this.subElements = this.getSubElements();

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
        const sortableCaretTemplate = () => `
            <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow">
            </span>
        `;

        return this.headerConfig
            .map(({ id = '', title = '', sortable = false, template }) => {
                if (template) return template();

                return `
                    <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order>
                        <span>${title}</span>
                        ${sortable ? sortableCaretTemplate() : ''}
                    </div>
                `;
            })
            .join('');
    }

    getRowTemplate() {
        const cellTemplate = data => `<div class="sortable-table__cell">${data}</div>`;

        return this.data
            .map(({ id = '', images = [], title = '', quantity = 0, price = 0, sales = 0, }) => {
                return `
                    <a href="/products/${id}" class="sortable-table__row">
                        ${images.length && cellTemplate('<img class="sortable-table-image" alt="Image" src="' + images[0] + '">')}
                        ${title && cellTemplate(title)}
                        ${quantity && cellTemplate(quantity)}
                        ${price && cellTemplate(price)}
                        ${sales && cellTemplate(sales)}
                    </a>
                `;
            })
            .join('');
    }

    sort(field = 'title', order = 'asc') {
        this.sortParams = { field, order };

        const sortData = [ ...this.data ];
        const sortType = this.headerConfig.find(item => item.id === field).sortType;

        const compare = (a, b, sortType) => {
            if (sortType === 'string') {
                return a[field].localeCompare(b[field], 'ru', { caseFirst: 'upper' });
            }
            if (sortType === 'number') {
                return a[field] - b[field];
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

        this.update(sortData);
    }

    update(data = []) {
        if (data.length) {
            this.data = data;
            this.subElements.body.innerHTML = this.getRowTemplate();
        }

        if (this.sortParams.field && this.sortParams.order) {
            this.subElements.header.innerHTML = this.getHeaderTemplate();
            const sortHeaderCellElem = this.subElements.header.querySelector(`[data-id="${this.sortParams.field}"]`);
            sortHeaderCellElem.dataset.order = this.sortParams.order;
        }
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
        this.sortParams = {};
    }
}

