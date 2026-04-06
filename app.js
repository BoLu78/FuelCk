const APP_VERSION = "6.7";
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
const TRIP_INFO_STORAGE_KEY = "rampcheck-trip-info";
const TRIP_INFO_LOGO_SRC = "./assets/tripinfo-logo-neos.png";
const TRIP_INFO_EXPORT_WIDTH = 1500;
const TRIP_INFO_EXPORT_HEIGHT = 2100;
const TRIP_INFO_LAYOUT = (() => {
  const page = {
    widthMm: 100,
    heightMm: 140,
  };
  const pageLeft = 5;
  const pageRight = 95;
  const valueLift = 0.65;
  const topRows = (() => {
    const yStart = 17;
    const rowStep = 6.15;
    const lineOffset = 1.1;
    const valueBaselineOffset = 0.9;
    const row1Y = yStart;
    const row2Y = yStart + rowStep;
    const row3Y = yStart + (rowStep * 2);

    return {
      yStart,
      rowStep,
      lineOffset,
      flightNumber: {
        labelX: pageLeft,
        labelY: row1Y,
        lineStartX: 29.9,
        lineEndX: 51.6,
        lineY: row1Y + lineOffset,
        valueCenterX: 40.75,
        valueX: 40.75,
        valueY: row1Y + lineOffset - valueBaselineOffset,
        valueAnchor: "middle",
      },
      from: {
        labelX: 52.6,
        labelY: row1Y,
        lineStartX: 63.6,
        lineEndX: 76.1,
        lineY: row1Y + lineOffset,
        valueCenterX: 69.85,
        valueY: row1Y + lineOffset - valueBaselineOffset,
      },
      to: {
        labelX: 76.2,
        labelY: row1Y,
        lineStartX: 81.2,
        lineEndX: pageRight,
        lineY: row1Y + lineOffset,
        valueCenterX: 88.1,
        valueY: row1Y + lineOffset - valueBaselineOffset,
      },
      date: {
        labelX: pageLeft,
        labelY: row2Y,
        lineStartX: 16.6,
        lineEndX: 40.6,
        lineY: row2Y + lineOffset,
        valueCenterX: 28.6,
        valueY: row2Y + lineOffset - valueBaselineOffset,
      },
      crew: {
        labelX: 48.8,
        labelY: row2Y,
        lineStartX: 61,
        lineEndX: 84.2,
        lineY: row2Y + lineOffset,
        valueCenterX: 72.6,
        valueY: row2Y + lineOffset - valueBaselineOffset,
      },
      registration: {
        labelX: pageLeft,
        labelY: row3Y,
        lineStartX: 32.3,
        lineEndX: 64.2,
        lineY: row3Y + lineOffset,
        valueCenterX: 48.25,
        valueX: 48.25,
        valueY: row3Y + lineOffset - valueBaselineOffset,
        valueAnchor: "middle",
      },
      aircraftType: {
        labelX: 66.2,
        labelY: row3Y,
        lineStartX: 79.8,
        lineEndX: 94.2,
        lineY: row3Y + lineOffset,
        valueCenterX: 87,
        valueX: 80.4,
        valueY: row3Y + lineOffset - valueBaselineOffset,
        valueAnchor: "start",
      },
    };
  })();
  const header = {
    x: pageLeft,
    y: 2,
    width: pageRight - pageLeft,
    height: 9,
    titleCenterX: 50,
    titleBaselineY: 7.95,
    logoX: 6.8,
    logoY: 3.6,
    logoWidth: 17.8,
    logoHeight: 6.3,
    metadataRightX: 94,
    metadataLine1Y: 3.9,
    metadataLine2Y: 5.7,
    metadataLine3Y: 7.5,
    metadataLine4Y: 9.3,
  };
  const bottomBoxes = {
    remarks: {
      x: pageLeft,
      y: 118,
      width: 47,
      height: 20,
      labelX: 6.4,
      labelY: 121.9,
    },
    signature: {
      x: 52,
      y: 118,
      width: 43,
      height: 20,
      labelX: 53.4,
      labelY: 121.9,
      imageX: 53.1,
      imageY: 122.6,
      imageWidth: 40.8,
      imageHeight: 13.8,
    },
  };
  const noteBox = {
    x: pageLeft,
    y: 35,
    width: 22,
    height: bottomBoxes.remarks.y - 35,
    labelX: 6.2,
    labelY: 38.9,
  };
  const mainArea = {
    x: noteBox.x + noteBox.width,
    y: 40.2,
    width: pageRight - (noteBox.x + noteBox.width),
    rightX: pageRight,
    labelX: noteBox.x + noteBox.width + 1.3,
    lineRightX: pageRight - 0.6,
    rowStep: 7.7,
    fieldLineOffset: 1.1,
    valueLift,
    inlineUnitBaselineOffset: 0.15,
  };
  const buildRow = (index, config) => {
    const y = mainArea.y + (mainArea.rowStep * index);
    const lineEndX = config.lineEndX ?? mainArea.lineRightX;
    const lineY = y + mainArea.fieldLineOffset;

    return {
      y,
      labelX: config.labelX ?? mainArea.labelX,
      lineStartX: config.lineStartX,
      lineEndX,
      lineY,
      valueCenterX: config.valueCenterX ?? ((config.lineStartX + lineEndX) / 2),
      valueX: config.valueX,
      valueY: config.valueY ?? (lineY - mainArea.valueLift),
      valueAnchor: config.valueAnchor,
    };
  };
  const alignedValueX = mainArea.lineRightX - 0.4;
  const rows = {
    captainName: buildRow(0, {
      lineStartX: 48.7,
    }),
    dow: buildRow(1, {
      lineStartX: 35.1,
      lineEndX: 63.1,
      valueX: 49.1,
      valueAnchor: "middle",
    }),
    doi: buildRow(1, {
      labelX: 65.8,
      lineStartX: 70.6,
      lineEndX: 88.8,
      valueX: 79.7,
      valueAnchor: "middle",
    }),
    maxZfw: buildRow(2, {
      lineStartX: 43.8,
      valueX: alignedValueX,
      valueAnchor: "end",
    }),
    maxTow: buildRow(3, {
      lineStartX: 62.2,
      valueX: alignedValueX,
      valueAnchor: "end",
    }),
    maxLdw: buildRow(4, {
      lineStartX: 62.2,
      valueX: alignedValueX,
      valueAnchor: "end",
    }),
    tripFuel: buildRow(5, {
      lineStartX: 43.8,
      valueX: alignedValueX,
      valueAnchor: "end",
    }),
    takeOffFuel: buildRow(6, {
      lineStartX: 56.8,
      valueX: alignedValueX,
      valueAnchor: "end",
    }),
    taxiFuel: buildRow(7, {
      lineStartX: 43.7,
      valueX: alignedValueX,
      valueAnchor: "end",
    }),
    blockFuel: buildRow(8, {
      lineStartX: 47.3,
      valueX: alignedValueX,
      valueAnchor: "end",
    }),
    eet: (() => {
      const y = mainArea.y + (mainArea.rowStep * 9);
      const hoursLineY = y + mainArea.fieldLineOffset;
      const minutesLineY = hoursLineY;
      const hoursLineStartX = 35.6;
      const hoursLineEndX = 52.8;
      const hoursGap = 4.8;
      const minutesLineStartX = hoursLineEndX + hoursGap;
      const minutesLineEndX = 89.6;

      return {
        y,
        labelX: mainArea.labelX,
        hoursLineStartX,
        hoursLineEndX,
        hoursLineY,
        hoursValueCenterX: (hoursLineStartX + hoursLineEndX) / 2,
        hoursValueY: hoursLineY - mainArea.valueLift,
        hrsLabelX: (hoursLineEndX + minutesLineStartX) / 2,
        hrsLabelY: hoursLineY - mainArea.inlineUnitBaselineOffset,
        minutesLineStartX,
        minutesLineEndX,
        minutesLineY,
        minutesValueCenterX: (minutesLineStartX + minutesLineEndX) / 2,
        minutesValueY: minutesLineY - mainArea.valueLift,
        minLabelX: (minutesLineEndX + mainArea.lineRightX) / 2,
        minLabelY: minutesLineY - mainArea.inlineUnitBaselineOffset,
      };
    })(),
  };

  return {
    page,
    header,
    topRows,
    noteBox,
    mainArea,
    rows,
    bottomBoxes,
  };
})();
const TRIP_INFO_PAGE_WIDTH_MM = TRIP_INFO_LAYOUT.page.widthMm;
const TRIP_INFO_PAGE_HEIGHT_MM = TRIP_INFO_LAYOUT.page.heightMm;
const TRIP_INFO_PAGE_WIDTH_PT = (TRIP_INFO_LAYOUT.page.widthMm / 25.4) * 72;
const TRIP_INFO_PAGE_HEIGHT_PT = (TRIP_INFO_LAYOUT.page.heightMm / 25.4) * 72;
const TRIP_INFO_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const TRIP_INFO_REGISTRATIONS = [
  "EI-NEO",
  "EI-NEU",
  "EI-NEW",
  "EI-NUA",
  "EI-NYE",
  "EI-XIN",
];
const TRIP_INFO_PANTRY_CODES = ["Z", "SH", "MH", "LH", "CH"];
const TRIP_INFO_WATER_DESTINATIONS = ["ZNZ", "MBA", "NOS", "NKG"];
const TRIP_INFO_WATER_CORRECTIONS = {
  50: {
    dowKg: 487,
    doiValue: 1.97,
  },
  80: {
    dowKg: 257,
    doiValue: 0.97,
  },
};
const TRIP_INFO_DEFAULTS = {
  flightNumber: "",
  from: "",
  to: "",
  date: "",
  crew: "2+9",
  crewBag: "",
  pantry: "",
  includeFak: true,
  flightType: "",
  waterMode: "STANDARD",
  aircraftRegistration: TRIP_INFO_REGISTRATIONS[0],
  aircraftType: "B789",
  captainName: "",
  dow: "",
  doi: "",
  maxZfw: "181.436",
  maxTow: "247.207",
  maxLdw: "192.776",
  tripFuel: "",
  taxiFuel: "",
  blockFuel: "",
  eetHours: "",
  eetMinutes: "",
};

