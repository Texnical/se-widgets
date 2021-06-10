const version = "3.0";

// Order is important here:
// EMF-5 | Freezing | Spirit Box | Writing | Orbs | Fingerprints
// 1 is true
// 0 is false

const BANSHEE = "110001",
  DEMON = "011100",
  HANTU = "000111",
  JINN = "101010",
  MARE = "011010",
  ONI = "101100",
  PHANTOM = "110010",
  POLTERGEIST = "001011",
  REVENANT = "100101",
  SHADE = "100110",
  SPIRIT = "001101",
  WRAITH = "011001",
  YOKAI = "001110",
  YUREI = "010110";

const OPTIONAL_OBJECTIVES = {
  ca: "Candle",
  can: "Candle",
  candle: "Candle",
  cr: "Crucifix",
  crucifix: "Crucifix",
  em: "EMF",
  emf: "EMF",
  es: "Escape",
  escape: "Escape",
  ev: "Event",
  event: "Event",
  hu: "Smudge(Hunt)",
  hunt: "Smudge(Hunt)",
  mo: "Motion",
  motion: "Motion",
  ph: "Photo",
  photo: "Photo",
  sa: "Salt",
  salt: "Salt",
  san: "<25% Sanity",
  sanity: "<25% Sanity",
  sm: "Smudge",
  smudge: "Smudge",
};

const LOCATIONS = {
  ta: "Tanglewood",
  tangle: "Tanglewood",
  tanglewood: "Tanglewood",
  ed: "Edgefield",
  edge: "Edgefield",
  edgefield: "Edgefield",
  ri: "Ridgeview",
  ridge: "Ridgeview",
  ridgeview: "Ridgeview",
  gr: "Grafton",
  grafton: "Grafton",
  bl: "Bleasdale",
  bleasdale: "Bleasdale",
  hi: "High School",
  hs: "High School",
  high: "High School",
  school: "High School",
  brown: "High School",
  brownstone: "High School",
  pr: "Prison",
  prison: "Prison",
  as: "Asylum",
  asylum: "Asylum",
};

const DIFFICULTY = {
  a: "Amateur",
  am: "Amateur",
  amateur: "Amateur",
  i: "Intermediate",
  int: "Intermediate",
  intermediate: "Intermediate",
  p: "Professional",
  pro: "Professional",
  professional: "Professional",
};

// Constants for displaying evidence on the widget
const EVIDENCE_OFF = 0,
  EVIDENCE_ON = 1,
  EVIDENCE_IMPOSSIBLE = 2,
  EVIDENCE_COMPLETE_IMPOSSIBLE = 3;

const EVIDENCE_NAMES_IN_DOM = [
  "emf",
  "spiritBox",
  "fingerprints",
  "orbs",
  "writing",
  "freezing",
];

// Permission levels for commands
const PERMISSION_GLITCHED = 0,
  PERMISSION_BROADCASTER = 1,
  PERMISSION_MOD = 2,
  PERMISSION_VIP = 3;

// TODO: Move all widget and user state to here
let userState = {
  boner: false,
  channelName: "",
  conclusionString: "",
  counter: 0,
  evidence: {
    emf: EVIDENCE_OFF,
    spiritBox: EVIDENCE_OFF,
    fingerprints: EVIDENCE_OFF,
    orbs: EVIDENCE_OFF,
    writing: EVIDENCE_OFF,
    freezing: EVIDENCE_OFF,
  },
  evidenceDisplay: {
    emf: EVIDENCE_OFF,
    spiritBox: EVIDENCE_OFF,
    fingerprints: EVIDENCE_OFF,
    orbs: EVIDENCE_OFF,
    writing: EVIDENCE_OFF,
    freezing: EVIDENCE_OFF,
  },
  ghostName: "",
  location: {
    locationName: "",
    locationDiff: "",
  },
  optionalObjectives: [
    // Object Format:
    // {
    //   text: objective,
    //   strike: true/false
    // }
  ],
  ouija: false,
};

let config = {};

const runCommandWithPermission = (permission, data, command, commandArgs) => {
  if (hasPermission(permission, getUserLevelFromData(data))) {
    command(...commandArgs);
  }
  updateDashboardDOM(userState);
};

const getUserLevelFromData = (data) => {
  let level = 999;
  let badges = data.badges;
  let badgeLevel = 999;

  for (let i = 0; i < badges.length; i++) {
    if (data.displayName.toLowerCase() === "glitchedmythos") {
      badgeLevel = PERMISSION_GLITCHED;
    } else if (badges[i].type === "broadcaster") {
      badgeLevel = PERMISSION_BROADCASTER;
    } else if (badges[i].type === "moderator") {
      badgeLevel = PERMISSION_MOD;
    } else if (badges[i].type === "vip") {
      badgeLevel = PERMISSION_VIP;
    }
  }

  level = badgeLevel < level ? badgeLevel : level;

  return level;
};

// If user level is equal to or less than permission level, then they have permission
const hasPermission = (permission, userLevel) => {
  return userLevel <= permission;
};

// For commands where VIP's are allowed to help
const modOrVIPPermission = (configuration) => {
  return configuration.allowVIPS ? PERMISSION_VIP : PERMISSION_MOD;
};

window.addEventListener("onWidgetLoad", function (obj) {
  // Field data from Stream Elements from the overlay settings the user set
  const fieldData = obj.detail.fieldData;

  // Sets up all the bars for the widget
  config.bars = [
    fieldData["barOne"],
    fieldData["barTwo"],
    fieldData["barThree"],
    fieldData["barFour"],
    fieldData["barFive"],
    fieldData["barSix"],
    fieldData["barSeven"],
    fieldData["barEight"],
    fieldData["barNine"],
    fieldData["barTen"],
  ];

  setUpWidgetDom(config.bars, fieldData);

  // Sets up all the commands for the widget
  config.commands = {
    [fieldData["resetCommand"]]: (data) => {
      runCommandWithPermission(modOrVIPPermission(config), data, _resetGhost, [
        data.text,
        userState,
      ]);
    },
    [fieldData["nameCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _setGhostName,
        [data.text, userState]
      );
    },
    [fieldData["firstnameCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _setGhostFirstName,
        [data.text, userState]
      );
    },
    [fieldData["surnameCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _setGhostSurName,
        [data.text, userState]
      );
    },
    [fieldData["locationNameCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _setLocationName,
        [data.text, userState]
      );
    },
    [fieldData["locationDiffCommand"]]: (data) => {
      runCommandWithPermission(modOrVIPPermission(config), data, _setDiffName, [
        data.text,
        userState,
      ]);
    },
    [fieldData["bonerCommand"]]: (data) => {
      runCommandWithPermission(modOrVIPPermission(config), data, _toggleBoner, [
        userState,
      ]);
    },
    [fieldData["ouijaCommand"]]: (data) => {
      runCommandWithPermission(modOrVIPPermission(config), data, _toggleOuija, [
        userState,
      ]);
    },
    [fieldData["emfCommand"]]: (data) => {
      runCommandWithPermission(modOrVIPPermission(config), data, _toggleEMF, [
        userState,
      ]);
    },
    [fieldData["spiritBoxCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _toggleSpiritBox,
        [userState]
      );
    },
    [fieldData["fingerprintsCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _toggleFingerprints,
        [userState]
      );
    },
    [fieldData["orbsCommand"]]: (data) => {
      runCommandWithPermission(modOrVIPPermission(config), data, _toggleOrbs, [
        userState,
      ]);
    },
    [fieldData["writingCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _toggleWriting,
        [userState]
      );
    },
    [fieldData["freezingCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _toggleFreezing,
        [userState]
      );
    },
    [fieldData["optionalObjectivesCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _setOptionalObjectives,
        [data.text, userState]
      );
    },
    [fieldData["toggleOptObjOneCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _toggleOptionalObjective,
        [0, userState] // The position in array
      );
    },
    [fieldData["toggleOptObjTwoCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _toggleOptionalObjective,
        [1, userState] // The position in array
      );
    },
    [fieldData["toggleOptObjThreeCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _toggleOptionalObjective,
        [2, userState] // The position in array
      );
    },
    [fieldData["vipToggleOnCommand"]]: (data) => {
      runCommandWithPermission(PERMISSION_MOD, data, _toggleOptionalObjective, [
        true,
      ]);
    },
    [fieldData["vipToggleOffCommand"]]: (data) => {
      runCommandWithPermission(PERMISSION_MOD, data, _toggleOptionalObjective, [
        true,
      ]);
    },
    [fieldData["setCounterNameCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _setCounterName,
        [data.text]
      );
    },
    [fieldData["setCounterNumberCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _setCounterNumber,
        [data.text]
      );
    },
    [fieldData["incrementCounterCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _incrementCounter,
        []
      );
    },
    [fieldData["decrementCounterCommand"]]: (data) => {
      runCommandWithPermission(
        modOrVIPPermission(config),
        data,
        _decrementCounter,
        []
      );
    },
    "!glitchedmythos": (data) => {
      runCommandWithPermission(PERMISSION_GLITCHED, data, _glitchedMythos, [
        data.text,
      ]);
    },
  };

  // Configuration based on user choices
  config.allowVIPS = fieldData["allowVIPS"] === "yes" ? true : false;
  config.conclusionStrings = {
    zeroEvidenceConclusionString: fieldData["zeroEvidenceConclusionString"]
      ? fieldData["zeroEvidenceConclusionString"]
      : "Waiting for Evidence",
    oneEvidenceConclusionString: fieldData["oneEvidenceConclusionString"]
      ? fieldData["oneEvidenceConclusionString"]
      : "Not sure yet...",
    tooMuchEvidence: fieldData["impossibleConclusionString"]
      ? fieldData["impossibleConclusionString"]
      : "Too Much Evidence",
  };
  config.ghosts = [
    {
      type: "Banshee",
      conclusion: createGhostConclusionString(
        fieldData["bansheeString"],
        "Banshee"
      ),
      evidence: BANSHEE,
    },
    {
      type: "Demon",
      conclusion: createGhostConclusionString(
        fieldData["demonString"],
        "Demon"
      ),
      evidence: DEMON,
    },
    {
      type: "Hantu",
      conclusion: createGhostConclusionString(
        fieldData["hantuString"],
        "Hantu"
      ),
      evidence: HANTU,
    },
    {
      type: "Jinn",
      conclusion: createGhostConclusionString(fieldData["jinnString"], "Jinn"),
      evidence: JINN,
    },
    {
      type: "Mare",
      conclusion: createGhostConclusionString(fieldData["mareString"], "Mare"),
      evidence: MARE,
    },
    {
      type: "Oni",
      conclusion: createGhostConclusionString(fieldData["oniString"], "Oni"),
      evidence: ONI,
    },
    {
      type: "Phantom",
      conclusion: createGhostConclusionString(
        fieldData["phantomString"],
        "Phantom"
      ),
      evidence: PHANTOM,
    },
    {
      type: "Poltergeist",
      conclusion: createGhostConclusionString(
        fieldData["poltergeistString"],
        "Poltergeist"
      ),
      evidence: POLTERGEIST,
    },
    {
      type: "Revenant",
      conclusion: createGhostConclusionString(
        fieldData["revenantString"],
        "Revenant"
      ),
      evidence: REVENANT,
    },
    {
      type: "Shade",
      conclusion: createGhostConclusionString(
        fieldData["shadeString"],
        "Shade"
      ),
      evidence: SHADE,
    },
    {
      type: "Spirit",
      conclusion: createGhostConclusionString(
        fieldData["spiritString"],
        "Spirit"
      ),
      evidence: SPIRIT,
    },
    {
      type: "Wraith",
      conclusion: createGhostConclusionString(
        fieldData["wraithString"],
        "Wraith"
      ),
      evidence: WRAITH,
    },
    {
      type: "Yokai",
      conclusion: createGhostConclusionString(
        fieldData["yokaiString"],
        "Yokai"
      ),
      evidence: YOKAI,
    },
    {
      type: "Yurei",
      conclusion: createGhostConclusionString(
        fieldData["yureiString"],
        "Yurei"
      ),
      evidence: YUREI,
    },
  ];
  config.markImpossibleEvidence =
    fieldData["markImpossibleEvidence"] === "yes" ? true : false;
  config.nameStrings = {
    noNameString: fieldData["noNameString"]
      ? fieldData["noNameString"]
      : "A New Ghostie",
    ghostNameString: fieldData["ghostNameString"]
      ? fieldData["ghostNameString"]
      : "Name: [name]",
    autoCapitalize: fieldData["autoCapitalize"] === "yes" ? true : false,
  };
  config.locationNameStrings = {
    noLocationString: fieldData["noLocationString"]
      ? fieldData["noLocationString"]
      : "No Map Selected...",
  };
  config.optionalObj = {
    noOptionalString: fieldData["noOptionalObjectivesMessage"],
    spacing: fieldData["objectivesSpacing"],
  };
  config.useEvidenceImpossibleCompleted =
    fieldData["useEvidenceImpossibleCompleted"] === "yes" ? true : false;

  // TODO: Refactor to set up in config
  let displayName = fieldData["displayName"] === "yes" ? true : false;
  let displayLocation = fieldData["displayLocation"] === "yes" ? true : false;
  let displayBoner = fieldData["displayBoner"] === "yes" ? true : false;
  let displayOuija = fieldData["displayOuija"] === "yes" ? true : false;
  let displayCounter = fieldData["displayCounter"] === "yes" ? true : false;
  let displayOptionalObjectives =
    fieldData["displayOptionalObjectives"] === "yes" ? true : false;
  let displayConclusion =
    fieldData["displayConclusion"] === "yes" ? true : false;

  if (!displayName) {
    $(`#name`).addClass("hidden");
  }

  if (!displayLocation) {
    $(`#location-container`).addClass("hidden");
  }

  if (!displayBoner && !displayOuija) {
    $(`#location-optionals`).addClass("hidden");
  } else {
    if (!displayBoner) {
      $(`#boner-svg-container`).addClass("hidden");
    }
    if (!displayOuija) {
      console.log("hide ouija");
      $(`#ouija-svg-container`).addClass("hidden");
    }
  }

  if (!displayCounter) {
    $(`#counter-container`).addClass("hidden");
  }

  if (!displayOptionalObjectives) {
    $(`#optional-obj`).addClass(`hidden`);
  }

  if (!displayConclusion) {
    $(`#conclusion`).addClass("hidden");
  }

  let useGradientBorder =
    fieldData["useGradientBorder"] === "yes" ? true : false;
  let useAnimatedBorder =
    fieldData["useAnimatedBorder"] === "yes" ? true : false;

  if (useGradientBorder) {
    $("#phas-dashboard").addClass("animated-box");

    if (useAnimatedBorder) {
      $("#phas-dashboard").addClass("in");
      $("#phas-dashboard").addClass("animated-box-300");
    } else {
      $("#phas-dashboard").addClass("animated-box-100");
    }
  } else {
    $("#phas-dashboard").addClass("phas-border");
  }

  userState.conclusionString =
    config.conclusionStrings.zeroEvidenceConclusionString;

  resetGhost(null, userState);
  updateDashboardDOM(userState);
});

window.addEventListener("onEventReceived", function (obj) {
  // Grab relevant data from the event;
  let data = obj.detail.event.data;

  // Check if a matching command
  let givenCommand = data.text.split(" ")[0];

  if (config.commands[givenCommand.toLowerCase()]) {
    config.commands[givenCommand.toLowerCase()](data);
  } else {
    console.log("No command exists");
  }
});

/*******************************************************
 *                  COMMAND FUNCTIONS                  *
 *******************************************************/

const _resetGhost = (command, state) => {
  let commandArgument = command.split(" ").slice(1).join(" ");
  if (commandArgument.length > 0) {
    resetGhost(commandArgument, state);
  } else {
    resetGhost(null, state);
  }
};

const _setGhostName = (command, state) => {
  enteredName = command.split(" ").slice(1).join(" ");
  state.ghostName = config.nameStrings.autoCapitalize
    ? camelCase(enteredName)
    : enteredName;
};

const _setGhostFirstName = (command, state) => {
  enteredName = command.split(" ").slice(1).join(" ");
  currentName = state.ghostName ? state.ghostName.split(" ") : "";
  newName = currentName[1]
    ? enteredName + " " + currentName.slice(1).join(" ")
    : enteredName;
  state.ghostName = config.nameStrings.autoCapitalize
    ? camelCase(newName)
    : newName;
};

const _setGhostSurName = (command, state) => {
  enteredName = command.split(" ").slice(1).join(" ");
  currentName = state.ghostName ? state.ghostName.split(" ") : "";
  if (currentName[1]) {
    newName = currentName.slice(0, -1).join(" ") + " " + enteredName;
  } else if (currentName[0]) {
    newName = currentName[0] + " " + enteredName;
  } else {
    newName = enteredName;
  }
  state.ghostName = config.nameStrings.autoCapitalize
    ? camelCase(newName)
    : newName;
};

const _setLocationName = (command, state) => {
  commandArgument = command.split(" ").slice(1).join(" ");
  state.location.locationName = getLocationNameString(commandArgument);
};

const _setDiffName = (command, state) => {
  commandArgument = command.split(" ");
  commandArgument = commandArgument[1]
    ? commandArgument[1]
    : commandArgument[0];
  state.location.locationDiff = getDifficultyString(commandArgument);
};

const _toggleBoner = (state) => {
  state.boner = !state.boner;
};

