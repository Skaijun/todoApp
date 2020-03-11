
class RenderDOMElements {
    constructor(selectedHTMLEl) {
        this.selectedHTMLEl = selectedHTMLEl || document.body
        this.createElementsDOM()
        this.generateData()
        this.todoController = new ToDoApp(this.selectedHTMLEl)
    }

    createElementsDOM() {
        const elementsDOM = `<p>ToDo App</p>
                           <div class="top">
                             <div class="refresh"></div>
                             <div class="data"></div>
                           </div>
                           <div class="content">
                             <form class="add-item">
                               <button class="btn-add" type="button">+</button>
                               <input type="text" class="input-todo" placeholder="add new task">
                              </form>
                             <ul class="todo-list">
                              </ul>
                            </div>`;
        this.selectedHTMLEl.insertAdjacentHTML("afterbegin", elementsDOM);
    }

    generateData() {
        const date = this.selectedHTMLEl.querySelector('.data');
        let currDate = new Date();
        const opt = {
            weekday: "long",
            month: "short",
            day: "numeric",
        };
        date.innerHTML = currDate.toLocaleDateString("en-US", opt);
    }

}

// -----------------------------------------------------------------------------------------------------------

class ToDoApp {
    constructor(selectedHTMLEl) {
        this.handleAddTaskEvent = this.handleAddTaskEvent.bind(this)
        this.handleInputSubmitEvent = this.handleInputSubmitEvent.bind(this)
        this.handleCheckAndRemoveTaskEvent = this.handleCheckAndRemoveTaskEvent.bind(this)
        this.handleRefreshBTNEvent = this.handleRefreshBTNEvent.bind(this)
        this.selectedHTMLEl = selectedHTMLEl
        this.state = new ToDoState(this.selectedHTMLEl)
        this.selectDOMElements(this.selectedHTMLEl)
        this.subscribeForEvents()
    }

    selectDOMElements(currDOM) {
        this.input = currDOM.querySelector('.input-todo'); // input's field
        this.list = currDOM.querySelector('.todo-list');
        this.formAddToDo = currDOM.querySelector('.add-item');
        this.refreshBtn = currDOM.querySelector('.refresh');
    }

    taskAdder() {
        let task = adjustInput(this.input.value);
        if (!task.length || task == null) {
            alert('Please, enter new task!!');
            this.input.value = '';
        } else {
            let index = this.state.indexNextTask;
            this.state.addNewTask(new Task(task, index));
            this.state.saveTaskInLocalStorage();
            this.input.value = '';
            const taskHTML = `<li class="item" task="wrap">
                          <button class="${ToDoState.TASK_STATE.UNCOMPLETE}" task="status" id="${index}"></button>
                          <p class="text">${task}</p>
                          <button class="trash" task="remove" id="${index}">X</button>
                       </li>`;
            this.list.insertAdjacentHTML("beforeend", taskHTML);
            this.state.indexNextTask++;
            this.state.saveNextTaskIndexInLocalStorage();
        }
    }

    subscribeForEvents() {
        this.formAddToDo.addEventListener('submit', this.handleInputSubmitEvent);
        this.selectedHTMLEl.addEventListener('click', this.handleAddTaskEvent);
        this.list.addEventListener('click', this.handleCheckAndRemoveTaskEvent);
        this.refreshBtn.addEventListener('click', this.handleRefreshBTNEvent);
    }

    handleInputSubmitEvent() {
        event.preventDefault();
        this.taskAdder();
    }

    handleAddTaskEvent() {
        if (event.target.classList.contains('btn-add')) {
            this.taskAdder();
        }
    }

    handleCheckAndRemoveTaskEvent() {
        let el = event.target;
        if (el.hasAttribute("task")) {
            let elTask = el.attributes.task.value;
            if (elTask == "status") {
                this.state.toggleTaskStatus(el);
            } else if (elTask == "remove") {
                this.state.removeTaskFromList(el);
            }
        }
    }

