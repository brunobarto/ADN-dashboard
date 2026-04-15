// --- DNA HELIX + SEQUENCE LOGIC -----------------------------------------

const dnaHelix = document.getElementById("dnaHelix");
const sequenceDisplay = document.getElementById("sequenceDisplay");
const sequenceLengthLabel = document.getElementById("sequenceLength");
const gcContentLabel = document.getElementById("gcContent");
const mutationRateInput = document.getElementById("mutationRate");
const mutationRateLabel = document.getElementById("mutationRateLabel");
const helixSpeedInput = document.getElementById("helixSpeed");
const helixSpeedLabel = document.getElementById("helixSpeedLabel");
const dnaOverlayTag = document.getElementById("dnaOverlayTag");
const mutationAlert = document.getElementById("mutationAlert");
const fpsLabel = document.getElementById("fpsLabel");

const btnRandom = document.getElementById("btnRandom");
const btnPause = document.getElementById("btnPause");
const btnInject = document.getElementById("btnInject");
const btnReset = document.getElementById("btnReset");

let sequence = "";
let isPaused = false;
let mutationRate = parseInt(mutationRateInput.value, 10) / 100;
let helixDuration = parseInt(helixSpeedInput.value, 10);
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 60;

const basePairs = [
  ["A", "T"],
  ["T", "A"],
  ["C", "G"],
  ["G", "C"],
];

function randomBasePair() {
  return basePairs[Math.floor(Math.random() * basePairs.length)];
}

function generateSequence(length) {
  let s = "";
  for (let i = 0; i < length; i++) {
    const pair = randomBasePair();
    s += pair[0];
  }
  return s;
}

function computeGCContent(seq) {
  if (!seq.length) return 0;
  const gc = seq.split("").filter((b) => b === "G" || b === "C").length;
  return (gc / seq.length) * 100;
}

function updateSequenceDisplay() {
  sequenceDisplay.textContent = sequence;
  sequenceLengthLabel.textContent = sequence.length + " bp";
  gcContentLabel.textContent = computeGCContent(sequence).toFixed(1);
}

function buildHelix(rungs = 32) {
  dnaHelix.innerHTML = "";
  const strand = document.createElement("div");
  strand.className = "dna-strand";

  for (let i = 0; i < rungs; i++) {
    const rung = document.createElement("div");
    rung.className = "dna-rung";

    const angle = (i / rungs) * Math.PI * 2;
    const y = (i / rungs - 0.5) * 220;
    const depth = Math.sin(angle);
    const scale = 0.6 + 0.4 * (depth + 1) / 2;
    const z = depth * 80;

    rung.style.transform =
      "translate3d(-50%, " +
      y.toFixed(1) +
      "px, " +
      z.toFixed(1) +
      "px) rotateY(" +
      (angle * 180 / Math.PI).toFixed(1) +
      "deg) scale(" +
      scale.toFixed(2) +
      ")";

    const line = document.createElement("div");
    line.className = "dna-rung-line";

    const [leftBase, rightBase] = randomBasePair();

    const leftNode = document.createElement("div");
    leftNode.className = "dna-node left " + leftBase.toLowerCase();
    leftNode.dataset.base = leftBase;

    const rightNode = document.createElement("div");
    rightNode.className = "dna-node right " + rightBase.toLowerCase();
    rightNode.dataset.base = rightBase;

    rung.appendChild(line);
    rung.appendChild(leftNode);
    rung.appendChild(rightNode);
    strand.appendChild(rung);
  }

  dnaHelix.appendChild(strand);
  strand.style.animationDuration = helixDuration + "s";
  dnaOverlayTag.textContent = "A/T · C/G · " + rungs + " rungs";
}

function mutateSequence() {
  if (!sequence.length) return;
  const chars = sequence.split("");
  for (let i = 0; i < chars.length; i++) {
    if (Math.random() < mutationRate) {
      const bases = ["A", "T", "C", "G"];
      const current = chars[i];
      const options = bases.filter((b) => b !== current);
      chars[i] = options[Math.floor(Math.random() * options.length)];
    }
  }
  sequence = chars.join("");
}

function tick() {
  const now = performance.now();
  const delta = now - lastFrameTime;
  frameCount++;

  if (delta >= 1000) {
    fps = Math.round((frameCount * 1000) / delta);
    fpsLabel.textContent = fps;
    frameCount = 0;
    lastFrameTime = now;
  }

  if (!isPaused) {
    mutateSequence();
    updateSequenceDisplay();
  }

  requestAnimationFrame(tick);
}

// --- GENOME CATALOG ------------------------------------------------------

const catalogBody = document.getElementById("catalogBody");
const activeSelectionLabel = document.getElementById("activeSelection");
const recordCountLabel = document.getElementById("recordCount");
const filterPills = document.querySelectorAll(".pill[data-filter]");

