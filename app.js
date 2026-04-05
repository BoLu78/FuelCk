const APP_VERSION = "v1.27";
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
const banner = document.getElementById("results-banner");
const bannerLabel = document.getElementById("banner-label");
const bannerTitle = document.getElementById("banner-title");
const bannerSubtitle = document.getElementById("banner-subtitle");
const fuelResultSection = document.getElementById("fuel-result-section");
const fuelResultsList = document.getElementById("fuel-results-list");
const fuelAdvancedDetails = document.getElementById("fuel-advanced-details");
const fuelAdvancedList = document.getElementById("fuel-advanced-list");
const acnForm = document.getElementById("acn-form");
const acnValidationMessage = document.getElementById("acn-validation-message");
const acnClearButton = document.getElementById("acn-clear-button");
const acnResultPanel = document.getElementById("acn-result-panel");
const acnResultsBanner = document.getElementById("acn-results-banner");
const acnBannerLabel = document.getElementById("acn-banner-label");
const acnBannerTitle = document.getElementById("acn-banner-title");
const acnBannerSubtitle = document.getElementById("acn-banner-subtitle");
const acnBannerGuidance = document.getElementById("acn-banner-guidance");
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
  clearAcnModule();
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
  clearAcnModule();
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

function normalizeNumericInput(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().replace(/,/g, ".");
  return normalized === "" ? null : normalized;
}

function parseNonNegativeNumber(value) {
  const normalizedValue = normalizeNumericInput(value);

  if (normalizedValue === null) {
    return null;
  }

  const parsed = Number(normalizedValue);
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
  const upliftDifferenceKg = result.actualUpliftKg - result.requiredUpliftKg;
  const upliftDifferencePercent = percentage(
    upliftDifferenceKg,
    result.requiredUpliftKg
  );

  banner.classList.toggle("pass", result.pass);
  banner.classList.toggle("fail", !result.pass);
  bannerLabel.textContent = stateLabel;
  bannerTitle.textContent = `${stateLabel} • ${result.aircraft}`;
  bannerSubtitle.textContent = result.pass
    ? "Actual uplift is within allowed tolerance"
    : "Actual uplift is outside allowed tolerance";
  fuelResultSection.classList.toggle("fail", !result.pass);

  const mainRows = [
    ["Planned Fuel", formatFuelKg(result.requiredUpliftKg)],
    ["Calc Fuel", formatFuelKg(result.actualUpliftKg)],
    [
      "Difference",
      `${formatFuelSignedKg(upliftDifferenceKg)} (${formatFuelSignedPercent(
        upliftDifferencePercent
      )})`,
      !result.pass,
    ],
    ["Tolerance", formatFuelKg(result.tolerance)],
  ];

  if (result.densityUnit === "lbs/US gal") {
    mainRows.push([
      "Density Converted",
      formatFuelDensityConverted(result.densityKgPerL),
      false,
      "fuel-converted-row",
      "fuel-converted-value",
    ]);
  }

  if (result.volumeUnit === "US gallons") {
    mainRows.push([
      "Volume Converted",
      formatFuelLiters(result.actualVolumeLiters),
      false,
      "fuel-converted-row",
      "fuel-converted-value",
    ]);
  }

  renderKeyValueList(fuelResultsList, mainRows);

  fuelAdvancedDetails.hidden = result.pass;

  if (result.pass) {
    fuelAdvancedList.textContent = "";
    return;
  }

  renderKeyValueList(fuelAdvancedList, [
    [
      "Allowed min / max",
      `${formatFuelKg(result.weightRangeMinKg)} / ${formatFuelKg(result.weightRangeMaxKg)}`,
    ],
    [
      "Volume range",
      `${formatFuelLiters(result.volumeMinLiters)} / ${formatFuelLiters(result.volumeMaxLiters)}`,
    ],
    ["Percent difference", formatFuelSignedPercent(upliftDifferencePercent)],
  ]);
}

function renderKeyValueList(container, rows) {
  container.textContent = "";

  rows.forEach(([key, value, isFail, rowClass, valueClass]) => {
    const row = document.createElement("div");
    row.className = "kv-row";
    if (isFail) {
      row.classList.add("fail");
    }
    if (rowClass) {
      row.classList.add(rowClass);
    }

    const keyNode = document.createElement("span");
    keyNode.className = "kv-key";
    keyNode.textContent = key;

    const valueNode = document.createElement("span");
    valueNode.className = "kv-value";
    if (valueClass) {
      valueNode.classList.add(valueClass);
    }
    valueNode.textContent = value;

    row.append(keyNode, valueNode);
    container.appendChild(row);
  });
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
  resetAcnForm(false, false);
}