const homeView = document.getElementById("homeView");
const fuelView = document.getElementById("fuelView");
const tripInfoView = document.getElementById("tripInfoView");
const acnView = document.getElementById("acnView");
const openFuelBtn = document.getElementById("openFuelBtn");
const openAcnBtn = document.getElementById("openAcnBtn");
const openTripInfoBtn = document.getElementById("openTripInfoBtn");
const backFromFuelBtn = document.getElementById("backFromFuelBtn");
const backFromAcnBtn = document.getElementById("backFromAcnBtn");
const backFromTripInfoBtn = document.getElementById("backFromTripInfoBtn");
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
const tripInfoForm = document.getElementById("tripInfo-form");
const tripInfoValidationMessage = document.getElementById("tripInfo-validation-message");
const tripInfoResetButton = document.getElementById("tripInfo-reset-button");
const tripInfoPreviewSection = document.getElementById("tripInfo-preview-section");
const tripInfoPreviewMount = document.getElementById("tripInfo-preview-mount");
const tripInfoDownloadPdfButton = document.getElementById("tripInfo-download-pdf-button");
const tripInfoDownloadPngButton = document.getElementById("tripInfo-download-png-button");
const tripInfoShareButton = document.getElementById("tripInfo-share-button");
const tripInfoSignatureCanvas = document.getElementById("tripInfo-signature-canvas");
const tripInfoClearSignatureButton = document.getElementById("tripInfo-clear-signature-button");
const tripInfoTakeOffFuelInput = document.getElementById("tripInfo-takeoff-fuel");
const tripInfoExportCanvas = document.getElementById("tripInfo-export-canvas");

let tripInfoState = {
  generatedData: null,
  signatureDataUrl: "",
  crewBagManualOverride: false,
  userInteractedWater: false,
};
let tripInfoLogoDataUrl = "";
let tripInfoSignaturePointerId = null;
let tripInfoSignatureDrawing = false;

registerServiceWorker();
updateToleranceText();
showHomeView();
initializeAcnModule();
initializeTripInfoModule();

openFuelBtn.addEventListener("click", () => {
  showInputScreen();
  showFuelView();
});

openAcnBtn.addEventListener("click", () => {
  showAcnView();
  clearAcnModule();
});

openTripInfoBtn.addEventListener("click", () => {
  showTripInfoView();
});

backFromFuelBtn.addEventListener("click", () => {
  showHomeView();
});

backFromAcnBtn.addEventListener("click", () => {
  showHomeView();
});

backFromTripInfoBtn.addEventListener("click", () => {
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

tripInfoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  generateTripInfoPreview();
});
tripInfoForm.addEventListener("input", handleTripInfoFormInput);
tripInfoForm.addEventListener("change", handleTripInfoFormChange);

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

tripInfoResetButton.addEventListener("click", () => {
  resetTripInfoModule(true);
});

tripInfoClearSignatureButton.addEventListener("click", () => {
  clearTripInfoSignature();
});

tripInfoDownloadPdfButton.addEventListener("click", () => {
  void tripInfoDownloadPdf();
});

tripInfoDownloadPngButton.addEventListener("click", () => {
  void tripInfoDownloadPng();
});

tripInfoShareButton.addEventListener("click", () => {
  void tripInfoShare();
});