    handleRefreshBTNEvent() {
        this.input.value = '';
        this.state.tasks = [];
        this.state.indexNextTask = 0;
        window.localStorage.removeItem(`${this.selectedHTMLEl.id}`);
        window.localStorage.removeItem(`${this.selectedHTMLEl.id}-index`);
        while (this.list.firstChild) {
            this.list.removeChild(this.list.firstChild);
        }
    }

}
// -----------------------------------------------------------------------------------------------------------

class ToDoState {
    constructor(currentToDo) {
        this.selectedHTMLEl = currentToDo
        this.tasks = JSON.parse(window.localStorage.getItem(`${this.selectedHTMLEl.id}`)) || []
        this.indexNextTask = JSON.parse(window.localStorage.getItem(`${this.selectedHTMLEl.id}-index`)) || 0
        this.loadTasksFromLocalStorage()
    }

    static TASK_STATE = {
        COMPLETE: "complete",
        UNCOMPLETE: "uncomplete",
        LINE_THROUGH: "text-complete"
    };

    addNewTask(task) {
        this.tasks.push(task);
    }

    removeTaskFromList(task) {
        this.tasks[task.id].isDeleted = true;
        task.parentNode.parentNode.removeChild(task.parentNode);
        this.saveTaskInLocalStorage();
    }

    toggleTaskStatus(task) {
        task.classList.toggle(ToDoState.TASK_STATE.COMPLETE);
        task.classList.toggle(ToDoState.TASK_STATE.UNCOMPLETE);
        task.parentNode.querySelector('.text').classList.toggle(ToDoState.TASK_STATE.LINE_THROUGH);
        if (this.tasks[task.id].isCompleted == false) {
            this.tasks[task.id].isCompleted = true;
        } else {
            this.tasks[task.id].isCompleted = false;
        }
        this.saveTaskInLocalStorage();
    }

    saveTaskInLocalStorage() {
        window.localStorage.setItem(`${this.selectedHTMLEl.id}`, JSON.stringify(this.tasks));
    }

    saveNextTaskIndexInLocalStorage() {
        window.localStorage.setItem(`${this.selectedHTMLEl.id}-index`, JSON.stringify(this.indexNextTask));
    }

    loadTasksFromLocalStorage() {
        if (this.tasks) {
            this.list = this.selectedHTMLEl.querySelector('.todo-list');
            for (let i = 0; i < this.tasks.length; i++) {
                if (!this.tasks[i].isDeleted) {
                    let done =
                        this.tasks[i].isCompleted ? ToDoState.TASK_STATE.COMPLETE : ToDoState.TASK_STATE.UNCOMPLETE;
                    let line =
                        this.tasks[i].isCompleted ? ToDoState.TASK_STATE.LINE_THROUGH : "";
                    const taskHTML = `<li class="item" task="wrap">
                                  <button class="${done}" task="status" id="${this.tasks[i].id}"></button>
                                  <p class="text ${line}">${this.tasks[i].task}</p>
                                  <button class="trash" task="remove" id="${this.tasks[i].id}">X</button>
                                  </li>`;
                    this.list.insertAdjacentHTML("beforeend", taskHTML);
                }
            }
        }
    }

}

// -----------------------------------------------------------------------------------------------------------
class Task {
    constructor(text, i) {
        this.task = text
        this.id = i
        this.isCompleted = false
        this.isDeleted = false
    }
}
// -----------------------------------------------------------------------------------------------------------
function adjustInput(str) {
    return str
        .normalize('NFD')
        .replace(/([.!?]+)(?=\S)/g, "$1 ")
        .toLowerCase()
        .trim();
};
// -----------------------------------------------------------------------------------------------------------

document.querySelectorAll('.todo').forEach(div => {
    new RenderDOMElements(div);
})

window.ToDoState = ToDoState;
