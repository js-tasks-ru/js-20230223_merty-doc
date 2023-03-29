import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
    element;
    subElements;
    ordersChart;
    salesChart;
    customersChart;
    sortableTable;

    constructor() {
        this.to = new Date();
        this.from = new Date(this.to.getFullYear(), this.to.getMonth(), this.to.getDate() - 2);
        this.bestsellersUrl = new URL('/api/dashboard/bestsellers', BACKEND_URL);
    }

    get template() {
        return `
            <div class="dashboard">
                <div class="content__top-panel">
                    <h2 class="page-title">Dashboard</h2>
                    <div data-element="rangePicker"></div>
                </div>
                <div data-element="chartsRoot" class="dashboard__charts">
                    <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                    <div data-element="salesChart" class="dashboard__chart_sales"></div>
                    <div data-element="customersChart" class="dashboard__chart_customers"></div>
                </div>
                
                <h3 class="block-title">Best sellers</h3>
    
                <div data-element="sortableTable"></div>
            </div>
        `;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.template;
        this.element = wrapper.firstElementChild;
        this.subElements = this.getSubElements();

        const from = this.from;
        const to = this.to;

        this.rangePicker = new RangePicker({ from, to });

        this.ordersChart = new ColumnChart({
            url: '/api/dashboard/orders',
            label: 'Заказы',
            link: '/sales',
            range: { from, to },
        });

        this.salesChart = new ColumnChart({
            url: '/api/dashboard/sales',
            label: 'Продажи',
            formatHeading: (data) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data),
            range: { from, to },
        });

        this.customersChart = new ColumnChart({
            url: '/api/dashboard/customers',
            label: 'Клиенты',
            range: { from, to },
        });

        this.sortableTable = new SortableTable(header, {
            url: `/api/dashboard/bestsellers?from=${this.from.toISOString()}&to=${this.to.toISOString()}`,
            isSortLocally: true,
        });

        this.subElements.rangePicker.append(this.rangePicker.element);
        this.subElements.ordersChart.append(this.ordersChart.element);
        this.subElements.salesChart.append(this.salesChart.element);
        this.subElements.customersChart.append(this.customersChart.element);
        this.subElements.sortableTable.append(this.sortableTable.element);

        this.initEventListeners();

        return this.element;
    }

    initEventListeners() {
        document.addEventListener('date-select', event => {
            this.from = event.detail.from;
            this.to = event.detail.to;
            this.update();
        });
    }

    getSubElements() {
        const subElements = {};

        for (const elem of this.element.querySelectorAll('[data-element]')) {
            subElements[elem.dataset.element] = elem;
        }

        return subElements;
    }

    update() {
        this.ordersChart.update(this.from, this.to);
        this.salesChart.update(this.from, this.to);
        this.customersChart.update(this.from, this.to);
        this.updateTable();
    }

    async updateTable() {
        this.bestsellersUrl.searchParams.set('from', this.from.toISOString());
        this.bestsellersUrl.searchParams.set('to', this.to.toISOString());
        this.bestsellersUrl.searchParams.set('_sort', 'title');
        this.bestsellersUrl.searchParams.set('_order', 'asc');
        this.bestsellersUrl.searchParams.set('_start', '0');
        this.bestsellersUrl.searchParams.set('_end', '30');

        this.sortableTable.subElements.body.innerHTML = '';
        this.sortableTable.subElements.loading.style.display = 'block';

        const data = await fetchJson(this.bestsellersUrl);

        this.sortableTable.subElements.loading.style.display = '';
        this.sortableTable.update(data);
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
        this.ordersChart = null;
        this.salesChart = null;
        this.customersChart = null;
        this.sortableTable = null;
    }
}