window.addEventListener("resize", () => {
  tripInfoResizeSignatureCanvas(true);
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
  [homeView, fuelView, tripInfoView, acnView].forEach((view) => {
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

function showTripInfoView() {
  showAppView(tripInfoView);
  tripInfoResizeSignatureCanvas(true);
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

function initializeTripInfoModule() {
  tripInfoSetupSignaturePad();
  tripInfoRestoreState();
  tripInfoUpdateTakeOffFuelField();
  tripInfoUpdatePreviewVisibility();
  void tripInfoLoadLogoData();
}

function tripInfoGetTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function tripInfoGetDefaultFormValues() {
  return {
    ...TRIP_INFO_DEFAULTS,
    date: tripInfoGetTodayIsoDate(),
  };
}

function handleTripInfoFormInput(event) {
  const target = event.target;

  if (
    !(target instanceof HTMLInputElement)
    && !(target instanceof HTMLSelectElement)
  ) {
    return;
  }

  if (
    target.name === "flightNumber"
    || target.name === "captainName"
  ) {
    target.value = tripInfoUppercaseLiveValue(target.value);
  }

  if (target.name === "from" || target.name === "to") {
    target.value = tripInfoNormalizeIataCode(target.value);
    tripInfoApplyRouteRules();
    if (target.name === "to") {
      tripInfoMaybeAutoSelectWaterMode();
    }
  }

  if (target.name === "pantry") {
    tripInfoMaybeAutoSelectWaterMode();
  }

  if (target.name === "crew") {
    target.value = target.value.replace(/[^\d+\s]/g, "");
    tripInfoSyncCrewBagFromCrew();
  }

  if (target.name === "crewBag") {
    target.value = tripInfoNormalizeCrewBagInput(target.value);
    tripInfoState.crewBagManualOverride = true;
  }

  if (target.name === "includeFak") {
    tripInfoApplyRouteRules();
  }

  if (target.name === "eetHours" || target.name === "eetMinutes") {
    target.value = target.value.replace(/\D/g, "");
  }

  tripInfoClearValidation();
  tripInfoUpdateTakeOffFuelField();
  tripInfoSaveState();
}

function handleTripInfoFormChange(event) {
  const target = event.target;

  if (
    !(target instanceof HTMLInputElement)
    && !(target instanceof HTMLSelectElement)
  ) {
    return;
  }

  if (
    target.name === "flightNumber"
    || target.name === "captainName"
  ) {
    target.value = tripInfoNormalizeText(target.value);
  }

  if (target.name === "from" || target.name === "to") {
    target.value = tripInfoNormalizeIataCode(target.value);
    tripInfoApplyRouteRules();
    if (target.name === "to") {
      tripInfoMaybeAutoSelectWaterMode();
    }
  }

  if (target.name === "crew") {
    const normalizedCrew = tripInfoNormalizeCrewValue(target.value);
    if (normalizedCrew) {
      target.value = normalizedCrew;
    }
    tripInfoSyncCrewBagFromCrew();
  }

  if (target.name === "crewBag") {
    target.value = tripInfoNormalizeCrewBagDisplayValue(target.value);
    tripInfoState.crewBagManualOverride = true;
  }

  if (target.name === "includeFak") {
    tripInfoApplyRouteRules();
  }

  if (target.name === "pantry") {
    tripInfoMaybeAutoSelectWaterMode();
  }

  if (target.name === "waterMode") {
    tripInfoState.userInteractedWater = true;
  }

  tripInfoUpdateTakeOffFuelField();
  tripInfoSaveState();
}

function tripInfoGetSelectedWaterMode() {
  const selectedWaterMode = tripInfoForm.querySelector('input[name="waterMode"]:checked');
  return selectedWaterMode instanceof HTMLInputElement ? selectedWaterMode.value : "";
}

function tripInfoSetSelectedWaterMode(value) {
  const normalizedWaterMode = tripInfoNormalizeWaterModeValue(value);
  tripInfoForm.querySelectorAll('input[name="waterMode"]').forEach((radio) => {
    if (radio instanceof HTMLInputElement) {
      radio.checked = normalizedWaterMode !== "" && radio.value === normalizedWaterMode;
    }
  });
}

function tripInfoRequiresWaterCorrection(to) {
  return TRIP_INFO_WATER_DESTINATIONS.includes(tripInfoNormalizeIataCode(to));
}

function tripInfoGetAutoWaterModeFromContext(to, pantryCode) {
  const normalizedPantryCode = tripInfoNormalizePantryValue(pantryCode);

  if (!tripInfoRequiresWaterCorrection(to)) {
    return "STANDARD";
  }

  if (normalizedPantryCode === "LH" || normalizedPantryCode === "CH") {
    return "80";
  }

  return "50";
}

function tripInfoGetEffectiveWaterMode(to, selectedWaterMode, pantryCode) {
  if (!tripInfoRequiresWaterCorrection(to)) {
    return "STANDARD";
  }

  const normalizedSelectedWaterMode = tripInfoNormalizeWaterModeValue(selectedWaterMode);
  return normalizedSelectedWaterMode || tripInfoGetAutoWaterModeFromContext(to, pantryCode);
}

function tripInfoMaybeAutoSelectWaterMode() {
  if (tripInfoState.userInteractedWater) {
    return;
  }

  const to = tripInfoNormalizeIataCode(tripInfoForm.elements.to.value);
  const pantryCode = tripInfoNormalizePantryValue(tripInfoForm.elements.pantry.value);
  const nextWaterMode = tripInfoGetAutoWaterModeFromContext(to, pantryCode);

  if (tripInfoGetSelectedWaterMode() !== nextWaterMode) {
    tripInfoSetSelectedWaterMode(nextWaterMode);
    tripInfoSaveState();
  }
}

function tripInfoShouldIncludeFakForRoute(from, to) {
  return !(
    tripInfoNormalizeIataCode(from) === "JFK"
    && tripInfoNormalizeIataCode(to) === "JFK"
  );
}

function tripInfoApplyRouteRules() {
  const from = tripInfoNormalizeIataCode(tripInfoForm.elements.from.value);
  const to = tripInfoNormalizeIataCode(tripInfoForm.elements.to.value);
  const shouldIncludeFak = tripInfoShouldIncludeFakForRoute(from, to);

  if (tripInfoForm.elements.includeFak.checked !== shouldIncludeFak) {
    tripInfoForm.elements.includeFak.checked = shouldIncludeFak;
    return true;
  }

  return false;
}

function tripInfoSetupSignaturePad() {
  tripInfoSignatureCanvas.addEventListener("pointerdown", handleTripInfoSignaturePointerDown);
  tripInfoSignatureCanvas.addEventListener("pointermove", handleTripInfoSignaturePointerMove);
  tripInfoSignatureCanvas.addEventListener("pointerup", handleTripInfoSignaturePointerUp);
  tripInfoSignatureCanvas.addEventListener("pointerleave", handleTripInfoSignaturePointerUp);
  tripInfoSignatureCanvas.addEventListener("pointercancel", handleTripInfoSignaturePointerUp);
  tripInfoResizeSignatureCanvas(false);
}

function tripInfoResizeSignatureCanvas(preserveContent) {
  const existingSignature = preserveContent ? tripInfoState.signatureDataUrl : "";
  const rect = tripInfoSignatureCanvas.getBoundingClientRect();
  const cssWidth = Math.max(320, Math.round(rect.width || 320));
  const cssHeight = Math.max(180, Math.round(rect.height || 180));
  const deviceScale = window.devicePixelRatio || 1;
  const ctx = tripInfoSignatureCanvas.getContext("2d");

  tripInfoSignatureCanvas.width = Math.round(cssWidth * deviceScale);
  tripInfoSignatureCanvas.height = Math.round(cssHeight * deviceScale);
  ctx.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
  tripInfoResetSignatureSurface();

  if (existingSignature) {
    void tripInfoDrawSignatureDataUrl(existingSignature);
  }
}

function tripInfoResetSignatureSurface() {
  const ctx = tripInfoSignatureCanvas.getContext("2d");
  const deviceScale = window.devicePixelRatio || 1;
  const width = tripInfoSignatureCanvas.width / deviceScale;
  const height = tripInfoSignatureCanvas.height / deviceScale;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2.2;
}

function handleTripInfoSignaturePointerDown(event) {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  event.preventDefault();
  tripInfoSignatureDrawing = true;
  tripInfoSignaturePointerId = event.pointerId;
  tripInfoSignatureCanvas.setPointerCapture(event.pointerId);

  const ctx = tripInfoSignatureCanvas.getContext("2d");
  const point = tripInfoGetSignaturePoint(event);
  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(point.x + 0.01, point.y + 0.01);
  ctx.stroke();
}

function handleTripInfoSignaturePointerMove(event) {
  if (!tripInfoSignatureDrawing || event.pointerId !== tripInfoSignaturePointerId) {
    return;
  }

  event.preventDefault();
  const ctx = tripInfoSignatureCanvas.getContext("2d");
  const point = tripInfoGetSignaturePoint(event);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
}

function handleTripInfoSignaturePointerUp(event) {
  if (!tripInfoSignatureDrawing || event.pointerId !== tripInfoSignaturePointerId) {
    return;
  }

  event.preventDefault();
  tripInfoSignatureDrawing = false;

  if (tripInfoSignatureCanvas.hasPointerCapture(event.pointerId)) {
    tripInfoSignatureCanvas.releasePointerCapture(event.pointerId);
  }

  tripInfoSignaturePointerId = null;
  tripInfoCommitSignature();
}

function tripInfoGetSignaturePoint(event) {
  const rect = tripInfoSignatureCanvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function tripInfoCommitSignature() {
  tripInfoState.signatureDataUrl = tripInfoSignatureCanvas.toDataURL("image/png");

  if (tripInfoState.generatedData) {
    tripInfoState.generatedData = {
      ...tripInfoState.generatedData,
      signatureDataUrl: tripInfoState.signatureDataUrl,
    };
    renderTripInfoPreview(tripInfoState.generatedData);
  }

  tripInfoSaveState();
}

function clearTripInfoSignature() {
  tripInfoResetSignatureSurface();
  tripInfoState.signatureDataUrl = "";

  if (tripInfoState.generatedData) {
    tripInfoState.generatedData = {
      ...tripInfoState.generatedData,
      signatureDataUrl: "",
    };
    renderTripInfoPreview(tripInfoState.generatedData);
  }

  tripInfoSaveState();
}

function tripInfoDrawSignatureDataUrl(dataUrl) {
  return new Promise((resolve) => {
    if (!dataUrl) {
      resolve();
      return;
    }

    const image = new Image();
    image.onload = () => {
      const ctx = tripInfoSignatureCanvas.getContext("2d");
      const deviceScale = window.devicePixelRatio || 1;
      const width = tripInfoSignatureCanvas.width / deviceScale;
      const height = tripInfoSignatureCanvas.height / deviceScale;
      tripInfoResetSignatureSurface();
      ctx.drawImage(image, 0, 0, width, height);
      resolve();
    };
    image.onerror = () => {
      resolve();
    };
    image.src = dataUrl;
  });
}

function tripInfoRestoreState() {
  const storedState = tripInfoReadStoredState();
  tripInfoState.crewBagManualOverride = storedState.crewBagManualOverride;
  tripInfoState.userInteractedWater = storedState.userInteractedWater;
  tripInfoApplyFormValues(storedState.formValues);
  const routeRuleChanged = tripInfoApplyRouteRules();
  tripInfoMaybeAutoSelectWaterMode();
  tripInfoSyncCrewBagFromCrew();
  tripInfoState.signatureDataUrl = storedState.signatureDataUrl;
  tripInfoUpdateTakeOffFuelField();
  tripInfoClearValidation();
  tripInfoResizeSignatureCanvas(false);

  if (tripInfoState.signatureDataUrl) {
    void tripInfoDrawSignatureDataUrl(tripInfoState.signatureDataUrl);
  }

  if (storedState.generatedData) {
    const restoredGeneratedData = tripInfoReadAndNormalizeValues(false);
    tripInfoState.generatedData = restoredGeneratedData
      ? {
          ...restoredGeneratedData,
          signatureDataUrl: tripInfoState.signatureDataUrl,
        }
      : null;
  } else {
    tripInfoState.generatedData = null;
  }

  if (tripInfoState.generatedData) {
    renderTripInfoPreview(tripInfoState.generatedData);
  } else {
    tripInfoPreviewMount.textContent = "";
  }

  if (routeRuleChanged) {
    tripInfoSaveState();
  }
}

function tripInfoReadStoredState() {
  const emptyState = {
    formValues: tripInfoGetDefaultFormValues(),
    generatedData: null,
    signatureDataUrl: "",
    crewBagManualOverride: false,
    userInteractedWater: false,
  };

  try {
    const rawState = localStorage.getItem(TRIP_INFO_STORAGE_KEY);
    if (!rawState) {
      return emptyState;
    }

    const parsedState = JSON.parse(rawState);
    const rawCrewBagValue = parsedState?.formValues?.crewBag;
    const inferredCrewBagManualOverride = tripInfoNormalizeCrewBagInput(
      String(rawCrewBagValue ?? "")
    ) !== "";

    return {
      formValues: tripInfoSanitizeStoredFormValues(parsedState?.formValues),
      generatedData:
        parsedState?.generatedData && typeof parsedState.generatedData === "object"
          ? parsedState.generatedData
          : null,
      signatureDataUrl:
        typeof parsedState?.signatureDataUrl === "string" ? parsedState.signatureDataUrl : "",
      crewBagManualOverride:
        typeof parsedState?.crewBagManualOverride === "boolean"
          ? parsedState.crewBagManualOverride
          : inferredCrewBagManualOverride,
      userInteractedWater:
        typeof parsedState?.userInteractedWater === "boolean"
          ? parsedState.userInteractedWater
          : false,
    };
  } catch {
    return emptyState;
  }
}

function tripInfoSaveState() {
  try {
    localStorage.setItem(
      TRIP_INFO_STORAGE_KEY,
      JSON.stringify({
        formValues: tripInfoGetFormValues(),
        generatedData: tripInfoState.generatedData,
        signatureDataUrl: tripInfoState.signatureDataUrl,
        crewBagManualOverride: tripInfoState.crewBagManualOverride,
        userInteractedWater: tripInfoState.userInteractedWater,
      })
    );
  } catch {
    // Keep the app stable if storage is unavailable.
  }
}

function tripInfoGetFormValues() {
  return {
    flightNumber: tripInfoForm.elements.flightNumber.value,
    from: tripInfoForm.elements.from.value,
    to: tripInfoForm.elements.to.value,
    date: tripInfoForm.elements.date.value,
    crew: tripInfoForm.elements.crew.value,
    crewBag: tripInfoForm.elements.crewBag.value,
    pantry: tripInfoForm.elements.pantry.value,
    includeFak: tripInfoForm.elements.includeFak.checked,
    flightType: tripInfoForm.elements.flightType.value,
    waterMode: tripInfoGetSelectedWaterMode(),
    aircraftRegistration: tripInfoForm.elements.aircraftRegistration.value,
    aircraftType: tripInfoForm.elements.aircraftType.value,
    captainName: tripInfoForm.elements.captainName.value,
    dow: tripInfoForm.elements.dow.value,
    doi: tripInfoForm.elements.doi.value,
    maxZfw: tripInfoForm.elements.maxZfw.value,
    maxTow: tripInfoForm.elements.maxTow.value,
    maxLdw: tripInfoForm.elements.maxLdw.value,
    tripFuel: tripInfoForm.elements.tripFuel.value,
    taxiFuel: tripInfoForm.elements.taxiFuel.value,
    blockFuel: tripInfoForm.elements.blockFuel.value,
    eetHours: tripInfoForm.elements.eetHours.value,
    eetMinutes: tripInfoForm.elements.eetMinutes.value,
  };
}

function tripInfoApplyFormValues(values = tripInfoGetDefaultFormValues()) {
  const mergedValues = tripInfoSanitizeStoredFormValues(values);

  Object.keys(TRIP_INFO_DEFAULTS).forEach((key) => {
    if (key === "waterMode") {
      return;
    }

    const field = tripInfoForm.elements[key];
    if (field) {
      if (field instanceof HTMLInputElement && field.type === "checkbox") {
        field.checked = Boolean(mergedValues[key]);
      } else {
        field.value = mergedValues[key];
      }
    }
  });

  tripInfoForm.elements.from.value = tripInfoNormalizeIataCode(tripInfoForm.elements.from.value);
  tripInfoForm.elements.to.value = tripInfoNormalizeIataCode(tripInfoForm.elements.to.value);
  tripInfoForm.elements.pantry.value = mergedValues.pantry;
  tripInfoForm.elements.flightType.value = mergedValues.flightType;
  tripInfoSetSelectedWaterMode(mergedValues.waterMode);
  tripInfoForm.elements.aircraftRegistration.value = mergedValues.aircraftRegistration;
  tripInfoForm.elements.aircraftType.value = "B789";
}

function resetTripInfoModule(shouldFocus) {
  tripInfoState.crewBagManualOverride = false;
  tripInfoState.userInteractedWater = false;
  tripInfoApplyFormValues(tripInfoGetDefaultFormValues());
  tripInfoSyncCrewBagFromCrew();
  tripInfoState.generatedData = null;
  tripInfoState.signatureDataUrl = "";
  tripInfoPreviewMount.textContent = "";
  tripInfoUpdatePreviewVisibility();
  tripInfoClearValidation();
  tripInfoResizeSignatureCanvas(false);
  tripInfoUpdateTakeOffFuelField();

  try {
    localStorage.removeItem(TRIP_INFO_STORAGE_KEY);
  } catch {
    // Ignore storage removal issues to preserve app stability.
  }

  if (shouldFocus) {
    tripInfoForm.elements.flightNumber.focus();
  }
}

function tripInfoShowValidation(message) {
  tripInfoValidationMessage.textContent = message;
  tripInfoValidationMessage.hidden = false;
}

function tripInfoClearValidation() {
  tripInfoValidationMessage.textContent = "";
  tripInfoValidationMessage.hidden = true;
}

function generateTripInfoPreview() {
  tripInfoClearValidation();
  const normalizedData = tripInfoReadAndNormalizeValues(true);

  if (!normalizedData) {
    return;
  }

  tripInfoState.generatedData = normalizedData;
  renderTripInfoPreview(normalizedData);
  tripInfoSaveState();
}

function tripInfoReadAndNormalizeValues(showErrors = true) {
  const rawValues = tripInfoGetFormValues();
  const flightNumber = tripInfoNormalizeText(rawValues.flightNumber);
  const from = tripInfoNormalizeIataCode(rawValues.from);
  const to = tripInfoNormalizeIataCode(rawValues.to);
  const parsedDate = tripInfoParseDateInput(rawValues.date);
  const crew = tripInfoNormalizeCrewValue(rawValues.crew);
  const crewBagInput = tripInfoNormalizeCrewBagInput(rawValues.crewBag);
  const crewBagValue = crewBagInput === "" ? null : tripInfoParsePlainInteger(crewBagInput);
  const pantryCode = tripInfoNormalizePantryValue(rawValues.pantry);
  const includeFak = tripInfoShouldIncludeFakForRoute(from, to);
  const flightType = tripInfoNormalizeFlightTypeValue(rawValues.flightType);
  const selectedWaterMode = tripInfoNormalizeWaterModeValue(rawValues.waterMode);
  const effectiveWaterMode = tripInfoGetEffectiveWaterMode(to, selectedWaterMode, pantryCode);
  const baseWaterLevel = tripInfoGetBaseWaterLevelFromWaterMode(effectiveWaterMode);
  const finalWaterLevel = baseWaterLevel === null ? null : 100;
  const waterCorrection = tripInfoGetWaterCorrection(baseWaterLevel, finalWaterLevel);
  const flightTypeNote = tripInfoBuildFlightTypeNoteText(flightType);
  const remarksWaterTransitionText = waterCorrection
    ? tripInfoBuildWaterTransitionText(baseWaterLevel, finalWaterLevel)
    : "";
  const remarksCorrectionText = waterCorrection
    ? tripInfoBuildWaterCorrectionText(waterCorrection)
    : "";
  const aircraftRegistration = tripInfoNormalizeText(rawValues.aircraftRegistration);
  const aircraftType = rawValues.aircraftType;
  const captainName = tripInfoNormalizeText(rawValues.captainName);
  const dowKg = tripInfoParseIntegerField(rawValues.dow);
  const doiValue = tripInfoParseDecimalField(rawValues.doi);
  const maxZfwKg = tripInfoParseIntegerField(rawValues.maxZfw);
  const maxTowKg = tripInfoParseIntegerField(rawValues.maxTow);
  const maxLdwKg = tripInfoParseIntegerField(rawValues.maxLdw);
  const tripFuelKg = tripInfoParseIntegerField(rawValues.tripFuel);
  const taxiFuelKg = tripInfoParseIntegerField(rawValues.taxiFuel);
  const blockFuelKg = tripInfoParseIntegerField(rawValues.blockFuel);
  const eetHoursValue = tripInfoParsePlainInteger(rawValues.eetHours);
  const eetMinutesValue = tripInfoParsePlainInteger(rawValues.eetMinutes);
  const errors = [];

  if (!flightNumber) {
    errors.push("Enter a flight number.");
  }

  if (!/^[A-Z]{3}$/.test(from)) {
    errors.push("From must be a valid 3-letter IATA code.");
  }

  if (!/^[A-Z]{3}$/.test(to)) {
    errors.push("To must be a valid 3-letter IATA code.");
  }

  if (!parsedDate) {
    errors.push("Enter a valid date.");
  }

  if (!crew) {
    errors.push("Crew must be in the format 2+9.");
  }

  if (crewBagInput !== "" && crewBagValue === null) {
    errors.push("Crew Bag must be a non-negative whole number.");
  }

  if (!TRIP_INFO_REGISTRATIONS.includes(aircraftRegistration)) {
    errors.push("Select a valid A/C registration.");
  }

  if (aircraftType !== "B789") {
    errors.push("A/C Type must be B789.");
  }

  if (!captainName) {
    errors.push("Enter the captain name.");
  }

  if (dowKg === null) {
    errors.push("Enter a valid non-negative DOW.");
  }

  if (doiValue === null) {
    errors.push("Enter a valid non-negative DOI.");
  }

  if (maxZfwKg === null) {
    errors.push("Enter a valid non-negative Max ZFW.");
  }

  if (maxTowKg === null) {
    errors.push("Enter a valid non-negative Max or Restricted TOW.");
  }

  if (maxLdwKg === null) {
    errors.push("Enter a valid non-negative Max or Restricted LDW.");
  }

  if (tripFuelKg === null) {
    errors.push("Enter a valid non-negative Trip Fuel.");
  }

  if (taxiFuelKg === null) {
    errors.push("Enter a valid non-negative Taxi Fuel.");
  }

  if (blockFuelKg === null) {
    errors.push("Enter a valid non-negative Block Fuel.");
  }

  if (eetHoursValue === null || eetMinutesValue === null) {
    errors.push("Enter valid non-negative EET hours and minutes.");
  }

  if (eetMinutesValue !== null && eetMinutesValue > 59) {
    errors.push("EET minutes must be between 0 and 59.");
  }

  if (
    blockFuelKg !== null &&
    taxiFuelKg !== null &&
    blockFuelKg - taxiFuelKg < 0
  ) {
    errors.push("Take Off Fuel cannot be negative.");
  }

  if (errors.length > 0) {
    if (showErrors) {
      tripInfoShowValidation(errors[0]);
    }
    return null;
  }

  const takeOffFuelKg = blockFuelKg - taxiFuelKg;
  const hasWaterCorrection = waterCorrection !== null;
  const correctedDowKg = hasWaterCorrection ? dowKg + waterCorrection.dowKg : dowKg;
  const correctedDoiValue = hasWaterCorrection ? doiValue + waterCorrection.doiValue : doiValue;
  const correctedDowKgDisplay = tripInfoBuildPrintedKgDisplay(correctedDowKg, hasWaterCorrection);
  const correctedDoiDisplay = tripInfoBuildPrintedDoiDisplay(correctedDoiValue, hasWaterCorrection);

  return {
    flightNumber,
    from,
    to,
    dateDisplay: parsedDate.display,
    dateIso: parsedDate.iso,
    crew,
    crewBagValue,
    crewBagDisplay: crewBagValue === null ? "" : String(crewBagValue),
    showCrewBagNote: crewBagValue !== null && crewBagValue > 0,
    pantryCode,
    showPantryNote: pantryCode !== "",
    includeFak,
    showFakNote: includeFak,
    flightType,
    flightTypeNote,
    showFlightTypeNote: flightTypeNote !== "",
    selectedWaterMode,
    effectiveWaterMode,
    baseWaterLevel,
    finalWaterLevel,
    waterMode: selectedWaterMode,
    waterCorrection,
    remarksWaterTransitionText,
    remarksCorrectionText,
    showRemarksCorrection: hasWaterCorrection,
    aircraftRegistration,
    aircraftType,
    captainName,
    originalDowKg: dowKg,
    originalDoiValue: doiValue,
    dowKg,
    doiValue,
    correctedDowKg,
    correctedDoiValue,
    correctedDowKgDisplay,
    correctedDoiDisplay,
    showCorrectedDowAsterisk: hasWaterCorrection,
    showCorrectedDoiAsterisk: hasWaterCorrection,
    remarksDowOriginalDisplay: hasWaterCorrection ? tripInfoFormatKgIntegerValue(dowKg) : "",
    remarksDowCorrectionDisplay: hasWaterCorrection
      ? tripInfoFormatKgIntegerValue(waterCorrection.dowKg)
      : "",
    remarksDoiOriginalDisplay: hasWaterCorrection ? tripInfoFormatDoiValue(doiValue) : "",
    remarksDoiCorrectionDisplay: hasWaterCorrection
      ? tripInfoFormatDoiCorrectionValue(waterCorrection.doiValue)
      : "",
    maxZfwKg,
    maxTowKg,
    maxLdwKg,
    tripFuelKg,
    takeOffFuelKg,
    taxiFuelKg,
    blockFuelKg,
    eetHours: String(eetHoursValue).padStart(2, "0"),
    eetMinutes: String(eetMinutesValue).padStart(2, "0"),
    dowDisplay: correctedDowKgDisplay,
    doiDisplay: correctedDoiDisplay,
    maxZfwDisplay: tripInfoFormatKgValue(maxZfwKg),
    maxTowDisplay: tripInfoFormatKgValue(maxTowKg),
    maxLdwDisplay: tripInfoFormatKgValue(maxLdwKg),
    tripFuelDisplay: tripInfoFormatKgValue(tripFuelKg),
    takeOffFuelDisplay: tripInfoFormatKgValue(takeOffFuelKg),
    taxiFuelDisplay: tripInfoFormatKgValue(taxiFuelKg),
    blockFuelDisplay: tripInfoFormatKgValue(blockFuelKg),
    signatureDataUrl: tripInfoState.signatureDataUrl,
  };
}

function tripInfoSanitizeStoredFormValues(values) {
  const defaultValues = tripInfoGetDefaultFormValues();
  const mergedValues = {
    ...defaultValues,
    ...(values && typeof values === "object" ? values : {}),
  };
  const parsedStoredDate = tripInfoParseDateInput(String(mergedValues.date || ""));
  const normalizedFrom = tripInfoNormalizeIataCode(String(mergedValues.from || ""));
  const normalizedTo = tripInfoNormalizeIataCode(String(mergedValues.to || ""));
  const normalizedCrew = tripInfoNormalizeCrewValue(String(mergedValues.crew || ""));
  const normalizedCrewBag = tripInfoNormalizeCrewBagDisplayValue(
    String(mergedValues.crewBag || "")
  );
  const normalizedPantry = tripInfoNormalizePantryValue(String(mergedValues.pantry || ""));
  const normalizedIncludeFak = tripInfoShouldIncludeFakForRoute(normalizedFrom, normalizedTo);
  const normalizedFlightType =
    tripInfoNormalizeFlightTypeValue(String(mergedValues.flightType || ""))
    || (tripInfoNormalizeBooleanValue(mergedValues.scheduleFlight, false)
      ? "SCHEDULE"
      : tripInfoNormalizeBooleanValue(mergedValues.charterFlight, false)
        ? "CHARTER"
        : "");
  const normalizedWaterMode =
    tripInfoNormalizeWaterModeValue(String(mergedValues.waterMode || ""))
    || (tripInfoNormalizeBooleanValue(mergedValues.waterFull, false)
      ? tripInfoGetAutoWaterModeFromContext(normalizedTo, normalizedPantry)
      : "STANDARD");

  return {
    ...mergedValues,
    from: normalizedFrom,
    to: normalizedTo,
    date: parsedStoredDate ? parsedStoredDate.iso : defaultValues.date,
    crew: normalizedCrew || defaultValues.crew,
    crewBag: normalizedCrewBag,
    pantry: normalizedPantry,
    includeFak: normalizedIncludeFak,
    flightType: normalizedFlightType,
    waterMode: normalizedWaterMode,
    aircraftRegistration: TRIP_INFO_REGISTRATIONS.includes(mergedValues.aircraftRegistration)
      ? mergedValues.aircraftRegistration
      : defaultValues.aircraftRegistration,
    aircraftType: "B789",
    maxZfw: String(mergedValues.maxZfw || defaultValues.maxZfw),
    maxTow: String(mergedValues.maxTow || defaultValues.maxTow),
    maxLdw: String(mergedValues.maxLdw || defaultValues.maxLdw),
  };
}

function tripInfoUpdateTakeOffFuelField() {
  const blockFuelKg = tripInfoParseIntegerField(tripInfoForm.elements.blockFuel.value);
  const taxiFuelKg = tripInfoParseIntegerField(tripInfoForm.elements.taxiFuel.value);

  if (blockFuelKg === null || taxiFuelKg === null || blockFuelKg - taxiFuelKg < 0) {
    tripInfoTakeOffFuelInput.value = "";
    return;
  }

  tripInfoTakeOffFuelInput.value = tripInfoFormatKgValue(blockFuelKg - taxiFuelKg);
}

function tripInfoSyncCrewBagFromCrew() {
  const currentCrewBagValue = tripInfoNormalizeCrewBagInput(tripInfoForm.elements.crewBag.value);

  if (tripInfoState.crewBagManualOverride && currentCrewBagValue !== "") {
    return;
  }

  const autoCrewBagValue = tripInfoCalculateCrewBagFromCrew(tripInfoForm.elements.crew.value);
  tripInfoForm.elements.crewBag.value = autoCrewBagValue === null ? "" : String(autoCrewBagValue);
}

function renderTripInfoPreview(data) {
  tripInfoPreviewMount.innerHTML = tripInfoBuildPreviewSvg(data);
  tripInfoUpdatePreviewVisibility();
}

function tripInfoUpdatePreviewVisibility() {
  tripInfoPreviewSection.hidden = !tripInfoState.generatedData;
}

function tripInfoBuildPreviewSvg(data) {
  const titleFontSize = 11 * (25.4 / 72);
  const bodyFontSize = 9 * (25.4 / 72);
  const valueFontSize = 10 * (25.4 / 72);
  const metadataFontSize = 4 * (25.4 / 72);
  const { page, header, topRows, noteBox, rows, bottomBoxes } = TRIP_INFO_LAYOUT;
  const noteBoxContentMarkup = tripInfoBuildNoteBoxContentMarkup(
    noteBox,
    data,
    bodyFontSize,
    valueFontSize
  );
  const remarksBoxContentMarkup = tripInfoBuildRemarksBoxContentMarkup(
    bottomBoxes.remarks,
    data,
    bodyFontSize
  );
  const buildSvgField = (field, value, options = {}) =>
    tripInfoBuildSvgInlineField({
      label: options.label ?? field.label ?? "",
      labelX: field.labelX,
      labelY: field.labelY ?? field.y,
      lineStartX: field.lineStartX,
      lineEndX: field.lineEndX,
      lineY: field.lineY,
      value,
      valueX: field.valueX ?? field.valueCenterX,
      valueY: field.valueY,
      valueAnchor: field.valueAnchor ?? "middle",
      labelFontSize: bodyFontSize,
      valueFontSize: valueFontSize,
      valueFontWeight: 600,
      ...options,
    });
  const logoMarkup = tripInfoLogoDataUrl
    ? `<image href="${tripInfoEscapeAttribute(tripInfoLogoDataUrl)}" x="${tripInfoFormatSvgNumber(
        header.logoX
      )}" y="${tripInfoFormatSvgNumber(header.logoY)}" width="${tripInfoFormatSvgNumber(
        header.logoWidth
      )}" height="${tripInfoFormatSvgNumber(
        header.logoHeight
      )}" preserveAspectRatio="xMidYMid meet" />`
    : "";
  const signatureMarkup = data.signatureDataUrl
    ? `<image href="${tripInfoEscapeAttribute(data.signatureDataUrl)}" x="${tripInfoFormatSvgNumber(
        bottomBoxes.signature.imageX
      )}" y="${tripInfoFormatSvgNumber(bottomBoxes.signature.imageY)}" width="${tripInfoFormatSvgNumber(
        bottomBoxes.signature.imageWidth
      )}" height="${tripInfoFormatSvgNumber(
        bottomBoxes.signature.imageHeight
      )}" preserveAspectRatio="xMidYMid meet" />`
    : "";

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${page.widthMm}mm" height="${page.heightMm}mm" viewBox="0 0 ${page.widthMm} ${page.heightMm}" role="img" aria-label="Trip Info preview">
      <rect x="0" y="0" width="${page.widthMm}" height="${page.heightMm}" fill="#ffffff" />
      ${tripInfoBuildSvgRect(header.x, header.y, header.width, header.height)}
      ${logoMarkup}
      ${tripInfoBuildSvgMmText({
        x: header.titleCenterX,
        y: header.titleBaselineY,
        text: "TRIP - INFO",
        textAnchor: "middle",
        fontSize: titleFontSize,
        fontWeight: 700,
        letterSpacing: 0,
      })}
      ${tripInfoBuildSvgMmText({
        x: header.metadataRightX,
        y: header.metadataLine1Y,
        text: "SN: FO-FO-008",
        textAnchor: "end",
        fontSize: metadataFontSize,
        fontWeight: 400,
        letterSpacing: 0,
      })}
      ${tripInfoBuildSvgMmText({
        x: header.metadataRightX,
        y: header.metadataLine2Y,
        text: "Revision: 03",
        textAnchor: "end",
        fontSize: metadataFontSize,
        fontWeight: 400,
        letterSpacing: 0,
      })}
      ${tripInfoBuildSvgMmText({
        x: header.metadataRightX,
        y: header.metadataLine3Y,
        text: "Date: 30 Jun 05",
        textAnchor: "end",
        fontSize: metadataFontSize,
        fontWeight: 400,
        letterSpacing: 0,
      })}
      ${tripInfoBuildSvgMmText({
        x: header.metadataRightX,
        y: header.metadataLine4Y,
        text: "Edited by: FOPH",
        textAnchor: "end",
        fontSize: metadataFontSize,
        fontWeight: 400,
        letterSpacing: 0,
      })}

      ${buildSvgField(topRows.flightNumber, tripInfoFitPreviewText(data.flightNumber, 16), {
        label: "Flight Number",
      })}
      ${buildSvgField(topRows.from, data.from, {
        label: "From",
      })}
      ${buildSvgField(topRows.to, data.to, {
        label: "To",
      })}

      ${buildSvgField(topRows.date, data.dateDisplay, {
        label: "Date",
      })}
      ${buildSvgField(topRows.crew, data.crew, {
        label: "Crew",
      })}

      ${buildSvgField(topRows.registration, data.aircraftRegistration, {
        label: "A/C Registration",
      })}
      ${buildSvgField(topRows.aircraftType, data.aircraftType, {
        label: "A/C Type",
      })}

      ${tripInfoBuildSvgRect(noteBox.x, noteBox.y, noteBox.width, noteBox.height)}
      ${tripInfoBuildSvgMmText({
        x: noteBox.labelX,
        y: noteBox.labelY,
        text: "NOTE:",
        fontSize: bodyFontSize,
        fontWeight: 400,
        letterSpacing: 0,
      })}
      ${noteBoxContentMarkup}

      ${buildSvgField(rows.captainName, tripInfoFitPreviewText(data.captainName, 22), {
        label: "Captain Name",
      })}
      ${buildSvgField(rows.dow, data.correctedDowKgDisplay, {
        label: "DOW",
      })}
      ${buildSvgField(rows.doi, data.correctedDoiDisplay, {
        label: "DOI",
      })}
      ${buildSvgField(rows.maxZfw, data.maxZfwDisplay, {
        label: "Max ZFW",
      })}
      ${buildSvgField(rows.maxTow, data.maxTowDisplay, {
        label: "Max or Restricted TOW",
      })}
      ${buildSvgField(rows.maxLdw, data.maxLdwDisplay, {
        label: "Max or Restricted LDW",
      })}
      ${buildSvgField(rows.tripFuel, data.tripFuelDisplay, {
        label: "Trip Fuel",
      })}
      ${buildSvgField(rows.takeOffFuel, data.takeOffFuelDisplay, {
        label: "Take Off Fuel",
      })}
      ${buildSvgField(rows.taxiFuel, data.taxiFuelDisplay, {
        label: "Taxi Fuel",
      })}
      ${buildSvgField(rows.blockFuel, data.blockFuelDisplay, {
        label: "Block Fuel",
      })}
      ${tripInfoBuildSvgInlineField({
        label: "EET",
        labelX: rows.eet.labelX,
        labelY: rows.eet.y,
        lineStartX: rows.eet.hoursLineStartX,
        lineEndX: rows.eet.hoursLineEndX,
        lineY: rows.eet.hoursLineY,
        value: data.eetHours,
        valueX: rows.eet.hoursValueCenterX,
        valueY: rows.eet.hoursValueY,
        valueAnchor: "middle",
        labelFontSize: bodyFontSize,
        valueFontSize: valueFontSize,
        valueFontWeight: 600,
      })}
      ${tripInfoBuildSvgMmText({
        x: rows.eet.hrsLabelX,
        y: rows.eet.hrsLabelY,
        text: "hrs",
        fontSize: bodyFontSize,
        fontWeight: 400,
        letterSpacing: 0,
      })}
      ${tripInfoBuildSvgInlineField({
        label: "",
        labelX: rows.eet.labelX,
        labelY: rows.eet.y,
        lineStartX: rows.eet.minutesLineStartX,
        lineEndX: rows.eet.minutesLineEndX,
        lineY: rows.eet.minutesLineY,
        value: data.eetMinutes,
        valueX: rows.eet.minutesValueCenterX,
        valueY: rows.eet.minutesValueY,
        valueAnchor: "middle",
        valueFontSize: valueFontSize,
        valueFontWeight: 600,
      })}
      ${tripInfoBuildSvgMmText({
        x: rows.eet.minLabelX,
        y: rows.eet.minLabelY,
        text: "min",
        fontSize: bodyFontSize,
        fontWeight: 400,
        letterSpacing: 0,
      })}

      ${tripInfoBuildSvgRect(
        bottomBoxes.remarks.x,
        bottomBoxes.remarks.y,
        bottomBoxes.remarks.width,
        bottomBoxes.remarks.height
      )}
      ${tripInfoBuildSvgMmText({
        x: bottomBoxes.remarks.labelX,
        y: bottomBoxes.remarks.labelY,
        text: "Remarks",
        fontSize: bodyFontSize,
        fontWeight: 400,
        letterSpacing: 0,
      })}
      ${remarksBoxContentMarkup}

      ${tripInfoBuildSvgRect(
        bottomBoxes.signature.x,
        bottomBoxes.signature.y,
        bottomBoxes.signature.width,
        bottomBoxes.signature.height
      )}
      ${tripInfoBuildSvgMmText({
        x: bottomBoxes.signature.labelX,
        y: bottomBoxes.signature.labelY,
        text: "Captain Signature",
        fontSize: bodyFontSize,
        fontWeight: 400,
        letterSpacing: 0,
      })}
      ${signatureMarkup}
    </svg>
  `.trim();
}

function tripInfoBuildNoteBoxContentMarkup(noteBox, data, bodyFontSize, valueFontSize) {
  const sections = [];

  if (data.showCrewBagNote) {
    sections.push({
      title: "CREW BAG",
      lines: [
        {
          text: data.crewBagDisplay,
          fontSize: valueFontSize,
          fontWeight: 600,
          circled: true,
          circleType: "crewBag",
        },
        { text: "HOLD 5", fontSize: bodyFontSize, fontWeight: 400 },
      ],
    });
  }

  if (data.showPantryNote) {
    sections.push({
      title: "PANTRY",
      lines: [
        {
          text: data.pantryCode,
          fontSize: valueFontSize,
          fontWeight: 600,
          circled: true,
          circleType: "pantry",
        },
      ],
    });
  }

  if (data.showFakNote) {
    sections.push({
      title: "FAK",
      lines: [
        {
          text: "802 KG",
          fontSize: valueFontSize,
          fontWeight: 600,
          circled: true,
          circleType: "fakWeight",
        },
        { text: "HOLD 4", fontSize: bodyFontSize, fontWeight: 400 },
      ],
    });
  }

  if (data.showFlightTypeNote) {
    const flightTypeLines = tripInfoBuildFlightTypeNoteLines(data.flightType);
    sections.push({
      title: "",
      lineStartOffset: 0,
      lineStep: 4.35,
      lines: flightTypeLines.map((text) => ({
        text,
        fontSize: bodyFontSize * 0.98,
        fontWeight: 600,
        circled: false,
      })),
    });
  }

  if (sections.length === 0) {
    return "";
  }

  const centerX = noteBox.x + (noteBox.width / 2);
  const separatorText = "======";
  const titleToLineStep = 5.05;
  const baseStartY = noteBox.y + 12.2;
  const separatorCount = sections.length - 1;
  const getSectionLineStartOffset = (section) =>
    section.lineStartOffset ?? (section.title ? titleToLineStep : 0);
  const getSectionLineStep = (section) => section.lineStep ?? titleToLineStep;
  const sectionHeights = sections.map((section) => {
    if (section.lines.length === 0) {
      return 0;
    }

    return getSectionLineStartOffset(section)
      + (getSectionLineStep(section) * (section.lines.length - 1));
  });
  const baseBlockToSeparator = 4.1;
  const baseSeparatorToNextBlock = 4.95;
  const bottomPadding = 9.2;
  const initialSectionOffset = Math.min((4 - sections.length) * 4.2, 12.6);
  const baseContentHeight =
    sectionHeights.reduce((total, height) => total + height, 0)
    + (separatorCount * (baseBlockToSeparator + baseSeparatorToNextBlock));
  const availableExtraSpace = Math.max(
    0,
    (noteBox.y + noteBox.height - bottomPadding) - (baseStartY + initialSectionOffset + baseContentHeight)
  );
  const extraTopOffset = Math.min(availableExtraSpace * 0.28, 4.8);
  const extraGapPerSeparator = separatorCount > 0
    ? Math.min((availableExtraSpace - extraTopOffset) / separatorCount, 3.1)
    : 0;
  const startY = baseStartY + initialSectionOffset + extraTopOffset;
  const blockToSeparator = baseBlockToSeparator + (extraGapPerSeparator * 0.42);
  const separatorToNextBlock = baseSeparatorToNextBlock + (extraGapPerSeparator * 0.58);
  const markup = [];
  let cursorY = startY;

  sections.forEach((section, index) => {
    const lineStartOffset = getSectionLineStartOffset(section);
    const lineStep = getSectionLineStep(section);

    if (section.title) {
      markup.push(
        tripInfoBuildSvgMmText({
          x: centerX,
          y: cursorY,
          text: section.title,
          textAnchor: "middle",
          fontSize: bodyFontSize,
          fontWeight: 600,
          letterSpacing: 0,
        })
      );
    }

    section.lines.forEach((line, lineIndex) => {
      const lineY = cursorY + lineStartOffset + (lineStep * lineIndex);

      if (line.circled) {
        markup.push(
          tripInfoBuildNoteCircleMarkup(centerX, lineY, line.circleType)
        );
      }

      markup.push(
        tripInfoBuildSvgMmText({
          x: centerX,
          y: lineY,
          text: line.text,
          textAnchor: "middle",
          fontSize: line.fontSize,
          fontWeight: line.fontWeight,
          letterSpacing: 0,
        })
      );
    });

    const sectionEndY =
      section.lines.length > 0
        ? cursorY + lineStartOffset + (lineStep * (section.lines.length - 1))
        : cursorY;

    if (index < sections.length - 1) {
      const separatorY = sectionEndY + blockToSeparator;
      markup.push(
        tripInfoBuildSvgMmText({
          x: centerX,
          y: separatorY,
          text: separatorText,
          textAnchor: "middle",
          fontSize: bodyFontSize * 0.95,
          fontWeight: 600,
          letterSpacing: 0,
        })
      );
      cursorY = separatorY + separatorToNextBlock;
    }
  });

  return markup.join("\n");
}

function tripInfoBuildNoteCircleMarkup(centerX, baselineY, circleType) {
  const circleDimensions = {
    crewBag: { rx: 4.35, ry: 2.55, baselineOffsetY: 1.2 },
    pantry: { rx: 4.55, ry: 2.55, baselineOffsetY: 1.2 },
    fakWeight: { rx: 7.95, ry: 2.7, baselineOffsetY: 1.2 },
  }[circleType];

  if (!circleDimensions) {
    return "";
  }

  return tripInfoBuildSvgEllipse(
    centerX,
    baselineY - circleDimensions.baselineOffsetY,
    circleDimensions.rx,
    circleDimensions.ry
  );
}

function tripInfoBuildRemarksBoxContentMarkup(remarksBox, data, bodyFontSize) {
  if (!data.showRemarksCorrection) {
    return "";
  }

  const remarksFontSize = bodyFontSize * 0.84;
  const textX = remarksBox.x + 1.9;
  const textY = remarksBox.labelY + 3.2;
  const lineStep = 3.35;

  return [
    tripInfoBuildSvgMmText({
      x: textX,
      y: textY,
      text: data.remarksWaterTransitionText,
      fontSize: remarksFontSize,
      fontWeight: 700,
      letterSpacing: 0,
    }),
    tripInfoBuildSvgSegmentedText({
      x: textX,
      y: textY + lineStep,
      fontSize: remarksFontSize,
      fontWeight: 400,
      segments: [
        { text: "*DOW " },
        {
          text: data.remarksDowOriginalDisplay,
          textDecoration: "underline",
        },
        { text: ` + ${data.remarksDowCorrectionDisplay}` },
      ],
    }),
    tripInfoBuildSvgSegmentedText({
      x: textX,
      y: textY + (lineStep * 2),
      fontSize: remarksFontSize,
      fontWeight: 400,
      segments: [
        { text: "*DOI " },
        {
          text: data.remarksDoiOriginalDisplay,
          textDecoration: "underline",
        },
        { text: ` + ${data.remarksDoiCorrectionDisplay}` },
      ],
    }),
  ].join("\n");
}

function tripInfoBuildSvgSegmentedText(options) {
  const {
    x,
    y,
    segments,
    textAnchor = "start",
    fontSize = 1.6,
    fontWeight = 400,
    letterSpacing = 0,
  } = options;

  const segmentsMarkup = segments
    .map((segment) => {
      const attributes = [];

      if (segment.fontWeight) {
        attributes.push(`font-weight="${tripInfoEscapeAttribute(String(segment.fontWeight))}"`);
      }

      if (segment.textDecoration) {
        attributes.push(
          `text-decoration="${tripInfoEscapeAttribute(segment.textDecoration)}"`
        );
      }

      return `<tspan${attributes.length > 0 ? ` ${attributes.join(" ")}` : ""}>${tripInfoEscapeXml(
        segment.text
      )}</tspan>`;
    })
    .join("");

  return `<text x="${tripInfoFormatSvgNumber(x)}" y="${tripInfoFormatSvgNumber(
    y
  )}" fill="#111827" font-family="Arial, Helvetica, sans-serif" font-size="${tripInfoFormatSvgNumber(
    fontSize
  )}" font-weight="${fontWeight}" letter-spacing="${tripInfoFormatSvgNumber(
    letterSpacing
  )}" text-anchor="${textAnchor}" xml:space="preserve">${segmentsMarkup}</text>`;
}

function tripInfoBuildSvgInlineField(options) {
  const {
    label,
    labelX,
    labelY,
    lineStartX,
    lineEndX,
    lineY,
    value,
    valueX = (lineStartX + lineEndX) / 2,
    valueY = lineY - 0.55,
    valueAnchor = "middle",
    labelFontSize = 9 * (25.4 / 72),
    valueFontSize = 10 * (25.4 / 72),
    labelFontWeight = 400,
    valueFontWeight = 400,
  } = options;

  return `
    ${label
      ? tripInfoBuildSvgMmText({
          x: labelX,
          y: labelY,
          text: label,
          fontSize: labelFontSize,
          fontWeight: labelFontWeight,
          letterSpacing: 0,
        })
      : ""}
    ${value
      ? tripInfoBuildSvgMmText({
          x: valueX,
          y: valueY,
          text: value,
          textAnchor: valueAnchor,
          fontSize: valueFontSize,
          fontWeight: valueFontWeight,
          letterSpacing: 0,
        })
      : ""}
    ${tripInfoBuildSvgLine(lineStartX, lineY, lineEndX, lineY)}
  `.trim();
}

function tripInfoBuildSvgRect(x, y, width, height, strokeWidth = 0.22) {
  return `<rect x="${tripInfoFormatSvgNumber(x)}" y="${tripInfoFormatSvgNumber(
    y
  )}" width="${tripInfoFormatSvgNumber(width)}" height="${tripInfoFormatSvgNumber(
    height
  )}" fill="none" stroke="#111827" stroke-width="${tripInfoFormatSvgNumber(strokeWidth)}" />`;
}

function tripInfoBuildSvgEllipse(cx, cy, rx, ry, strokeWidth = 0.22) {
  return `<ellipse cx="${tripInfoFormatSvgNumber(cx)}" cy="${tripInfoFormatSvgNumber(
    cy
  )}" rx="${tripInfoFormatSvgNumber(rx)}" ry="${tripInfoFormatSvgNumber(
    ry
  )}" fill="none" stroke="#111827" stroke-width="${tripInfoFormatSvgNumber(strokeWidth)}" />`;
}

function tripInfoBuildSvgLine(x1, y1, x2, y2, strokeWidth = 0.22) {
  return `<line x1="${tripInfoFormatSvgNumber(x1)}" y1="${tripInfoFormatSvgNumber(
    y1
  )}" x2="${tripInfoFormatSvgNumber(x2)}" y2="${tripInfoFormatSvgNumber(
    y2
  )}" stroke="#111827" stroke-width="${tripInfoFormatSvgNumber(strokeWidth)}" />`;
}

function tripInfoBuildSvgMmText(options) {
  const {
    x,
    y,
    text,
    textAnchor = "start",
    fontSize = 1.6,
    fontWeight = 400,
    letterSpacing = 0,
  } = options;

  return `<text x="${tripInfoFormatSvgNumber(x)}" y="${tripInfoFormatSvgNumber(
    y
  )}" fill="#111827" font-family="Arial, Helvetica, sans-serif" font-size="${tripInfoFormatSvgNumber(
    fontSize
  )}" font-weight="${fontWeight}" letter-spacing="${tripInfoFormatSvgNumber(
    letterSpacing
  )}" text-anchor="${textAnchor}">${tripInfoEscapeXml(text)}</text>`;
}

function tripInfoFormatSvgNumber(value) {
  return Number(value).toFixed(3).replace(/\.?0+$/, "");
}

async function tripInfoDownloadPng() {
  await tripInfoRunExport(async () => {
    const pngBlob = await tripInfoCreatePngBlob();
    tripInfoTriggerDownload(
      pngBlob,
      `${tripInfoBuildFilenameBase(tripInfoState.generatedData)}.png`
    );
  });
}

async function tripInfoDownloadPdf() {
  await tripInfoRunExport(async () => {
    const pdfBlob = await tripInfoCreatePdfBlob();
    tripInfoTriggerDownload(
      pdfBlob,
      `${tripInfoBuildFilenameBase(tripInfoState.generatedData)}.pdf`
    );
  });
}

async function tripInfoShare() {
  await tripInfoRunExport(async () => {
    const pngBlob = await tripInfoCreatePngBlob();
    const pdfBlob = await tripInfoCreatePdfBlob();
    const baseFilename = tripInfoBuildFilenameBase(tripInfoState.generatedData);

    if (typeof File === "function" && navigator.share && navigator.canShare) {
      const pngFile = new File([pngBlob], `${baseFilename}.png`, { type: "image/png" });
      const pdfFile = new File([pdfBlob], `${baseFilename}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.canShare({ files: [pdfFile, pngFile] })) {
        await navigator.share({
          title: `Trip Info ${tripInfoState.generatedData.flightNumber}`,
          files: [pdfFile, pngFile],
        });
        return;
      }

      if (navigator.canShare({ files: [pngFile] })) {
        await navigator.share({
          title: `Trip Info ${tripInfoState.generatedData.flightNumber}`,
          files: [pngFile],
        });
        return;
      }
    }

    tripInfoTriggerDownload(pngBlob, `${baseFilename}.png`);
  });
}

async function tripInfoRunExport(task) {
  if (!tripInfoState.generatedData) {
    return;
  }

  tripInfoSetExportButtonsDisabled(true);
  tripInfoClearValidation();

  try {
    await task();
  } catch (error) {
    if (error?.name !== "AbortError") {
      tripInfoShowValidation("Unable to complete the Trip Info export.");
    }
  } finally {
    tripInfoSetExportButtonsDisabled(false);
  }
}

function tripInfoSetExportButtonsDisabled(disabled) {
  tripInfoDownloadPdfButton.disabled = disabled;
  tripInfoDownloadPngButton.disabled = disabled;
  tripInfoShareButton.disabled = disabled;
}

async function tripInfoCreatePngBlob() {
  const canvas = await tripInfoRenderExportCanvas();
  return tripInfoCanvasToBlob(canvas, "image/png");
}

async function tripInfoCreatePdfBlob() {
  const canvas = await tripInfoRenderExportCanvas();
  return tripInfoCanvasToPdfBlob(canvas);
}

async function tripInfoRenderExportCanvas() {
  await tripInfoLoadLogoData();

  const svgMarkup = tripInfoBuildPreviewSvg({
    ...tripInfoState.generatedData,
    signatureDataUrl: tripInfoState.signatureDataUrl,
  });
  const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);
  const ctx = tripInfoExportCanvas.getContext("2d");

  try {
    const image = await tripInfoLoadImage(svgUrl);
    tripInfoExportCanvas.width = TRIP_INFO_EXPORT_WIDTH;
    tripInfoExportCanvas.height = TRIP_INFO_EXPORT_HEIGHT;
    ctx.clearRect(0, 0, TRIP_INFO_EXPORT_WIDTH, TRIP_INFO_EXPORT_HEIGHT);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, TRIP_INFO_EXPORT_WIDTH, TRIP_INFO_EXPORT_HEIGHT);
    ctx.drawImage(image, 0, 0, TRIP_INFO_EXPORT_WIDTH, TRIP_INFO_EXPORT_HEIGHT);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }

  return tripInfoExportCanvas;
}

function tripInfoLoadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load export image."));
    image.src = source;
  });
}

function tripInfoCanvasToBlob(canvas, type) {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== "function") {
      try {
        const dataUrl = canvas.toDataURL(type);
        resolve(new Blob([tripInfoDataUrlToBytes(dataUrl)], { type }));
      } catch (error) {
        reject(error);
      }
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Unable to export canvas."));
    }, type);
  });
}

function tripInfoCanvasToPdfBlob(canvas) {
  const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);
  const encoder = new TextEncoder();
  const imageBytes = tripInfoDataUrlToBytes(jpegDataUrl);
  const contentStream = `q\n${TRIP_INFO_PAGE_WIDTH_PT.toFixed(2)} 0 0 ${TRIP_INFO_PAGE_HEIGHT_PT.toFixed(2)} 0 0 cm\n/Im0 Do\nQ\n`;
  const contentBytes = encoder.encode(contentStream);
  const chunks = [];
  const offsets = [0];
  let byteOffset = 0;

  const appendBytes = (bytes) => {
    chunks.push(bytes);
    byteOffset += bytes.length;
  };

  const appendText = (text) => {
    appendBytes(encoder.encode(text));
  };

  appendText("%PDF-1.3\n");
  offsets.push(byteOffset);
  appendText("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  offsets.push(byteOffset);
  appendText("2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n");
  offsets.push(byteOffset);
  appendText(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${TRIP_INFO_PAGE_WIDTH_PT.toFixed(
      2
    )} ${TRIP_INFO_PAGE_HEIGHT_PT.toFixed(
      2
    )}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );
  offsets.push(byteOffset);
  appendText(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`
  );
  appendBytes(imageBytes);
  appendText("\nendstream\nendobj\n");
  offsets.push(byteOffset);
  appendText(`5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
  appendBytes(contentBytes);
  appendText("endstream\nendobj\n");

  const xrefOffset = byteOffset;
  appendText(`xref\n0 ${offsets.length}\n`);
  appendText("0000000000 65535 f \n");
  offsets.slice(1).forEach((offset) => {
    appendText(`${String(offset).padStart(10, "0")} 00000 n \n`);
  });
  appendText(
    `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  return new Blob(chunks, { type: "application/pdf" });
}

function tripInfoDataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return bytes;
}

function tripInfoTriggerDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}

function tripInfoBuildFilenameBase(data) {
  const flightNumber = tripInfoSanitizeFilenamePart(data?.flightNumber || "TRIP");
  const datePart = tripInfoSanitizeFilenamePart(
    data?.dateIso || new Date().toISOString().slice(0, 10)
  );

  return `TRIPINFO_${flightNumber}_${datePart}`;
}

function tripInfoSanitizeFilenamePart(value) {
  const sanitized = String(value)
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return sanitized || "NA";
}

async function tripInfoLoadLogoData() {
  if (tripInfoLogoDataUrl) {
    return tripInfoLogoDataUrl;
  }

  try {
    const response = await fetch(TRIP_INFO_LOGO_SRC);

    if (!response.ok) {
      throw new Error("Logo not available.");
    }

    const logoBlob = await response.blob();
    tripInfoLogoDataUrl = await tripInfoBlobToDataUrl(logoBlob);

    if (tripInfoState.generatedData) {
      renderTripInfoPreview(tripInfoState.generatedData);
    }
  } catch {
    tripInfoLogoDataUrl = "";
  }

  return tripInfoLogoDataUrl;
}

function tripInfoBlobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read logo."));
    };
    reader.onerror = () => {
      reject(new Error("Unable to read logo."));
    };
    reader.readAsDataURL(blob);
  });
}

