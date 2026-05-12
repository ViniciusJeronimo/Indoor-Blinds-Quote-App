
export enum BlindType {
  Roller = 'Roller',
  DoubleRoller = 'Double Roller',
  Vertical = 'Vertical',
  VenetianAluminium = 'Venetian Aluminium',
  VenetianTimber = 'Venetian Timber',
  Roman = 'Roman',
  Celular = 'Celular',
  Panel = 'Panel',
  Shutter = 'Shutter',
  VertiSheer = 'Verti Sheer',
  Curtain = 'Curtain'
}

// Roller Specific Enums
export enum RollDirection { Standard = 'Standard', Reverse = 'Reverse' }
export enum BottomRail { White = 'White', Anodised = 'Anodised', SurfMist = 'Surf Mist', Dune = 'Dune', Black = 'Black' }
export enum ChainType { Plastic = 'Plastic', Metal = 'Metal' }
export enum MotorOption { Yes = 'Yes', No = 'No' }
export enum ControlSide { Left = 'Left', Right = 'Right', None = 'None' }
export enum BracketColor { White = 'White', Grey = 'Grey', Black = 'Black' }
export enum Fitting { Reveal = 'Reveal', Face = 'Face', Top = 'Top' }

// Vertical Specific Enums
export enum SlatSize { Size89 = '89', Size127 = '127' }
export enum TrackColor { White = 'White', Cream = 'Cream', Grey = 'Grey', Black = 'Black' }
export enum BottomType { SewIn = 'Sew In', Chainless = 'Chainless', Chains = 'Chains' }
export enum TrackType { V28 = 'V28', SafeTrack = 'Safe Track' }
export enum ControlType { Wand = 'Wand', Cord = 'Cord' }
export enum Bunch { Left = 'Left', Right = 'Right', CO = 'CO', CB = 'CB' }

// Venetian Timber Specific Enums
export enum TimberSlatSize { Size50 = '50', Size63 = '63' }
export enum TimberReturn { Yes = 'Yes', No = 'No' }

// Venetian Aluminium Specific Enums
export enum AluminiumSlatSize { Size25 = '25' }

// Curtain Specific Enums
export enum CurtainType { Blockout = 'Blockout', Sheer = 'Sheer' }
export enum CurtainFabric { Aruba = 'MK Aruba', Carter = 'CP Carter', Harris = 'Filigree Harris' }
export enum TrackColorCurtain { White = 'White', Silver = 'Silver', Black = 'Black' }
export enum HeadingStyle { SWave = 'S-Wave', ReverseBox = 'Reverse Box', PP1 = '1 P.P.', PP2 = '2 P.P.', PP3 = '3 P.P.' }
export enum HemStyle { Standard = 'Standard', Weighted = 'Weighted' }
export enum CurtainControlType { HandDrawn = 'Hand Drawn', Cord = 'Cord' }
export enum CurtainControlSide { Left = 'Left', Right = 'Right', Both = 'Both' }
export enum HookNumber { H71 = '71', H72 = '72', H73 = '73', H74 = '74' }

export interface BaseBlindData {
  id: string;
  type: BlindType;
  room: string;
  material: string;
  color: string;
  width: number;
  drop: number;
  price: number;
  notes?: string;
}

export interface RollerBlindData extends BaseBlindData {
  type: BlindType.Roller | BlindType.DoubleRoller;
  rollDirection: RollDirection;
  bottomRail: BottomRail;
  chainType: ChainType;
  chainLength: number;
  motor: MotorOption;
  controlSide: ControlSide;
  bracketColor: BracketColor;
  fitting: Fitting;
}

export interface VerticalBlindData extends BaseBlindData {
  type: BlindType.Vertical;
  slatSize: SlatSize;
  trackColor: TrackColor;
  bottomType: BottomType;
  trackType: TrackType;
  controlType: ControlType;
  bunch: Bunch;
  controlSide: ControlSide;
  fitting: Fitting;
}

export interface VenetianTimberData extends BaseBlindData {
  type: BlindType.VenetianTimber;
  slatSize: TimberSlatSize | string; // standard 50, but can be changed
  valance: string;
  bottomRail: string;
  blindReturn: TimberReturn;
  controlType: string;
  controlSide: ControlSide;
}

export interface VenetianAluminiumData extends BaseBlindData {
  type: BlindType.VenetianAluminium;
  slatSize: AluminiumSlatSize | string; // standard 25, but can be changed
  controlSide: ControlSide;
}

export interface CurtainData extends BaseBlindData {
  type: BlindType.Curtain;
  curtainType: CurtainType;
  fabric: CurtainFabric | string;
  trackColor: TrackColorCurtain | string;
  headingStyle: HeadingStyle | string;
  hemStyle: HemStyle | string;
  controlType: CurtainControlType | string;
  controlSide?: CurtainControlSide; // Shown if controlType is Cord
  bunch: Bunch | string;
  bfp: number;
  hookNumber: HookNumber;
  fitting: Fitting;
}

// Placeholder for other types to ensure type safety
export interface GenericBlindData extends BaseBlindData {
  type: Exclude<BlindType, BlindType.Roller | BlindType.DoubleRoller | BlindType.Vertical | BlindType.VenetianTimber | BlindType.VenetianAluminium | BlindType.Curtain>;
}

export type BlindItem = RollerBlindData | VerticalBlindData | VenetianTimberData | VenetianAluminiumData | CurtainData | GenericBlindData;

export type UserRole = 'admin' | 'salesperson';

export interface SystemUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  receptionEmail?: string;
  salespersonPersonalEmail?: string;
  createdAt: any;
}

export interface Customer {
  customerNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export interface Quote {
  id: string;
  customer: Customer;
  blinds: BlindItem[];
  fittingPrice?: number;
  fittingIncluded?: boolean;
  takedowns?: number; // Quantity of takedowns
  takedownsIncluded?: boolean; // If true, takedown cost is 0
  discount?: number;
  createdAt: Date;
}