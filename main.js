"use strict";

class EventEmitter {
    constructor() {
        this._events = {};
    }
    on(evt, listener) {
        (this._events[evt] || (this._events[evt] = [])).push(listener);
        return this;
    }
    emit(evt, arg) {
        (this._events[evt] || []).slice().forEach(lsn => lsn(arg));
    }
}

class Model extends EventEmitter {
    constructor() {
        super();
        this.todoItems = [];
    }

    addTodo(item) {
        if (item !== "") {
            const todo = {
                id: Math.random(),
                name: item,
                completed: false,
            }
            this.todoItems.push(todo);
            console.log(this.todoItems);
        }
        this.emit('itemAdded', item);
    }

    getTodoId (elem) {
        this.todoItems.forEach(function (item) {
            if (elem.dataset.name === item.name) {
                elem.setAttribute('data-key', item.id);
                return item.id;
            }
        })
    }

    toggleCheckTodo(id) {
        this.todoItems.forEach(function (item) {
            if (item.id == id) {
                item.completed = !item.completed;
            }
        });
        console.log(this.todoItems);
        this.emit('itemChecked');
    }

    removeTodo(id) {
        this.todoItems = this.todoItems.filter(function (item) {
            return item.id != id;
        });
        console.log(this.todoItems);
        this.emit('itemRemoved');
    }
}

class View extends EventEmitter{
    constructor() {

        super();
        this.inputWrapper = document.querySelector('.input-wrapper');
        this.input = document.querySelector('.input');

    }


    createElement(tag, className) {
        let element = document.createElement(tag)
        if (className) element.classList.add(className)
        return element;
    }


    createTodoItems () {

        let newTask = this.createElement("div", "list-item")
        this.inputWrapper.append(newTask);
        newTask.setAttribute('data-name', this.input.value);

        let textLine = this.createElement("p", "text-item")
        textLine.innerHTML = this.input.value;
        newTask.append(textLine);

        let inputRadio = this.createElement("input", "checkbox");
        inputRadio.setAttribute('type', 'checkbox');
        newTask.prepend(inputRadio);

        let deleteButton = this.createElement("button", "delete-button");
        deleteButton.innerHTML = "x";
        textLine.append(deleteButton);

    }

    handleAddTodo () {
        this.input.addEventListener("keydown", event => {
            if (event.keyCode === 13 && this.input.value !== "") {
                this.emit('addButtonClicked');
                this.createTodoItems();
                this.input.value = "";
            }
        })
    }


    handleDeleteTodo () {
        this.inputWrapper.addEventListener("click", event => {
            if (event.target.className === "delete-button") {
                this.emit('deleteButtonClicked');
                let elem = event.target.closest('div');
                let inputRadio = elem.firstChild;
                if (inputRadio.checked) {
                    elem.remove();
                }
            }
        })

    }

    handleToggleTodo () {
        this.inputWrapper.addEventListener("click", event => {
            if (event.target.className === "checkbox") {
                this.emit('checkboxClicked');
                let elem = event.target.closest('div');
                let inputRadio = elem.firstChild;
                let textLine = elem.lastChild

                if (inputRadio.checked) {
                    textLine.classList.add("checked");
                } else {
                    textLine.classList.remove("checked");
                }
            }
        })
    }

}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        view.on('addButtonClicked',  () => this.addItem());
        view.on('deleteButtonClicked', () => this.deleteItem());
        view.on('checkboxClicked', () => this.toggleItem());

        model.on('itemAdded', () => this.view.handleAddTodo());
        model.on('itemRemoved', () => this.view.handleDeleteTodo());
        model.on('itemChecked', () => this.view.handleToggleTodo());
    }


    addItem = () => {
        this.model.addTodo(this.view.input.value);
    }


    deleteItem = () => {
        // чтоб получить id - нужно получить элемент - не понимаю как здесь до него добраться, опять вешать addEventListener ведь неправильно?
        // let currentId = this.model.getTodoId();
        // this.model.removeTodo(currentId)
    }


    toggleItem = () => {
        // аналогично
        // let currentId = this.model.getTodoId();
        // this.model.toggleCheckTodo(currentId)
    }
}

const myTodoList = new Controller(new Model(), new View())
myTodoList.addItem();
myTodoList.deleteItem();
myTodoList.toggleItem();