function tripInfoUppercaseLiveValue(value) {
  return typeof value === "string" ? value.toUpperCase() : "";
}

function tripInfoNormalizeText(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function tripInfoNormalizeIataCode(value) {
  return tripInfoNormalizeText(value)
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3);
}

function tripInfoNormalizeCrewValue(value) {
  const compactValue = tripInfoNormalizeText(value).replace(/\s+/g, "");
  return /^\d+\+\d+$/.test(compactValue) ? compactValue : null;
}

function tripInfoNormalizeCrewBagInput(value) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function tripInfoNormalizeCrewBagDisplayValue(value) {
  const normalizedValue = tripInfoNormalizeCrewBagInput(value);

  if (!normalizedValue) {
    return "";
  }

  return String(Number(normalizedValue));
}

function tripInfoNormalizePantryValue(value) {
  const normalizedValue = tripInfoNormalizeText(String(value || ""));
  return TRIP_INFO_PANTRY_CODES.includes(normalizedValue) ? normalizedValue : "";
}

function tripInfoNormalizeBooleanValue(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === "true") {
      return true;
    }

    if (normalizedValue === "false") {
      return false;
    }
  }

  return fallback;
}

function tripInfoNormalizeFlightTypeValue(value) {
  const normalizedValue = tripInfoNormalizeText(String(value || ""));

  if (normalizedValue === "SCHEDULE" || normalizedValue === "SCHED") {
    return "SCHED";
  }

  if (normalizedValue === "CHARTER") {
    return "CHARTER";
  }

  return "";
}

