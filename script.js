// script.js

const unitToSarsai = {
  "kila": 1280,
  "kanal": 160,
  "marla": 8,
  "sarsai": 1,
  "sqft": 1 / 34.03
};

const sarsaiToUnit = {
  "kila": 1280,
  "kanal": 160,
  "marla": 8,
  "sarsai": 1
};

const landInputs = document.getElementById("land-inputs");
const addEntryBtn = document.getElementById("add-entry");
const totalsOutput = document.getElementById("totals-output");
const numPersonsInput = document.getElementById("numPersons");
const divisionGrid = document.getElementById("division-grid");

let landEntries = [];

addEntryBtn.addEventListener("click", addLandRow);
numPersonsInput.addEventListener("input", calculateAll);

// Add one row by default
addLandRow();

function addLandRow() {
  const row = document.createElement("div");
  row.className = "land-row";

  const input = document.createElement("input");
  input.type = "number";
  input.min = "0";
  input.value = "";
  input.placeholder = "Enter value";
  input.addEventListener("input", calculateAll);

  const unitSelect = document.createElement("select");
  ["kila", "kanal", "marla", "sarsai", "sqft"].forEach(unit => {
    const opt = document.createElement("option");
    opt.value = unit;
    opt.textContent = unit.toUpperCase();
    unitSelect.appendChild(opt);
  });
  unitSelect.addEventListener("change", calculateAll);

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "×";
  removeBtn.style.background = "#e74c3c";
  removeBtn.style.color = "white";
  removeBtn.style.border = "none";
  removeBtn.style.borderRadius = "4px";
  removeBtn.style.padding = "0 8px";
  removeBtn.addEventListener("click", () => {
    landInputs.removeChild(row);
    calculateAll();
  });

  row.appendChild(input);
  row.appendChild(unitSelect);
  row.appendChild(removeBtn);
  landInputs.appendChild(row);
}
function calculateAll() {
  let totalSarsai = 0;

  // Loop through each land row
  const rows = document.querySelectorAll(".land-row");
  rows.forEach(row => {
    const input = row.querySelector("input").value;
    const unit = row.querySelector("select").value;

    const val = parseFloat(input);
    if (!isNaN(val)) {
      totalSarsai += val * unitToSarsai[unit];
    }
  });

  // Display total in all units
  const sqft = totalSarsai * 34.03;
  const unitBreakdown = convertFromSarsai(totalSarsai);

  let outputHTML = `<h2>Total Area</h2>
    <p><strong>Kila:</strong> ${unitBreakdown.kila}</p>
    <p><strong>Kanal:</strong> ${unitBreakdown.kanal}</p>
    <p><strong>Marla:</strong> ${unitBreakdown.marla}</p>
    <p><strong>Sarsai:</strong> ${unitBreakdown.sarsai.toFixed(2)}</p>
    <p><strong>Square Feet:</strong> ${sqft.toFixed(2)}</p>`;

  totalsOutput.innerHTML = outputHTML;

  // Proceed to division
  divideLand(totalSarsai);
}

function convertFromSarsai(sarsai) {
  let rem = sarsai;
  const kila = Math.floor(rem / sarsaiToUnit.kila);
  rem = rem % sarsaiToUnit.kila;

  const kanal = Math.floor(rem / sarsaiToUnit.kanal);
  rem = rem % sarsaiToUnit.kanal;

  const marla = Math.floor(rem / sarsaiToUnit.marla);
  rem = rem % sarsaiToUnit.marla;

  const sarsaiFinal = rem;

  return { kila, kanal, marla, sarsai: sarsaiFinal };
}
function divideLand(totalSarsai) {
  const numPersons = parseInt(numPersonsInput.value);
  if (!numPersons || numPersons < 1) return;

  const personSarsai = totalSarsai / numPersons;
  divisionGrid.innerHTML = ""; // Clear previous

  for (let i = 1; i <= numPersons; i++) {
    const share = convertFromSarsai(personSarsai);
    const personDiv = document.createElement("div");
    personDiv.className = "person-grid";

    personDiv.innerHTML = `
      <h3>Person ${i}</h3>
      <div class="block" style="background:#2980b9">Kila: ${share.kila}</div>
      <div class="block" style="background:#27ae60">Kanal: ${share.kanal}</div>
      <div class="block" style="background:#f39c12">Marla: ${share.marla}</div>
      <div class="block" style="background:#c0392b">Sarsai: ${share.sarsai.toFixed(2)}</div>
    `;

    divisionGrid.appendChild(personDiv);
  }

  // Store for export
  window._divisionResults = {
    total: totalSarsai,
    persons: numPersons,
    perPerson: personSarsai,
    breakdowns: Array.from({ length: numPersons }, () => convertFromSarsai(personSarsai))
  };
}
document.getElementById("download-csv").addEventListener("click", () => {
  const { breakdowns } = window._divisionResults || {};
  if (!breakdowns) return;

  let csv = "Person,Kila,Kanal,Marla,Sarsai\n";
  breakdowns.forEach((b, i) => {
    csv += `Person ${i + 1},${b.kila},${b.kanal},${b.marla},${b.sarsai.toFixed(2)}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "land_division.csv";
  link.click();
});