const catalogData = [
  { id: "GEN-RPT-032", origin: "Reptilian", mutation: "High", stability: "Low" },
  { id: "GEN-RPT-019", origin: "Reptilian", mutation: "Medium", stability: "Medium" },
  { id: "GEN-HMN-004", origin: "Human", mutation: "Low", stability: "High" },
  { id: "GEN-HYB-011", origin: "Hybrid", mutation: "High", stability: "Medium" },
  { id: "GEN-HMN-021", origin: "Human", mutation: "Medium", stability: "High" },
  { id: "GEN-RPT-041", origin: "Reptilian", mutation: "Low", stability: "Low" },
  { id: "GEN-ARC-002", origin: "Archived", mutation: "Low", stability: "Unknown" },
  { id: "GEN-HYB-017", origin: "Hybrid", mutation: "Medium", stability: "Medium" },
];

function renderCatalog(filter = "all") {
  catalogBody.innerHTML = "";
  const filtered = catalogData.filter((row) => {
    if (filter === "all") return true;
    if (filter === "reptilian") return row.origin === "Reptilian";
    if (filter === "human") return row.origin === "Human";
    if (filter === "hybrid") return row.origin === "Hybrid";
    if (filter === "archived") return row.origin === "Archived";
    return true;
  });

  filtered.forEach((row, idx) => {
    const div = document.createElement("div");
    div.className = "catalog-row";
    div.dataset.id = row.id;

    const mutationBadgeClass =
      row.mutation === "High" ? "badge badge-high" :
      row.mutation === "Low" ? "badge badge-low" :
      "badge";

    const stabilityBadgeClass =
      row.stability === "High" ? "badge badge-low" :
      row.stability === "Low" ? "badge badge-high" :
      "badge";

    div.innerHTML = `
      <div><span class="id">${row.id}</span></div>
      <div>${row.origin}</div>
      <div><span class="${mutationBadgeClass}">${row.mutation}</span></div>
      <div><span class="${stabilityBadgeClass}">${row.stability}</span></div>
    `;

    div.addEventListener("click", () => {
      activeSelectionLabel.textContent = row.id;
    });

    catalogBody.appendChild(div);

    if (idx === 0) {
      activeSelectionLabel.textContent = row.id;
    }
  });

  recordCountLabel.textContent = filtered.length;
}

filterPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    filterPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    const filter = pill.dataset.filter;
    renderCatalog(filter);
  });
});

// --- THUMBNAILS ---------------------------------------------------------

const thumbs = document.querySelectorAll(".thumb");
const videoLabel = document.querySelector(".video-label");

thumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const type = thumb.dataset.thumb;
    if (type === "dna") {
      videoLabel.textContent = "FOCUS · DNA STRAND";
    } else if (type === "cell") {
      videoLabel.textContent = "FOCUS · CELLULAR MATRIX";
    } else if (type === "skin") {
      videoLabel.textContent = "FOCUS · EPIDERMAL SCALES";
    } else if (type === "matrix") {
      videoLabel.textContent = "FOCUS · PROTEIN NETWORK";
    }
  });
});

// --- BUTTON HANDLERS ----------------------------------------------------

btnRandom.addEventListener("click", () => {
  sequence = generateSequence(120);
  updateSequenceDisplay();
});

btnPause.addEventListener("click", () => {
  isPaused = !isPaused;
  btnPause.textContent = isPaused ? "Resume" : "Pause";
});

btnInject.addEventListener("click", () => {
  mutationAlert.textContent = "Mutation load: spike detected";
  mutationAlert.classList.add("danger");
  mutationAlert.classList.remove("ok");
  mutationAlert.style.borderColor = "rgba(255, 75, 106, 0.7)";
  setTimeout(() => {
    mutationAlert.textContent = "Mutation load: nominal";
    mutationAlert.classList.remove("danger");
    mutationAlert.classList.add("ok");
    mutationAlert.style.borderColor = "rgba(75, 255, 176, 0.7)";
    setTimeout(() => {
      mutationAlert.classList.remove("ok");
      mutationAlert.style.borderColor = "rgba(255, 255, 255, 0.16)";
    }, 1200);
  }, 1400);
});

btnReset.addEventListener("click", () => {
  sequence = generateSequence(80);
  updateSequenceDisplay();
  mutationRateInput.value = 25;
  mutationRate = 0.25;
  mutationRateLabel.textContent = mutationRate.toFixed(2);
  helixSpeedInput.value = 18;
  helixDuration = 18;
  helixSpeedLabel.textContent = helixDuration + "s";
  const strand = dnaHelix.querySelector(".dna-strand");
  if (strand) strand.style.animationDuration = helixDuration + "s";
});

mutationRateInput.addEventListener("input", () => {
  mutationRate = parseInt(mutationRateInput.value, 10) / 100;
  mutationRateLabel.textContent = mutationRate.toFixed(2);
});

helixSpeedInput.addEventListener("input", () => {
  helixDuration = parseInt(helixSpeedInput.value, 10);
  helixSpeedLabel.textContent = helixDuration + "s";
  const strand = dnaHelix.querySelector(".dna-strand");
  if (strand) strand.style.animationDuration = helixDuration + "s";
});

// --- INIT ----------------------------------------------------------------

function init() {
  buildHelix(32);
  sequence = generateSequence(100);
  updateSequenceDisplay();
  renderCatalog("all");
  requestAnimationFrame(tick);
}

init();
