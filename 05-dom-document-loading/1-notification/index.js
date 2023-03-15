export default class NotificationMessage {
    static prevNotification;

    timer;

    constructor(message = '', { duration = 2000, type = 'success' } = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;

        this.render();
    }

    get template() {
        return `
        <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">${this.message}</div>
            </div>
        </div>
        `;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.template;
        this.element = wrapper.firstElementChild;
    }

    show(container = document.body) {
        container.append(this.element);

        if (NotificationMessage.prevNotification) {
            NotificationMessage.prevNotification.destroy();
        }

        NotificationMessage.prevNotification = this;

        this.timer = setTimeout(() => {
            this.remove();
        }, this.duration);
    }

    remove() {
        clearTimeout(this.timer);

        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        NotificationMessage.prevNotification = null;
    }
}