const _toggleOuija = (state) => {
  state.ouija = !state.ouija;
};

const _toggleEMF = (state) => {
  state.evidence.emf = toggleEvidence(state.evidence.emf);
  calculateGhostEvidenceDisplay(state);
  determineConclusionMessage(state);
};

const _toggleSpiritBox = (state) => {
  state.evidence.spiritBox = toggleEvidence(state.evidence.spiritBox);
  calculateGhostEvidenceDisplay(state);
  determineConclusionMessage(state);
};

const _toggleFingerprints = (state) => {
  state.evidence.fingerprints = toggleEvidence(state.evidence.fingerprints);
  calculateGhostEvidenceDisplay(state);
  determineConclusionMessage(state);
};

const _toggleOrbs = (state) => {
  state.evidence.orbs = toggleEvidence(state.evidence.orbs);
  calculateGhostEvidenceDisplay(state);
  determineConclusionMessage(state);
};

const _toggleWriting = (state) => {
  state.evidence.writing = toggleEvidence(state.evidence.writing);
  calculateGhostEvidenceDisplay(state);
  determineConclusionMessage(state);
};

const _toggleFreezing = (state) => {
  state.evidence.freezing = toggleEvidence(state.evidence.freezing);
  calculateGhostEvidenceDisplay(state);
  determineConclusionMessage(state);
};

const _setOptionalObjectives = (command, state) => {
  let commandSplit = command.split(" ");
  let optObjCommands = commandSplit.slice(1);
  optObjCommands = optObjCommands.slice(Math.max(optObjCommands.length - 3, 0)); // Grabs only the last 3 commands

  if (optObjCommands.length === 1) {
    state.optionalObjectives = updateSingleOptionalObjective(
      state.optionalObjectives,
      optObjCommands[0]
    );
  } else {
    state.optionalObjectives = updateFullOptionalObjectives(...optObjCommands);
  }
};

const _toggleOptionalObjective = (objectiveNumber, state) => {
  toggleStrikethrough(objectiveNumber, state);
};

const _toggleVIPAccessibility = (canUseVIP) => {
  toggleVIPAccessibility(canUseVIP);
};

const _setCounterName = (command) => {
  commandArgument = command.split(" ").slice(1).join(" ");
  setCounterName(commandArgument);
};

const _setCounterNumber = (command) => {
  commandArgument = command.split(" ").slice(1).join(" ");
  setCounterNumber(commandArgument);
};

const _incrementCounter = () => {
  incrementCounter();
};

const _decrementCounter = () => {
  decrementCounter();
};

const _glitchedMythos = (command) => {
  commandArgument = command.split(" ").slice(1).join(" ");

  if (commandArgument) {
    writeOutVersion(commandArgument);
  } else {
    writeOutVersion(
      `Hello GlitchedMythos. Thank you for creating me. I am version ${version} of your widget. I think everyone should check you out at twitch.tv/glitchedmythos. Also ${userState.channelName} is absolutely AMAZING!`
    );
  }
};

/*******************************************************
 *                  LOGIC FUNCTIONS                    *
 *******************************************************/
const resetGhost = (newName, state) => {
  resetName(newName, state);
  resetLocationName(state);
  resetEvidence(state.evidence);
  resetEvidence(state.evidenceDisplay);
  resetOptionalObjectives([], state);
  resetConclusion(state);
};

const resetName = (newName, state) => {
  if (newName) {
    state.ghostName = config.nameStrings.autoCapitalize
      ? camelCase(newName)
      : newName;
  }
};

const resetLocationName = (state) => {
  state.location.locationName = config.locationNameStrings.noLocationString;
  state.location.locationDiff = "";
};

const resetOptionalObjectives = (optionalObjectives, state) => {
  if (optionalObjectives) {
    state.optionalObjectives = optionalObjectives;
  } else {
    state.optionalObjectives = [];
  }
};

const resetEvidence = (evidence) => {
  evidence.emf = EVIDENCE_OFF;
  evidence.spiritBox = EVIDENCE_OFF;
  evidence.fingerprints = EVIDENCE_OFF;
  evidence.orbs = EVIDENCE_OFF;
  evidence.writing = EVIDENCE_OFF;
  evidence.freezing = EVIDENCE_OFF;
};

const resetConclusion = (state) => {
  state.conclusionString =
    config.conclusionStrings.zeroEvidenceConclusionString;
};

const calculateGhostEvidenceDisplay = (state) => {
  // We do a deep copy to ensure there are no references
  let evidenceDisplay = JSON.parse(JSON.stringify(state.evidence));
  let evidenceString = createEvidenceString(evidenceDisplay);
  let numOfTrueEvidence = numOfTrueEvidenceInString(evidenceString);

  if (numOfTrueEvidence < 2) {
    evidenceDisplay = calculateSingleGhostEvidence(evidenceDisplay);
  } else if (numOfTrueEvidence === 2) {
    evidenceDisplay = calculateDoubleGhostEvidence(
      evidenceDisplay,
      evidenceString
    );
  } else if (numOfTrueEvidence === 3) {
    evidenceDisplay = calculateTripleGhostEvidence(
      evidenceDisplay,
      evidenceString
    );
  } else if (numOfTrueEvidence > 3) {
    evidenceDisplay = calculateBadEvidence(evidenceDisplay);
  }
  state.evidenceDisplay = evidenceDisplay;
};

const calculateSingleGhostEvidence = (evidence) => {
  // Here we need to ensure there is no impossible evidence
  for (let i = 0; i < EVIDENCE_NAMES_IN_DOM; i++) {
    if (evidence[EVIDENCE_NAMES_IN_DOM[i]] !== EVIDENCE_ON) {
      evidence[EVIDENCE_NAMES_IN_DOM[i]] = EVIDENCE_OFF;
    }
  }

  return evidence;
};

const calculateDoubleGhostEvidence = (evidence, evidenceString) => {
  let possibleGhosts = getGhostPossibilities(evidenceString);
  let impossibleEvidence = getImpossibleEvidence(possibleGhosts);

  // Addition shorthand prior to impossibleEvidence converts the string to a number
  // EMF-5 | Freezing | Spirit Box | Writing | Orbs | Fingerprints
  if (+impossibleEvidence[0] == 0) {
    evidence.emf = EVIDENCE_IMPOSSIBLE;
  }

  if (+impossibleEvidence[1] == 0) {
    evidence.freezing = EVIDENCE_IMPOSSIBLE;
  }

  if (+impossibleEvidence[2] == 0) {
    evidence.spiritBox = EVIDENCE_IMPOSSIBLE;
  }

  if (+impossibleEvidence[3] == 0) {
    evidence.writing = EVIDENCE_IMPOSSIBLE;
  }

  if (+impossibleEvidence[4] == 0) {
    evidence.orbs = EVIDENCE_IMPOSSIBLE;
  }

  if (+impossibleEvidence[5] == 0) {
    evidence.fingerprints = EVIDENCE_IMPOSSIBLE;
  }

  return evidence;
};

const calculateTripleGhostEvidence = (evidence, evidenceString) => {
  let possibleGhosts = getGhostPossibilities(evidenceString);

  if (possibleGhosts.length === 0) {
    for (const val in evidence) {
      if (evidence[val] === EVIDENCE_ON) {
        evidence[val] = EVIDENCE_IMPOSSIBLE;
      } else {
        evidence[val] = EVIDENCE_OFF;
      }
    }
  } else {
    for (let i = 0; i < EVIDENCE_NAMES_IN_DOM.length; i++) {
      if (evidence[EVIDENCE_NAMES_IN_DOM[i]] !== EVIDENCE_ON) {
        evidence[EVIDENCE_NAMES_IN_DOM[i]] = EVIDENCE_COMPLETE_IMPOSSIBLE;
      }
    }
  }

  return evidence;
};

const calculateBadEvidence = (evidence) => {
  for (let i = 0; i < EVIDENCE_NAMES_IN_DOM.length; i++) {
    if (evidence[EVIDENCE_NAMES_IN_DOM[i]] === EVIDENCE_ON) {
      evidence[EVIDENCE_NAMES_IN_DOM[i]] = EVIDENCE_IMPOSSIBLE;
    } else {
      evidence[EVIDENCE_NAMES_IN_DOM[i]] = EVIDENCE_OFF;
    }
  }

  return evidence;
};

const updateSingleOptionalObjective = (optionalObjectives, objective) => {
  let objectiveString = getOptObjectiveString(objective);

  let oldOptionalObjective = optionalObjectives.findIndex(
    (item) => item.text === objectiveString
  );

  if (oldOptionalObjective >= 0) {
    optionalObjectives.splice(oldOptionalObjective, 1);
  } else if (optionalObjectives.length < 3) {
    optionalObjectives.push({ text: objectiveString, strike: false });
  }
  return optionalObjectives;
};

const updateFullOptionalObjectives = (
  objectiveOne,
  objectiveTwo,
  objectiveThree
) => {
  let optionalObjectives = [];
  optionalObjectives.push({
    text: getOptObjectiveString(objectiveOne),
    strike: false,
  });
  optionalObjectives.push({
    text: getOptObjectiveString(objectiveTwo),
    strike: false,
  });
  optionalObjectives.push({
    text: getOptObjectiveString(objectiveThree),
    strike: false,
  });

  return optionalObjectives;
};

const determineConclusionMessage = (state) => {
  let displayEvidenceString = createEvidenceString(state.evidenceDisplay);
  let numOfDisplayTrueEvidence = numOfTrueEvidenceInString(
    displayEvidenceString
  );

  let userEvidenceString = createEvidenceString(state.evidence);
  let numberOfUserTrueEvidence = numOfTrueEvidenceInString(userEvidenceString);

  if (numOfDisplayTrueEvidence < 1 && numberOfUserTrueEvidence < 1) {
    state.conclusionString =
      config.conclusionStrings.zeroEvidenceConclusionString;
  } else if (numOfDisplayTrueEvidence === 1) {
    state.conclusionString =
      config.conclusionStrings.oneEvidenceConclusionString;
  } else if (numOfDisplayTrueEvidence === 2) {
    let ghostPossibilities = getGhostPossibilities(displayEvidenceString);
    let ghostPossibilityStrings = ghostPossibilities.map((ghost) => ghost.type);
    state.conclusionString = `Could be a ` + ghostPossibilityStrings.join(", ");
  } else if (numOfDisplayTrueEvidence === 3) {
    let ghostPossibilities = getGhostPossibilities(displayEvidenceString);
    let ghostPossibilityStrings = ghostPossibilities.map((ghost) => ghost.type);

    state.conclusionString =
      ghostPossibilityStrings.length === 0
        ? config.conclusionStrings.tooMuchEvidence
        : ghostPossibilities[0].conclusion;
  } else {
    state.conclusionString = config.conclusionStrings.tooMuchEvidence;
  }
};

/*******************************************************
 *                  HELPER FUNCTIONS                   *
 *******************************************************/

const toggleEvidence = (evidence) => {
  if (evidence === EVIDENCE_ON) {
    evidence = EVIDENCE_OFF;
  } else {
    evidence = EVIDENCE_ON;
  }
  return evidence;
};

const getLocationNameString = (location) => {
  let locationSplit = location.split(" ");
  if (locationSplit[1]) {
    _setDiffName(locationSplit[1].toLowerCase(), userState);
  }
  updateLocationName(LOCATIONS[locationSplit[0].toLowerCase()]);
};

const getDifficultyString = (difficulty) => {
  updateLocationDiff(DIFFICULTY[difficulty.toLowerCase()]);
};

// Returns each first character capitalized
const camelCase = (sentence) => {
  return sentence.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
    letter.toUpperCase()
  );
};

const toggleVIPAccessibility = (canUseVIP) => {
  if (canUseVIP !== undefined && canUseVIP !== null) {
    config.allowVIPS = canUseVIP;
  } else {
    config.allowVIPS = !config.allowVIPS;
  }
};

const createEvidenceString = (evidence) => {
  let evidenceString = "";

  evidenceString =
    evidence.emf === EVIDENCE_ON ? evidenceString + "1" : evidenceString + "0";
  evidenceString =
    evidence.freezing === EVIDENCE_ON
      ? evidenceString + "1"
      : evidenceString + "0";
  evidenceString =
    evidence.spiritBox === EVIDENCE_ON
      ? evidenceString + "1"
      : evidenceString + "0";
  evidenceString =
    evidence.writing === EVIDENCE_ON
      ? evidenceString + "1"
      : evidenceString + "0";
  evidenceString =
    evidence.orbs === EVIDENCE_ON ? evidenceString + "1" : evidenceString + "0";
  evidenceString =
    evidence.fingerprints === EVIDENCE_ON
      ? evidenceString + "1"
      : evidenceString + "0";

  return evidenceString;
};

const numOfTrueEvidenceInString = (evidenceString) => {
  let index,
    count = 0;
  for (index = 0; index < evidenceString.length; ++index) {
    count = evidenceString.charAt(index) == "1" ? count + 1 : count;
  }

  return count;
};

const getGhostPossibilities = (evidenceString) => {
  // List of ghosts returns [<evidenceString>, <Name>]
  const possibleGhosts = [];
  const numOfTrueEvidence = numOfTrueEvidenceInString(evidenceString);

  for (let i = 0; i < config.ghosts.length; i++) {
    let evidenceMatch = 0;
    let ghostToCheck = config.ghosts[i];

    for (let j = 0; j < evidenceString.length; j++) {
      if (evidenceString.charAt(j) == "1") {
        if (evidenceString.charAt(j) == ghostToCheck.evidence.charAt(j)) {
          evidenceMatch = evidenceMatch + 1;
        }
      }
    }

    if (evidenceMatch == numOfTrueEvidence && evidenceMatch > 1) {
      possibleGhosts.push(config.ghosts[i]);
    }
  }

  return possibleGhosts;
};

const getImpossibleEvidence = (possibleGhosts) => {
  let impossibleEvidenceString = "000000"; // If it stays a 0, we know it can't match any of the ghosts
  for (let i = 0; i < possibleGhosts.length; i++) {
    for (let k = 0; k < impossibleEvidenceString.length; k++) {
      impossibleEvidenceString =
        impossibleEvidenceString.substr(0, k) +
        `${+impossibleEvidenceString[k] + +possibleGhosts[i].evidence[k]}` +
        impossibleEvidenceString.substr(k + 1);
      impossibleEvidenceString[k] = `${
        +impossibleEvidenceString[k] + +possibleGhosts[i].evidence[k]
      }`; // possibleGhosts[ghost][ghost evidence string][position in evidence string]
    }
  }
  return impossibleEvidenceString;
};

const createGhostConclusionString = (conclusionString, ghostType) => {
  return conclusionString ? conclusionString : `It's a ${ghostType}!!`;
};

const getOptObjectiveString = (obj) => {
  return OPTIONAL_OBJECTIVES[obj.toLowerCase()];
};

const getNumberString = (num) => {
  const numStrings = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  return numStrings[num];
};

/*******************************************************
 *             DOM MANIPULATING FUNCTIONS              *
 *******************************************************/

const updateDashboardDOM = (state) => {
  updateNameDOM(state.ghostName);
  updateLocationName(state.location.locationName);
  updateLocationDiff(state.location.locationDiff);
  updateBoner(state.boner);
  updateOuija(state.ouija);
  updateEvidenceDOM(state.evidenceDisplay);
  updateOptionalObjectivesDOM(state.optionalObjectives);
  updateConclusion(state.conclusionString);
};

/** NAME RELATED DOM MANIPULATING FUNCTIONS */
const updateNameDOM = (newName) => {
  let nameString = "" + config.nameStrings.ghostNameString;

  /**
   * Replaces "[name]" with the name of the ghost, allowing the user to paramaterize
   * the name for things such as "Name: [name]" === "Name: John Doe"
   */
  nameString = nameString.replace(/\[name\]/g, newName);
  $("#name").html(`${newName ? nameString : config.nameStrings.noNameString}`);
};

/** EVIDENCE RELATED DOM MANIPULATING FUNCTIONS */
const updateEvidenceDOM = (evidence) => {
  resetEvidenceDOM();
  for (let i = 0; i < EVIDENCE_NAMES_IN_DOM.length; i++) {
    let evidenceDom = $(`#${EVIDENCE_NAMES_IN_DOM[i]}-svg`);
    switch (evidence[EVIDENCE_NAMES_IN_DOM[i]]) {
      case EVIDENCE_ON:
        evidenceDom.addClass("active");
        break;
      case EVIDENCE_IMPOSSIBLE:
        evidenceDom.addClass("impossible");
        break;
      case EVIDENCE_COMPLETE_IMPOSSIBLE:
        evidenceDom.addClass("impossible-completed");
        break;
      case EVIDENCE_OFF:
      default:
        evidenceDom.addClass("inactive");
        break;
    }
  }
};

const resetEvidenceDOM = () => {
  for (let i = 0; i < EVIDENCE_NAMES_IN_DOM.length; i++) {
    $(`#${EVIDENCE_NAMES_IN_DOM[i]}-svg`).removeClass([
      "active",
      "inactive",
      "impossible",
      "impossible-completed",
    ]);
  }
};

