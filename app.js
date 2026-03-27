const APP_VERSION = "v1.7";
const LBS_TO_KG = 0.45359237;
const US_GALLON_TO_LITERS = 3.785411784;
const INVALID_ALERT_MESSAGE = "Invalid data: required uplift must be positive";
const ACN_AIRCRAFT_DATA = {
  "B787-9": {
    label: "B787-9",
    referenceLabel: "B787-9",
    maxWeightKg: 254692,
    emptyWeightKg: 113398,
    tirePsi: 226,
    rigid: {
      A: { max: 65, empty: 25 },
      B: { max: 76, empty: 27 },
      C: { max: 90, empty: 30 },
      D: { max: 104, empty: 35 },
    },
    flexible: {
      A: { max: 66, empty: 25 },
      B: { max: 73, empty: 26 },
      C: { max: 88, empty: 28 },
      D: { max: 118, empty: 35 },
    },
  },
  "B737 NG": {
    label: "B737 NG",
    referenceLabel: "B737-800",
    maxWeightKg: 79242,
    emptyWeightKg: 41413,
    tirePsi: 204,
    rigid: {
      A: { max: 49, empty: 23 },
      B: { max: 52, empty: 24 },
      C: { max: 54, empty: 25 },
      D: { max: 56, empty: 27 },
    },
    flexible: {
      A: { max: 43, empty: 20 },
      B: { max: 45, empty: 21 },
      C: { max: 50, empty: 22 },
      D: { max: 55, empty: 26 },
    },
  },
  "B737 MAX": {
    label: "B737 MAX",
    referenceLabel: "B737 MAX 8",
    maxWeightKg: 82417,
    emptyWeightKg: 43091,
    tirePsi: 210,
    rigid: {
      A: { max: 52, empty: 24 },
      B: { max: 54, empty: 25 },
      C: { max: 57, empty: 27 },
      D: { max: 59, empty: 28 },
    },
    flexible: {
      A: { max: 45, empty: 21 },
      B: { max: 48, empty: 22 },
      C: { max: 53, empty: 23 },
      D: { max: 58, empty: 27 },
    },
  },
};
const PAVEMENT_LABELS = {
  R: "Rigid",
  F: "Flexible",
};
const SUBGRADE_LABELS = {
  A: "High",
  B: "Medium",
  C: "Low",
  D: "Ultra Low",
};
const TIRE_CODE_DETAILS = {
  W: {
    label: "Unlimited",
    limitPsi: Number.POSITIVE_INFINITY,
  },
  X: {
    label: "High (max 254 psi)",
    limitPsi: 254,
  },
  Y: {
    label: "Medium (max 181 psi)",
    limitPsi: 181,
  },
  Z: {
    label: "Low (max 73 psi)",
    limitPsi: 73,
  },
};
const EVALUATION_LABELS = {
  T: "Technical",
  U: "Using aircraft experience",
};
const PAVEMENT_TABLE_KEYS = {
  R: "rigid",
  F: "flexible",
};
const ACN_DEFAULTS = {
  pcnNumber: "",
  pavementType: "R",
  subgrade: "B",
  tireCode: "X",
  evaluationMethod: "T",
  aircraftType: "B787-9",
  weightUnit: "KGS",
  actualWeight: "",
};

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
const acnForm = document.getElementById("acn-form");
const acnValidationMessage = document.getElementById("acn-validation-message");
const acnClearButton = document.getElementById("acn-clear-button");
const acnResultPanel = document.getElementById("acn-result-panel");
const acnResultsBanner = document.getElementById("acn-results-banner");
const acnBannerLabel = document.getElementById("acn-banner-label");
const acnBannerTitle = document.getElementById("acn-banner-title");
const acnBannerSubtitle = document.getElementById("acn-banner-subtitle");
const acnResultChip = document.getElementById("acn-result-chip");
const acnReportSection = document.getElementById("acn-report-section");
const acnDetailsList = document.getElementById("acn-details-list");
const acnOverloadNote = document.getElementById("acn-overload-note");
const acnComparisonDetail = document.getElementById("acn-comparison-detail");

registerServiceWorker();
updateToleranceText();
showHomeView();
initializeAcnModule();

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

acnForm.addEventListener("submit", (event) => {
  event.preventDefault();
  evaluateAcnModule();
});