function clearAcnModule() {
  resetAcnForm(true, true);
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
  const trimmedPcnInput = typeof pcnInput === "string" ? pcnInput.trim() : "";
  const parsedWeight = parseAcnWeightInput(actualWeightInput, weightUnit);

  if (trimmedPcnInput === "") {
    showAcnValidation("Enter a PCN number.");
    return null;
  }

  if (!/^\d+$/.test(trimmedPcnInput)) {
    showAcnValidation("PCN number must be a whole number from 1 to 999.");
    return null;
  }

  const pcnNumber = Number(trimmedPcnInput);

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

  if (!parsedWeight) {
    showAcnValidation("Enter a valid aircraft weight greater than 0.");
    return null;
  }

  if (parsedWeight.actualWeightKg < aircraftData.emptyWeightKg) {
    showAcnValidation(
      `Weight is below the ${aircraftData.label} empty weight of ${formatWholeKg(
        aircraftData.emptyWeightKg
      )}.`
    );
    return null;
  }

  if (parsedWeight.actualWeightKg > aircraftData.maxWeightKg) {
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
    enteredWeight: parsedWeight.enteredWeight,
    actualWeightKg: parsedWeight.actualWeightKg,
    displayWeightUnit: parsedWeight.displayWeightUnit,
    displayWeightValue: parsedWeight.displayWeightValue,
    aircraftData,
  };
}

