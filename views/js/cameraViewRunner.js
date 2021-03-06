import OctoPrintClient from "./lib/octoprint.js";
import UI from "./lib/functions/ui.js";
import Calc from "./lib/functions/calc.js";
import currentOperations from "./lib/modules/currentOperations.js";
import PrinterManager from "./lib/modules/printerManager.js";
import doubleClickFullScreen from "./lib/functions/fullscreen.js";

let printerInfo = "";
let elems = [];

//Connect to servers socket..webSocket
let url = window.location.hostname;
let port = window.location.port;
if (port != "") {
  port = ":" + port;
}

//Close modal event listeners...
$("#printerManagerModal").on("hidden.bs.modal", function(e) {
  //Fix for mjpeg stream not ending when element removed...
  document.getElementById("printerControlCamera").src = "";
});

var source = new EventSource("/sse/printerInfo/");
source.onmessage = function(e) {
  if (e.data != null) {
    let res = JSON.parse(e.data);

    if (
      document.getElementById("printerManagerModal").classList.contains("show")
    ) {
      PrinterManager.init(res.printerInfo);
    } else {
      printerInfo = res.printerInfo;
      if (res.clientSettings.cameraView.currentOp) {
        currentOperations(res.currentOperations, res.currentOperationsCount);
      }
      updateState(res.printerInfo, res.clientSettings.cameraView);
    }
  }
};
source.onerror = function(e) {
  UI.createAlert(
    "error",
    "Communication with the server has been suddenly lost, please restart client and try again..."
  );
};
source.onclose = function(e) {
  UI.createAlert(
    "error",
    "Communication with the server has been suddenly lost, please restart client and try again..."
  );
};

//Setup page listeners...
let printerCard = document.querySelectorAll("[id^='printerButton-']");
printerCard.forEach(card => {
  let ca = card.id.split("-");
  card.addEventListener("click", e => {
    PrinterManager.updateIndex(parseInt(ca[1]));
    PrinterManager.init(printerInfo);
  });
  document
    .getElementById("camBody-" + parseInt(ca[1]))
    .addEventListener("dblclick", e => {
      doubleClickFullScreen(e.target);
    });
  document
    .getElementById("camStart-" + ca[1])
    .addEventListener("click", async e => {
      e.target.disabled = true;
      let opts = {
        command: "start"
      };
      OctoPrintClient.jobAction(printerInfo[ca[1]], opts, e);
    });
  document.getElementById("camStop-" + ca[1]).addEventListener("click", e => {
    bootbox.confirm({
      message: `${printerInfo[ca[1]].index}.  ${
        printerInfo[ca[1]].settingsAppearance.name
      }: <br>Are you sure you want to cancel the ongoing print?`,
      buttons: {
        cancel: {
          label: '<i class="fa fa-times"></i> Cancel'
        },
        confirm: {
          label: '<i class="fa fa-check"></i> Confirm'
        }
      },
      callback: function(result) {
        if (result) {
          e.target.disabled = true;
          let opts = {
            command: "cancel"
          };
          OctoPrintClient.jobAction(printerInfo[ca[1]], opts, e);
        }
      }
    });
  });
});