acnClearButton.addEventListener("click", () => {
  resetAcnForm(true);
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

function initializeAcnModule() {
  resetAcnForm(false);
}

function evaluateAcnModule() {
  clearAcnValidation();

  const parsed = readAcnInputValues();
  if (!parsed) {
    hideAcnResult();
    return;
  }

  const result = calculateAcnResult(parsed);
  renderAcnResult(result);
}

function readAcnInputValues() {
  const pcnInput = acnForm.elements.pcnNumber.value;
  const pavementType = acnForm.elements.pavementType.value;
  const subgrade = acnForm.elements.subgrade.value;
  const tireCode = acnForm.elements.tireCode.value;
  const evaluationMethod = acnForm.elements.evaluationMethod.value;
  const aircraftType = acnForm.elements.aircraftType.value;
  const weightUnit = acnForm.elements.weightUnit.value;
  const actualWeightInput = acnForm.elements.actualWeight.value;
  const aircraftData = ACN_AIRCRAFT_DATA[aircraftType];
  const pcnNumber = Number(pcnInput);
  const enteredWeight = parsePositiveNumber(actualWeightInput);

  if (typeof pcnInput !== "string" || pcnInput.trim() === "") {
    showAcnValidation("Enter a PCN number.");
    return null;
  }

  if (!Number.isInteger(pcnNumber) || pcnNumber < 1 || pcnNumber > 999) {
    showAcnValidation("PCN number must be a whole number from 1 to 999.");
    return null;
  }

  if (!PAVEMENT_LABELS[pavementType]) {
    showAcnValidation("Select a valid pavement type.");
    return null;
  }

  if (!SUBGRADE_LABELS[subgrade]) {
    showAcnValidation("Select a valid subgrade category.");
    return null;
  }

  if (!TIRE_CODE_DETAILS[tireCode]) {
    showAcnValidation("Select a valid tire pressure category.");
    return null;
  }

  if (!EVALUATION_LABELS[evaluationMethod]) {
    showAcnValidation("Select a valid evaluation method.");
    return null;
  }

  if (!aircraftData) {
    showAcnValidation("Select a valid aircraft type.");
    return null;
  }

  if (weightUnit !== "KGS" && weightUnit !== "T") {
    showAcnValidation("Select a valid weight unit.");
    return null;
  }

  if (enteredWeight === null) {
    showAcnValidation("Enter a valid aircraft weight greater than 0.");
    return null;
  }

  const actualWeightKg = weightUnit === "T" ? enteredWeight * 1000 : enteredWeight;

  if (actualWeightKg < aircraftData.emptyWeightKg) {
    showAcnValidation(
      `Weight is below the ${aircraftData.label} empty weight of ${formatWholeKg(
        aircraftData.emptyWeightKg
      )}.`
    );
    return null;
  }

  if (actualWeightKg > aircraftData.maxWeightKg) {
    showAcnValidation(
      `Weight exceeds the ${aircraftData.label} max table weight of ${formatWholeKg(
        aircraftData.maxWeightKg
      )}.`
    );
    return null;
  }

  return {
    pcnNumber,
    pavementType,
    subgrade,
    tireCode,
    evaluationMethod,
    aircraftType,
    weightUnit,
    enteredWeight,
    actualWeightKg,
    aircraftData,
  };
}

function calculateAcnResult(values) {
  const pavementTableKey = PAVEMENT_TABLE_KEYS[values.pavementType];
  const acnRange = values.aircraftData[pavementTableKey][values.subgrade];
  const rawAcn =
    acnRange.max
    - ((values.aircraftData.maxWeightKg - values.actualWeightKg)
      / (values.aircraftData.maxWeightKg - values.aircraftData.emptyWeightKg))
      * (acnRange.max - acnRange.empty);
  const roundedAcn = Math.round(rawAcn);
  const aircraftTirePsi = values.aircraftData.tirePsi;
  const tireLimitPsi = TIRE_CODE_DETAILS[values.tireCode].limitPsi;
  const tirePass =
    values.tireCode === "W" ? true : aircraftTirePsi <= tireLimitPsi;
  const acnPass = roundedAcn <= values.pcnNumber;
  const overallPass = acnPass && tirePass;

  return {
    ...values,
    rawAcn,
    roundedAcn,
    aircraftTirePsi,
    tirePass,
    acnPass,
    overallPass,
    coding: `${values.pcnNumber}/${values.pavementType}/${values.subgrade}/${values.tireCode}/${values.evaluationMethod}`,
    maxAllowableWeight: calculateMaxAllowableWeight(
      values.pcnNumber,
      values.aircraftData,
      acnRange
    ),
    resultMessage: getAcnResultMessage(acnPass, tirePass),
    overloadNote: getAcnOverloadNote(roundedAcn, values.pcnNumber),
  };
}

function calculateMaxAllowableWeight(pcnNumber, aircraftData, acnRange) {
  if (pcnNumber >= acnRange.max) {
    return {
      kind: "weight",
      weightKg: aircraftData.maxWeightKg,
    };
  }

  if (pcnNumber < acnRange.empty) {
    return {
      kind: "belowRange",
    };
  }

  const interpolatedWeightKg =
    aircraftData.maxWeightKg
    - ((acnRange.max - pcnNumber) / (acnRange.max - acnRange.empty))
      * (aircraftData.maxWeightKg - aircraftData.emptyWeightKg);
  const clampedWeightKg = Math.max(
    aircraftData.emptyWeightKg,
    Math.min(aircraftData.maxWeightKg, interpolatedWeightKg)
  );

  return {
    kind: "weight",
    weightKg: Math.round(clampedWeightKg),
  };
}

function renderAcnResult(result) {
  const stateLabel = result.overallPass ? "PASS" : "FAIL";

  acnResultPanel.hidden = false;
  acnReportSection.classList.toggle("fail", !result.overallPass);
  acnResultsBanner.classList.toggle("pass", result.overallPass);
  acnResultsBanner.classList.toggle("fail", !result.overallPass);
  acnBannerLabel.textContent = "RESULT";
  acnBannerTitle.textContent = stateLabel;
  acnBannerSubtitle.textContent = result.resultMessage;
  acnResultChip.classList.toggle("pass", result.overallPass);
  acnResultChip.classList.toggle("fail", !result.overallPass);
  acnResultChip.textContent = stateLabel;
  acnOverloadNote.hidden = !result.overloadNote;
  acnOverloadNote.textContent = result.overloadNote;
  acnComparisonDetail.textContent = `ACN ${result.roundedAcn} vs PCN ${result.pcnNumber}`;

  renderKeyValueList(acnDetailsList, [
    ["Coding", result.coding],
    ["PCN", formatNumber(result.pcnNumber, 0)],
    ["Pavement Type", `${result.pavementType} - ${PAVEMENT_LABELS[result.pavementType]}`],
    ["Subgrade Strength", `${result.subgrade} - ${SUBGRADE_LABELS[result.subgrade]}`],
    [
      "Evaluation Method",
      `${result.evaluationMethod} - ${EVALUATION_LABELS[result.evaluationMethod]}`,
    ],
    [
      "Aircraft Weight",
      formatAcnWeight(result.enteredWeight, result.weightUnit, result.actualWeightKg),
    ],
    ["ACN", `${formatNumber(result.roundedAcn, 0)} (raw ${formatNumber(result.rawAcn, 2)})`, !result.acnPass],
    [
      "Max Allowable Weight",
      formatMaxAllowableWeight(result.maxAllowableWeight, result.weightUnit),
      result.maxAllowableWeight.kind === "belowRange",
    ],
  ]);
}

function resetAcnForm(shouldFocus) {
  acnForm.elements.pcnNumber.value = ACN_DEFAULTS.pcnNumber;
  acnForm.elements.pavementType.value = ACN_DEFAULTS.pavementType;
  acnForm.elements.subgrade.value = ACN_DEFAULTS.subgrade;
  acnForm.elements.tireCode.value = ACN_DEFAULTS.tireCode;
  acnForm.elements.evaluationMethod.value = ACN_DEFAULTS.evaluationMethod;
  acnForm.elements.aircraftType.value = ACN_DEFAULTS.aircraftType;
  acnForm.elements.weightUnit.value = ACN_DEFAULTS.weightUnit;
  acnForm.elements.actualWeight.value = ACN_DEFAULTS.actualWeight;
  clearAcnValidation();
  hideAcnResult();

  if (shouldFocus) {
    acnForm.elements.pcnNumber.focus();
  }
}

function showAcnValidation(message) {
  acnValidationMessage.textContent = message;
  acnValidationMessage.hidden = false;
}

function clearAcnValidation() {
  acnValidationMessage.textContent = "";
  acnValidationMessage.hidden = true;
}

function hideAcnResult() {
  acnResultPanel.hidden = true;
  acnReportSection.classList.remove("fail");
  acnOverloadNote.textContent = "";
  acnOverloadNote.hidden = true;
  acnComparisonDetail.textContent = "";
  acnDetailsList.textContent = "";
}

function getAcnResultMessage(acnPass, tirePass) {
  if (acnPass && tirePass) {
    return "ACN vs PCN check OK. Aircraft is within the selected pavement limitation.";
  }

  if (!acnPass && tirePass) {
    return "ACN exceeds PCN. Normal operations are not suitable on this pavement.";
  }

  if (acnPass && !tirePass) {
    return "Tire pressure category is not compatible with the aircraft tire pressure.";
  }

  return "ACN exceeds PCN and tire pressure category is not compatible.";
}

function getAcnOverloadNote(roundedAcn, pcnNumber) {
  if (roundedAcn <= pcnNumber) {
    return "";
  }

  if (roundedAcn <= pcnNumber * 1.1) {
    return "Overload note: normal operations are not suitable. Any overload operation requires airport approval. Keep overload within 10% above reported PCN and within about 5% of annual movements.";
  }

  return "Overload note: exceeds the 10% overload guidance. Airport approval would still be required, but this case is outside the normal occasional overload guidance.";
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

function formatPsi(value) {
  return `${formatNumber(value, 0)} psi`;
}

function formatWholeKg(value) {
  return `${formatNumber(Math.round(value), 0)} kg`;
}

function formatTonnes(value) {
  return `${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })} t`;
}

function formatMaxAllowableWeight(maxAllowableWeight, unit) {
  if (maxAllowableWeight.kind === "belowRange") {
    return "Below empty-weight ACN range";
  }

  if (unit === "T") {
    return formatTonnes(maxAllowableWeight.weightKg / 1000);
  }

  return formatWholeKg(maxAllowableWeight.weightKg);
}

function formatAcnWeight(value, unit, actualWeightKg) {
  if (unit === "T") {
    return formatTonnes(value);
  }

  return formatWholeKg(actualWeightKg);
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
