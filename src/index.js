const { ipcRenderer } = require("electron");
const { stat } = require("original-fs");

let mylist;
let iduser;
let name;
let status;
let btnform;
let btnapprove;
let btndecline;

window.onload = function () {
  mylist = document.getElementById("mylist");
  btnform = document.getElementById("btnform");
  iduser = document.getElementById("iduser");
  name = document.getElementById("name");
  status = document.getElementById("status");
  btnform.onclick = renderAddUser;
  renderGetUsers();
};

async function renderGetUsers() {
  await ipcRenderer.invoke("get");
}

async function renderAddUser() {
  const obj = {
    name: name.value,
    status: "Pending",
  };
  name.value = "";
  await ipcRenderer.invoke("add", obj);
}

ipcRenderer.on("users", (event, results) => {
  let template = "";
  const list = results;
  list.forEach((element) => {
    template += `
         <tr>
            <td>${element.name}</td>
            <td>${element.status}</td>
            <td>
              <button class="btn btn-info"
              id="btnapprove"
                value="${element.id}"
                name="${element.name}"> 
                Approve
              </button>
             </td>
             
             <td>
               <button class="btn btn-danger"   
                 id="btndecline"
                 value="${element.id}"
                 name="${element.name}"> 
                Decline
              </button>
           
            </td>
         </tr>
      `;
  });

  mylist.innerHTML = template;
  btnapprove = document.querySelectorAll(".btn-info");
  btnapprove.forEach((boton) => {
    boton.addEventListener("click", renderApproveUser);
  });

  btndecline = document.querySelectorAll(".btn-danger");
  btndecline.forEach((boton) => {
    boton.addEventListener("click", renderDeclineUser);
  });
});

ipcRenderer.on("user", (event, result) => {
  iduser.value = result.id;
  name.value = result.name;
  status.value = result.status;
});

async function renderApproveUser(e) {
  const obj = {
    id: parseInt(e.target.value),
    status: "Approved",
    name: e.target.name,
  };

  await ipcRenderer.invoke("update", obj);
  await ipcRenderer.invoke("notify");
}

async function renderDeclineUser(e) {
  const obj = {
    id: parseInt(e.target.value),
    status: "Declined",
    name: e.target.name,
  };

  await ipcRenderer.invoke("update", obj);
  await ipcRenderer.invoke("notify");
}

async function renderUpdateUser() {
  const obj = {
    id: iduser.value,
    name: name.value,
    status: status.value,
  };

  clearinput();
  await ipcRenderer.invoke("update", obj);
}

function clearinput() {
  iduser.value = "";
  name.value = "";
  status.value = "";
}