/** OPTIONAL OBJECTIVE RELATED DOM MANIPULATING FUNCTIONS */
const updateOptionalObjectivesDOM = (optionalObjectives) => {
  resetOptionalDOM();

  if (config.optionalObj.spacing === "justify-evenly") {
    updateOptionalObjectivesDOMEvenly(optionalObjectives);
  } else if (optionalObjectives.length > 0) {
    $("#optional-obj-container").removeClass("hidden");
    $("#no-opt-objectives-container").addClass("hidden");
    for (let i = 0; i < optionalObjectives.length; i++) {
      $("#optional-obj-container").append(
        $("<div>", {
          class: `objective px-0.5 ${
            optionalObjectives[i].strike ? " strikethrough" : ""
          }`,
          id: `objective-${getNumberString(i + 1)}`,
          text: optionalObjectives[i].text,
        })
      );
    }
  }
};

const updateOptionalObjectivesDOMEvenly = (optionalObjectives) => {
  if (optionalObjectives.length > 0) {
    $("#optional-obj-container").removeClass("hidden");
    $("#no-opt-objectives-container").addClass("hidden");

    if (optionalObjectives[0]) {
      $("#optional-obj-container").append(
        $("<div>", {
          class: `objective w-1/3 text-left${
            optionalObjectives[0].strike ? " strikethrough" : ""
          }`,
          id: "objective-one",
          text: optionalObjectives[0].text,
        })
      );
    }
    if (optionalObjectives[1]) {
      $("#optional-obj-container").append(
        $("<div>", {
          class: `objective w-1/3 text-center${
            optionalObjectives[1].strike ? " strikethrough" : ""
          }`,
          id: "objective-two",
          text: optionalObjectives[1].text,
        })
      );
    }
    if (optionalObjectives[2]) {
      $("#optional-obj-container").append(
        $("<div>", {
          class: `objective w-1/3 text-right${
            optionalObjectives[2].strike ? " strikethrough" : ""
          }`,
          id: "objective-three",
          text: optionalObjectives[2].text,
        })
      );
    }
  }
};

const resetOptionalDOM = () => {
  $("#optional-obj-container").empty();
  $("#optional-obj-container").addClass("hidden");
  $("#no-opt-objectives-container").removeClass("hidden");
};

const toggleStrikethrough = (optionalNumber, state) => {
  state.optionalObjectives[optionalNumber].strike =
    !state.optionalObjectives[optionalNumber].strike;
};

/** LOCATION RELATED DOM MANIPULATING FUNCTIONS */
const updateLocationName = (location) => {
  $("#location-name").html(location);
};

const updateLocationDiff = (diff) => {
  $("#location-difficulty").html(diff);
};

const updateBoner = (boner) => {
  $(`#boner`).removeClass(["boner-active", "boner-inactive"]);
  $(`#boner`).addClass(boner ? "boner-active" : "boner-inactive");
};

const updateOuija = (ouija) => {
  $(`#ouija`).removeClass(["ouija-active", "ouija-inactive"]);
  $(`#ouija`).addClass(ouija ? "ouija-active" : "ouija-inactive");
};

/** CONCLUSION RELATED DOM MANIPULATING FUNCTIONS */
const updateConclusion = (conclusion) => {
  $("#conclusion").html(conclusion);
};

/** COUNTER RELATED DOM MANIPULATING FUNCTIONS */
const setCounterName = (name) => {
  $("#counter-name").html(name);
};

const setCounterNumber = (number) => {
  let num = parseInt(number);

  if (Number.isInteger(num)) {
    $("#counter-number").text("" + num);
  }
};

const incrementCounter = (num) => {
  let counter = $("#counter-number");
  counter.text(parseInt(counter.text()) + (num ? num : 1));
};

const decrementCounter = (num) => {
  let counter = $("#counter-number");
  counter.text(parseInt(dom.text()) - (num ? num : 1));
};

/**
 * GlitchedMythos Only
 */

let speed = 100;
let cursorSpeed = 400;
let time = 0;
let prevTime = 200;

const writeMessage = (word) => {
  for (let c in word.split("")) {
    time = Math.floor(Math.random() * speed);

    setTimeout(() => {
      $("#text").before(word[c]);
    }, prevTime + time);

    prevTime += time;
  }

  return prevTime;
};

const writeOutVersion = (command) => {
  $("#version").addClass("show-version-item");
  setTimeout(() => {
    let time = writeMessage(command);
    setTimeout(() => {
      $("#version").removeClass("show-version-item");
      prevTime = 0;
      time = 0;
      setTimeout(() => {
        $("#console-container").empty();
        $("#console-container").append($(`<span class="prompt">>  </span>`));
        $("#console-container").append($(`<div id="text"></div>`));
        $("#console-container").append($(`<div class="cursor"></div>`));
      }, 2000);
    }, time + 2000);
  }, 1000);
};

/*******************************************************
 *                DOM SETUP FUNCTIONS                  *
 *******************************************************/

const setUpWidgetDom = (bars, fieldData) => {
  const bars_master = getBarsMaster(fieldData);
  bars.forEach((bar) => {
    $(`#phas-dashboard`).append(bars_master[bar]);
  });
};

const getBarsMaster = (fieldData) => {
  return {
    name: createNameDom(fieldData),
    location: createLocationDom(fieldData),
    evidence: createEvidenceDom(fieldData),
    counter: createCounterDom(fieldData),
    "optional-objectives": createOptionalObjectivesDom(fieldData),
    conclusion: createConclusionDom(fieldData),
  };
};

const createNameDom = (fieldData) => {
  return `<div class="name" id="name">${fieldData["noNameString"]}</div>`;
};

const createLocationDom = (fieldData) => {
  return `<div class="flex flex-row ${fieldData["locationSpacing"]}" id="location-container">
  <div class="location-theme mr-0.5 pb-0.5" id="location-name">
  ${fieldData["noLocationString"]}
  </div>
  <div class="location-theme" id="location-difficulty"></div>
  <div class="location-optionals flex flex-row" id="location-optionals">
    <div class="boner-svg-container" id="boner-svg-container">
      <svg
        id="boner"
        class="boner-inactive"
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 301.32 301.32"
      >
        <g>
          <g>
            <path
              d="M290.653,45.771c-6.561-6.56-15.388-10.286-24.479-10.625c-0.339-9.091-4.065-17.92-10.624-24.479
         C248.671,3.789,239.524,0,229.797,0s-18.873,3.789-25.752,10.667c-5.54,5.541-9.087,12.556-10.255,20.285
         c-3.502,23.188-14.534,45.061-31.063,61.59l-70.185,70.185c-16.529,16.529-38.402,27.562-61.591,31.063
         c-7.729,1.168-14.743,4.715-20.283,10.255C3.789,210.924,0,220.069,0,229.797s3.789,18.874,10.667,25.753
         c6.561,6.56,15.388,10.286,24.479,10.624c0.34,9.091,4.065,17.919,10.625,24.479c6.879,6.879,16.024,10.668,25.752,10.668
         s18.874-3.789,25.753-10.667c5.541-5.542,9.087-12.557,10.254-20.285c3.554-23.523,14.295-44.821,31.063-61.589l70.186-70.186
         c16.768-16.769,38.065-27.51,61.588-31.063c7.729-1.167,14.744-4.713,20.286-10.254c6.878-6.879,10.667-16.025,10.667-25.753
         S297.531,52.65,290.653,45.771z M280.046,86.669c-3.259,3.26-7.38,5.345-11.918,6.029c-26.715,4.036-50.905,16.238-69.956,35.288
         l-70.186,70.186c-19.05,19.051-31.252,43.241-35.288,69.957c-0.685,4.537-2.77,8.658-6.029,11.917
         c-4.045,4.046-9.424,6.274-15.146,6.274c-5.721,0-11.1-2.229-15.145-6.274c-5.375-5.374-7.478-12.993-5.626-20.38
         c0.642-2.558-0.107-5.264-1.971-7.128c-1.425-1.424-3.339-2.196-5.304-2.196c-0.607,0-1.22,0.074-1.824,0.226
         c-7.386,1.85-15.006-0.251-20.38-5.625C17.229,240.897,15,235.519,15,229.797c0-5.721,2.229-11.1,6.274-15.145
         c3.259-3.26,7.38-5.345,11.918-6.03c26.333-3.978,51.178-16.51,69.957-35.288l70.185-70.185
         c18.778-18.779,31.311-43.624,35.288-69.956c0.686-4.539,2.771-8.66,6.03-11.92c4.045-4.045,9.424-6.273,15.145-6.273
         c5.722,0,11.101,2.229,15.146,6.274c5.374,5.373,7.477,12.992,5.625,20.38c-0.642,2.558,0.107,5.264,1.971,7.128
         c1.864,1.864,4.567,2.612,7.128,1.971c7.389-1.852,15.006,0.251,20.381,5.626c4.045,4.045,6.273,9.424,6.273,15.145
         C286.32,77.245,284.092,82.624,280.046,86.669z"
            />
          </g>
          <g>
            <circle cx="63.45" cy="217.518" r="6.933" />
          </g>
          <g>
            <path
              d="M45.812,212.556c-12.036,0-21.828,9.792-21.828,21.828c0,4.143,3.357,7.5,7.5,7.5s7.5-3.357,7.5-7.5
         c0-3.765,3.063-6.828,6.828-6.828c4.143,0,7.5-3.357,7.5-7.5S49.954,212.556,45.812,212.556z"
            />
          </g>
        </g>
      </svg>
    </div>
    <div class="ouija-svg-container" id="ouija-svg-container">
      <svg
        id="ouija"
        class="ouija-inactive"
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <g>
          <path d="m362 391h15v15h-15z" />
          <path
            d="m489.5 46h-467c-12.406 0-22.5 10.093-22.5 22.5v150h15v-71.893l16.82-16.82c14.551 9.624 34.392 8.035 47.197-4.771 12.805-12.805 14.395-32.645 4.771-47.197l16.82-16.819h310.784l16.82 16.819c-9.624 14.552-8.034 34.392 4.771 47.197 12.805 12.806 32.646 14.395 47.197 4.771l16.82 16.82v158.786l-16.82 16.82c-14.552-9.625-34.393-8.036-47.197 4.771-12.805 12.805-14.395 32.645-4.771 47.197l-16.82 16.819h-19.392v15h97.5c12.406 0 22.5-10.093 22.5-22.499v-315.001c0-12.407-10.094-22.5-22.5-22.5zm-426.393 31.287 5.303 5.303c4.25 4.25 6.591 9.9 6.591 15.91s-2.341 11.66-6.591 15.91c-8.771 8.772-23.047 8.773-31.819 0l-5.304-5.303-16.287 16.287v-56.894c0-4.135 3.364-7.5 7.5-7.5h56.894zm417.606 31.82-5.304 5.303c-8.771 8.773-23.048 8.772-31.819 0-4.25-4.25-6.591-9.9-6.591-15.91s2.341-11.66 6.591-15.91l5.303-5.303-16.287-16.287h56.894c4.136 0 7.5 3.364 7.5 7.5v56.894zm8.787 281.893h-56.894l16.287-16.286-5.303-5.303c-8.773-8.773-8.773-23.047 0-31.82 8.771-8.772 23.048-8.773 31.819 0l5.304 5.304 16.287-16.289v56.894c0 4.135-3.364 7.5-7.5 7.5z"
          />
          <path
            d="m226 398.5c0 16.542 13.458 30 30 30s30-13.458 30-30-13.458-30-30-30-30 13.458-30 30zm45 0c0 8.271-6.729 15-15 15s-15-6.729-15-15 6.729-15 15-15 15 6.729 15 15z"
          />
          <path
            d="m303.454 342.258c-12.367-18.202-28.48-32.97-44.209-40.52l-3.245-1.557-3.245 1.558c-15.729 7.55-31.842 22.318-44.209 40.52-11.092 16.326-17.892 33.345-19.604 48.741h-88.334l-16.82-16.819c9.624-14.552 8.034-34.392-4.771-47.197-12.805-12.806-32.646-14.395-47.197-4.771l-16.82-16.82v-71.893h-15v150c0 12.407 10.094 22.5 22.5 22.5h166.222c1.024 16.799 5.61 29.854 13.937 39.754 11.3 13.434 29.246 20.246 53.341 20.246s42.041-6.812 53.341-20.246c8.327-9.9 12.913-22.955 13.937-39.754h23.721v-15h-23.941c-1.712-15.397-8.512-32.416-19.604-48.742zm-288.454 41.242v-56.894l16.287 16.287 5.304-5.304c8.772-8.773 23.049-8.772 31.819 0 8.773 8.773 8.773 23.047 0 31.82l-5.303 5.303 16.287 16.288h-56.894c-4.136 0-7.5-3.365-7.5-7.5zm241 67.5c-36.309 0-52.5-16.192-52.5-52.5 0-27.934 25.079-66.438 52.5-81.563 27.421 15.125 52.5 53.63 52.5 81.563 0 36.308-16.191 52.5-52.5 52.5z"
          />
          <path
            d="m136.536 237.018 4.177-19.515 29.767-4.592 9.792 17.347 13.063-7.374-40.993-72.617-13.012 2.023-17.462 81.588zm26.062-38.069-18.526 2.858 5.536-25.868z"
          />
          <path
            d="m283.178 197.834c0-8.317-3.996-15.717-10.167-20.387 2.607-3.722 4.142-8.246 4.142-13.124 0-12.647-10.289-22.937-22.936-22.937h-11.987-15v15 67.118l7.533-.033c.002 0 17.919-.08 22.856-.08 14.094.001 25.559-11.464 25.559-25.557zm-28.96-41.447c4.376 0 7.936 3.561 7.936 7.937s-3.56 7.936-7.936 7.936l-11.987.019v-15.891h11.987zm3.402 52.005c-2.818 0-9.851.026-15.39.048v-21.162h15.39c5.821 0 10.558 4.736 10.558 10.557s-4.737 10.557-10.558 10.557z"
          />
          <path
            d="m365.67 154.482c-22.127-4.751-43.993 9.385-48.745 31.511-4.75 22.126 9.386 43.992 31.512 48.744 2.77.595 5.489.89 8.146.89 7.58 0 14.622-2.407 20.684-7.125l5.919-4.606-9.214-11.837-5.918 4.607c-4.639 3.61-10.178 4.758-16.467 3.407-14.04-3.015-23.01-16.89-19.995-30.929 3.016-14.041 16.893-23.01 30.931-19.994 5.103 1.096 9.701 3.655 13.297 7.4l5.194 5.41 10.82-10.389-5.194-5.41c-5.679-5.914-12.929-9.953-20.97-11.679z"
          />
          <path d="m127.5 91h30v15h-30z" />
          <path d="m354.5 91h30v15h-30z" />
          <path d="m203.5 91h105v15h-105z" />
          <path d="m340.728 323.5h15v30h-15z" />
          <path d="m156.271 323.5h15v30h-15z" />
          <path d="m126.272 323.5h15v30h-15z" />
          <path d="m370.728 323.5h15v30h-15z" />
          <path
            d="m285.999 257.056h15v14.999h-15z"
            transform="matrix(.07 -.998 .998 .07 8.926 538.69)"
          />
          <path
            d="m323.499 261.303h14.999v14.999h-14.999z"
            transform="matrix(.115 -.993 .993 .115 25.999 566.78)"
          />
          <path
            d="m360.256 267.459h15v15h-15z"
            transform="matrix(.153 -.988 .988 .153 39.937 596.489)"
          />
          <path
            d="m211.001 257.056h15v15h-15z"
            transform="matrix(.998 -.07 .07 .998 -18.077 16.034)"
          />
          <path d="m248.5 256h15v15h-15z" />
          <path
            d="m173.501 261.303h14.999v14.999h-14.999z"
            transform="matrix(.993 -.115 .115 .993 -29.634 22.532)"
          />
          <path
            d="m136.744 267.459h15v15h-15z"
            transform="matrix(.988 -.153 .153 .988 -40.239 25.209)"
          />
          <path d="m467 203.5h15v15h-15z" />
          <path d="m467 233.5h15v15h-15z" />
        </g>
      </svg>
    </div>
  </div>
</div>`;
};

