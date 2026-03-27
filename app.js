const LBS_TO_KG = 0.45359237;
const US_GALLON_TO_LITERS = 3.785411784;
const INVALID_ALERT_MESSAGE = "Invalid data: required uplift must be positive";

const homeView = document.getElementById("homeView");
const fuelView = document.getElementById("fuelView");
const acnView = document.getElementById("acnView");
const openFuelBtn = document.getElementById("openFuelBtn");
const openAcnBtn = document.getElementById("openAcnBtn");
const backFromFuelBtn = document.getElementById("backFromFuelBtn");
const backFromAcnBtn = document.getElementById("backFromAcnBtn");
const form = document.getElementById("fuel-form");
const inputScreen = document.getElementById("input-screen");
const resultsScreen = document.getElementById("results-screen");
const aircraftInputs = document.querySelectorAll('input[name="aircraft"]');
const clearButton = document.getElementById("clear-button");
const backButton = document.getElementById("back-button");
const recheckButton = document.getElementById("recheck-button");
const banner = document.getElementById("results-banner");
const bannerLabel = document.getElementById("banner-label");
const bannerTitle = document.getElementById("banner-title");
const bannerSubtitle = document.getElementById("banner-subtitle");
const conversionsList = document.getElementById("conversions-list");
const weightList = document.getElementById("weight-list");
const volumeList = document.getElementById("volume-list");
const weightSection = document.getElementById("weight-section");
const volumeSection = document.getElementById("volume-section");
const weightChip = document.getElementById("weight-chip");
const volumeChip = document.getElementById("volume-chip");

registerServiceWorker();
updateToleranceText();
showHomeView();

openFuelBtn.addEventListener("click", () => {
  showInputScreen();
  showFuelView();
});

openAcnBtn.addEventListener("click", () => {
  showAcnView();
});

backFromFuelBtn.addEventListener("click", () => {
  showHomeView();
});

backFromAcnBtn.addEventListener("click", () => {
  showHomeView();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateAndRender();
});

aircraftInputs.forEach((input) => {
  input.addEventListener("change", updateToleranceText);
});

clearButton.addEventListener("click", () => {
  form.reset();
  form.elements.aircraft.value = "B787";
  form.elements.densityUnit.value = "kg/L";
  form.elements.volumeUnit.value = "Liters";
  form.elements.densityValue.value = "0.796";
  updateToleranceText();
  form.elements.rampFuel.focus();
});

backButton.addEventListener("click", () => {
  showInputScreen();
});

recheckButton.addEventListener("click", () => {
  calculateAndRender();
});

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // Keep the app quiet and stable if registration is unavailable.
    });
  });
}

function calculateAndRender() {
  const parsed = readInputValues();

  if (!parsed) {
    window.alert(INVALID_ALERT_MESSAGE);
    return;
  }

  const result = calculateFuelCheck(parsed);
  renderResults(result);
  showResultsScreen();
}

function updateToleranceText() {
  const aircraft = form.elements.aircraft.value;
  const el = document.getElementById("toleranceText");

  if (aircraft === "B787") {
    el.textContent = "MAX(3%, 400 kg)";
  } else {
    el.textContent = "MAX(3%, 200 kg)";
  }
}

function readInputValues() {
  const aircraft = form.elements.aircraft.value;
  const densityUnit = form.elements.densityUnit.value;
  const volumeUnit = form.elements.volumeUnit.value;
  const rampFuel = parseNonNegativeNumber(form.elements.rampFuel.value);
  const remainingFuel = parseNonNegativeNumber(form.elements.remainingFuel.value);
  const densityValue = parsePositiveNumber(form.elements.densityValue.value);
  const actualVolume = parseNonNegativeNumber(form.elements.actualVolume.value);

  if (
    rampFuel === null ||
    remainingFuel === null ||
    densityValue === null ||
    actualVolume === null
  ) {
    return null;
  }

  const requiredUpliftKg = rampFuel - remainingFuel;

  if (requiredUpliftKg <= 0) {
    return null;
  }

  return {
    aircraft,
    rampFuel,
    remainingFuel,
    densityUnit,
    densityValue,
    volumeUnit,
    actualVolume,
  };
}

