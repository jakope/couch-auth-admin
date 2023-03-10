export default `<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.3/dist/sweetalert2.all.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.3/dist/sweetalert2.min.css" rel="stylesheet">
<script type="text/javascript" src="https://oss.sheetjs.com/sheetjs/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.20/jspdf.plugin.autotable.min.js"></script>
<link href="https://unpkg.com/tabulator-tables@5.4.4/dist/css/tabulator.min.css" rel="stylesheet">
<link href="https://unpkg.com/tabulator-tables@5.4.4/dist/css/tabulator_modern.min.css" rel="stylesheet">
<script type="text/javascript" src="https://unpkg.com/tabulator-tables@5.4.4/dist/js/tabulator.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/object-gui@2/dist/js/object-gui.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/object-gui@2/dist/css/object-gui.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
<div>
    <button id="download-csv">Download CSV</button>
    <button id="download-json">Download JSON</button>
    <button id="download-xlsx">Download XLSX</button>
    <button id="download-pdf">Download PDF</button> 
    <button id="download-html">Download HTML</button>
</div>
<div id="table"></div>
<div id="user"></div>
<script>
    let user, editor; 
  
    function showToast(text,failure){
      const icon = failure ? "error" : "success";
      Swal.fire({
        icon,
        title : text,
        toast: true,
        position: 'top-start',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })
}
async function requestData(url = "", options = {}) {
    
    options = Object.assign({ method : "POST", data : {}, message : "ok" },options);
  // Default options are marked with *
  let fetchOptions = {
    method : options.method, // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  }
  if(options.method == "POST" || options.method == "PUT"){
    fetchOptions.body = JSON.stringify(options.data);
  }
  const response = await fetch(url, fetchOptions);
  if(response.ok){
    showToast(options.message);
  }else{
    showToast("Fehler","error")
  }
  return response.json(); // parses JSON response into native JavaScript objects
}

    const closeEditor = async () =>{
        user = null;
        editor.root.element.remove();
        editor = null;
    }

  const passwordForgot = async ()=>{
    Swal.fire({
  title: "Send forgot Email to " + user.email + "?",
  showCancelButton: true,
  confirmButtonText: 'Yes',
}).then(async (result) => {
  if (result.isConfirmed) {
    const resulte = await requestData("api/users/forgot-password", { 
      data : {
        email : user.email,
      },
      message : "E-Mail versendet"
    });
    }
});
  }

  const changeEmail = async ()=>{
    const { value: email } = await Swal.fire({
  title: 'Input email address',
  input: 'email',
  inputLabel: 'The new email address',
  inputPlaceholder: 'Enter the email address',
  showCancelButton: true,
});
if(email){
  requestData("api/users/change-email", { data : {
  user_id : user._id,
  newEmail : value
  }
 },"E-Mail versendet");
}
  }


  const changePassword = async ()=>{
    const { value: password } = await Swal.fire({
  title: 'Enter your password',
  showCancelButton: true,
  input: 'password',
  inputLabel: 'Password',
  inputPlaceholder: 'Enter your password',
  inputAttributes: {
    maxlength: 10,
    autocapitalize: 'off',
    autocorrect: 'off'
  }
})

if (password) { 
requestData("api/users/change-password", { 
  data : {
  user_id : user._id,
  password : password
  },
  message : "Password changed"
 });
    }
  }
    
    async function showEditor(id){
        const response = await requestData("/admin/api/users/"+id,{ method : "GET", message : "User loaded"});
        console.log("response",response);
        if(response.data){
            user = response.data;
            const data = Object.assign(response.data,{
                passwordForgot,
                changePassword,
                changeEmail,
                closeEditor
            })
editor = new Editor("user", "Userdata", () => data);
editor.theme("light");
// const strings = ["_id","email","type","user_uid"];
// strings.forEach((str)=>{
//     editor.root.addProperty(str, str, "string");
// });
response.details.forEach((elem)=>{
  editor.root.addProperty(elem.field, elem.title, elem.type)
})
editor.root.addButton("passwordForgot", "Send password forgot E-Mail");
editor.root.addButton("changePassword", "Change password");
editor.root.addButton("changeEmail", "Change Email");
editor.root.addButton("closeEditor", "Close");
        }
        
}
var table;
async function initTable(){    
  const columns = await requestData("api/users/columns", { method : "GET"});
  console.log("columns",columns);
    table = new Tabulator("#table", {
        layout:"fitDataStretch",
        ajaxURL: "/admin/api/users",
        columns : columns
});
table.on("rowClick", function(e, row){
  if(editor){
    closeEditor();
  }
  const id = row.getData().id;
  showEditor(id);
});
table.on("tableBuilt", () => {
  // table.setPage(2);
});
}
initTable();


//trigger download of data.csv file
document.getElementById("download-csv").addEventListener("click", function(){
    table.download("csv", "data.csv");
});

//trigger download of data.json file
document.getElementById("download-json").addEventListener("click", function(){
    table.download("json", "data.json");
});

//trigger download of data.xlsx file
document.getElementById("download-xlsx").addEventListener("click", function(){
    table.download("xlsx", "data.xlsx", {sheetName:"My Data"});
});

//trigger download of data.pdf file
document.getElementById("download-pdf").addEventListener("click", function(){
    table.download("pdf", "data.pdf", {
        orientation:"portrait", //set page orientation to portrait
        title:"Example Report", //add title to report
    });
});

//trigger download of data.html file
document.getElementById("download-html").addEventListener("click", function(){
    table.download("html", "data.html", {style:true});
});


</script>`;