function tripInfoNormalizeWaterModeValue(value) {
  const normalizedValue = tripInfoNormalizeText(String(value || ""));
  return normalizedValue === "STANDARD" || normalizedValue === "80" || normalizedValue === "50"
    ? normalizedValue
    : "";
}

function tripInfoGetBaseWaterLevelFromWaterMode(waterMode) {
  if (waterMode === "80" || waterMode === "50") {
    return Number(waterMode);
  }

  return null;
}

function tripInfoGetWaterCorrection(baseWaterLevel, finalWaterLevel) {
  if (baseWaterLevel === null || finalWaterLevel !== 100 || baseWaterLevel === 100) {
    return null;
  }

  return TRIP_INFO_WATER_CORRECTIONS[baseWaterLevel] || null;
}

function tripInfoBuildFlightTypeNoteText(flightType) {
  if (flightType === "SCHED") {
    return "SCHEDULE FLT";
  }

  if (flightType === "CHARTER") {
    return "CHARTER FLT";
  }

  return "";
}

function tripInfoBuildFlightTypeNoteLines(flightType) {
  if (flightType === "SCHED") {
    return ["SCHEDULE", "FLT"];
  }

  if (flightType === "CHARTER") {
    return ["CHARTER", "FLT"];
  }

  return [];
}

