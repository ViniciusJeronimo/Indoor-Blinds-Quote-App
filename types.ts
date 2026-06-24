import {
  BlindType, RollDirection, BottomRail, ChainType, MotorOption, ControlSide,
  BracketColor, Fitting, SlatSize, TrackColor, BottomType, ControlType, Bunch,
  TrackType, TimberSlatSize, TimberReturn, AluminiumSlatSize, CurtainType,
  CurtainFabric, TrackColorCurtain, HeadingStyle, HemStyle, CurtainControlType,
  CurtainControlSide, HookNumber
} from './types';

export const BLIND_TYPES = Object.values(BlindType);

export const ROLLER_OPTIONS = {
  rollDirection: Object.values(RollDirection),
  bottomRail: Object.values(BottomRail),
  chainType: Object.values(ChainType),
  motor: Object.values(MotorOption),
  controlSide: Object.values(ControlSide),
  bracketColor: Object.values(BracketColor),
  fitting: Object.values(Fitting),
};

export const VERTICAL_OPTIONS = {
  slatSize: Object.values(SlatSize),
  trackColor: Object.values(TrackColor),
  bottomType: Object.values(BottomType),
  trackType: Object.values(TrackType),
  controlType: Object.values(ControlType),
  bunch: Object.values(Bunch),
  controlSide: Object.values(ControlSide),
  fitting: Object.values(Fitting),
};

export const TIMBER_OPTIONS = {
  slatSize: Object.values(TimberSlatSize),
  blindReturn: Object.values(TimberReturn),
  controlSide: Object.values(ControlSide),
};

export const ALUMINIUM_OPTIONS = {
  slatSize: Object.values(AluminiumSlatSize),
  controlSide: Object.values(ControlSide),
};

export const CURTAIN_OPTIONS = {
  curtainType: Object.values(CurtainType),
  fabric: Object.values(CurtainFabric),
  trackColor: Object.values(TrackColorCurtain),
  headingStyle: Object.values(HeadingStyle),
  hemStyle: Object.values(HemStyle),
  controlType: Object.values(CurtainControlType),
  controlSide: Object.values(CurtainControlSide),
  bunch: Object.values(Bunch),
  hookNumber: Object.values(HookNumber),
  fitting: Object.values(Fitting),
};

// -----------------------------------------------------------------
// MATERIAL / COLOR DATA PER BLIND TYPE
// -----------------------------------------------------------------

// Types that share the same material/color structure (Roller, Double Roller, Roman, Panel, Vertical)
export const STANDARD_MATERIALS = ['CAI', 'Bancoora', 'Cascata', 'Elite Screen'];

export const STANDARD_COLORS_BY_MATERIAL: Record<string, string[]> = {
  'CAI': ['Oyster', 'Spirit', 'Mist', 'Raven', 'Chiffon', 'Whisper'],
  'Bancoora': ['White', 'Fawn', 'Whisper', 'Taupe'],
  'Cascata': ['Mercurio', 'Neve', 'Grigio'],
  'Elite Screen': ['Concrete', 'Whisper', 'Platinum', 'Charcoal'],
};

// Venetian Timber
export const TIMBER_MATERIALS = ['M2M', 'Verona'];
export const TIMBER_COLORS = ['White', 'White Stripes'];

// Venetian Aluminium
export const ALUMINIUM_MATERIAL = 'Aluminium';
export const ALUMINIUM_COLORS = ['White', 'Red', 'Blue', 'Black'];

// VertiSheer — no material field, just colors
export const VERTISHEER_COLORS = ['White', 'Pure White', 'Porcelain', 'Latte', 'Storm'];

// Curtain colors are driven by curtainType + material (fabric), defined in types.ts enums
// but we add the explicit mapping here for the form
export const CURTAIN_COLORS_BY_FABRIC: Record<string, string[]> = {
  // Blockout fabrics
  'MK Weylands': ['Stone', 'Birch', 'White'],
  'Filigree Harris': ['Stone', 'Birch', 'White'],
  // Sheer fabrics
  'CP Carter': ['Vanilla', 'Stone', 'Parchment'],
  'CP Omni': ['Vanilla', 'Stone', 'Parchment'],
  'MK Aruba': ['Vanilla', 'Stone', 'Parchment'],
  // Privacy
  'Opulent Hues': ['Oyster'],
};

export const CURTAIN_FABRICS_BY_TYPE: Record<string, string[]> = {
  'Blockout': ['MK Weylands', 'Filigree Harris'],
  'Sheer': ['CP Carter', 'CP Omni', 'MK Aruba'],
  'Privacy': ['Opulent Hues'],
};

// Helper: get materials for a given blind type
export function getMaterialsForType(type: BlindType): string[] | null {
  switch (type) {
    case BlindType.Roller:
    case BlindType.DoubleRoller:
    case BlindType.Roman:
    case BlindType.Panel:
    case BlindType.Vertical:
      return STANDARD_MATERIALS;
    case BlindType.VenetianTimber:
      return TIMBER_MATERIALS;
    case BlindType.VenetianAluminium:
      return [ALUMINIUM_MATERIAL];
    case BlindType.VertiSheer:
      return null; // No material field for VertiSheer
    case BlindType.Cellular:
    case BlindType.Shutter:
      return null; // Free text
    default:
      return null;
  }
}

// Helper: get colors for a given blind type + selected material
export function getColorsForType(type: BlindType, material?: string): string[] | null {
  switch (type) {
    case BlindType.Roller:
    case BlindType.DoubleRoller:
    case BlindType.Roman:
    case BlindType.Panel:
    case BlindType.Vertical:
      return material ? (STANDARD_COLORS_BY_MATERIAL[material] ?? []) : [];
    case BlindType.VenetianTimber:
      return TIMBER_COLORS;
    case BlindType.VenetianAluminium:
      return ALUMINIUM_COLORS;
    case BlindType.VertiSheer:
      return VERTISHEER_COLORS;
    case BlindType.Cellular:
    case BlindType.Shutter:
      return null; // Free text
    default:
      return null;
  }
}
