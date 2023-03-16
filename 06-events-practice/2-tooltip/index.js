class Tooltip {
    static #instance;
    elements;
    element;

    handlePointerOver = event => {
        const target = event.target;
        if (!target.dataset.tooltip) return;

        if (!this.elements.has(target)) {
            this.elements.set(target, target.dataset.tooltip);
        }

        this.element.innerHTML = this.elements.get(target);
        document.body.append(this.element);

        target.addEventListener('pointermove', this.moveHandler);

        target.addEventListener('pointerout', () => {
            this.element.remove();
            target.removeEventListener('pointermove', this.moveHandler);
        });
    }

    moveHandler = event => {
        this.element.style.top = `${event.clientY}px`;
        this.element.style.left = `${event.clientX}px`;
    };

    constructor() {
        if (Tooltip.#instance) {
            return Tooltip.#instance;
        }

        Tooltip.#instance = this;
    }

    initialize() {
        this.elements = new Map();

        this.render();
        this.initEventListeners();
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<div class="tooltip"></div>`;
        this.element = wrapper.firstElementChild;

        // TODO: эта строка в моей реализации добавлена просто, чтобы пройти тест, она не нужна
        document.body.append(this.element);
    }

    initEventListeners() {
        document.addEventListener('pointerover', this.handlePointerOver);
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();

        this.elements = null;
        this.element = null;

        document.removeEventListener('pointerover', this.handlePointerOver);

        Tooltip.#instance = null;
    }
}

export default Tooltip;