function tripInfoBuildWaterTransitionText(baseWaterLevel, finalWaterLevel) {
  return `Water ${baseWaterLevel}% to ${finalWaterLevel}%`;
}

function tripInfoBuildPrintedKgDisplay(value, withAsterisk = false) {
  return `${tripInfoFormatKgValue(value)}${withAsterisk ? "*" : ""}`;
}

function tripInfoBuildPrintedDoiDisplay(value, withAsterisk = false) {
  return `${tripInfoFormatDoiValue(value)}${withAsterisk ? "*" : ""}`;
}

function tripInfoBuildWaterCorrectionText(waterCorrection) {
  return `${tripInfoFormatSignedKgValue(waterCorrection.dowKg)} DOW / ${tripInfoFormatSignedDecimalValue(
    waterCorrection.doiValue,
    2
  )} DOI`;
}

function tripInfoCalculateCrewBagFromCrew(value) {
  const normalizedCrew = tripInfoNormalizeCrewValue(String(value || ""));

  if (!normalizedCrew) {
    return null;
  }

  return normalizedCrew
    .split("+")
    .reduce((sum, item) => sum + Number(item), 0);
}

function tripInfoParseDateInput(value) {
  const trimmedValue = tripInfoNormalizeText(value);

  if (!trimmedValue) {
    return null;
  }

  let year;
  let month;
  let day;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    const [isoYear, isoMonth, isoDay] = trimmedValue.split("-").map(Number);
    year = isoYear;
    month = isoMonth;
    day = isoDay;
  } else {
    const match = trimmedValue.match(
      /^(\d{1,2})[\/.\-\s]([A-Za-z]{3,}|\d{1,2})[\/.\-\s](\d{2}|\d{4})$/
    );

    if (!match) {
      return null;
    }

    day = Number(match[1]);
    month = tripInfoParseMonthToken(match[2]);
    year = tripInfoParseYearToken(match[3]);
  }

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return {
    iso: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    display: `${String(day).padStart(2, "0")}/${TRIP_INFO_MONTHS[month - 1]}/${String(
      year
    ).slice(-2)}`,
  };
}

