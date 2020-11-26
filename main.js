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
            return todo;
        }
        this.emit('itemAdded', item);
    }

    toggleCheckTodo(id) {
        this.todoItems.forEach(function (item) {
            if (item.id == id) {
                item.completed = !item.completed;
                this.emit('itemChecked');
            }
        });
        console.log(this.todoItems);

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
        newTask.setAttribute('data-name', `${this.input.value}`);

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
                let textLine = elem.lastChild;
                if (inputRadio.checked) {
                    textLine.classList.add("checked");
                    elem.classList.add("current");
                } else {
                    textLine.classList.remove("checked");
                    elem.classList.remove("current");
                }
                return elem;
            }
        })
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // model.on('itemAdded', () => this.addItem());
        // model.on('itemRemoved', () => this.addItem());
        // model.on('itemChecked', () => this.toggleItem());

        view.on('addButtonClicked',  () => this.model.addTodo(this.view.input.value));
        view.on('deleteButtonClicked', () => this.model.removeTodo(this.getId()));
        view.on('checkboxClicked', () => this.model.toggleCheckTodo(this.getId()));

    }

    getId () {
        this.view.inputWrapper.addEventListener("dblclick", event => {
            if (event.target.className === "checkbox") {
                let elem = event.target.closest('div');
                console.log(elem);
                this.model.todoItems.forEach(function(item) {
                    if (elem.dataset.name === item.name) {
                        elem.setAttribute('data-key', `${item.id}`);
                        console.log(elem.dataset.key);
                        return (elem.dataset.key);
                    }
                })
            }
        })
    }


    addItem = () => {
        this.view.handleAddTodo();
    }

    deleteItem = () => {
        this.view.handleDeleteTodo();
    }

    toggleItem = () => {
        this.view.handleToggleTodo();
    }
}

const myTodoList = new Controller(new Model(), new View());
myTodoList.addItem();
myTodoList.deleteItem();
myTodoList.toggleItem();