const createEvidenceDom = (fieldData) => {
  return `<div class="flex flex-grow flex-row flex-wrap justify-between">
  <!-- EMF 5 SVG  -->
  <div class="svg-container">
    <svg
      id="emf-svg"
      class="evidence inactive"
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200.000000 200.000000"
    >
      <g
        transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)"
        stroke="none"
      >
        <path
          d="M70 990 l0 -420 230 0 231 0 -3 58 -3 57 -147 3 -148 3 0 124 0 125 120 0 120 0 0 60 0 60 -120 0 -120 0 0 115 0 114 148 3 147 3 3 58 3 57 -231 0 -230 0 0 -420z"
        />
        <path
          d="M670 990 l0 -420 75 0 75 0 2 288 3 287 66 -225 66 -225 52 -3 c28 -2 51 -2 51 0 0 11 130 441 134 446 3 3 6 -124 6 -281 l0 -287 80 0 80 0 0 420 0 420 -110 0 -109 0 -19 -62 c-10 -35 -38 -134 -62 -221 -24 -86 -47 -154 -51 -150 -4 5 -34 103 -66 218 l-60 210 -106 3 -107 3 0 -421z"
        />
        <path
          d="M1530 990 l0 -420 80 0 80 0 0 185 0 185 115 0 115 0 0 60 0 60 -115 0 -115 0 0 115 0 115 145 0 145 0 0 60 0 60 -225 0 -225 0 0 -420z"
        />
      </g>
    </svg>
  </div>
  <div class="svg-container">
    <!-- SPIRIT BOX SVG -->
    <svg
      id="spiritBox-svg"
      class="evidence inactive"
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512.000000 512.000000"
    >
      <g
        transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
        stroke="none"
      >
        <path
          d="M3055 5106 c-37 -17 -70 -52 -84 -89 -7 -19 -11 -224 -11 -617 l0
-590 -642 -2 c-630 -3 -644 -3 -683 -24 -22 -11 -53 -40 -70 -63 l-30 -43 -3
-1751 c-2 -1225 0 -1763 8 -1789 14 -50 56 -97 105 -119 38 -18 87 -19 915
-19 828 0 877 1 915 19 50 22 91 70 105 120 7 27 9 603 8 1788 l-3 1749 -27
41 c-43 65 -87 86 -190 91 l-88 4 0 587 c0 550 -2 589 -19 627 -10 23 -33 51
-51 64 -40 28 -113 36 -155 16z m265 -1728 c20 -21 20 -33 20 -475 0 -440 -1
-454 -20 -473 -20 -20 -33 -20 -764 -20 l-745 0 -15 22 c-14 20 -16 81 -16
473 0 440 0 452 20 473 l21 22 739 0 739 0 21 -22z m20 -1893 l0 -95 -780 0
-780 0 0 95 0 95 780 0 780 0 0 -95z m0 -440 l0 -95 -780 0 -780 0 0 95 0 95
780 0 780 0 0 -95z m0 -450 l0 -95 -780 0 -780 0 0 95 0 95 780 0 780 0 0 -95z"
        />
        <path
          d="M1780 3985 l0 -125 150 0 150 0 0 125 0 125 -150 0 -150 0 0 -125z"
        />
        <path
          d="M2230 3985 l0 -125 150 0 150 0 0 125 0 125 -150 0 -150 0 0 -125z"
        />
      </g>
    </svg>
  </div>
  <div class="svg-container">
    <!-- Fingerprints SVG                 -->
    <svg
      id="fingerprints-svg"
      class="evidence inactive"
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200.000000 200.000000"
    >
      <g
        transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)"
        stroke="none"
      >
        <path
          d="M792 1790 c-43 -18 -47 -50 -22 -162 12 -57 28 -114 35 -128 7 -14 9
-34 5 -45 -4 -11 0 -47 8 -80 8 -33 16 -86 17 -118 2 -32 9 -72 15 -88 11 -26
17 -29 56 -29 33 0 46 5 58 22 22 31 20 70 -4 100 -18 24 -19 28 -4 58 20 39
13 123 -12 151 -13 14 -14 24 -5 51 8 27 6 53 -13 138 -30 132 -59 160 -134
130z"
        />
        <path
          d="M1224 1766 c-16 -12 -20 -31 -25 -123 -3 -59 -3 -118 2 -129 5 -13 3
-26 -4 -33 -7 -7 -15 -51 -19 -99 -3 -48 -9 -109 -13 -137 -3 -27 -2 -56 3
-64 5 -7 30 -15 54 -18 39 -5 47 -2 62 18 18 27 21 62 5 90 -8 16 -5 26 17 52
24 29 26 37 21 96 -3 44 -1 71 8 85 7 12 16 66 19 122 6 92 5 103 -14 127 -17
21 -30 27 -59 27 -20 0 -46 -6 -57 -14z"
        />
        <path
          d="M440 1593 c-32 -12 -60 -47 -60 -75 0 -30 101 -192 126 -202 8 -3 14
-16 14 -30 0 -13 16 -48 36 -77 20 -30 49 -82 64 -115 17 -39 36 -64 49 -69
26 -8 88 21 96 45 9 30 -20 88 -49 96 -22 5 -23 9 -14 34 12 37 -18 110 -56
135 -19 13 -26 26 -26 49 0 40 -100 193 -136 206 -14 6 -26 10 -27 9 -1 0 -9
-3 -17 -6z"
        />
        <path
          d="M214 1128 c-27 -12 -44 -49 -37 -76 5 -19 132 -112 153 -112 5 0 15
-9 22 -21 7 -11 28 -30 47 -42 19 -11 57 -40 83 -64 27 -24 53 -43 59 -43 16
0 59 47 59 65 0 23 -37 55 -65 55 -19 0 -25 5 -25 23 0 26 -40 67 -82 85 -14
6 -29 19 -32 29 -6 17 -114 96 -146 107 -8 2 -25 0 -36 -6z"
        />
        <path
          d="M1045 1101 c-11 -5 -46 -10 -77 -10 -31 -1 -69 -6 -85 -12 -80 -30
-293 -321 -293 -400 0 -46 32 -77 85 -81 l40 -3 -3 -68 c-4 -84 18 -127 107
-209 126 -117 265 -147 355 -77 19 15 26 30 26 55 0 49 -12 67 -70 104 -55 35
-61 52 -35 113 8 20 15 58 15 84 0 65 31 122 106 196 67 66 73 80 49 111 -21
28 -19 44 10 78 25 30 25 30 7 62 -10 17 -31 37 -47 45 -35 17 -162 25 -190
12z"
        />
        <path
          d="M1630 1073 c-26 -26 -44 -56 -52 -87 -12 -44 -27 -64 -110 -140 -16
-14 -28 -36 -28 -50 0 -33 61 -86 90 -79 26 7 66 58 76 96 5 23 11 28 27 23
50 -13 155 67 182 138 28 73 -10 123 -100 134 -42 4 -47 2 -85 -35z"
        />
        <path
          d="M1277 794 c-21 -14 -58 -53 -83 -86 -41 -56 -44 -64 -44 -124 0 -36
-7 -80 -15 -99 l-14 -35 52 -38 c94 -69 100 -72 148 -72 57 0 126 35 155 78
28 41 37 106 24 169 -13 57 -70 159 -88 156 -7 -2 -18 -4 -24 -5 -8 -2 -14 10
-16 27 -7 61 -36 70 -95 29z"
        />
      </g>
    </svg>
  </div>
  <div class="svg-container">
    <!-- GHOST ORBS SVG -->
    <svg
      id="orbs-svg"
      class="evidence inactive"
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 880.000000 1115.000000"
    >
      <g
        transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)"
        stroke="none"
      >
        <path
          d="M8080 9745 c-346 -77 -615 -330 -712 -670 -20 -69 -23 -103 -23 -245
0 -142 3 -176 23 -245 91 -317 340 -566 657 -657 69 -20 103 -23 245 -23 142
0 176 3 245 23 317 91 566 340 657 657 20 69 23 103 23 245 0 142 -3 176 -23
245 -90 315 -340 566 -652 656 -98 28 -342 36 -440 14z"
        />
        <path
          d="M1972 8639 c-508 -12 -1212 -49 -1772 -94 -102 -8 -188 -15 -192 -15
-5 0 -8 -25 -8 -55 0 -55 0 -55 31 -55 17 0 37 7 45 15 9 8 26 15 40 15 15 0
24 -6 24 -15 0 -25 66 -20 73 5 4 15 14 20 36 20 24 0 31 -4 31 -20 0 -16 -7
-20 -35 -20 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35
-2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35
-35 -35 l-35 0 0 -83 0 -83 313 38 c962 116 1613 162 2287 161 823 0 1366 -51
1815 -168 154 -40 235 -70 353 -129 160 -81 249 -160 308 -276 21 -43 28 -73
32 -136 4 -75 2 -86 -24 -134 -92 -170 -414 -322 -984 -465 -272 -68 -512
-115 -1348 -260 -1350 -236 -2050 -361 -2489 -446 l-263 -51 0 -69 0 -69 35 0
c33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35
-2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -24
0 -35 -5 -35 -15 0 -17 -23 -20 -51 -5 -18 10 -19 7 -19 -38 l0 -49 137 -41
c967 -290 2349 -511 3788 -606 333 -22 997 -55 1134 -56 10 0 12 9 6 37 -13
73 -10 72 -157 69 -73 -1 -121 0 -105 2 23 3 27 8 27 38 0 32 2 34 35 34 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 31 35 28 0 31 3
25 22 -3 13 -6 29 -6 36 0 6 -11 12 -25 12 -22 0 -25 4 -25 35 0 24 5 35 15
35 21 0 20 56 -2 68 -13 8 -15 19 -10 57 4 26 4 71 1 101 -7 53 -7 54 -40 54
-32 0 -34 2 -34 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 2 35 34 35 25 0 36 -5 39 -17 2 -10 1 4 -1 31 -3 26 0 51 5 55 5
3 14 34 20 68 l9 61 -95 6 c-53 3 -159 8 -236 11 -346 15 -805 50 -1110 86
-1034 121 -1618 334 -1772 645 -32 67 -37 84 -37 152 0 61 5 86 23 121 119
228 572 429 1366 606 88 20 689 137 1335 260 2283 435 2219 422 2512 511 1177
357 1667 846 1468 1467 -48 151 -115 252 -265 402 -140 141 -278 242 -473 348
-781 423 -2072 715 -3632 822 -371 25 -603 35 -1055 45 -472 10 -571 10 -1063
-1z m58 -119 c0 -28 3 -30 35 -30 32 0 35 2 35 30 0 28 3 30 35 30 32 0 35 -2
35 -30 0 -28 3 -30 35 -30 32 0 35 2 35 30 0 28 3 30 35 30 32 0 35 -2 35 -30
0 -28 3 -30 35 -30 32 0 35 2 35 30 0 28 3 30 35 30 32 0 35 -2 35 -30 0 -28
3 -30 35 -30 32 0 35 2 35 30 0 28 3 30 35 30 32 0 35 -2 35 -30 0 -28 3 -30
35 -30 32 0 35 2 35 30 0 28 3 30 35 30 32 0 35 -2 35 -30 0 -28 3 -30 35 -30
32 0 35 2 35 30 0 28 3 30 35 30 32 0 35 -2 35 -30 0 -28 3 -30 35 -30 32 0
35 2 35 30 0 28 3 30 35 30 32 0 35 -2 35 -30 0 -28 3 -30 35 -30 32 0 35 2
35 31 0 28 2 30 33 27 27 -2 33 -8 35 -30 3 -25 8 -28 38 -28 30 0 34 3 34 25
0 22 4 25 35 25 31 0 35 -3 35 -25 0 -22 4 -25 35 -25 31 0 35 3 35 25 0 22 4
25 35 25 31 0 35 -3 35 -25 0 -22 4 -25 35 -25 28 0 35 4 35 20 0 16 7 20 35
20 28 0 35 -4 35 -20 0 -16 7 -20 35 -20 28 0 35 4 35 20 0 16 7 20 35 20 28
0 35 -4 35 -20 0 -16 7 -20 35 -20 24 0 35 5 35 15 0 10 11 15 35 15 24 0 35
-5 35 -15 0 -10 11 -15 35 -15 19 0 35 5 35 10 0 6 16 10 35 10 20 0 35 -5 35
-11 0 -8 16 -10 52 -6 29 4 76 4 105 0 52 -6 53 -6 53 -39 0 -32 2 -34 35 -34
33 0 35 2 35 35 0 28 4 35 19 35 37 0 51 -12 51 -41 0 -26 3 -29 35 -29 32 0
35 2 35 30 0 31 7 34 48 24 15 -4 22 -14 22 -30 0 -21 5 -24 35 -24 28 0 35 4
35 20 0 16 7 20 35 20 28 0 35 -4 35 -20 0 -16 7 -20 35 -20 24 0 35 5 35 15
0 10 10 15 30 15 18 0 33 -6 36 -15 6 -16 69 -22 78 -7 2 4 34 3 70 -2 66 -10
66 -10 66 -43 0 -31 2 -33 35 -33 32 0 35 2 35 30 0 23 5 30 19 30 35 0 51
-12 51 -36 0 -21 5 -24 35 -24 28 0 35 4 35 20 0 16 7 20 31 20 22 0 32 -5 36
-20 4 -15 14 -20 39 -20 19 0 34 5 34 10 0 6 13 10 29 10 17 0 33 -4 36 -10 3
-5 22 -10 41 -10 32 0 34 -2 34 -35 0 -33 2 -35 35 -35 32 0 35 2 35 30 0 31
7 34 48 24 15 -4 22 -14 22 -30 0 -21 5 -24 35 -24 29 0 35 4 35 21 0 15 4 19
16 15 9 -3 24 -6 35 -6 11 0 19 -7 19 -16 0 -14 8 -16 53 -12 28 3 44 3 35 1
-13 -3 -18 -14 -18 -39 0 -32 2 -34 35 -34 33 0 35 2 35 34 0 32 1 33 33 27
25 -5 33 -12 35 -34 3 -23 8 -27 38 -27 28 0 34 4 34 21 0 17 4 20 23 15 12
-3 28 -6 35 -6 6 0 12 -7 12 -16 0 -14 8 -16 48 -12 26 3 41 3 35 1 -7 -3 -13
-20 -13 -39 0 -32 2 -34 35 -34 32 0 35 2 35 30 0 31 7 34 48 24 15 -4 22 -14
22 -30 0 -21 5 -24 35 -24 24 0 35 5 35 15 0 19 13 19 53 1 18 -8 43 -16 57
-18 20 -2 26 -9 28 -35 3 -30 6 -33 38 -33 27 0 34 4 34 20 0 11 6 20 13 20
29 0 57 -13 57 -26 0 -9 12 -14 35 -14 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
31 0 35 3 35 25 0 14 4 25 9 25 25 0 61 -21 61 -36 0 -13 8 -15 38 -13 l37 4
-4 -37 c-3 -38 -3 -38 33 -38 32 0 36 3 36 25 0 14 4 25 9 25 24 0 61 -21 61
-35 0 -11 10 -15 35 -15 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 31 0 35 3 35
25 0 23 2 24 28 14 15 -5 32 -16 37 -24 6 -7 24 -15 40 -17 26 -3 30 -8 33
-35 3 -30 6 -33 38 -33 24 0 34 5 34 15 0 19 11 19 36 0 18 -14 18 -14 -8 -15
-25 0 -28 -4 -28 -35 0 -33 2 -35 35 -35 32 0 35 2 35 30 0 17 4 30 10 30 24
0 60 -25 60 -42 0 -14 8 -18 35 -18 33 0 35 -2 35 -35 0 -33 2 -35 34 -35 22
0 36 5 38 14 3 13 6 13 28 1 l25 -14 -27 -1 c-25 0 -28 -4 -28 -35 0 -33 2
-35 35 -35 32 0 35 2 35 30 l0 31 30 -16 c16 -8 33 -21 37 -27 4 -7 22 -20 38
-28 17 -9 31 -25 33 -37 2 -16 11 -23 35 -25 28 -3 32 -7 35 -35 3 -30 6 -33
38 -33 32 0 34 -2 34 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -34 0 -32 3 -35 33 -38 28 -3 32 -7 35 -35 2 -25 8 -33
22 -33 14 0 29 -18 50 -60 34 -67 36 -80 15 -80 -10 0 -15 -11 -15 -35 0 -32
3 -35 29 -35 29 0 41 -14 41 -51 0 -15 -7 -19 -35 -19 -33 0 -35 -2 -35 -35 0
-33 2 -35 34 -35 30 0 35 4 38 28 2 15 3 -28 2 -94 -1 -67 -5 -127 -8 -133 -4
-6 -20 -11 -37 -11 -26 0 -29 -3 -29 -34 0 -27 5 -35 20 -38 19 -3 18 -7 -14
-68 -23 -44 -41 -66 -55 -68 -14 -2 -21 -11 -21 -26 0 -28 -18 -46 -46 -46
-18 0 -23 -6 -26 -32 -3 -29 -7 -33 -35 -36 -27 -3 -33 -8 -33 -26 0 -28 -18
-46 -46 -46 -16 0 -24 -7 -26 -22 -2 -12 -16 -29 -32 -38 -15 -8 -42 -27 -58
-42 -38 -36 -48 -35 -48 2 0 28 -3 30 -35 30 -33 0 -35 -2 -35 -35 0 -31 3
-35 28 -35 26 -1 26 -1 8 -15 -25 -19 -36 -19 -36 0 0 10 -11 15 -35 15 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -34 -35 -28 0 -35 -4 -38 -22 -2 -16 -21 -31 -68
-54 -60 -29 -65 -30 -68 -13 -3 14 -12 19 -38 19 -32 0 -34 -2 -34 -35 0 -33
-2 -35 -35 -35 -25 0 -35 -4 -35 -15 0 -14 -37 -35 -61 -35 -5 0 -9 11 -9 25
0 22 -4 25 -35 25 -33 0 -35 -2 -35 -34 0 -19 6 -36 13 -39 6 -2 -9 -2 -35 1
-44 4 -48 3 -48 -17 0 -14 -9 -25 -26 -31 -39 -15 -44 -13 -44 20 0 28 -3 30
-35 30 -33 0 -35 -2 -35 -34 0 -25 5 -36 18 -39 9 -2 -7 -2 -35 1 -48 4 -53 3
-53 -16 0 -14 -10 -24 -31 -31 -18 -6 -34 -11 -35 -11 -2 0 -4 14 -4 30 0 28
-3 30 -36 30 -36 0 -36 0 -33 -38 l4 -37 -37 4 c-29 2 -38 -1 -38 -12 0 -18
-5 -22 -42 -31 -25 -6 -28 -4 -28 19 0 22 -4 25 -35 25 -32 0 -35 -2 -35 -30
0 -17 -6 -32 -12 -34 -81 -22 -122 -28 -126 -17 -2 6 -19 11 -38 11 -27 0 -34
-4 -34 -20 0 -11 -6 -20 -12 -20 -7 0 -23 -3 -35 -6 -20 -5 -23 -2 -23 20 0
23 -4 26 -35 26 -32 0 -35 -2 -35 -30 0 -17 -6 -32 -12 -34 -81 -22 -122 -28
-126 -17 -2 6 -19 11 -38 11 -27 0 -34 -4 -34 -20 0 -13 -7 -20 -19 -20 -11 0
-26 -3 -35 -6 -12 -5 -16 0 -16 20 0 23 -4 26 -35 26 -32 0 -35 -3 -35 -29 0
-29 -14 -41 -51 -41 -15 0 -19 7 -19 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 2 -35 33 -36 l32 -1 -29 -10 c-22 -8 -31 -8 -34 1 -2 6 -19 11 -37
11 -24 0 -34 -5 -38 -20 -4 -15 -14 -20 -36 -20 -24 0 -31 4 -31 20 0 16 -7
20 -35 20 -32 0 -35 -3 -35 -29 0 -21 -6 -30 -22 -35 -42 -11 -48 -7 -48 29 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -34 0 -28 4 -35 23 -39 12 -2 -4 -2 -35 1
-47 4 -58 2 -58 -11 0 -16 -20 -27 -51 -27 -12 0 -19 7 -19 20 0 16 -7 20 -35
20 -32 0 -35 -2 -35 -30 0 -23 -5 -30 -19 -30 -11 0 -26 -3 -35 -6 -13 -5 -16
1 -16 30 0 34 -1 36 -35 36 -33 0 -35 -2 -35 -34 0 -28 4 -35 23 -39 12 -3 -4
-2 -35 1 -49 4 -58 2 -58 -12 0 -9 -6 -16 -12 -16 -7 0 -23 -3 -35 -6 -19 -5
-23 -2 -23 15 0 17 -6 21 -34 21 -30 0 -35 -3 -38 -27 -2 -23 -8 -29 -35 -31
-31 -3 -33 -1 -33 27 0 29 -3 31 -35 31 -33 0 -35 -2 -35 -34 0 -19 6 -36 13
-39 6 -3 -7 -2 -31 0 -31 4 -46 2 -55 -9 -7 -9 -24 -18 -39 -20 -22 -4 -28 -1
-28 13 0 15 -8 19 -35 19 -30 0 -35 -3 -35 -24 0 -24 -16 -36 -51 -36 -14 0
-19 7 -19 30 0 28 -3 30 -35 30 -33 0 -35 -2 -35 -35 0 -32 -2 -35 -31 -35
-17 0 -37 -7 -45 -15 -20 -20 -64 -20 -64 0 0 10 -11 15 -35 15 -31 0 -35 -3
-35 -25 0 -14 -6 -25 -12 -25 -7 0 -23 -3 -35 -6 -20 -6 -23 -3 -23 25 0 29
-2 31 -35 31 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -34 -35 -19 0 -36 -4 -38 -9
-1 -5 -18 -12 -35 -16 -26 -5 -33 -3 -33 9 0 12 -10 16 -34 16 -28 0 -35 -4
-38 -22 -2 -18 -11 -24 -35 -26 -30 -3 -33 -1 -33 22 0 23 -4 26 -35 26 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -34 -35 -19 0 -38 -4 -41 -10 -3 -5 -19 -10 -36
-10 -16 0 -29 5 -29 10 0 6 -16 10 -35 10 -28 0 -35 -4 -35 -19 0 -20 -18 -31
-51 -31 -14 0 -19 7 -19 25 0 22 -4 25 -35 25 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -34 -35 -19 0 -38 -4 -41 -10 -3 -5 -19 -10 -36 -10 -16 0 -29 5 -29 10 0
6 -15 10 -34 10 -28 0 -35 -4 -38 -22 -2 -18 -11 -24 -35 -26 -30 -3 -33 -1
-33 22 0 23 -4 26 -35 26 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -31 -35 -18 0
-37 -6 -43 -14 -6 -7 -23 -16 -38 -20 -24 -5 -28 -3 -28 14 0 16 -7 20 -35 20
-32 0 -35 -2 -35 -30 0 -17 -5 -30 -12 -30 -7 0 -23 -3 -35 -6 -21 -6 -23 -3
-23 30 0 34 -1 36 -35 36 -33 0 -35 -2 -35 -34 0 -32 3 -35 33 -38 l32 -4 -29
-9 c-21 -5 -31 -5 -34 3 -2 7 -19 12 -38 12 -29 0 -34 -3 -34 -24 0 -16 -7
-26 -22 -30 -41 -10 -48 -7 -48 24 0 28 -3 30 -35 30 -33 0 -35 -2 -35 -35 0
-29 4 -35 23 -36 21 0 21 -1 2 -8 -11 -5 -21 -4 -23 0 -2 5 -19 9 -38 9 -27 0
-34 -4 -34 -20 0 -20 -27 -40 -54 -40 -11 0 -16 9 -16 30 0 28 -3 30 -35 30
-33 0 -35 -2 -35 -35 0 -31 3 -35 28 -36 l27 0 -24 -12 c-19 -9 -25 -9 -29 1
-2 6 -19 12 -38 12 -31 0 -34 -3 -34 -30 0 -25 -4 -30 -35 -36 -19 -3 -35 -10
-35 -15 0 -8 -52 -39 -65 -39 -3 0 -5 11 -5 25 0 22 -4 25 -35 25 -33 0 -35
-2 -35 -35 0 -27 4 -35 18 -35 14 0 15 -2 2 -10 -10 -6 -16 -6 -18 0 -2 6 -19
10 -38 10 -32 0 -34 -2 -34 -35 0 -33 -2 -35 -34 -35 -32 0 -35 -3 -38 -32 -3
-29 -7 -33 -35 -36 -28 -3 -32 -7 -35 -35 -3 -28 -7 -32 -37 -35 l-34 -3 5
-52 c3 -29 3 -44 1 -34 -3 12 -14 17 -39 17 -32 0 -34 -2 -34 -35 0 -32 2 -35
30 -35 31 0 34 -7 24 -47 -4 -16 -14 -23 -30 -23 -21 0 -24 -5 -24 -35 0 -30
3 -35 24 -35 28 0 30 -3 40 -43 6 -26 5 -27 -29 -27 -33 0 -35 -2 -35 -35 0
-33 2 -35 35 -35 31 0 35 3 36 28 l0 27 12 -24 c9 -19 9 -25 -1 -29 -6 -2 -12
-19 -12 -38 0 -32 2 -34 35 -34 33 0 35 -2 35 -34 0 -32 3 -35 33 -38 28 -3
32 -7 35 -35 3 -28 7 -32 35 -35 28 -3 32 -7 35 -35 3 -30 6 -33 38 -33 32 0
34 -2 34 -35 0 -33 2 -35 35 -35 24 0 35 5 35 15 0 19 11 19 36 0 18 -14 18
-14 -8 -15 -25 0 -28 -4 -28 -35 0 -33 2 -35 35 -35 32 0 35 2 35 30 0 17 4
30 10 30 24 0 60 -25 60 -42 0 -14 8 -18 35 -18 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 30 0 35 3 35 24 0 23 2 24 35 13 19 -6 35 -16 35 -24 0 -8 13 -13
35 -13 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 31 0 35 3 35 25 0 14 4 25 9 25
25 0 61 -21 61 -36 0 -14 8 -16 58 -12 31 3 47 4 35 1 -19 -4 -23 -11 -23 -39
0 -32 2 -34 35 -34 32 0 35 2 35 31 0 28 2 30 33 27 27 -2 33 -8 35 -31 3 -24
8 -27 38 -27 26 0 34 4 34 19 0 14 6 17 28 13 15 -2 32 -11 39 -20 9 -11 24
-13 55 -9 24 2 37 3 31 0 -7 -3 -13 -20 -13 -39 0 -32 2 -34 35 -34 32 0 35 2
35 31 0 28 2 30 33 27 27 -2 33 -8 35 -31 3 -24 8 -27 38 -27 27 0 34 4 34 20
0 16 7 20 31 20 22 0 32 -5 36 -20 4 -15 14 -20 39 -20 19 0 34 5 34 10 0 13
57 13 65 0 3 -5 22 -10 41 -10 32 0 34 -2 34 -35 0 -33 2 -35 35 -35 32 0 35
2 35 30 0 28 3 30 35 30 32 0 35 -2 35 -30 0 -28 3 -30 35 -30 31 0 35 3 35
25 0 22 4 25 35 25 31 0 35 -3 35 -25 0 -22 4 -25 35 -25 28 0 35 4 35 20 0
11 6 20 13 20 29 0 57 -13 57 -26 0 -9 12 -14 35 -14 24 0 35 5 35 15 0 11 8
13 33 8 17 -3 35 -11 39 -16 3 -6 26 -7 53 -4 26 4 71 4 101 1 53 -7 54 -7 54
-40 0 -32 2 -34 35 -34 33 0 35 2 35 35 0 28 4 35 19 35 37 0 51 -12 51 -41 0
-26 3 -29 35 -29 32 0 35 2 35 30 0 28 3 30 35 30 32 0 35 -2 35 -30 0 -28 3
-30 35 -30 31 0 35 3 35 25 0 22 4 25 35 25 31 0 35 -3 35 -25 0 -22 4 -25 35
-25 31 0 35 3 35 25 0 22 4 25 35 25 31 0 35 -3 35 -25 0 -22 4 -25 35 -25 28
0 35 4 35 20 0 16 7 20 35 20 28 0 35 -4 35 -20 0 -16 -7 -20 -35 -20 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -32 0 -35 -2 -35 -30 0 -28 -3 -30 -35 -30
-32 0 -35 2 -35 30 0 28 -3 30 -35 30 -30 0 -35 -3 -35 -24 0 -31 -12 -38 -45
-30 -18 4 -25 13 -25 30 0 21 -5 24 -35 24 -31 0 -35 -3 -35 -25 0 -22 -4 -25
-35 -25 -31 0 -35 3 -35 25 0 22 -4 25 -35 25 -28 0 -35 -4 -35 -20 0 -16 -7
-20 -35 -20 -28 0 -35 4 -35 20 0 16 -7 20 -35 20 -24 0 -35 -5 -35 -15 0 -10
-11 -15 -35 -15 -24 0 -35 5 -35 15 0 10 -11 15 -35 15 -19 0 -35 -4 -35 -10
0 -5 -16 -10 -35 -10 -19 0 -35 5 -35 11 0 8 -20 10 -62 7 -35 -3 -51 -3 -35
-1 23 4 27 9 27 39 0 32 -2 34 -35 34 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -32 0 -35 -2 -35 -30 0 -28 -3 -30
-35 -30 -32 0 -35 2 -35 30 0 28 -3 30 -35 30 -31 0 -35 -3 -35 -25 0 -22 -4
-25 -35 -25 -31 0 -35 3 -35 25 0 22 -4 25 -35 25 -28 0 -35 -4 -35 -20 0 -13
-7 -20 -19 -20 -30 0 -51 11 -51 26 0 9 -12 14 -35 14 -19 0 -35 -4 -35 -10 0
-5 -16 -10 -35 -10 -19 0 -35 5 -35 11 0 8 -19 10 -57 7 -32 -3 -48 -3 -35 -1
18 4 22 11 22 39 0 32 -2 34 -35 34 -33 0 -35 -2 -35 -35 0 -28 -4 -35 -19
-35 -37 0 -51 12 -51 41 0 26 -3 29 -35 29 -31 0 -35 -3 -35 -25 0 -22 -4 -25
-35 -25 -31 0 -35 3 -35 25 0 22 -4 25 -35 25 -28 0 -35 -4 -35 -20 0 -11 -6
-20 -12 -20 -30 0 -58 13 -58 26 0 9 -12 14 -35 14 -19 0 -35 -5 -35 -11 0 -7
-11 -9 -32 -5 -18 4 -50 10 -70 13 -35 5 -38 7 -38 39 0 32 -2 34 -35 34 -32
0 -35 -2 -35 -30 0 -23 -5 -30 -19 -30 -35 0 -51 12 -51 36 0 21 -5 24 -35 24
-28 0 -35 -4 -35 -20 0 -13 -7 -20 -19 -20 -30 0 -51 11 -51 26 0 17 -66 20
-72 3 -3 -8 -14 -8 -43 0 -22 6 -52 11 -67 11 -25 0 -28 3 -28 35 0 33 -2 35
-35 35 -31 0 -35 -3 -35 -26 0 -23 -3 -25 -32 -22 -25 2 -34 8 -36 25 -3 19
-10 23 -38 23 -24 0 -34 -4 -34 -16 0 -12 -7 -14 -32 -9 -18 4 -34 11 -36 16
-2 5 -19 9 -38 9 -32 0 -34 2 -34 35 0 33 -2 35 -35 35 -32 0 -35 -2 -35 -30
0 -31 -7 -34 -47 -24 -16 4 -23 14 -23 30 0 21 -5 24 -35 24 -24 0 -35 -5 -35
-15 0 -20 -44 -20 -64 0 -8 8 -28 15 -45 15 -29 0 -31 3 -31 35 0 33 -2 35
-35 35 -32 0 -35 -2 -35 -30 0 -28 -2 -30 -27 -24 -39 9 -43 13 -43 35 0 15
-7 19 -35 19 -25 0 -35 -4 -35 -15 0 -12 -7 -14 -27 -9 -16 4 -32 10 -38 14
-5 5 -23 10 -40 12 -26 3 -30 8 -33 36 -3 29 -6 32 -38 32 -30 0 -34 -3 -34
-25 0 -23 -3 -25 -28 -19 -37 9 -42 13 -42 31 0 13 -9 15 -52 11 -29 -3 -45
-3 -36 -1 13 3 18 14 18 39 0 32 -2 34 -35 34 -32 0 -35 -2 -35 -30 0 -31 -7
-34 -48 -24 -15 4 -22 14 -22 30 0 21 -5 24 -34 24 -19 0 -36 -5 -38 -12 -3
-8 -22 -6 -71 8 -62 17 -67 21 -67 46 0 25 3 28 35 28 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 -2 35 -35 35 -32 0 -35 3 -35 29 0 21 6 30 22 35 42 11 48 7 48 -29 0
-33 2 -35 35 -35 33 0 35 2 35 34 0 28 -4 35 -22 39 -13 2 3 2 35 -1 46 -4 57
-2 57 11 0 16 20 27 51 27 12 0 19 -7 19 -20 0 -16 7 -20 35 -20 32 0 35 2 35
30 0 17 5 30 13 30 6 0 22 3 34 6 21 6 23 3 23 -30 0 -34 1 -36 35 -36 33 0
35 2 35 34 0 28 -4 35 -23 39 -12 3 4 2 36 -1 48 -4 57 -2 57 12 0 9 6 16 13
16 6 0 22 3 34 6 19 5 23 2 23 -15 0 -17 6 -21 35 -21 30 0 35 3 35 24 0 24
16 36 51 36 14 0 19 -7 19 -30 0 -28 3 -30 35 -30 33 0 35 2 35 35 0 32 2 35
31 35 17 0 37 7 45 15 9 8 26 15 40 15 15 0 24 -6 24 -15 0 -10 11 -15 35 -15
31 0 35 3 35 25 0 18 5 25 19 25 11 0 26 3 35 6 13 5 16 -1 16 -25 0 -29 3
-31 35 -31 33 0 35 2 35 35 0 33 2 35 34 35 19 0 38 5 41 10 3 6 19 10 36 10
16 0 29 -4 29 -10 0 -5 16 -10 35 -10 28 0 35 4 35 20 0 11 6 20 13 20 6 0 22
3 35 6 19 5 22 2 22 -20 0 -23 4 -26 35 -26 32 0 35 3 35 29 0 29 14 41 51 41
15 0 19 -7 19 -35 0 -33 2 -35 35 -35 33 0 35 2 35 34 0 30 -4 35 -27 39 -16
2 0 2 35 -1 50 -3 62 -2 62 11 0 14 28 27 58 27 6 0 12 -9 12 -20 0 -16 7 -20
34 -20 30 0 35 3 38 28 2 22 8 28 36 30 30 3 32 1 32 -27 0 -29 2 -31 36 -31
36 0 36 0 33 38 -4 37 -4 37 28 34 21 -3 38 2 48 12 21 21 65 21 65 1 0 -10
11 -15 35 -15 31 0 35 3 35 25 0 18 5 25 19 25 11 0 26 3 35 6 13 5 16 -1 16
-25 0 -29 3 -31 35 -31 33 0 35 2 35 35 0 33 2 35 34 35 19 0 38 5 41 10 3 6
19 10 36 10 16 0 29 -4 29 -10 0 -5 16 -10 35 -10 28 0 35 4 35 20 0 11 6 20
13 20 6 0 22 3 35 6 19 5 22 2 22 -20 0 -23 4 -26 35 -26 32 0 35 3 35 29 0
29 14 41 51 41 15 0 19 -7 19 -35 0 -33 2 -35 35 -35 33 0 35 2 35 34 0 28 -4
35 -22 39 -13 2 3 2 35 -1 48 -4 57 -2 57 12 0 9 6 16 13 16 6 0 22 3 35 6 18
5 22 2 22 -15 0 -17 6 -21 34 -21 30 0 35 3 38 28 2 22 8 28 36 30 30 3 32 1
32 -27 0 -29 3 -31 35 -31 33 0 35 2 35 35 0 33 2 35 34 35 19 0 36 4 38 10 2
5 18 12 36 16 25 5 32 3 32 -10 0 -12 9 -16 34 -16 28 0 35 4 38 23 2 17 11
23 36 25 29 3 32 1 32 -22 0 -23 4 -26 35 -26 33 0 35 2 35 35 0 33 2 35 33
35 18 0 37 4 43 9 5 4 21 11 37 15 20 5 27 3 27 -9 0 -11 10 -15 35 -15 28 0
35 4 35 20 0 13 10 24 26 30 39 15 44 13 44 -20 0 -28 3 -30 35 -30 33 0 35 2
35 35 0 33 2 35 31 35 18 0 37 6 43 14 6 7 23 16 39 20 23 5 27 3 27 -14 0
-16 7 -20 35 -20 32 0 35 3 35 29 0 21 6 30 23 35 41 11 47 7 47 -29 0 -33 2
-35 35 -35 33 0 35 2 35 34 0 32 -3 35 -32 38 l-33 4 29 9 c21 5 31 5 34 -3 2
-7 19 -12 38 -12 29 0 34 3 34 24 0 24 16 36 51 36 14 0 19 -7 19 -30 0 -28 3
-30 35 -30 33 0 35 2 35 35 0 30 -4 35 -22 35 -22 1 -22 1 -4 12 15 8 21 8 24
0 2 -7 19 -12 38 -12 29 0 34 3 34 24 0 18 8 27 31 35 18 6 34 11 35 11 2 0 4
-16 4 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -32 35 l-33 1 25 14
c32 18 40 18 40 0 0 -10 10 -15 34 -15 32 0 35 3 38 33 3 28 7 32 34 35 21 2
34 10 37 22 2 10 19 26 36 34 l31 17 0 -36 c0 -33 2 -35 35 -35 33 0 35 2 35
34 0 32 -3 35 -32 38 l-33 3 33 23 32 23 0 -25 c0 -23 4 -26 35 -26 33 0 35 2
35 34 0 28 -4 35 -21 38 l-21 3 21 19 c21 19 21 19 21 -2 0 -18 6 -22 35 -22
33 0 35 2 35 35 0 31 -3 35 -26 35 l-25 0 22 31 c12 18 28 48 35 68 9 27 18
37 38 39 22 3 26 8 26 38 0 27 -4 34 -19 34 -20 0 -31 18 -31 51 0 14 7 19 25
19 22 0 25 4 25 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 22 -5 35 -13 35
-11 0 -47 49 -47 64 0 3 14 6 30 6 28 0 30 3 30 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -32 l-1 -33 -26 30 -27 30 27 3 c23 3 27 8 27 38 0 32 -2 34 -34
34 -30 0 -35 -4 -38 -27 l-3 -27 -30 27 -30 26 33 1 c30 0 32 2 32 35 0 33 -2
35 -35 35 -32 0 -35 -2 -35 -30 0 -37 -14 -38 -49 -2 -15 15 -41 32 -57 37
-21 8 -30 18 -32 39 -3 28 -5 28 -50 24 -26 -3 -41 -3 -34 -1 6 3 12 20 12 39
0 32 -2 34 -35 34 -31 0 -35 -3 -35 -25 0 -16 -6 -25 -16 -25 -24 0 -54 19
-54 35 0 10 -11 15 -35 15 -33 0 -35 2 -35 35 0 33 -2 35 -34 35 -31 0 -35 -3
-38 -28 -3 -27 -5 -28 -35 -20 -23 6 -33 14 -33 28 0 16 -7 20 -34 20 -19 0
-36 -5 -38 -12 -4 -11 -8 -11 -120 19 -12 3 -18 14 -18 34 0 27 -3 29 -35 29
-31 0 -35 -3 -35 -26 0 -22 -3 -25 -22 -20 -13 3 -29 6 -35 6 -7 0 -13 9 -13
20 0 16 -7 20 -35 20 -19 0 -35 -4 -35 -10 0 -5 -13 -10 -29 -10 -17 0 -33 5
-36 10 -3 6 -22 10 -41 10 -32 0 -34 2 -34 35 0 33 -2 35 -35 35 -34 0 -35 -2
-35 -36 0 -33 -2 -36 -22 -30 -13 3 -29 6 -35 6 -8 0 -13 13 -13 30 0 28 -3
30 -35 30 -31 0 -35 -3 -35 -25 0 -22 -4 -25 -35 -25 -31 0 -35 3 -35 25 0 22
-4 25 -35 25 -28 0 -35 -4 -35 -20 0 -16 -7 -20 -35 -20 -28 0 -35 4 -35 20 0
16 -7 20 -35 20 -24 0 -35 -5 -35 -15 0 -10 -11 -15 -35 -15 -24 0 -35 5 -35
15 0 10 -11 15 -35 15 -24 0 -35 -5 -35 -15 0 -11 -8 -13 -32 -8 -18 3 -34 10
-36 15 -5 12 -72 10 -72 -2 0 -5 -16 -10 -35 -10 -19 0 -35 5 -35 10 0 13 -67
13 -75 -1 -4 -6 -14 -7 -24 -3 -22 10 -671 12 -677 2 -7 -12 -64 -10 -64 2 0
6 -16 10 -35 10 -19 0 -35 -4 -35 -10 0 -5 -16 -10 -35 -10 -19 0 -35 5 -35
10 0 6 -16 10 -35 10 -24 0 -35 -5 -35 -15 0 -10 -11 -15 -35 -15 -24 0 -35 5
-35 15 0 25 -66 20 -73 -5 -4 -15 -14 -20 -36 -20 -24 0 -31 4 -31 20 0 16 -7
20 -35 20 -28 0 -35 -4 -35 -19 0 -20 -18 -31 -51 -31 -14 0 -19 7 -19 25 0
22 -4 25 -35 25 -30 0 -35 -3 -35 -24 0 -24 -16 -36 -51 -36 -14 0 -19 7 -19
30 0 28 -3 30 -35 30 -32 0 -35 -3 -35 -29 0 -29 -14 -41 -51 -41 -15 0 -19 7
-19 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -31 -3 -35 -26 -35 -15 0
-45 -5 -67 -12 -32 -10 -41 -10 -45 0 -6 18 -72 16 -72 -3 0 -10 -11 -15 -35
-15 -24 0 -35 5 -35 15 0 10 -11 15 -35 15 -28 0 -35 -4 -35 -20 0 -13 -7 -20
-19 -20 -11 0 -26 -3 -35 -6 -12 -5 -16 0 -16 20 0 23 -4 26 -34 26 -30 0 -35
-3 -38 -27 -2 -23 -8 -29 -35 -31 -31 -3 -33 -1 -33 27 0 29 -3 31 -35 31 -33
0 -35 -2 -35 -34 0 -33 -1 -33 -54 -40 -30 -3 -75 -3 -101 1 -38 5 -49 3 -57
-10 -12 -22 -68 -23 -68 -2 0 10 -11 15 -35 15 -28 0 -35 -4 -35 -20 0 -11 -6
-20 -12 -20 -7 0 -23 -3 -36 -6 -19 -5 -22 -2 -22 20 0 23 -4 26 -35 26 -32 0
-35 -2 -35 -30 0 -28 -3 -30 -35 -30 -32 0 -35 2 -35 30 0 28 3 30 35 30 33 0
35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 34 35 28 0 35 4 38
23 2 17 11 23 36 25 29 3 32 1 32 -22 0 -23 4 -26 34 -26 30 0 35 3 38 28 2
22 8 28 36 30 30 3 32 1 32 -27 0 -29 3 -31 35 -31 32 0 35 3 35 29 0 29 14
41 51 41 15 0 19 -7 19 -35 0 -33 2 -35 35 -35 33 0 35 2 35 34 0 33 1 33 52
39 29 4 76 4 104 1 33 -4 54 -2 58 5 9 14 66 15 66 1 0 -16 60 -12 76 5 9 8
26 15 40 15 15 0 24 -6 24 -15 0 -10 11 -15 35 -15 24 0 35 5 35 15 0 10 11
15 35 15 24 0 35 -5 35 -15 0 -10 11 -15 35 -15 28 0 35 4 35 20 0 16 7 20 35
20 28 0 35 -4 35 -20 0 -16 7 -20 35 -20 28 0 35 4 35 20 0 11 6 20 13 20 6 0
22 3 35 6 19 5 22 2 22 -20 0 -23 4 -26 35 -26 31 0 35 3 35 25 0 22 4 25 35
25 31 0 35 -3 35 -25 0 -22 4 -25 35 -25 31 0 35 3 35 25 0 22 4 25 35 25 31
0 35 -3 35 -25 0 -22 4 -25 35 -25 30 0 35 3 35 23 0 31 7 37 42 37 24 0 28
-4 28 -30z"
        />
        <path
          d="M840 8455 c0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35
-2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35
35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33
0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35z m70 -70 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35z"
        />
        <path
          d="M840 8315 c0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35
-2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35z m70 -70 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35
35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33
0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35
35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35z"
        />
        <path
          d="M840 8175 c0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35
-2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35
2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35z m70 -70 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35z"
        />
        <path
          d="M840 8035 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M980 8035 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M1120 8035 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M3920 8035 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M4060 8035 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M4270 7965 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M4410 7965 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M4550 7965 c0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35
-2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35
35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35z m350 -70 c0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 -2 35 -35z m210 -70 c0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33
0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35
2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 -2 35
-35z m-420 -2100 c0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 2 35 35 35
33 0 35 -2 35 -35z m-2100 -420 c0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 2 35 35 35 33 0 35 -2 35 -35z m-350 -70 c0 -33 -2 -35 -35 -35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35z
m140 0 c0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 -2
35 -35z m-210 -2310 c0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 -2 35 -35z m210 -70 c0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 2 35 35 35 33 0 35 -2 35 -35z"
        />
        <path
          d="M5180 7755 c0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35
0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35z m210
-70 c0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35
-2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35
-2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0
-35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35
0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 2 35 35 35 33 0 35 -2 35 -35z"
        />
        <path
          d="M5530 7545 c0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
-2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35z m210
-70 c0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35
35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0
33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 -2 35 -35z"
        />
        <path
          d="M5880 7335 c0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35z m210 -70 c0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33
0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35
2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35
35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35
35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 -2 35 -35z"
        />
        <path
          d="M6230 7125 c0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33
-2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0
33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35z m70 -70 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35
0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 -2 35 -35z"
        />
        <path
          d="M6370 6985 c0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35z m140 -140 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35
35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35
35 35 33 0 35 -2 35 -35z"
        />
        <path
          d="M1820 5095 c0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35
-2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0
-33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2
-35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35
35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35
35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35
35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35z
m-420 -140 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2
35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35
0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35
-2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35
-35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2
35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35
35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33
0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35
2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35
35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0
33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2
35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35
35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33
0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 -2 35
-35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35
35 35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35z"
        />
        <path
          d="M1330 4885 c0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33
-2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35
-35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0 -35
-2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35 -33 0
-35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33
2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2
35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35
-35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35z m70 -70 c0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0
-33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2
-35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33
0 -35 2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35
2 -35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35
35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35z"
        />
        <path
          d="M980 4675 c0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35
-2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35z"
        />
        <path
          d="M840 4115 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M840 3975 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M840 3835 c0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35
-35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2
-35 -35 -35 -33 0 -35 -2 -35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33
2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0 35 -2 35 -35 0 -33 2 -35
35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 2 35 35 35 33 0
35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0
35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35
2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2
-35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2
-35 -35z m140 -140 c0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 -2 -35 -35 -35
-33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35
-35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35
35 -33 0 -35 -2 -35 -35 0 -33 -2 -35 -35 -35 -33 0 -35 2 -35 35 0 33 2 35
35 35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35
33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 2 35 35 35 33 0
35 -2 35 -35z"
        />
        <path
          d="M980 3555 c0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35 -35
33 0 35 -2 35 -35 0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33
0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35 -33 0
-35 -2 -35 -35z"
        />
        <path
          d="M2730 2785 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M2870 2785 c0 -33 2 -35 35 -35 33 0 35 -2 35 -35 0 -33 2 -35 35
-35 33 0 35 2 35 35 0 33 -2 35 -35 35 -33 0 -35 2 -35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M3080 2715 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M3220 2715 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M3360 2715 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M3710 2645 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M3850 2645 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M3990 2645 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M4130 2645 c0 -33 2 -35 35 -35 33 0 35 2 35 35 0 33 -2 35 -35 35
-33 0 -35 -2 -35 -35z"
        />
        <path
          d="M790 7256 c-218 -64 -370 -236 -402 -453 -30 -208 62 -414 235 -531
104 -69 167 -87 307 -87 140 0 203 18 307 87 267 179 320 549 114 804 -50 63
-155 136 -236 166 -74 27 -255 35 -325 14z"
        />
        <path
          d="M7320 5229 c-746 -66 -1434 -479 -1855 -1114 -551 -829 -551 -1921 0
-2750 100 -152 189 -261 319 -391 361 -360 811 -598 1305 -690 993 -184 1987
238 2546 1081 551 830 551 1920 0 2750 -100 152 -189 261 -319 391 -528 527
-1250 789 -1996 723z"
        />
      </g>
    </svg>
  </div>
  <div class="svg-container">
    <!-- GHOST WRITING SVG -->
    <svg
      id="writing-svg"
      class="evidence inactive"
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200.000000 200.000000"
    >
      <g
        transform="translate(0.000000,200.000000) scale(0.019000,-0.019000)"
        stroke="none"
      >
        <path
          d="M200 8963 c-38 -13 -92 -60 -120 -101 l-30 -45 0 -3657 0 -3657 30
-45 c17 -25 49 -58 72 -74 l41 -29 4927 0 4927 0 41 29 c23 16 55 49 72 74
l30 45 0 3657 0 3657 -30 45 c-17 25 -49 58 -72 74 l-41 29 -4916 2 c-2704 1
-4923 -1 -4931 -4z m9820 -103 c20 -20 20 -33 20 -3698 0 -3161 -2 -3681 -14
-3698 -14 -19 -54 -19 -2468 -24 -1349 -3 -3550 -3 -4891 0 -2399 5 -2439 5
-2453 24 -12 17 -14 537 -14 3698 0 3665 0 3678 20 3698 20 20 33 20 4900 20
4867 0 4880 0 4900 -20z"
        />
        <path
          d="M260 5160 l0 -3660 2395 0 2395 0 0 3660 0 3660 -2395 0 -2395 0 0
-3660z m100 0 l0 -3620 -30 0 -30 0 0 3620 0 3620 30 0 30 0 0 -3620z m90 0
l0 -3620 -25 0 -25 0 0 3620 0 3620 25 0 25 0 0 -3620z m100 0 l0 -3620 -30 0
-30 0 0 3620 0 3620 30 0 30 0 0 -3620z m90 0 l0 -3620 -25 0 -25 0 0 3620 0
3620 25 0 25 0 0 -3620z m2510 3096 c462 -87 810 -271 1073 -565 78 -88 141
-185 198 -306 80 -171 84 -192 84 -495 0 -301 -3 -315 -83 -475 -61 -123 -102
-184 -200 -297 -136 -158 -295 -288 -476 -388 -55 -30 -113 -68 -130 -84 -25
-24 -41 -30 -86 -32 -59 -3 -236 -50 -311 -82 -26 -11 -56 -34 -68 -51 -26
-36 -37 -38 -59 -11 -15 19 -38 23 -192 35 -458 38 -668 85 -935 209 -313 147
-582 406 -730 703 -84 170 -88 188 -93 456 -5 299 1 329 103 534 119 240 165
302 320 431 121 102 277 203 410 267 166 80 309 124 515 156 146 23 525 20
660 -5z m-142 -3778 c2 -9 -11 -36 -28 -59 -48 -67 -86 -232 -61 -269 8 -12
47 -16 218 -19 217 -3 306 5 396 40 76 28 78 25 75 -115 l-3 -121 -25 1 c-14
1 -51 11 -82 23 -32 11 -88 25 -125 31 -74 11 -422 14 -447 4 -14 -5 -16 -29
-16 -160 l0 -154 28 -7 c15 -4 167 -8 337 -8 293 0 315 1 398 23 49 13 95 21
103 18 11 -4 14 -29 14 -114 0 -130 -8 -145 -65 -118 -113 54 -246 76 -458 76
-153 0 -345 -15 -359 -29 -3 -3 -9 -138 -13 -298 -8 -323 -8 -324 51 -262 156
164 464 279 744 279 263 -1 452 -154 505 -409 18 -85 13 -124 -26 -202 -65
-130 -201 -247 -336 -289 -110 -34 -239 -45 -325 -27 -162 33 -334 121 -548
281 -63 47 -120 86 -126 86 -7 0 -44 -25 -84 -55 -192 -149 -351 -241 -510
-296 -83 -28 -242 -31 -339 -5 -166 44 -310 159 -384 305 -43 86 -46 122 -17
235 66 259 257 389 549 373 215 -12 388 -68 561 -182 36 -24 81 -60 99 -79 19
-20 41 -36 48 -36 19 0 19 562 0 578 -19 16 -193 32 -354 32 -175 0 -306 -19
-411 -60 -56 -22 -79 -27 -89 -18 -15 12 -18 204 -4 227 8 12 24 11 108 -10
93 -23 114 -24 398 -24 165 0 312 4 328 8 l27 7 0 148 c0 81 -4 153 -9 161 -7
11 -52 12 -237 8 -232 -4 -301 -14 -378 -53 -35 -17 -52 -18 -62 -3 -9 16 -5
232 6 243 5 5 31 0 62 -12 29 -12 83 -26 120 -33 74 -12 471 -9 484 4 14 14 3
139 -16 195 -11 30 -31 69 -45 87 -25 34 -31 56 -18 69 4 3 81 5 172 4 146 -3
166 -5 169 -20z"
        />
        <path
          d="M2620 8233 c-196 -21 -412 -79 -622 -166 -133 -54 -172 -77 -135 -77
6 0 54 -6 106 -14 112 -17 128 -29 141 -110 5 -32 12 -61 15 -64 3 -3 76 18
163 46 198 66 294 82 508 89 203 7 289 -4 446 -53 244 -78 444 -199 604 -365
75 -79 97 -108 136 -179 95 -173 138 -479 88 -630 -30 -89 -101 -228 -157
-308 -107 -151 -308 -321 -456 -386 -141 -62 -396 -128 -550 -141 -54 -5 -85
-13 -100 -26 l-22 -19 24 -20 c13 -11 29 -20 37 -20 33 0 116 -23 129 -36 17
-17 13 -28 -31 -102 -19 -30 -31 -59 -27 -65 16 -26 347 32 500 89 140 52 363
160 398 193 17 16 41 32 55 36 40 12 129 86 225 187 424 444 466 1047 106
1523 -248 329 -650 550 -1107 610 -104 14 -379 18 -474 8z m1114 -294 c30 -23
33 -45 10 -77 -19 -28 -68 -54 -87 -46 -15 5 -37 66 -37 101 0 46 67 59 114
22z m519 -1257 c27 -46 30 -193 4 -219 -32 -33 -58 -1 -72 90 -4 27 -11 37
-24 37 -22 0 -31 19 -31 65 0 58 7 66 58 63 40 -3 49 -7 65 -36z"
        />
        <path
          d="M1720 7909 c-75 -54 -220 -201 -285 -288 -168 -223 -249 -459 -248
-721 1 -240 60 -432 200 -644 67 -101 258 -288 373 -365 119 -79 346 -190 470
-230 172 -56 411 -97 525 -89 47 3 51 5 69 43 24 52 13 69 -52 75 -28 3 -56
10 -62 16 -5 5 -12 37 -15 69 -7 80 -25 95 -151 124 -335 77 -526 172 -705
351 -146 145 -219 259 -261 407 -33 114 -33 351 0 472 44 164 124 291 279 449
152 154 173 181 173 223 0 96 -115 112 -135 19 -7 -32 -50 -75 -84 -83 -62
-15 -82 45 -31 93 29 27 37 59 24 94 -9 24 -37 19 -84 -15z m-248 -1249 c35
-43 50 -123 46 -243 -3 -116 -19 -172 -48 -172 -28 0 -51 69 -56 167 -7 127
-9 134 -54 178 -66 65 -50 104 39 97 41 -3 59 -9 73 -27z"
        />
        <path
          d="M2655 7889 c-155 -21 -314 -59 -425 -101 -62 -24 -80 -36 -80 -52 0
-19 271 -192 328 -210 23 -8 26 0 36 83 2 24 10 48 18 52 19 12 115 31 136 27
19 -3 71 -101 72 -135 0 -12 -5 -25 -11 -28 -19 -12 -55 4 -67 30 -14 31 -56
34 -72 5 -36 -67 142 -234 228 -214 33 8 156 69 195 96 58 41 11 93 -75 84
-35 -4 -48 -2 -48 8 0 14 123 136 137 136 18 0 33 -25 33 -56 0 -43 16 -83 36
-91 9 -3 38 3 64 14 54 23 330 193 330 203 0 22 -263 110 -405 135 -110 20
-335 27 -430 14z"
        />
        <path
          d="M3541 7654 c-29 -65 -90 -235 -97 -271 -3 -17 -2 -33 3 -36 4 -3 35
6 67 20 57 24 61 24 93 9 41 -19 73 -78 56 -104 -7 -12 -21 -16 -42 -14 -26 3
-38 -3 -65 -32 -18 -20 -36 -36 -41 -36 -4 0 -28 16 -52 36 -24 19 -51 34 -60
32 -22 -4 -63 -84 -70 -134 -6 -49 22 -93 91 -145 67 -51 531 -309 555 -309
15 0 41 94 48 175 13 162 -65 431 -164 563 -90 119 -264 292 -293 292 -5 0
-18 -21 -29 -46z m198 -533 c25 -16 4 -38 -48 -51 -57 -13 -68 -23 -73 -65 -4
-36 -26 -43 -58 -17 -28 23 -30 67 -3 94 38 38 147 61 182 39z"
        />
        <path
          d="M1979 7638 c-58 -45 -177 -183 -246 -287 -98 -146 -131 -282 -119
-490 7 -131 18 -187 40 -209 13 -13 28 -7 138 58 311 185 427 256 477 292 50
38 53 42 48 74 -8 49 -53 136 -89 173 -33 34 -36 35 -57 22 -9 -6 -11 -18 -7
-34 7 -30 -11 -40 -45 -24 -34 17 -91 96 -87 121 3 20 8 21 80 18 42 -1 79 2
82 7 7 10 -66 191 -104 261 -32 57 -55 61 -111 18z m89 -550 c19 -19 15 -93
-8 -119 l-19 -24 -32 33 c-30 31 -35 33 -88 31 -31 -2 -62 0 -69 5 -17 10 -7
55 16 73 22 16 183 18 200 1z"
        />
        <path
          d="M3338 7416 c-82 -79 -154 -175 -170 -227 -24 -83 42 -122 97 -58 51
62 165 323 148 340 -5 5 -38 -20 -75 -55z"
        />
        <path
          d="M2250 7397 c0 -43 121 -304 145 -314 20 -7 57 18 74 50 13 24 12 30
-13 68 -32 47 -184 209 -197 209 -5 0 -9 -6 -9 -13z"
        />
        <path
          d="M2470 7359 c0 -16 -5 -20 -20 -16 -11 3 -22 1 -26 -4 -7 -11 44 -84
89 -128 63 -60 74 -13 15 62 -27 34 -29 42 -18 62 15 27 6 45 -21 45 -13 0
-19 -7 -19 -21z"
        />
        <path
          d="M3127 7321 c-54 -57 -76 -99 -62 -120 19 -32 60 9 109 106 46 93 32
97 -47 14z"
        />
        <path
          d="M2668 7340 c33 -31 52 -38 52 -20 0 11 -59 50 -75 50 -5 0 5 -14 23
-30z"
        />
        <path
          d="M2590 7282 c0 -14 59 -66 67 -59 3 4 -6 21 -22 37 -28 30 -45 38 -45
22z"
        />
        <path
          d="M2797 7263 c-13 -13 -7 -63 7 -63 19 0 46 38 39 56 -5 14 -35 19 -46
7z"
        />
        <path
          d="M2662 7148 c-7 -26 -15 -34 -43 -39 -23 -5 -46 -22 -71 -51 -43 -49
-98 -147 -98 -173 0 -25 92 -146 156 -205 56 -51 79 -59 115 -39 16 8 29 7 57
-7 28 -13 52 -15 111 -11 84 6 107 19 159 86 59 77 39 82 -49 11 -34 -27 -65
-50 -68 -50 -12 0 -71 99 -71 117 0 22 54 115 108 185 39 51 69 65 58 26 -3
-13 -9 -40 -12 -60 l-7 -38 37 0 c40 0 40 1 27 -33 -5 -13 -5 -30 -1 -37 9
-14 41 5 103 63 35 33 34 47 -6 72 -21 13 -45 46 -71 97 -42 84 -69 104 -93
72 -14 -19 -15 -19 -29 0 -8 11 -14 23 -14 28 0 23 -39 2 -84 -47 -28 -30 -56
-55 -62 -55 -6 0 -34 27 -63 60 -29 33 -59 60 -66 60 -8 0 -18 -14 -23 -32z
m134 -143 c10 -8 32 -15 48 -15 27 0 28 -2 22 -32 -8 -41 -32 -78 -51 -78 -16
0 -51 62 -55 95 -5 48 3 55 36 30z m-115 -74 c56 -56 59 -62 59 -109 0 -68
-32 -116 -81 -120 -64 -5 -119 63 -119 149 0 50 14 56 51 25 17 -14 34 -26 39
-26 20 0 19 20 -3 47 -87 103 -43 131 54 34z"
        />
        <path
          d="M2283 6950 c-38 -22 -43 -40 -12 -40 37 0 84 33 73 52 -8 13 -27 9
-61 -12z"
        />
        <path
          d="M3307 6964 c-14 -14 -7 -25 13 -22 12 2 21 8 21 13 0 12 -24 18 -34
9z"
        />
        <path
          d="M3251 6886 c-9 -11 -10 -20 -1 -35 11 -22 23 -26 105 -36 69 -9 173
-45 179 -61 7 -18 -43 -18 -149 1 -99 18 -164 20 -148 4 21 -21 167 -50 281
-56 96 -5 112 -4 112 9 0 18 -77 67 -205 131 -106 53 -155 66 -174 43z"
        />
        <path
          d="M2242 6855 c-82 -28 -147 -59 -157 -75 -20 -32 244 11 293 47 70 52
-15 69 -136 28z"
        />
        <path
          d="M1984 6709 c-13 -22 18 -34 84 -34 72 1 165 22 156 36 -8 13 -231 11
-240 -2z"
        />
        <path
          d="M3160 6675 c-16 -19 -4 -52 23 -59 39 -10 232 -7 221 4 -15 15 -175
70 -205 70 -15 0 -32 -7 -39 -15z"
        />
        <path
          d="M2320 6654 c-41 -14 -79 -29 -84 -35 -13 -12 185 -12 218 1 31 11 34
35 7 50 -29 15 -57 12 -141 -16z"
        />
        <path
          d="M3820 6650 c0 -5 11 -10 25 -10 14 0 25 5 25 10 0 6 -11 10 -25 10
-14 0 -25 -4 -25 -10z"
        />
        <path
          d="M1770 6620 c0 -5 14 -10 31 -10 17 0 28 4 24 10 -3 6 -17 10 -31 10
-13 0 -24 -4 -24 -10z"
        />
        <path
          d="M3272 6572 l-143 -3 -23 -52 c-13 -28 -32 -78 -42 -111 l-19 -59 38
-68 c40 -74 47 -116 20 -126 -16 -6 -49 25 -80 73 -12 18 -13 18 -27 1 -24
-31 -119 -276 -112 -292 7 -20 18 -19 160 10 163 33 286 74 436 147 119 58
130 66 236 172 105 106 224 251 224 273 0 6 -8 14 -17 19 -22 9 -452 20 -651
16z m233 -61 c62 -35 89 -65 81 -86 -5 -13 -18 -16 -64 -13 l-57 3 0 -45 c0
-58 -25 -66 -66 -21 -30 33 -43 37 -83 21 -42 -16 -50 -44 -21 -78 28 -33 31
-52 13 -70 -22 -22 -47 -12 -73 29 -24 37 -30 40 -62 37 -51 -4 -64 19 -34 61
31 42 70 61 131 61 45 0 52 3 61 26 9 25 12 26 59 21 27 -3 52 -3 54 2 3 4 -4
20 -15 37 -10 16 -19 32 -19 37 0 16 48 5 95 -22z"
        />
        <path
          d="M1730 6561 c-62 -17 -15 -113 117 -244 183 -181 358 -281 619 -355
121 -35 247 -56 276 -47 10 4 18 15 18 26 0 39 -82 259 -196 524 l-39 90 -50
7 c-28 3 -92 7 -143 7 -89 1 -95 0 -115 -25 -12 -15 -39 -45 -59 -69 -21 -23
-38 -46 -38 -51 0 -4 12 -20 26 -35 26 -27 26 -49 -1 -49 -32 0 -120 96 -110
122 3 7 18 19 33 26 44 19 86 58 78 70 -8 13 -371 16 -416 3z m680 -195 c0
-19 -61 -94 -96 -117 -73 -48 -74 4 -1 78 52 51 97 70 97 39z m148 -113 l-3
-65 35 -11 c24 -9 35 -18 35 -32 0 -27 -32 -30 -100 -10 -72 20 -86 45 -57
101 26 49 70 96 83 89 5 -4 8 -36 7 -72z"
        />
        <path
          d="M2775 6550 c-21 -24 -48 -26 -65 -5 -14 17 -40 20 -40 4 0 -6 25 -35
56 -64 54 -51 56 -55 50 -90 -12 -62 37 -90 70 -40 23 35 15 166 -11 195 -23
25 -37 25 -60 0z"
        />
        <path
          d="M2914 6555 c-4 -9 -2 -21 4 -27 16 -16 47 -5 47 17 0 26 -42 34 -51
10z"
        />
        <path
          d="M2800 6255 c-10 -12 -10 -21 -2 -40 15 -32 36 -32 51 1 19 43 -20 74
-49 39z"
        />
        <path
          d="M2850 5741 c0 -13 27 -21 45 -15 8 4 12 10 9 15 -7 12 -54 12 -54 0z"
        />
        <path
          d="M1944 3100 c-103 -21 -228 -112 -275 -201 -37 -69 -33 -165 8 -249
51 -105 139 -165 281 -195 136 -29 281 -13 371 42 152 93 354 256 359 290 6
39 -136 146 -295 223 -141 69 -347 110 -449 90z"
        />
        <path
          d="M3625 3103 c-130 -10 -251 -46 -385 -114 -96 -49 -246 -154 -263
-184 -11 -21 48 -80 183 -182 189 -142 282 -183 419 -183 202 1 356 73 426
202 40 73 47 185 16 247 -72 141 -231 227 -396 214z"
        />
        <path
          d="M5180 5160 l0 -3660 2400 0 2400 0 0 3660 0 3660 -2400 0 -2400 0 0
-3660z m4470 0 l0 -3620 -25 0 -25 0 0 3620 0 3620 25 0 25 0 0 -3620z m100 0
l0 -3620 -30 0 -30 0 0 3620 0 3620 30 0 30 0 0 -3620z m90 0 l0 -3620 -25 0
-25 0 0 3620 0 3620 25 0 25 0 0 -3620z m100 0 l0 -3620 -30 0 -30 0 0 3620 0
3620 30 0 30 0 0 -3620z m-2469 2774 c86 -63 306 -285 314 -317 23 -91 -95
-43 -273 111 -59 50 -104 82 -118 82 -40 0 -192 -140 -261 -240 -76 -112 -147
-284 -158 -387 -13 -122 -54 -179 -123 -171 l-27 3 -3 99 c-2 82 2 113 23 190
53 184 141 331 278 470 93 93 239 206 267 206 10 0 46 -21 81 -46z m149 -398
c117 -16 194 -42 340 -115 201 -101 329 -207 410 -341 76 -126 142 -335 112
-354 -32 -20 -118 58 -173 156 -103 182 -184 279 -311 369 -188 132 -300 161
-670 174 l-188 7 0 23 c0 13 15 40 34 59 l33 36 154 0 c85 0 201 -7 259 -14z
m-842 -163 c5 -33 -38 -106 -128 -219 -91 -114 -171 -260 -194 -355 -48 -195
8 -397 164 -593 39 -49 69 -94 67 -100 -4 -13 -78 -20 -125 -11 -76 14 -185
168 -248 350 -25 72 -28 94 -28 220 0 126 2 148 27 220 42 125 90 197 217 326
121 122 205 190 230 186 8 -1 16 -12 18 -24z m1120 -132 c81 -53 89 -78 73
-233 -23 -223 -69 -353 -179 -508 -60 -84 -173 -212 -212 -240 -28 -20 -31
-20 -54 -5 -54 36 -46 61 75 223 96 130 149 229 185 347 26 83 28 105 29 265
1 96 2 178 3 183 3 13 18 7 80 -32z m-313 -221 c98 -14 130 -27 143 -55 15
-33 0 -72 -30 -77 -13 -2 -63 1 -113 5 -118 11 -371 1 -460 -18 -133 -29 -291
-85 -434 -155 -80 -39 -150 -69 -158 -66 -8 4 -13 23 -13 55 0 86 49 124 270
207 124 46 290 89 405 104 88 11 309 11 390 0z m590 -190 c80 -38 236 -155
324 -242 82 -80 177 -207 209 -278 71 -158 105 -288 82 -315 -34 -41 -284 -85
-485 -85 -98 0 -125 3 -125 13 0 21 30 43 91 71 53 23 80 29 244 57 101 17
109 22 101 72 -4 23 -20 71 -36 106 -74 157 -193 293 -363 412 -197 139 -226
171 -191 211 24 26 61 20 149 -22z m-1183 -57 c8 -10 29 -47 47 -83 73 -142
214 -299 369 -411 90 -64 214 -128 356 -183 49 -19 81 -37 81 -46 0 -21 -81
-49 -143 -49 -102 -2 -277 85 -470 231 -134 102 -233 220 -325 390 -50 92 -49
111 11 142 57 30 55 30 74 9z m-761 -315 c18 -20 20 -32 16 -78 -3 -30 -19
-92 -36 -137 -36 -92 -46 -142 -33 -161 15 -23 140 -34 377 -35 258 0 351 10
484 53 123 40 188 47 230 26 95 -49 -49 -125 -366 -193 -117 -25 -146 -27
-343 -27 -154 0 -243 5 -315 17 -126 21 -214 44 -242 63 -46 29 -23 127 73
314 48 91 108 180 124 180 5 0 19 -10 31 -22z m2154 -42 c44 -58 43 -91 -6
-165 -128 -192 -338 -350 -574 -432 -114 -39 -206 -49 -461 -49 -222 0 -225 0
-307 29 -136 48 -136 48 -90 78 25 16 53 18 303 15 303 -4 344 1 515 59 218
74 398 216 489 386 68 124 87 136 131 79z m-707 -1721 c421 -63 851 -301 1064
-589 183 -247 268 -480 254 -703 -29 -488 -289 -856 -771 -1092 -302 -149
-544 -197 -940 -189 -238 5 -248 7 -477 82 -582 191 -941 595 -1028 1156 -10
66 -9 87 9 175 62 300 167 502 360 696 151 151 320 257 596 376 124 53 153 46
184 -46 45 -134 75 -171 137 -171 59 0 96 18 92 44 -2 17 -11 22 -48 24 -53 4
-80 25 -80 63 0 20 9 32 35 48 19 11 35 27 35 35 0 22 -40 46 -77 46 -36 0
-43 14 -15 29 17 9 126 25 232 35 85 8 335 -3 438 -19z"
        />
        <path
          d="M7310 4660 c-14 -25 -18 -141 -7 -192 9 -44 32 -56 49 -25 18 31 17
199 -1 220 -18 22 -28 21 -41 -3z"
        />
        <path
          d="M7500 4640 c-6 -12 -11 -57 -12 -101 0 -95 14 -119 71 -119 53 0 65
12 63 60 -2 26 3 52 13 67 23 35 15 64 -24 90 -43 29 -96 31 -111 3z"
        />
        <path
          d="M7851 4561 c-30 -41 -61 -112 -61 -138 0 -53 61 -1 95 80 32 77 8
117 -34 58z"
        />
        <path
          d="M8115 4492 c-42 -5 -49 -15 -46 -66 1 -34 -4 -50 -24 -75 -34 -39
-31 -75 7 -79 22 -3 33 5 57 40 18 25 51 54 78 68 37 19 49 31 51 52 5 42 -53
70 -123 60z"
        />
        <path
          d="M6616 4464 c-9 -24 -7 -73 5 -95 8 -16 16 -19 45 -13 31 6 39 3 62
-25 25 -30 29 -31 47 -17 15 11 20 26 20 65 0 27 -5 55 -11 61 -11 11 -114 40
-143 40 -11 0 -22 -7 -25 -16z"
        />
        <path
          d="M7356 4341 c-38 -39 -107 -68 -224 -92 -248 -52 -391 -132 -557 -312
-41 -45 -87 -105 -103 -134 -30 -58 -56 -73 -126 -73 -45 -1 -76 -18 -76 -43
0 -8 18 -30 40 -47 48 -38 55 -62 69 -235 5 -76 18 -157 30 -195 39 -123 142
-273 249 -359 l53 -43 -3 -80 c-4 -108 7 -116 95 -70 34 18 74 32 88 32 15 0
69 -13 121 -29 262 -81 445 -84 723 -12 119 31 219 41 283 30 66 -13 71 -7 64
61 l-4 48 104 109 c189 197 203 230 248 613 7 61 20 113 36 146 30 64 30 74
-1 74 -58 0 -112 38 -165 115 -146 212 -433 379 -713 415 -98 12 -125 25 -156
73 -13 20 -30 37 -36 37 -6 0 -24 -13 -39 -29z m359 -226 c192 -72 386 -205
452 -309 23 -35 23 -40 9 -54 -13 -13 -47 -17 -179 -20 -190 -5 -289 7 -323
39 -40 37 -153 331 -141 364 6 15 15 16 65 10 31 -4 84 -17 117 -30z m-477
-12 c-7 -53 -106 -314 -126 -334 -14 -14 -58 -18 -272 -27 -140 -5 -259 -6
-263 -2 -10 9 171 187 251 247 120 91 265 149 376 152 l39 1 -5 -37z m187
-145 c15 -35 38 -92 52 -127 33 -88 25 -96 -102 -96 -114 0 -122 6 -101 67 29
86 95 218 109 218 7 0 26 -28 42 -62z m658 -324 c56 -10 48 -34 -25 -82 -84
-54 -236 -125 -254 -118 -18 7 -64 108 -64 141 0 13 5 27 11 31 9 5 172 24
279 33 8 0 32 -2 53 -5z m-1078 -22 c40 -6 51 -11 53 -27 3 -26 -66 -143 -90
-151 -28 -8 -324 159 -312 177 6 10 274 11 349 1z m537 -3 c42 -11 62 -39 73
-104 4 -22 16 -64 27 -93 l20 -53 -23 -33 c-12 -19 -32 -39 -43 -47 -85 -54
-184 -109 -197 -109 -21 0 -156 71 -229 120 -67 45 -71 64 -35 175 31 97 47
123 88 140 39 17 263 20 319 4z m736 -175 c4 -133 -16 -212 -76 -304 -55 -82
-158 -190 -182 -190 -22 0 -66 83 -114 212 -51 136 -50 138 37 196 154 104
306 193 322 188 6 -1 11 -47 13 -102z m-1650 22 c137 -69 295 -162 306 -179 7
-11 -3 -43 -42 -123 -69 -140 -120 -216 -142 -212 -9 2 -45 35 -79 73 -102
115 -171 280 -171 410 0 92 5 93 128 31z m1115 -285 c32 -38 80 -170 75 -207
-2 -20 -9 -30 -23 -32 -28 -4 -225 134 -225 158 0 19 52 65 105 93 40 21 39
21 68 -12z m-598 -16 c103 -57 106 -72 28 -129 -63 -46 -218 -128 -226 -119
-18 17 -1 76 62 216 36 80 46 83 136 32z m389 -215 c188 -113 229 -147 203
-168 -33 -28 -234 -62 -362 -62 -81 0 -236 26 -280 47 -49 24 -43 48 25 94 70
47 271 159 286 159 7 0 64 -31 128 -70z"
        />
        <path
          d="M6167 4175 c-21 -21 -21 -21 4 -56 21 -30 144 -119 164 -119 6 0 28
18 49 39 49 50 41 67 -54 110 -89 41 -140 49 -163 26z"
        />
        <path
          d="M8517 4097 c-56 -30 -102 -60 -102 -68 0 -11 22 -15 99 -17 126 -4
146 7 146 77 0 35 -4 51 -16 55 -22 8 -14 11 -127 -47z"
        />
        <path
          d="M6065 3980 c-10 -17 11 -33 74 -59 64 -25 131 -38 131 -24 0 39 -186
114 -205 83z"
        />
        <path
          d="M8755 3879 c-152 -27 -224 -60 -191 -88 9 -7 35 -15 58 -18 29 -4 53
-15 74 -35 l32 -30 40 21 c73 37 109 126 63 151 -11 5 -21 9 -23 9 -2 -1 -25
-5 -53 -10z"
        />
        <path
          d="M5938 3780 c-48 -26 -52 -62 -9 -84 34 -18 203 -41 228 -32 15 6 13
12 -19 39 -25 21 -38 42 -40 62 -3 29 -4 30 -63 32 -44 2 -70 -3 -97 -17z"
        />
        <path
          d="M8800 3548 c-19 -12 -53 -28 -76 -37 -23 -9 -42 -20 -43 -26 -1 -5
22 -13 51 -18 35 -5 61 -16 78 -32 34 -33 55 -31 92 5 25 26 29 36 24 62 -14
68 -62 86 -126 46z"
        />
        <path
          d="M5932 3335 c-68 -21 -91 -48 -53 -60 15 -5 21 -17 23 -53 3 -43 5
-47 30 -50 28 -3 188 36 188 46 0 3 -7 13 -16 23 -15 17 -14 20 5 48 38 53 31
61 -56 60 -43 0 -97 -6 -121 -14z"
        />
        <path
          d="M8655 3271 c-9 -15 -11 -13 53 -45 29 -15 50 -31 47 -36 -3 -5 -27
-12 -53 -16 -49 -7 -92 -27 -92 -45 0 -20 70 -39 142 -39 102 0 118 6 118 41
0 17 9 37 20 46 32 28 25 52 -22 73 -54 23 -202 38 -213 21z"
        />
        <path
          d="M6051 3019 c-97 -19 -110 -88 -26 -138 26 -15 41 -18 53 -12 34 19
144 139 138 150 -8 13 -101 13 -165 0z"
        />
        <path
          d="M8562 3018 c-7 -7 -12 -20 -12 -29 0 -10 -11 -31 -25 -47 -29 -35
-27 -37 37 -46 28 -4 60 -17 77 -32 36 -30 55 -30 106 -1 76 43 55 75 -91 140
-70 31 -75 32 -92 15z"
        />
        <path
          d="M6330 2783 c-37 -14 -101 -67 -116 -94 -18 -36 -12 -62 22 -84 23
-15 27 -15 71 7 52 26 133 100 133 122 0 35 -67 65 -110 49z"
        />
        <path
          d="M8224 2624 c-16 -84 46 -214 101 -214 27 0 85 54 85 79 0 41 -123
171 -161 171 -13 0 -20 -11 -25 -36z"
        />
        <path
          d="M6612 2559 c-23 -11 -65 -23 -93 -26 -90 -11 -110 -50 -58 -116 35
-46 63 -36 147 47 47 47 73 81 70 92 -4 25 -17 25 -66 3z"
        />
        <path
          d="M7984 2496 c-6 -16 26 -85 63 -133 28 -39 63 -44 63 -10 0 57 -111
183 -126 143z"
        />
        <path
          d="M6777 2454 c-43 -61 -60 -110 -46 -136 14 -25 67 -48 120 -50 36 -1
46 4 70 30 15 17 33 49 40 71 22 73 -13 98 -50 36 -16 -27 -27 -35 -50 -35
-36 0 -45 21 -35 85 8 59 -7 59 -49 -1z"
        />
        <path
          d="M7764 2441 c-55 -25 -61 -45 -22 -72 26 -19 29 -26 25 -56 -8 -49 18
-73 81 -73 26 0 53 5 60 12 33 33 -13 165 -67 192 -36 19 -27 19 -77 -3z"
        />
        <path
          d="M7503 2388 c-4 -7 -8 -35 -8 -63 0 -44 -3 -50 -22 -53 -17 -3 -30 8
-55 42 -36 52 -59 58 -76 21 -16 -35 -15 -65 3 -108 16 -40 48 -52 133 -51 58
1 75 20 80 92 6 84 -29 160 -55 120z"
        />
      </g>
    </svg>
  </div>
  <div class="svg-container">
    <!-- FREEZING TEMPS SVG -->
    <svg
      id="freezing-svg"
      class="evidence inactive"
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200.000000 200.000000"
    >
      <g
        transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)"
        stroke="none"
      >
        <path
          d="M673 1884 c-18 -9 -43 -33 -55 -53 -23 -36 -23 -38 -26 -497 l-3
-461 -40 -18 c-59 -27 -133 -106 -170 -181 -26 -52 -33 -81 -37 -143 -10 -176
75 -318 237 -395 60 -28 75 -31 162 -31 90 0 99 2 171 37 91 45 147 103 191
196 29 61 32 76 32 162 -1 75 -6 107 -24 152 -28 72 -107 160 -178 200 l-53
30 0 463 0 463 -26 32 c-50 59 -117 75 -181 44z m126 -80 c21 -26 21 -36 21
-499 l0 -472 64 -32 c127 -62 191 -172 184 -316 -6 -127 -68 -223 -183 -283
-44 -24 -62 -27 -145 -27 -85 0 -101 3 -148 28 -101 53 -164 139 -181 248 -24
149 55 293 197 358 l52 24 0 472 c0 463 0 473 21 499 16 20 29 26 59 26 30 0
43 -6 59 -26z"
        />
        <path
          d="M717 1104 c-4 -4 -7 -83 -7 -175 l0 -168 -40 -11 c-97 -26 -180 -133
-180 -233 0 -72 18 -122 62 -172 68 -78 166 -104 270 -73 57 17 121 78 148
140 58 134 -21 301 -161 338 l-39 11 -2 172 c-3 164 -4 172 -23 175 -12 2 -24
0 -28 -4z"
        />
        <path
          d="M350 1725 c-6 -8 -10 -22 -8 -32 3 -16 14 -18 82 -18 63 0 81 3 89
17 8 12 7 21 -2 32 -18 22 -143 23 -161 1z"
        />
        <path
          d="M1343 1613 c-8 -3 -13 -24 -13 -55 l0 -50 -35 22 c-42 26 -79 23 -83
-6 -2 -17 9 -29 53 -54 31 -18 59 -38 61 -45 3 -6 4 -46 2 -88 l-3 -76 -72 42
-73 41 0 61 c0 72 -18 107 -47 89 -12 -8 -19 -26 -21 -58 -2 -25 -5 -46 -7
-46 -2 0 -19 9 -38 20 -40 24 -67 18 -67 -15 0 -16 11 -30 37 -45 l38 -22 -38
-22 c-37 -21 -54 -47 -42 -66 11 -17 44 -11 98 20 l52 29 73 -43 c54 -32 69
-45 60 -53 -25 -19 -126 -73 -137 -73 -6 0 -33 14 -61 31 -52 32 -75 32 -87 3
-6 -17 6 -31 57 -65 l23 -15 -36 -22 c-70 -41 -36 -94 34 -55 l38 21 3 -52 c3
-45 6 -51 27 -54 32 -5 41 12 41 84 l0 62 69 41 c38 22 72 41 75 41 3 0 6 -38
6 -85 l0 -84 -57 -34 c-39 -22 -59 -41 -61 -55 -5 -32 23 -38 66 -16 21 10 40
20 44 22 4 2 8 -18 10 -45 3 -44 5 -48 28 -48 23 0 25 4 28 48 2 26 5 47 8 47
3 0 22 -10 43 -22 44 -25 74 -19 69 14 -2 15 -22 34 -60 56 l-58 34 0 84 c0
46 3 84 8 84 4 0 39 -20 77 -43 l70 -42 5 -70 c5 -67 6 -70 30 -70 23 0 25 4
28 48 3 50 13 57 46 32 26 -19 50 -19 67 1 11 14 10 19 -12 38 -15 11 -34 26
-44 31 -15 9 -12 13 21 35 41 26 50 56 24 72 -11 7 -30 2 -68 -21 -29 -17 -58
-31 -63 -31 -6 0 -42 19 -81 41 l-70 41 75 44 76 44 52 -30 c58 -35 92 -36 97
-4 2 16 -8 28 -38 46 l-42 24 41 27 c45 30 48 38 25 61 -20 20 -23 20 -59 -4
-16 -11 -33 -20 -37 -20 -5 0 -8 20 -8 44 0 47 -17 70 -44 60 -13 -5 -16 -21
-16 -74 0 -76 3 -71 -93 -125 l-68 -37 3 88 3 88 55 33 c41 24 55 39 55 55 0
29 -35 36 -67 14 -37 -26 -47 -20 -50 31 -3 48 -15 59 -45 46z"
        />
        <path
          d="M352 1588 c-20 -20 -14 -47 11 -53 13 -4 49 -5 81 -3 66 3 91 23 67
52 -16 20 -140 23 -159 4z"
        />
        <path
          d="M353 1453 c-23 -9 -15 -52 10 -58 45 -12 139 -1 150 17 20 32 -8 48
-82 47 -36 0 -72 -3 -78 -6z"
        />
        <path
          d="M343 1304 c-3 -9 -2 -24 4 -33 15 -24 151 -23 166 1 8 12 7 21 -2 32
-20 23 -159 23 -168 0z"
        />
        <path
          d="M343 1164 c-12 -33 11 -49 75 -52 72 -3 105 10 100 41 -3 20 -9 22
-86 25 -69 2 -83 0 -89 -14z"
        />
        <path
          d="M347 1034 c-14 -14 -7 -43 12 -54 28 -14 124 -12 145 3 10 7 17 22
14 33 -3 17 -13 19 -84 22 -44 1 -83 0 -87 -4z"
        />
      </g>
    </svg>
  </div>
</div>`;
};

const createCounterDom = (fieldData) => {
  return `
  <div class="flex flex-row" id="counter-container">
<div class="counter-theme mr-0.5" id="counter-name">
  ${fieldData["counterDefaultString"]}
</div>
<div class="counter-theme" id="counter-number">0</div>
</div>
`;
};

const createOptionalObjectivesDom = (fieldData) => {
  return `<div class="optional-obj py-0.5" id="optional-obj">
  <div
    class="flex-1 flex ${fieldData["objectivesSpacing"]} hidden"
    id="optional-obj-container"
  ></div>
  <div class="objective" id="no-opt-objectives-container">
    ${fieldData["noOptionalObjectivesMessage"]}
  </div>
</div>`;
};

const createConclusionDom = (fieldData) => {
  return `<div class="conclusion pt-0.5 flex-1" id="conclusion">
  ${fieldData["zeroEvidenceConclusionString"]}
</div>`;
};
