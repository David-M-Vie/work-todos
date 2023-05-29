// Go out do Local Storage and retrieve any todos. 

let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Runs this on start up and any time crud changes on todos
const refreshApp = () => {
  // console.log('refresh')
  let html = '';
  if(todos.length > 0){
    for(i = 0; i < todos.length; i++) {
  html += `<li class="item ${todos[i].completed ? "completed" : ""}" draggable="true" data-uid="${todos[i].uid}">            
              <h4 class="top-row">
                <span contentEditable="true" onblur="editMode(${todos[i].uid}, 'id', this)">Id: ${todos[i].id} </span> 
                <input type="checkbox" ${todos[i].completed ? "checked" : ""}/> 
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
      setNewOrder(item.dataset.uid); // WORK IN PROGRESS!!!!
    });
    item.querySelector('input').addEventListener("change", (e) => {toggleCompleted(e)})
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

  const todo = {uid, id, description, dueDate: "tbc", completed: false}
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos))
  refreshApp();
  closeModal()
}

/*=========================
   Mark a todo as complete
===========================*/
const toggleCompleted = (e) => {
  const li = e.target.closest("li");
  const uid = Number(li.dataset.uid);
   e.target.checked ? li.classList.add("completed") : li.classList.remove("completed")
  const toggleTodos = todos.map((todo) => {
    if(uid === todo.uid ) {
      todo.completed = !todo.completed;
      li.querySelector("input[type=checkbox]").toggleAttribute("checked");
    }
    return todo;
  })
  todos = [...toggleTodos];
  localStorage.setItem("todos", JSON.stringify(todos));
  refreshApp()
}

/*================
    Delete a todo 
==================*/
const deleteTodo = (uid) => {

  const filteredTodos = todos.filter((todo) => {

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
    

  }else if( mode === 'desc'){
    // edit the description

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
const setNewOrder = (uid) => {
  uid = Number(uid)
  // Go through the DOM and reconstruct the todos array pulling the information out of each node,  then compare with the current nodes array. If different send to localstorage and refresh the app.
  const reorderedElements = [...document.querySelectorAll(".item")];
  const reorderedTodoIds = reorderedElements.map((todo) => {
    return Number(todo.dataset.uid)
  })  
  // console.log('New Order', reorderedTodoIds)
  // Find the element that moved and where it moved to.. 
  // the element that moved is passed in to the function (uid)
  // where it moved to can be found by checking the reordered array with indexOf
  const movedTo = reorderedTodoIds.indexOf(uid);
  
  // Find where the element moved from by checking where the element is in the original todos array

  // Element
  const targetTodo = todos.find(todo =>  todo.uid === uid)

  // Index
  const movedFrom = todos.findIndex((todo) => uid === todo.uid)
  
  // splice out the old position
  todos.splice(movedFrom, 1)
  // Splice in at the new position
  todos.splice(movedTo, 0, targetTodo)
  localStorage.setItem('todos', JSON.stringify(todos));
  refreshApp();
   



}


console.log('todos ', todos)
