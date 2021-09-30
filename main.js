const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const path = require("path");

let db = require("./src/database");

const NOTIFICATION_TITLE = "Insurance Application";
const NOTIFICATION_BODY = "Result of approval";

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // nodeIntegration: true,
      // contextIsolation:true,
      // devTools:false,
      preload: path.join(app.getAppPath(), "./src/index.js"),
    },
  });

  win.loadFile("./src/index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function notifyuser() {
  new Notification({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY,
  }).show();
}

ipcMain.handle("get", () => {
  getUsers();
});

ipcMain.handle("add", (event, obj) => {
  addUser(obj);
});

ipcMain.handle("get_one", (event, obj) => {
  getuser(obj);
});

ipcMain.handle("approve_user", (event, obj) => {
  approveuser(obj);
});

ipcMain.handle("decline_user", (event, obj) => {
  declineuser(obj);
});

ipcMain.handle("update", (event, obj) => {
  updateuser(obj);
});

ipcMain.handle("notify", (event) => {
  notifyuser();
});

function getUsers() {
  db.query("SELECT * FROM users", (error, results, fields) => {
    if (error) {
      console.log(error);
    }

    win.webContents.send("users", results);
  });
}

function addUser(obj) {
  const sql = "INSERT INTO users SET ?";
  db.query(sql, obj, (error, results, fields) => {
    if (error) {
      console.log(error);
    }
    getUsers();
  });
}

function getuser(obj) {
  let { id } = obj;
  let sql = "SELECT * FROM users WHERE id = ?";
  db.query(sql, id, (error, results, fields) => {
    if (error) {
      console.log(error);
    }
    console.log(results);
    win.webContents.send("user", results[0]);
  });
}

function updateuser(obj) {
  let { id, name, status } = obj;
  const sql = "UPDATE users SET name=?, status=? WHERE id=?";
  db.query(sql, [name, status, id], (error, results, fields) => {
    if (error) {
      console.log(error);
    }
    getUsers();
  });
}