function grabElements(printer) {
  if (typeof elems[printer.index] != "undefined") {
    return elems[printer.index];
  } else {
    let printerElemens = {
      row: document.getElementById("camPanel-" + printer.index),
      index: document.getElementById("camIndex-" + printer.index),
      name: document.getElementById("camName-" + printer.index),
      control: document.getElementById("printerButton-" + printer.index),
      start: document.getElementById("camStart-" + printer.index),
      stop: document.getElementById("camStop-" + printer.index),
      camera: document.getElementById("panCameraSRC-" + printer.index),
      currentFile: document.getElementById("camFileName-" + printer.index),
      camBackground: document.getElementById("camBody-" + printer.index),
      state: document.getElementById("camState-" + printer.index),
      progress: document.getElementById("camProgress-" + printer.index),
      tool0: document.getElementById("panE0Temp-" + printer.index),
      bed: document.getElementById("panBedTemp-" + printer.index),
      iconBedT: document.getElementById("bedT-" + printer.index),
      iconBedA: document.getElementById("bedA-" + printer.index),
      iconTool0A: document.getElementById("tool0A-" + printer.index),
      iconTool0T: document.getElementById("tool0T-" + printer.index)
    };
    elems[printer.index] = printerElemens;
    return elems[printer.index];
  }
}
function updateState(printers, clientSettings) {
  printers.forEach(printer => {
    let elements = grabElements(printer);
    elements.camBackground.className = `card-body cameraContain ${printer.stateColour.category}`;
    if (typeof printer.settingsApperance != "undefined") {
      elements.index.innerHTML = `
      <h6 class="float-left mb-0" id="panIndex-${printer.index}">
        <button id="panName-1" type="button" class="btn btn-secondary mb-0" role="button" disabled="">
          ${printer.index} . ${printer.settingsApperance.name}
        </button>
      </h6>
      `;
    }

    if (typeof printer.job != "undefined" && printer.job.file.name != null) {
      elements.currentFile.innerHTML =
        '<i class="fas fa-file-code"></i> ' + printer.job.file.name;
    } else {
      elements.currentFile.innerHTML =
        '<i class="fas fa-file-code"></i> ' + "No File Selected";
    }

    if (typeof printer.progress != "undefined") {
      elements.progress.innerHTML =
        Math.floor(printer.progress.completion) + "%";
      elements.progress.style.width = printer.progress.completion + "%";
    }
    let tool0A = 0;
    let tool0T = 0;
    let bedA = 0;
    let bedT = 0;
    if (typeof printer.temps != "undefined") {
      if (typeof printer.temps[0].tool0 != "undefined") {
        tool0A = printer.temps[0].tool0.actual;
        tool0T = printer.temps[0].tool0.target;
        bedA = printer.temps[0].bed.actual;
        bedT = printer.temps[0].bed.target;
      } else {
        tool0A = 0;
        tool0T = 0;
        bedA = 0;
        bedT = 0;
      }
    }
    let hideClosed = "";
    let hideOffline = "";

    if (clientSettings.hideClosed) {
      hideClosed = "hidden";
    }
    //Set the state
    if (printer.stateColour.category === "Active") {
      if (printer.camURL != "") {
        elements.row.className = "col-sm-12 col-md-4 col-lg-3 col-xl-2";
      }

      elements.control.disabled = false;
      elements.start.disabled = true;
      elements.stop.disabled = false;
      elements.start.classList.add("hidden");
      elements.stop.classList.remove("hidden");
      if (tool0A > tool0T - 0.5 && tool0A < tool0T + 0.5) {
        elements.tool0.innerHTML =
          '<i id="tool0A-' +
          printer.index +
          '" class="far fa-circle toolOn"></i> ' +
          tool0A +
          "°C" +
          " " +
          '<i id="tool0T-' +
          printer.index +
          '" class="fas fa-bullseye toolOn"></i> ' +
          tool0T +
          "°C";
      } else if (tool0A < 35) {
        elements.tool0.innerHTML =
          '<i id="tool0A-' +
          printer.index +
          '" class="far fa-circle"></i> ' +
          tool0A +
          "°C" +
          " " +
          '<i id="tool0T-' +
          printer.index +
          '" class="fas fa-bullseye"></i> ' +
          tool0T +
          "°C";
      } else {
        elements.tool0.innerHTML =
          '<i id="tool0A-' +
          printer.index +
          '" class="far fa-circle toolOut"></i> ' +
          tool0A +
          "°C" +
          '<i id="tool0T-' +
          printer.index +
          '" class="fas fa-bullseye toolOut"></i> ' +
          tool0T +
          "°C";
      }
      if (bedA > bedT - 0.5 && bedA < bedT + 0.5) {
        elements.bed.innerHTML =
          '<i id="bedA-' +
          printer.index +
          '" class="far fa-circle toolOn"></i> ' +
          bedA +
          "°C" +
          " " +
          '<i id="bedT-' +
          printer.index +
          '" class="fas fa-bullseye toolOn"></i> ' +
          bedT +
          "°C";
      } else if (bedA < 35) {
        elements.bed.innerHTML =
          '<i id="bedA-' +
          printer.index +
          '" class="far fa-circle"></i> ' +
          bedA +
          "°C" +
          " " +
          '<i id="bedT-' +
          printer.index +
          '" class="fas fa-bullseye"></i> ' +
          bedT +
          "°C";
      } else {
        elements.bed.innerHTML =
          '<i id="bedA-' +
          printer.index +
          '" class="far fa-circle toolOut"></i> ' +
          bedA +
          "°C" +
          '<i id="bedT-' +
          printer.index +
          '" class="fas fa-bullseye toolOut"></i> ' +
          bedT +
          "°C";
      }
    } else if (
      printer.stateColour.category === "Idle" ||
      printer.stateColour.category === "Complete"
    ) {
      elements.control.disabled = false;
      if (printer.camURL != "") {
        elements.row.className = "col-sm-12 col-md-4 col-lg-3 col-xl-2";
      }
      if (typeof printer.job != "undefined" && printer.job.file.name != null) {
        elements.start.disabled = false;
        elements.stop.disabled = true;
        elements.start.classList.remove("hidden");
        elements.stop.classList.add("hidden");
      } else {
        elements.start.disabled = true;
        elements.stop.disabled = true;
        elements.start.classList.remove("hidden");
        elements.stop.classList.add("hidden");
      }
    } else if (printer.state === "Closed") {
      if (printer.camURL != "") {
        elements.row.className =
          "col-sm-12 col-md-4 col-lg-3 col-xl-2" + " " + hideClosed;
      }

      elements.control.disabled = false;
      elements.start.disabled = true;
      elements.stop.disabled = true;
      elements.start.classList.remove("hidden");
      elements.stop.classList.add("hidden");
    } else if (printer.stateColour.category === "Offline") {
      elements.start.classList.remove("hidden");
      elements.stop.classList.add("hidden");
      elements.control.disabled = true;
      elements.start.disabled = true;
      elements.stop.disabled = true;
    }
  });
}
