export default class DoubleSlider {
    element;
    subElements;

    handleMoveFrom = event => {
        const { left, width } = this.subElements.inner.getBoundingClientRect();
        const { clientX } = event;

        const percent = (clientX - left) / width;
        const result = this.min + percent * (this.max - this.min);

        if (result >= this.selected.to) {
            this.selected.from = this.selected.to;
        } else if (result <= this.min) {
            this.selected.from = this.min;
        } else {
            this.selected.from = Math.round(result);
        }

        this.leftThumbUpdate();
    }

    handleMoveTo = event => {
        const { right, width } = this.subElements.inner.getBoundingClientRect();
        const { clientX } = event;

        const percent = (right - clientX) / width;
        const result = this.max - percent * (this.max - this.min);

        if (result <= this.selected.from) {
            this.selected.to = this.selected.from;
        } else if (result >= this.max) {
            this.selected.to = this.max;
        } else {
            this.selected.to = Math.round(result);
        }

        this.rightThumbUpdate();
    }

    handleUp = () => {
        this.element.dispatchEvent(new CustomEvent('range-select', {
            detail: this.selected
        }));

        document.removeEventListener('pointermove', this.handleMoveFrom);
        document.removeEventListener('pointermove', this.handleMoveTo);
    }

    constructor({ min = 20, max = 100, formatValue = value => value, selected } = {}) {
        this.min = min;
        this.max = max;
        this.formatValue = formatValue;
        this.selected = selected || { from: min, to: max };

        this.render();
        this.initEventListeners();
    }

    get template() {
        return `
            <div class="range-slider">
                <span data-element="from">${this.formatValue(this.min)}</span>
                <div data-element="inner" class="range-slider__inner">
                    <span data-element="progress" class="range-slider__progress"></span>
                    <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
                    <span data-element="thumbRight" class="range-slider__thumb-right"></span>
                </div>
                <span data-element="to">${this.formatValue(this.max)}</span>
            </div>
        `;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.template;
        this.element = wrapper.firstElementChild;
        this.subElements = this.getSubElements();

        this.leftThumbUpdate();
        this.rightThumbUpdate();
    }

    getSubElements() {
        const subElements = {};

        for (const elem of this.element.querySelectorAll('[data-element]')) {
            const name = elem.dataset.element;
            subElements[name] = elem;
        }

        return subElements;
    }

    initEventListeners() {
        this.subElements.thumbLeft.addEventListener('pointerdown', () => {
            document.addEventListener('pointermove', this.handleMoveFrom);
        });

        this.subElements.thumbRight.addEventListener('pointerdown', () => {
            document.addEventListener('pointermove', this.handleMoveTo);
        });

        document.addEventListener('pointerup', this.handleUp);
    }

    leftThumbUpdate() {
        const percent = 1 - ((this.max - this.selected.from) / (this.max - this.min));

        this.subElements.from.innerHTML = this.formatValue(this.selected.from);

        if (this.selected.from >= this.selected.to) {
            this.subElements.progress.style.left = `${100 - parseFloat(this.subElements.progress.style.right)}%` || '100%';
            this.subElements.thumbLeft.style.left = `${100 - parseFloat(this.subElements.progress.style.right)}%` || '100%';
            return;
        }

        if (this.selected.from <= this.min) {
            this.subElements.progress.style.left = `0%`;
            this.subElements.thumbLeft.style.left = `0%`;
            return;
        }

        this.subElements.progress.style.left = `${percent * 100}%`;
        this.subElements.thumbLeft.style.left = `${percent * 100}%`;
    }

    rightThumbUpdate() {
        const percent = ((this.max - this.selected.to) / (this.max - this.min));

        this.subElements.to.innerHTML = this.formatValue(this.selected.to);

        if (this.selected.to <= this.selected.from) {
            this.subElements.progress.style.right = `${100 - parseFloat(this.subElements.progress.style.left)}%` || '100%';
            this.subElements.thumbRight.style.right = `${100 - parseFloat(this.subElements.progress.style.left)}%` || '100%';
            return;
        }

        if (this.selected.to >= this.max) {
            this.subElements.progress.style.right = `0%`;
            this.subElements.thumbRight.style.right = `0%`;
            return;
        }

        this.subElements.progress.style.right = `${percent * 100}%`;
        this.subElements.thumbRight.style.right = `${percent * 100}%`;
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;

        document.removeEventListener('pointerup', this.handleUp);
    }
}