function parseNonNegativeNumber(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function parsePositiveNumber(value) {
  const parsed = parseNonNegativeNumber(value);
  if (parsed === null || parsed <= 0) {
    return null;
  }
  return parsed;
}

function calculateFuelCheck(values) {
  const requiredUpliftKg = values.rampFuel - values.remainingFuel;
  const densityKgPerL =
    values.densityUnit === "kg/L"
      ? values.densityValue
      : (values.densityValue * LBS_TO_KG) / US_GALLON_TO_LITERS;
  const actualVolumeLiters =
    values.volumeUnit === "Liters"
      ? values.actualVolume
      : values.actualVolume * US_GALLON_TO_LITERS;
  const actualUpliftKg = actualVolumeLiters * densityKgPerL;
  const totalFuelLoaded = values.remainingFuel + actualUpliftKg;
  const weightDifference = totalFuelLoaded - values.rampFuel;
  let minKg;

  if (values.aircraft === "B787") {
    minKg = 400;
  } else if (values.aircraft === "B737") {
    minKg = 200;
  }

  const tolerance = Math.max(0.03 * requiredUpliftKg, minKg);
  const pass = Math.abs(actualUpliftKg - requiredUpliftKg) <= tolerance;
  const requiredVolumeLiters = requiredUpliftKg / densityKgPerL;
  const volumeDifferenceLiters = actualVolumeLiters - requiredVolumeLiters;
  const volumeMinLiters = Math.max(0, (requiredUpliftKg - tolerance) / densityKgPerL);
  const volumeMaxLiters = (requiredUpliftKg + tolerance) / densityKgPerL;

  return {
    ...values,
    requiredUpliftKg,
    densityKgPerL,
    actualVolumeLiters,
    actualUpliftKg,
    totalFuelLoaded,
    weightDifference,
    tolerance,
    pass,
    requiredVolumeLiters,
    volumeDifferenceLiters,
    volumeMinLiters,
    volumeMaxLiters,
    weightRangeMinKg: Math.max(0, requiredUpliftKg - tolerance),
    weightRangeMaxKg: requiredUpliftKg + tolerance,
  };
}

function renderResults(result) {
  const stateLabel = result.pass ? "PASS" : "FAIL";

  banner.classList.toggle("pass", result.pass);
  banner.classList.toggle("fail", !result.pass);
  bannerLabel.textContent = stateLabel;
  bannerTitle.textContent = `${stateLabel} • ${result.aircraft}`;
  bannerSubtitle.textContent = result.pass
    ? "Actual uplift is within allowed tolerance"
    : "Actual uplift is outside allowed tolerance";

  renderKeyValueList(conversionsList, [
    ["Aircraft", result.aircraft],
    ["Ramp Fuel", formatKg(result.rampFuel)],
    ["Remaining Fuel", formatKg(result.remainingFuel)],
    ["Required Uplift", formatKg(result.requiredUpliftKg)],
    [
      "Density Input",
      `${formatNumber(result.densityValue, 3)} ${result.densityUnit}`,
    ],
    ["Density Converted", `${formatNumber(result.densityKgPerL, 4)} kg/L`],
    [
      "Volume Input",
      `${formatNumber(result.actualVolume, 2)} ${result.volumeUnit}`,
    ],
    ["Volume Converted", formatLiters(result.actualVolumeLiters)],
  ]);

  const actualWeightDifference = result.actualUpliftKg - result.requiredUpliftKg;
  const weightDifferenceFail = Math.abs(actualWeightDifference) > result.tolerance;
  const volumeDifferenceFail =
    result.actualVolumeLiters < result.volumeMinLiters ||
    result.actualVolumeLiters > result.volumeMaxLiters;

  renderKeyValueList(weightList, [
    ["Required Uplift", formatKg(result.requiredUpliftKg)],
    ["Actual Uplift", formatKg(result.actualUpliftKg)],
    [
      "Difference",
      `${formatSignedKg(actualWeightDifference)} (${formatSignedPercent(
        percentage(actualWeightDifference, result.requiredUpliftKg)
      )})`,
      weightDifferenceFail,
    ],
    [
      "Allowed Min / Max",
      `${formatKg(result.weightRangeMinKg)} / ${formatKg(result.weightRangeMaxKg)}`,
    ],
    ["Tolerance", formatKg(result.tolerance)],
    ["Total Fuel Loaded", formatKg(result.totalFuelLoaded)],
    [
      "Loaded vs Ramp",
      `${formatSignedKg(result.weightDifference)} (${formatSignedPercent(
        percentage(result.weightDifference, result.rampFuel)
      )})`,
      weightDifferenceFail,
    ],
  ]);

  renderKeyValueList(volumeList, [
    ["Required Volume", formatLiters(result.requiredVolumeLiters)],
    ["Actual Volume", formatLiters(result.actualVolumeLiters)],
    [
      "Difference",
      `${formatSignedLiters(result.volumeDifferenceLiters)} (${formatSignedPercent(
        percentage(result.volumeDifferenceLiters, result.requiredVolumeLiters)
      )})`,
      volumeDifferenceFail,
    ],
    [
      "Allowed Min / Max",
      `${formatLiters(result.volumeMinLiters)} / ${formatLiters(result.volumeMaxLiters)}`,
    ],
  ]);

  setSectionState(weightSection, weightChip, weightDifferenceFail);
  setSectionState(volumeSection, volumeChip, volumeDifferenceFail);
}

function renderKeyValueList(container, rows) {
  container.textContent = "";

  rows.forEach(([key, value, isFail]) => {
    const row = document.createElement("div");
    row.className = "kv-row";
    if (isFail) {
      row.classList.add("fail");
    }

    const keyNode = document.createElement("span");
    keyNode.className = "kv-key";
    keyNode.textContent = key;

    const valueNode = document.createElement("span");
    valueNode.className = "kv-value";
    valueNode.textContent = value;

    row.append(keyNode, valueNode);
    container.appendChild(row);
  });
}

function setSectionState(section, chip, isFail) {
  section.classList.toggle("fail", isFail);
  chip.classList.toggle("fail", isFail);
  chip.textContent = isFail ? "OUT OF RANGE" : "IN RANGE";
}

function showAppView(activeView) {
  [homeView, fuelView, acnView].forEach((view) => {
    const isActive = view === activeView;
    view.hidden = !isActive;
    view.setAttribute("aria-hidden", String(!isActive));
  });
  window.scrollTo(0, 0);
}

function showHomeView() {
  showAppView(homeView);
}

function showFuelView() {
  showAppView(fuelView);
}

function showAcnView() {
  showAppView(acnView);
}

function showResultsScreen() {
  inputScreen.hidden = true;
  resultsScreen.hidden = false;
  window.scrollTo(0, 0);
}

function showInputScreen() {
  resultsScreen.hidden = true;
  inputScreen.hidden = false;
  window.scrollTo(0, 0);
}

function percentage(value, base) {
  if (base === 0) {
    return 0;
  }
  return (value / base) * 100;
}

function formatNumber(value, decimals) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatKg(value) {
  return `${formatNumber(value, 1)} kg`;
}

function formatLiters(value) {
  return `${formatNumber(value, 1)} L`;
}

function formatSignedKg(value) {
  return `${value >= 0 ? "+" : "-"}${formatNumber(Math.abs(value), 1)} kg`;
}

function formatSignedLiters(value) {
  return `${value >= 0 ? "+" : "-"}${formatNumber(Math.abs(value), 1)} L`;
}

function formatSignedPercent(value) {
  return `${value >= 0 ? "+" : "-"}${formatNumber(Math.abs(value), 2)}%`;
}
