// Go out do Local Storage and retrieve any todos. 

let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Runs this on start up and any time crud changes on todos
const refreshApp = () => {
  console.log('refresh')
  let html = '';
  if(todos.length > 0){
    for(i = 0; i < todos.length; i++) {
  html += `<li class="item" draggable="true">            
              <h4 class="top-row">
                <span contentEditable="true" onblur="editMode(${todos[i].uid}, 'id', this)">Id: ${todos[i].id} </span> 
                <input type="checkbox"/> 
                <button class="btn2" onclick="deleteTodo(${todos[i].uid})">Delete</button>
              </h4>
              <div class="bottom-row">
                <div class="col-1">
                  <p contentEditable="true" onblur="editMode(${todos[i].uid},'desc', this)" class="text">${todos[i].description}</p>          
                </div>
                <div class="col-2">
                  <p class="text"> Due: ${todos[i].dueDate} </p>
                </div>
              </div>
              
            </li>`
    }
  }else {
    html = "No todo's to do!"
  }

  const ul = document.querySelector(".sortable-list");
  ul.innerHTML = html;

  const sortableList = document.querySelector(".sortable-list");
  const items = sortableList.querySelectorAll(".item");
  items.forEach(item => {
    item.addEventListener("dragstart", () => {
      setTimeout(() => item.classList.add("dragging"), 0)
    })
    // Removing dragging class from item on dragend event
    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      // when drag ends, need to update the todos list with new order.
      setNewOrder(); // WORK IN PROGRESS!!!!
    });
    item.querySelector('input').addEventListener("change", (e) => {toggleCompleted(e)})
    item.queryselector
  })

  const initSortableList = (e) => {
    e.preventDefault();
    const draggingItem = document.querySelector(".dragging");

    let siblings = [...sortableList.querySelectorAll(".item:not(.dragging)")];
    let nextSibling = siblings.find(sibling => {
      return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2
    })
    sortableList.insertBefore(draggingItem, nextSibling);
  }
  sortableList.addEventListener("dragover", initSortableList);
  sortableList.addEventListener("dragenter", e => e.preventDefault());  
}

refreshApp();

// Note: Any time a drag is ended,  need to resave the order into local storage so that the new order persists across page refreshes // 

/* =====================
     A Modal Window
   ===================== */

// An Overlay for the modal to sit on top of:
const modalOverlay = (status) => {
  if(status === 'open') { 
    const createOverlay = document.createElement('div');
    createOverlay.className = "modal-overlay";
    document.body.appendChild(createOverlay)
    document.body.style.overflow = "hidden"
  }else { 
    // must be removing the overlay
    document.querySelector(".modal-overlay").remove();
    document.body.style.overflow = "scroll"
  }
}

// Modal HTML template
const modalHTML = `
<div class="modal">
  <div class="top-row">
    <h2> Add a Todo </h2> 
    <button class="close-modal btn2" >Close</button>
  </div>
  <div class="inputs">
    <input type="text" placeholder="enter id" id="id" />
  </div>
  <div class="inputs">
    <textarea id="description">enter description</textarea>
  </div>
  <div class="btn-wrapper">
    <button class="btn1"> Add </button>
  </div>
</div>
`

const openModal = () => {
  // insert overlay first. 
  modalOverlay("open");

  const modalWrapper = document.createElement("div");
  modalWrapper.innerHTML = modalHTML;
  document.body.appendChild(modalWrapper)

  document.querySelector('.close-modal').addEventListener("click", closeModal)
  document.querySelector(".btn-wrapper > .btn1").addEventListener('click', addTodo)
  document.querySelector('textarea').addEventListener("focus", () => {
    document.querySelector('textarea').textContent = ""
  })
  document.getElementById("id").focus()
}

const closeModal = () => {
  document.querySelector('.modal').parentElement.remove(); 
  modalOverlay('close')
}

document.querySelector('.btn1').addEventListener('click', openModal)




/*==============
    Add a todo
================*/

const addTodo = () => {
  // validate the inputs: 
  const id = document.querySelector('#id').value;
  const description = document.querySelector('#description').value;
  const uid = Math.floor(Math.random() * Date.now());

  const todo = {uid, id, description, dueDate: "tbc"}
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos))
  refreshApp();
  closeModal()
}

/*=========================
   Mark a todo as complete
===========================*/
const toggleCompleted = (e) => {
  e.target.checked ? e.target.closest("li").classList.add("completed") : e.target.closest("li").classList.remove("completed")
}

/*================
    Delete a todo 
==================*/
const deleteTodo = (uid) => {
  console.log(uid)
  const filteredTodos = todos.filter((todo) => {
    console.log(todo)
    return todo.uid !== uid;
  })
  todos = [...filteredTodos]
  localStorage.setItem("todos", JSON.stringify(filteredTodos));
  refreshApp()
}

/*==============
    Edit a todo 
================*/
const editMode = (uid, mode, element) => {

  if(mode === 'id') {
    let text = element.textContent.split(": ");
    todos.map((todo) => {
      if(todo.uid === uid) {
        return todo.id = text[1]
      }
      return
    })
    console.log('todos', todos)

  }else if( mode === 'desc'){
    // edit the description
    console.log('desc mode yeah', uid, 'elementContent', element.textContent)
    todos.map((todo) => {
      if(todo.uid === uid) {
        return todo.description = element.textContent;
      }
      return
    })
  }
  localStorage.setItem('todos', JSON.stringify(todos));
  refreshApp();
}

/*===============================
  When order of todos is changed 
=================================*/
const setNewOrder = () => {
  // Go through the DOM and reconstruct the todos array pulling the information out of each node,  then compare with the current nodes array. If different send to localstorage and refresh the app.
  const todos = [...document.querySelectorAll(".item")];
  console.log(todos)
  console.log(todos[0].children[0].innerText)
  console.log(todos[0].children[1].innerText) // WORK IN PROGRESS!!!! //
}

