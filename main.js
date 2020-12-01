"use strict";

class EventEmitter {
    constructor() {
        this._events = {};
    }
    on(evt, listener) {
        (this._events[evt] || (this._events[evt] = [])).push(listener);
        return this;
    }
    emit(evt, ...args) {
        (this._events[evt] || []).slice().forEach(lsn => lsn(...args));
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
            this.emit('itemAdded', item);
        }
    }

    toggleCheckTodo(id) {
        this.todoItems.forEach(function (item) {
            if (item.id == id) {
                item.completed = !item.completed;
            }
        });
        this.emit('itemChecked');
    }

    removeTodo(id) {
        this.todoItems = this.todoItems.filter(function (item) {
            return item.id != id;
        });
        this.emit('itemRemoved');
    }

    editTodo(id, updatedText) {
        // this.todoItems.forEach(function (item) {
        //     if (item.id == id) {
        //         item.name = updatedText;
        //     }
        // });
        this.todoItems = this.todoItems.map((todo) =>
            todo.id == id ? {id: todo.id, name: updatedText, completed: false} : todo,
        )
        this.emit('itemEdited');
    }

    setTodoId (elem) {
        this.todoItems.forEach(function(item) {
            if (elem.dataset.name == item.name) {
                elem.setAttribute('data-key', item.id);
            }
        })
    }
}


class View extends EventEmitter{
    constructor(model) {
        super();
        this.inputWrapper = document.querySelector('.input-wrapper');
        this.input = document.querySelector('.input');
        this.editBtn = document.querySelector('.edit-btn');
        this.model = model;
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
        this.model.setTodoId(newTask);

        let textLine = this.createElement("input", "text-item");
        textLine.setAttribute("readonly", true);
        textLine.value = this.input.value;
        newTask.append(textLine);

        let inputRadio = this.createElement("input", "checkbox");
        inputRadio.setAttribute('type', 'checkbox');
        newTask.prepend(inputRadio);

        let deleteButton = this.createElement("button", "delete-button");
        deleteButton.innerHTML = "x";
        newTask.append(deleteButton);
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

    handleEditTodo() {
        let saveButton;
        let textLine;

        this.inputWrapper.addEventListener("dblclick", event => {
            if (event.target.className !== "checkbox" && event.target.className !== "delete-button") {
                let elem = event.target.closest('div');
                textLine = elem.childNodes[1];
                textLine.removeAttribute("readonly", true);

                saveButton = this.createElement("button", "save-button");
                saveButton.innerHTML = "SAVE";
                elem.append(saveButton);
            }
        })
        this.inputWrapper.addEventListener("click", event => {
           if (event.target.className === "save-button") {
               let elem = event.target.closest('div');
               let updatedText = textLine.value;
               textLine.setAttribute("readonly", true);
               event.target.style.display = "none";
               console.log (updatedText);
               this.emit('editButtonClicked', [elem, updatedText]);
               return updatedText;
            }

        })
    }

    handleDeleteTodo () {
        this.inputWrapper.addEventListener("click", event => {
            if (event.target.className === "delete-button") {
                let elem = event.target.closest('div');
                let inputRadio = elem.firstChild;
                if (inputRadio.checked) {
                    elem.remove();
                    this.emit('deleteButtonClicked', elem);
                }
            }
        })
    }

    handleToggleTodo () {
        this.inputWrapper.addEventListener("click", event => {
            if (event.target.className === "checkbox") {

                let elem = event.target.closest('div');
                this.emit('checkboxClicked', elem);
                let inputRadio = elem.firstChild;
                let textLine = elem.childNodes[1];

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

        view.on('addButtonClicked',  () => this.model.addTodo(this.view.input.value));
        view.on('deleteButtonClicked', (elem) => this.model.removeTodo(elem.dataset.key));
        view.on('checkboxClicked', (elem) => this.model.toggleCheckTodo(elem.dataset.key));
        view.on('editButtonClicked', (args) => this.model.editTodo(args[0].dataset.key, args[1]));

        model.on('itemAdded', () => this.showUpdatedData());
        model.on('itemRemoved', () => this.showUpdatedData());
        model.on('itemChecked', () => this.showUpdatedData());
        model.on('itemEdited', () => this.showUpdatedData());
    }

    showUpdatedData () {
        console.log (this.model.todoItems);
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

    editItem = () => {
        this.view.handleEditTodo();
    }


}

let model = new Model();
let view = new View(model);
const myTodoList = new Controller(model, view);
myTodoList.addItem();
myTodoList.deleteItem();
myTodoList.toggleItem();
myTodoList.editItem();



