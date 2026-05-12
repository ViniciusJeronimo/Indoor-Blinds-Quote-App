
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

export const MATERIAL_OPTIONS = ['Cai', 'Bancoora', 'Cascata'];
export const COLOR_OPTIONS = ['Whisper', 'Porcellin', 'Oyster'];

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

export const PLACEHOLDER_IMAGES = {
  roller: "https://picsum.photos/400/300?random=1",
  vertical: "https://picsum.photos/400/300?random=2",
  default: "https://picsum.photos/400/300?random=3"
};
