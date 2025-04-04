const landInputs = document.getElementById("land-inputs");
const addEntryBtn = document.getElementById("add-entry");
const totalsOutput = document.getElementById("totals-output");
const numPersonsInput = document.getElementById("num-persons");
const divisionGrid = document.getElementById("division-grid");

const unitToSarsai = {
  "kila": 160,
  "kanal": 8,
  "marla": 0.5,
  "sarsai": 1,
  "sqft": 1 / 34.03
};
const sarsaiToUnit = {
  "kila": 160,
  "kanal": 8,
  "marla": 0.5
};

function createRow() {
  const row = document.createElement("div");
  row.className = "land-row";
  row.innerHTML = \`
    <input type="number" step="any" placeholder="Value" />
    <select>
      <option value="kila">Kila</option>
      <option value="kanal">Kanal</option>
      <option value="marla">Marla</option>
      <option value="sarsai">Sarsai</option>
      <option value="sqft">Square Feet</option>
    </select>
    <button onclick="this.parentNode.remove(); calculateAll();">Remove</button>
  \`;
  row.querySelector("input").addEventListener("input", calculateAll);
  row.querySelector("select").addEventListener("change", calculateAll);
  landInputs.appendChild(row);
}

addEntryBtn.addEventListener("click", () => {
  createRow();
  console.log("Add Land Entry button clicked");
});

numPersonsInput.addEventListener("input", calculateAll);

function calculateAll() {
  let totalSarsai = 0;
  const rows = document.querySelectorAll(".land-row");
  rows.forEach(row => {
    const input = row.querySelector("input").value;
    const unit = row.querySelector("select").value;
    const val = parseFloat(input);
    if (!isNaN(val)) {
      totalSarsai += val * unitToSarsai[unit];
    }
  });
  const sqft = totalSarsai * 34.03;
  const unitBreakdown = convertFromSarsai(totalSarsai);
  let outputHTML = \`<h2>Total Area</h2>
    <p><strong>Kila:</strong> \${unitBreakdown.kila}</p>
    <p><strong>Kanal:</strong> \${unitBreakdown.kanal}</p>
    <p><strong>Marla:</strong> \${unitBreakdown.marla}</p>
    <p><strong>Sarsai:</strong> \${unitBreakdown.sarsai.toFixed(2)}</p>
    <p><strong>Square Feet:</strong> \${sqft.toFixed(2)}</p>\`;
  totalsOutput.innerHTML = outputHTML;
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
  return { kila, kanal, marla, sarsai: rem };
}

function divideLand(totalSarsai) {
  const numPersons = parseInt(numPersonsInput.value);
  if (!numPersons || numPersons < 1) return;
  const personSarsai = totalSarsai / numPersons;
  divisionGrid.innerHTML = "";
  for (let i = 1; i <= numPersons; i++) {
    const share = convertFromSarsai(personSarsai);
    const personDiv = document.createElement("div");
    personDiv.className = "person-grid";
    personDiv.innerHTML = \`
      <h3>Person \${i}</h3>
      <div class="block" style="background:#2980b9">Kila: \${share.kila}</div>
      <div class="block" style="background:#27ae60">Kanal: \${share.kanal}</div>
      <div class="block" style="background:#f39c12">Marla: \${share.marla}</div>
      <div class="block" style="background:#c0392b">Sarsai: \${share.sarsai.toFixed(2)}</div>
    \`;
    divisionGrid.appendChild(personDiv);
  }
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
    csv += \`Person \${i + 1},\${b.kila},\${b.kanal},\${b.marla},\${b.sarsai.toFixed(2)}\n\`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "land_division.csv";
  link.click();
});

document.getElementById("download-pdf").addEventListener("click", async () => {
  const { breakdowns } = window._divisionResults || {};
  if (!breakdowns) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Land Division Report", 14, 20);
  breakdowns.forEach((b, i) => {
    const y = 30 + i * 40;
    doc.setFontSize(14);
    doc.text(\`Person \${i + 1}\`, 14, y);
    doc.setFontSize(12);
    doc.text(\`Kila: \${b.kila}\`, 20, y + 10);
    doc.text(\`Kanal: \${b.kanal}\`, 60, y + 10);
    doc.text(\`Marla: \${b.marla}\`, 20, y + 20);
    doc.text(\`Sarsai: \${b.sarsai.toFixed(2)}\`, 60, y + 20);
    doc.setDrawColor(0);
    doc.setFillColor(200, 220, 255);
    doc.rect(130, y - 2, 60, 30, "F");
    doc.setTextColor(0);
    doc.text(\`Block: P\${i + 1}\`, 140, y + 15);
  });
  doc.save("land_division.pdf");
});