function calculateAcnResult(values) {
  const pavementTableKey = PAVEMENT_TABLE_KEYS[values.pavementType];
  const acnRange = values.aircraftData[pavementTableKey][values.subgrade];
  const tireDetails = TIRE_CODE_DETAILS[values.tireCode];
  const rawAcn =
    acnRange.max
    - ((values.aircraftData.maxWeightKg - values.actualWeightKg)
      / (values.aircraftData.maxWeightKg - values.aircraftData.emptyWeightKg))
      * (acnRange.max - acnRange.empty);
  const roundedAcn = Math.floor(rawAcn);
  const acnPass = roundedAcn <= values.pcnNumber;
  const aircraftTirePsi = values.aircraftData.tirePsi;
  const tirePass =
    values.tireCode === "W" ? true : aircraftTirePsi <= tireDetails.limitPsi;
  const occasionalLimit =
    values.pavementType === "F" ? values.pcnNumber * 1.1 : values.pcnNumber * 1.05;
  const acnBand = getAcnBand(values.pavementType, values.pcnNumber, roundedAcn);
  const status = getAcnOperationalStatus({
    pavementType: values.pavementType,
    pcnNumber: values.pcnNumber,
    roundedAcn,
    tirePass,
  });

  return {
    ...values,
    rawAcn,
    roundedAcn,
    acnPass,
    tirePass,
    aircraftTirePsi,
    occasionalLimit,
    acnBand,
    statusTone: status.tone,
    statusHeadline: status.headline,
    statusChipLabel: status.chipLabel,
    coding: `${values.pcnNumber}/${values.pavementType}/${values.subgrade}/${values.tireCode}/${values.evaluationMethod}`,
    maxAllowableWeight: calculateMaxAllowableWeight(
      values.pcnNumber,
      values.aircraftData,
      acnRange
    ),
    guidanceMaxWeightKg: calculateGuidanceMaxWeight(
      occasionalLimit,
      values.aircraftData,
      acnRange
    ),
    tirePressureLimitLabel: `${values.tireCode} - ${tireDetails.label}`,
    tireCompatibilityLabel: tirePass ? "Compatible" : "Not compatible",
    tireComparison: `Tire ${formatPsi(aircraftTirePsi)} vs code ${values.tireCode}`,
    resultMessage: status.message,
    resultNote: status.note,
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

function calculateGuidanceMaxWeight(targetAcn, aircraftData, acnRange) {
  if (targetAcn >= acnRange.max) {
    return aircraftData.maxWeightKg;
  }

  if (targetAcn < acnRange.empty) {
    return aircraftData.emptyWeightKg;
  }

  const interpolatedWeightKg =
    aircraftData.maxWeightKg
    - ((acnRange.max - targetAcn) / (acnRange.max - acnRange.empty))
      * (aircraftData.maxWeightKg - aircraftData.emptyWeightKg);

  return Math.round(
    Math.max(
      aircraftData.emptyWeightKg,
      Math.min(aircraftData.maxWeightKg, interpolatedWeightKg)
    )
  );
}

function renderAcnResult(result) {
  const isFail = result.statusTone === "fail";
  const guidanceMaxWeightDisplayKg = Math.round(result.guidanceMaxWeightKg);
  const remainingOverloadMarginKg = Math.max(
    0,
    result.guidanceMaxWeightKg - result.actualWeightKg
  );
  const remainingOverloadMarginDisplayKg = Math.round(remainingOverloadMarginKg);
  const showOverloadMargin = result.statusHeadline === "OCCASIONAL OVERLOAD";

  acnResultPanel.hidden = false;
  acnReportSection.classList.toggle("fail", isFail);
  acnResultsBanner.classList.toggle("pass", result.statusTone === "pass");
  acnResultsBanner.classList.toggle("warn", result.statusTone === "warn");
  acnResultsBanner.classList.toggle("fail", isFail);
  acnBannerLabel.textContent = "RESULT";
  acnBannerTitle.textContent = result.statusHeadline;
  acnBannerSubtitle.textContent = result.resultMessage;
  acnBannerGuidance.hidden = !showOverloadMargin;
  acnBannerGuidance.textContent = showOverloadMargin
    ? `Maximum operating weight within guidance: ${formatItalianKgInteger(
        guidanceMaxWeightDisplayKg
      )} kg (+${formatItalianKgInteger(remainingOverloadMarginDisplayKg)})`
    : "";
  acnResultChip.classList.toggle("pass", result.statusTone === "pass");
  acnResultChip.classList.toggle("warn", result.statusTone === "warn");
  acnResultChip.classList.toggle("fail", isFail);
  acnResultChip.textContent = result.statusChipLabel;
  acnOverloadNote.hidden = !result.resultNote;
  acnOverloadNote.textContent = result.resultNote;
  acnOverloadNote.classList.toggle("warn", result.statusTone === "warn");
  acnOverloadNote.classList.toggle("fail", isFail);
  acnComparisonDetail.textContent = `ACN ${result.roundedAcn} vs PCN ${result.pcnNumber}`;

  renderKeyValueList(acnDetailsList, [
    ["Coding", result.coding],
    ["PCN", formatNumber(result.pcnNumber, 0)],
    ["Pavement Type", `${result.pavementType} - ${PAVEMENT_LABELS[result.pavementType]}`],
    ["Subgrade Strength", `${result.subgrade} - ${SUBGRADE_LABELS[result.subgrade]}`],
    ["Tire Pressure Limit", result.tirePressureLimitLabel],
    [
      "Evaluation Method",
      `${result.evaluationMethod} - ${EVALUATION_LABELS[result.evaluationMethod]}`,
    ],
    [
      "Aircraft Weight",
      formatAcnWeight(result.displayWeightValue, result.displayWeightUnit),
    ],
    [
      "ACN",
      `${formatNumber(result.roundedAcn, 0)} (raw ${formatNumber(result.rawAcn, 2)})`,
      result.tirePass && result.roundedAcn > result.occasionalLimit,
    ],
    [
      "Max Allowable Weight",
      formatMaxAllowableWeight(result.maxAllowableWeight, result.weightUnit),
      false,
    ],
    ["Tire Compatibility", result.tireCompatibilityLabel, !result.tirePass],
    ["Tire Comparison", result.tireComparison, !result.tirePass],
  ]);

  highlightAcnMaxAllowableRow(result.acnBand);
}

function resetAcnForm(shouldFocus, clearSelects) {
  acnForm.elements.pcnNumber.value = ACN_DEFAULTS.pcnNumber;
  acnForm.elements.pavementType.value = clearSelects ? "" : ACN_DEFAULTS.pavementType;
  acnForm.elements.subgrade.value = clearSelects ? "" : ACN_DEFAULTS.subgrade;
  acnForm.elements.tireCode.value = clearSelects ? "" : ACN_DEFAULTS.tireCode;
  acnForm.elements.evaluationMethod.value = clearSelects ? "" : ACN_DEFAULTS.evaluationMethod;
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
  acnResultsBanner.classList.remove("pass", "warn", "fail");
  acnResultChip.classList.remove("pass", "warn", "fail");
  acnOverloadNote.textContent = "";
  acnOverloadNote.hidden = true;
  acnOverloadNote.classList.remove("warn", "fail");
  acnBannerGuidance.textContent = "";
  acnBannerGuidance.hidden = true;
  acnComparisonDetail.textContent = "";
  acnDetailsList.textContent = "";
}

function getAcnOperationalStatus({ pavementType, pcnNumber, roundedAcn, tirePass }) {
  if (!tirePass) {
    return {
      tone: "fail",
      headline: "FAIL",
      chipLabel: "FAIL",
      message:
        "Selected tire pressure category is not compatible with the aircraft tire pressure.",
      note:
        "Choose a compatible tire pressure category before evaluating pavement suitability.",
    };
  }

  if (roundedAcn <= pcnNumber) {
    return {
      tone: "pass",
      headline: "PASS",
      chipLabel: "PASS",
      message: "Normal operations suitable on this pavement.",
      note: "",
    };
  }

  const occasionalLimit = pavementType === "F" ? pcnNumber * 1.1 : pcnNumber * 1.05;

  if (roundedAcn <= occasionalLimit) {
    return {
      tone: "warn",
      headline: "OCCASIONAL OVERLOAD",
      chipLabel: "OVERLOAD",
      message:
        pavementType === "F"
          ? "ACN is within 10% above the PCN on a flexible pavement. Occasional minor overloading operations may be acceptable."
          : "ACN is within 5% above the PCN on a rigid pavement. Occasional minor overloading operations may be acceptable.",
      note: "Authority permission may be required.",
    };
  }

  return {
    tone: "fail",
    headline: "FAIL",
    chipLabel: "FAIL",
    message: "ACN exceeds the occasional overload guidance for this pavement.",
    note:
      "For emergency use, further overloading is usually acceptable. Different restrictions may apply.",
  };
}

function getAcnBand(pavementType, pcnNumber, roundedAcn) {
  if (roundedAcn <= pcnNumber) {
    return "pass";
  }

  const occasionalLimit = pavementType === "F" ? pcnNumber * 1.1 : pcnNumber * 1.05;
  return roundedAcn <= occasionalLimit ? "warn" : "fail";
}

function highlightAcnMaxAllowableRow(acnBand) {
  const rows = acnDetailsList.querySelectorAll(".kv-row");
  const maxAllowableRow = Array.from(rows).find((row) => {
    const keyNode = row.querySelector(".kv-key");
    return keyNode?.textContent === "Max Allowable Weight";
  });

  if (!maxAllowableRow) {
    return;
  }

  maxAllowableRow.classList.add("max-allowable-row", `max-allowable-${acnBand}`);
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

function formatFuelInteger(value) {
  return formatNumber(Math.round(value), 0);
}

function formatFuelKg(value) {
  return `${formatFuelInteger(value)} kg`;
}

function formatFuelLiters(value) {
  return `${formatFuelInteger(value)} L`;
}

function formatFuelSignedKg(value) {
  return `${value >= 0 ? "+" : "-"}${formatFuelInteger(Math.abs(value))} kg`;
}

function formatFuelSignedPercent(value) {
  return `${value >= 0 ? "+" : "-"}${formatFuelInteger(Math.abs(value))}%`;
}

function formatFuelDensityConverted(value) {
  return `${formatNumber(value, 3)} kg/L`;
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

function formatAcnWeight(value, unit) {
  if (unit === "T") {
    return formatTonnes(value);
  }

  return formatWholeKg(value);
}

function formatItalianKgInteger(value) {
  return Math.round(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).replace(/,/g, ".");
}

function parseAcnWeightInput(rawValue, weightUnit) {
  if (typeof rawValue !== "string") {
    return null;
  }

  const trimmedValue = rawValue.trim();

  if (trimmedValue === "") {
    return null;
  }

  if (/^\d{3}$/.test(trimmedValue)) {
    const shortcutValue = Number(trimmedValue);

    if (!Number.isFinite(shortcutValue) || shortcutValue <= 0) {
      return null;
    }

    return {
      enteredWeight: shortcutValue,
      actualWeightKg: shortcutValue * 1000,
      displayWeightUnit: "T",
      displayWeightValue: shortcutValue,
    };
  }

  const enteredWeight = parsePositiveNumber(trimmedValue);

  if (enteredWeight === null) {
    return null;
  }

  return {
    enteredWeight,
    actualWeightKg: weightUnit === "T" ? enteredWeight * 1000 : enteredWeight,
    displayWeightUnit: weightUnit,
    displayWeightValue: enteredWeight,
  };
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
