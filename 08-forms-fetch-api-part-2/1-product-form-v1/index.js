import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
    element;
    subElements;
    fields = {
        title: '',
        description: '',
        images: [],
        subcategory: '',
        price: 100,
        discount: 0,
        quantity: 1,
        status: 1,
    };

    handleSubmitForm = async event => {
        event.preventDefault();
        await this.saveProducts(event);
    }

    handleChangeFormField = event => {
        this.onChangeFormField(event);
    }

    handleUploadImages = async event => {
        await this.onUploadImages(event);
    }

    handleDeleteImage = event => {
        this.onDeleteImage(event);
    }

    constructor(productId = '') {
        this.productId = productId;
        this.url = new URL(BACKEND_URL);
    }

    async render() {
        if (this.productId) {
            this.fields = await this.loadProduct();
        }

        const wrapper = document.createElement('div');
        wrapper.innerHTML = await this.getTemplate();
        this.element = wrapper.firstElementChild;
        this.subElements = this.getSubElements();

        this.initEventListeners();
    }

    getSubElements() {
        const subElements = {};

        for (const elem of this.element.querySelectorAll('[data-element]')) {
            subElements[elem.dataset.element] = elem;
        }

        return subElements;
    }

    initEventListeners() {
        this.subElements.productForm.addEventListener('submit', this.handleSubmitForm);
        this.subElements.productForm.addEventListener('input', this.handleChangeFormField);
        this.subElements.uploadImage.addEventListener('change', this.handleUploadImages);
        this.subElements.imageListContainer.addEventListener('click', this.handleDeleteImage);
    }

    onChangeFormField(event) {
        const target = event.target;

        if (target.name === 'status') {
            this.fields[target.name] = parseFloat(target.value);
            return;
        }

        switch (target.type) {
            case 'file':
                return;
            case 'number':
                this.fields[target.name] = parseFloat(target.value);
                break;
            default:
                this.fields[target.name] = target.value;
        }
    }

    async onUploadImages(event) {
        const image = await this.uploadImages(event.target.files);
        this.fields.images.push(image);
        this.subElements.imageListContainer.firstElementChild.insertAdjacentHTML('beforeend', this.getImageRowTemplate(image));
    }

    onDeleteImage(event) {
        if (!event.target.closest('[data-delete-handle]')) return;

        const parent = event.target.closest('li');
        const source = parent.querySelector('input[name="source"]').value;

        parent.remove();
        const images = this.fields.images.filter(item => item.source !== source);
        this.fields.images = [ ...images ];
    }

    async getTemplate() {
        return `
            <div class="product-form">
                <form data-element="productForm" class="form-grid">
                    <div class="form-group form-group__half_left">
                        <fieldset>
                            <label class="form-label">Название товара</label>
                            <input required="" type="text" name="title" class="form-control" value="${escapeHtml(this.fields['title'])}" placeholder="Название товара">
                        </fieldset>
                    </div>
                    <div class="form-group form-group__wide">
                        <label class="form-label">Описание</label>
                        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара">${escapeHtml(this.fields['description'])}</textarea>
                    </div>
                    <div class="form-group form-group__wide" data-element="sortable-list-container">
                        <label class="form-label">Фото</label>
                        <div data-element="imageListContainer">
                            <ul class="sortable-list">
                                ${this.renderImagesList()}
                            </ul>
                        </div>
                        <label data-element="uploadImage" class="button-primary-outline" style="text-align:center;">
                            <input type="file" accept="image/*" style="position:absolute;visibility:hidden;">
                            <span>Загрузить</span>
                        </label>
                    </div>
                    <div class="form-group form-group__half_left">
                        <label class="form-label">Категория</label>
                        <select data-element="subcategory" class="form-control" name="subcategory">
                            ${await this.renderCategories(this.fields['subcategory'])}
                        </select>
                    </div>
                    <div class="form-group form-group__half_left form-group__two-col">
                        <fieldset>
                            <label class="form-label">Цена ($)</label>
                            <input required="" type="number" name="price" value="${this.fields['price']}" class="form-control" placeholder="100">
                        </fieldset>
                        <fieldset>
                            <label class="form-label">Скидка ($)</label>
                            <input required="" type="number" name="discount" value="${this.fields['discount']}" class="form-control" placeholder="0">
                        </fieldset>
                    </div>
                    <div class="form-group form-group__part-half">
                        <label class="form-label">Количество</label>
                        <input required="" type="number" class="form-control" name="quantity" value="${this.fields['quantity']}" placeholder="1">
                    </div>
                    <div class="form-group form-group__part-half">
                        <label class="form-label">Статус</label>
                        <select class="form-control" name="status">
                            <option value="1"${this.fields['status'] === 1 && ' selected'}>Активен</option>
                            <option value="0"${this.fields['status'] === 0 && ' selected'}>Неактивен</option>
                        </select>
                    </div>
                    <div class="form-buttons">
                        <button type="submit" name="save" class="button-primary-outline">
                            Сохранить товар
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    getImageRowTemplate(image) {
        return `
            <li class="products-edit__imagelist-item sortable-list__item">
                <input type="hidden" name="url" value="${image.url}">
                <input type="hidden" name="source" value="${image.source}">
                <span>
                    <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                    <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
                    <span>${image.source}</span>
                </span>
                <button type="button">
                    <img src="icon-trash.svg" data-delete-handle="" alt="delete">
                </button>
            </li>
        `;
    }

    renderImagesList() {
        if (!this.productId) return '';
        return this.fields.images.map(image => this.getImageRowTemplate(image)).join('');
    }

    async renderCategories(selected) {
        const categories = await this.loadCategories();

        if (!this.productId) {
            this.fields.subcategory = categories[0].subcategories[0].id;
            selected = this.fields.subcategory;
        }

        return categories.map((category) => {
            return category.subcategories.map(subcategory => {
                return `
                    <option value="${subcategory.id}"${subcategory.id === selected ? ' selected' : ''}>
                        ${category.title} > ${subcategory.title}
                    </option>`;
            }).join('');
        }).join('');
    }

    async loadCategories() {
        const url = new URL('/api/rest/categories', this.url);

        url.searchParams.set('_sort', 'weight');
        url.searchParams.set('_refs', 'subcategory');

        return await fetchJson(url);
    }

    async loadProduct() {
        const url = new URL('/api/rest/products', this.url);

        url.searchParams.set('id', this.productId);

        const [ data ] = await fetchJson(url);

        return data;
    }

    async uploadImages(files) {
        const url = new URL('https://api.imgur.com/3/image');
        const formData = new FormData();
        formData.append('image', files[0]);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
                },
                body: formData,
                referrer: ''
            });

            const data = await response.json();

            if (!data.success) throw data;

            return {
                url: data.data.link,
                source: files[0].name,
            };
        } catch (error) {
            console.error(error);
        }
    }

    async saveProducts() {
        const url = new URL('/api/rest/products', this.url);
        const method = !this.productId ? 'PUT' : 'PATCH';

        try {
            const data = await fetchJson(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.fields),
            });

            const eventName = !this.productId ? 'product-saved' : 'product-updated';

            this.element.dispatchEvent(new CustomEvent(eventName, {
                detail: data
            }));
        } catch (e) {
            console.error(e);
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
    }
}
