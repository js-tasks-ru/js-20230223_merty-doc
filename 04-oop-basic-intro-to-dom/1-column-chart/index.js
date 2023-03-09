export default class ColumnChart {
    chartHeight = 50;
    status = 'idle';

    constructor({ data = [], label = '', link = '', value, formatHeading = value => value } = {}) {
        this.data = data;
        this.label = label;
        this.link = link;
        this.value = formatHeading(value);

        this.status = data.length > 0 ? 'idle' : 'loading';

        this.render();
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();
        this.element = wrapper.firstElementChild;

        this.getElements();

        if (this.status !== 'loading') {
            this.elements.body.innerHTML = this.getListElements();
        }
    }

    getElements() {
        this.elements = {};

        for (const elem of this.element.querySelectorAll('[data-element]')) {
            const name = elem.getAttribute('data-element');
            this.elements[name] = elem;
        }
    }

    getTemplate() {
        return `
        <div class="column-chart${this.status === 'loading' ? ' column-chart_loading' : ''}" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
                ${this.label}
                ${this.link && '<a class="column-chart__link" href="' + this.link + '">View all</a>'}
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this.value}</div>
                <div data-element="body" class="column-chart__chart"></div>
            </div>
        </div> 
        `;
    }

    getListElements() {
        const data = this.getColumnProps(this.data);

        return data.map(({ percent, value }) => `
            <div style="--value: ${value}" data-tooltip="${percent}"></div>
        `).join('');
    }

    getColumnProps(data) {
        const maxValue = Math.max(...data);
        const scale = 50 / maxValue;

        return data.map(item => {
            return {
                percent: (item / maxValue * 100).toFixed(0) + '%',
                value: String(Math.floor(item * scale))
            };
        });
    }

    update(newData) {
        if (!newData) return;
        this.data = newData;
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
    }
}
