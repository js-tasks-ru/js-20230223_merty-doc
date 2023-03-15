class Tooltip {
    static #instance;
    elements;
    element;

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

        for (const elem of document.querySelectorAll('[data-tooltip]')) {
            this.elements.set(elem, elem.dataset.tooltip);
        }

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
        for (const [ parent, content ] of this.elements) {
            parent.addEventListener('pointerover', event => {
                if (event.target !== parent) return;

                this.element.innerHTML = content;
                document.body.append(this.element);

                parent.addEventListener('pointermove', this.moveHandler);
            });

            parent.addEventListener('pointerout', () => {
                this.element.remove();
                parent.removeEventListener('pointermove', this.moveHandler);
            });
        }
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

        Tooltip.#instance = null;
    }
}

export default Tooltip;