function tripInfoParseMonthToken(token) {
  if (/^\d{1,2}$/.test(token)) {
    const numericMonth = Number(token);
    return numericMonth >= 1 && numericMonth <= 12 ? numericMonth : null;
  }

  const normalizedToken = token.slice(0, 3).toLowerCase();
  const monthIndex = TRIP_INFO_MONTHS.findIndex(
    (month) => month.toLowerCase() === normalizedToken
  );

  return monthIndex >= 0 ? monthIndex + 1 : null;
}

function tripInfoParseYearToken(token) {
  if (!/^\d{2}(\d{2})?$/.test(token)) {
    return null;
  }

  if (token.length === 4) {
    return Number(token);
  }

  return 2000 + Number(token);
}

function tripInfoParseIntegerField(value) {
  const compactValue = tripInfoNormalizeText(value).replace(/\s+/g, "");

  if (!compactValue) {
    return null;
  }

  if (/^\d+$/.test(compactValue)) {
    return Number(compactValue);
  }

  if (/^\d{1,3}([.,]\d{3})+$/.test(compactValue)) {
    return Number(compactValue.replace(/[.,]/g, ""));
  }

  return null;
}

function tripInfoParseDecimalField(value) {
  const compactValue = tripInfoNormalizeText(value).replace(/\s+/g, "");

  if (!compactValue) {
    return null;
  }

  if (/^\d+$/.test(compactValue)) {
    return Number(compactValue);
  }

  if (/^\d+[.,]\d+$/.test(compactValue)) {
    return Number(compactValue.replace(",", "."));
  }

  return null;
}

function tripInfoParsePlainInteger(value) {
  const trimmedValue = tripInfoNormalizeText(value);

  if (!/^\d+$/.test(trimmedValue)) {
    return null;
  }

  return Number(trimmedValue);
}

function tripInfoFormatKgValue(value) {
  return `${Math.round(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} KG`;
}

function tripInfoFormatKgIntegerValue(value) {
  return Math.round(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function tripInfoFormatSignedKgValue(value) {
  return `${value >= 0 ? "+" : "-"}${Math.round(Math.abs(value)).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} KG`;
}

function tripInfoFormatSignedDecimalValue(value, decimals) {
  return `${value >= 0 ? "+" : "-"}${Math.abs(Number(value)).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function tripInfoFormatDoiValue(value) {
  return Number(value).toLocaleString("it-IT", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function tripInfoFormatDoiCorrectionValue(value) {
  return Number(value).toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function tripInfoEscapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function tripInfoEscapeAttribute(value) {
  return tripInfoEscapeXml(value).replace(/"/g, "&quot;");
}

function tripInfoFitPreviewText(value, maxLength) {
  const text = String(value);
  return text.length > maxLength ? `${text.slice(0, Math.max(0, maxLength - 3))}...` : text;
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
