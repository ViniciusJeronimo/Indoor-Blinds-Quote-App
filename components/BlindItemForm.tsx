import React, { useState, useEffect } from 'react';
import {
  BlindType, BlindItem, RollDirection, BottomRail, ChainType, MotorOption, ControlSide,
  BracketColor, Fitting, SlatSize, TrackColor, BottomType, ControlType, Bunch, TrackType,
  TimberSlatSize, TimberReturn, AluminiumSlatSize, CurtainType,
  TrackColorCurtain, HeadingStyle, HemStyle, CurtainControlType, CurtainControlSide, HookNumber
} from '../types';
import {
  ROLLER_OPTIONS, VERTICAL_OPTIONS, TIMBER_OPTIONS, ALUMINIUM_OPTIONS, CURTAIN_OPTIONS,
  getMaterialsForType, getColorsForType, CURTAIN_FABRICS_BY_TYPE, CURTAIN_COLORS_BY_FABRIC
} from '../constants';
import { Plus, X } from 'lucide-react';

interface Props {
  onAdd: (blind: BlindItem) => void;
  onCancel: () => void;
}

const BlindItemForm: React.FC<Props> = ({ onAdd, onCancel }) => {
  const [type, setType] = useState<BlindType>(BlindType.Roller);

  // Common State
  const [room, setRoom] = useState('');
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [width, setWidth] = useState<number>(0);
  const [drop, setDrop] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Roller & Double Roller Specific State
  const [rollDirection, setRollDirection] = useState<RollDirection>(RollDirection.Reverse);
  const [bottomRail, setBottomRail] = useState<BottomRail>(BottomRail.White);
  const [chainType, setChainType] = useState<ChainType>(ChainType.Metal);
  const [chainLength, setChainLength] = useState<number>(1000);
  const [motor, setMotor] = useState<MotorOption>(MotorOption.No);
  const [controlSide, setControlSide] = useState<ControlSide>(ControlSide.Left);
  const [bracketColor, setBracketColor] = useState<BracketColor>(BracketColor.White);
  const [fitting, setFitting] = useState<Fitting>(Fitting.Reveal);

  // Vertical Specific State
  const [slatSize, setSlatSize] = useState<SlatSize>(SlatSize.Size89);
  const [trackColor, setTrackColor] = useState<TrackColor>(TrackColor.White);
  const [bottomType, setBottomType] = useState<BottomType>(BottomType.SewIn);
  const [trackType, setTrackType] = useState<TrackType>(TrackType.V28);
  const [controlType, setControlType] = useState<ControlType>(ControlType.Cord);
  const [bunch, setBunch] = useState<Bunch>(Bunch.Left);

  // Venetian Timber Specific State
  const [timberSlatSize, setTimberSlatSize] = useState<string>(TimberSlatSize.Size50);
  const [valance, setValance] = useState('');
  const [timberBottomRail, setTimberBottomRail] = useState('');
  const [blindReturn, setBlindReturn] = useState<TimberReturn>(TimberReturn.No);
  const [timberControlType, setTimberControlType] = useState('');

  // Venetian Aluminium Specific State
  const [aluminiumSlatSize, setAluminiumSlatSize] = useState<string>(AluminiumSlatSize.Size25);

  // Curtain Specific State
  const [curtainType, setCurtainType] = useState<CurtainType>(CurtainType.Blockout);
  const [fabric, setFabric] = useState<string>('');
  const [trackColorCurtain, setTrackColorCurtain] = useState<string>(TrackColorCurtain.White);
  const [headingStyle, setHeadingStyle] = useState<string>(HeadingStyle.SWave);
  const [hemStyle, setHemStyle] = useState<string>(HemStyle.Standard);
  const [curtainControlType, setCurtainControlType] = useState<string>(CurtainControlType.HandDrawn);
  const [curtainControlSide, setCurtainControlSide] = useState<CurtainControlSide>(CurtainControlSide.Left);
  const [curtainBunch, setCurtainBunch] = useState<string>(Bunch.Left);
  const [bfp, setBfp] = useState<number>(0);
  const [hookNumber, setHookNumber] = useState<HookNumber>(HookNumber.H73);

  const isRollerType = type === BlindType.Roller || type === BlindType.DoubleRoller;
  const isVerticalType = type === BlindType.Vertical;
  const isVenetianTimber = type === BlindType.VenetianTimber;
  const isVenetianAluminium = type === BlindType.VenetianAluminium;
  const isCurtain = type === BlindType.Curtain;
  const isVertiSheer = type === BlindType.VertiSheer;
  const isFreeText = type === BlindType.Celular || type === BlindType.Shutter;

  // Derived material/color options for non-curtain blind types
  const availableMaterials = getMaterialsForType(type);
  const availableColors = getColorsForType(type, material);

  // Derived curtain options
  const availableFabrics = isCurtain ? (CURTAIN_FABRICS_BY_TYPE[curtainType] ?? []) : [];
  const availableCurtainColors = isCurtain ? (CURTAIN_COLORS_BY_FABRIC[fabric] ?? []) : [];

  // Reset material/color when blind type changes
  useEffect(() => {
    if (isCurtain) {
      const fabrics = CURTAIN_FABRICS_BY_TYPE[curtainType] ?? [];
      const firstFabric = fabrics[0] ?? '';
      setFabric(firstFabric);
      const colors = CURTAIN_COLORS_BY_FABRIC[firstFabric] ?? [];
      setColor(colors[0] ?? '');
      setMaterial('');
    } else if (availableMaterials && availableMaterials.length > 0) {
      const firstMat = availableMaterials[0];
      setMaterial(firstMat);
      const colors = getColorsForType(type, firstMat);
      setColor(colors && colors.length > 0 ? colors[0] : '');
    } else if (isVertiSheer) {
      setMaterial('');
      const colors = getColorsForType(type);
      setColor(colors && colors.length > 0 ? colors[0] : '');
    } else {
      setMaterial('');
      setColor('');
    }
    // Reset chain length default for roller
    if (isRollerType) setChainLength(1000);
  }, [type]);

  // Reset color when material changes (for standard types)
  useEffect(() => {
    if (!isCurtain && availableMaterials && material) {
      const colors = getColorsForType(type, material);
      if (colors && colors.length > 0) setColor(colors[0]);
    }
  }, [material]);

  // Reset fabric + color when curtain type changes
  useEffect(() => {
    if (isCurtain) {
      const fabrics = CURTAIN_FABRICS_BY_TYPE[curtainType] ?? [];
      const firstFabric = fabrics[0] ?? '';
      setFabric(firstFabric);
      const colors = CURTAIN_COLORS_BY_FABRIC[firstFabric] ?? [];
      setColor(colors[0] ?? '');
    }
  }, [curtainType]);

  // Reset color when curtain fabric changes
  useEffect(() => {
    if (isCurtain && fabric) {
      const colors = CURTAIN_COLORS_BY_FABRIC[fabric] ?? [];
      setColor(colors[0] ?? '');
    }
  }, [fabric]);

  // Vertical track type → control type enforcement
  useEffect(() => {
    if (type === BlindType.Vertical) {
      if (trackType === TrackType.V28) setControlType(ControlType.Cord);
      else if (trackType === TrackType.SafeTrack) setControlType(ControlType.Wand);
    }
  }, [trackType, type]);

  // Vertical wand → control side None
  useEffect(() => {
    if (type === BlindType.Vertical && controlType === ControlType.Wand) {
      setControlSide(ControlSide.None);
    }
  }, [controlType, type]);

  // Curtain drop auto-calculation from BFP + hook
  useEffect(() => {
    if (isCurtain) {
      let calcDrop = bfp;
      if (hookNumber === HookNumber.H71) calcDrop = bfp - 40;
      else if (hookNumber === HookNumber.H72) calcDrop = bfp - 20;
      else if (hookNumber === HookNumber.H73) calcDrop = bfp;
      else if (hookNumber === HookNumber.H74) calcDrop = bfp + 10;
      setDrop(calcDrop >= 0 ? calcDrop : 0);
    }
  }, [isCurtain, hookNumber, bfp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const baseData = {
      id: crypto.randomUUID(),
      room: room || 'Unknown Room',
      material: isCurtain ? fabric : material,
      color,
      width,
      drop,
      price,
      notes
    };

    let newItem: BlindItem;

    if (isRollerType) {
      newItem = {
        ...baseData,
        type: type as BlindType.Roller | BlindType.DoubleRoller,
        rollDirection, bottomRail, chainType, chainLength,
        motor, controlSide, bracketColor, fitting
      };
    } else if (type === BlindType.Vertical) {
      newItem = {
        ...baseData,
        type: BlindType.Vertical,
        slatSize, trackColor, bottomType, trackType,
        controlType, bunch, controlSide, fitting
      };
    } else if (isVenetianTimber) {
      newItem = {
        ...baseData,
        type: BlindType.VenetianTimber,
        slatSize: timberSlatSize,
        valance,
        bottomRail: timberBottomRail,
        blindReturn,
        controlType: timberControlType,
        controlSide
      };
    } else if (isVenetianAluminium) {
      newItem = {
        ...baseData,
        type: BlindType.VenetianAluminium,
        slatSize: aluminiumSlatSize,
        controlSide
      };
    } else if (isCurtain) {
      newItem = {
        ...baseData,
        type: BlindType.Curtain,
        curtainType,
        fabric,
        trackColor: trackColorCurtain,
        headingStyle,
        hemStyle,
        controlType: curtainControlType,
        controlSide: curtainControlType === CurtainControlType.Cord ? curtainControlSide : undefined,
        bunch: curtainBunch,
        bfp,
        hookNumber,
        fitting
      };
    } else {
      newItem = { ...baseData, type: type as any };
    }

    onAdd(newItem);

    // Reset for next item
    setRoom('');
    setWidth(0);
    setDrop(0);
    setPrice(0);
    setNotes('');
    setBfp(0);
  };

  const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm border p-2 bg-white text-gray-900";
  const labelClass = "block text-xs font-medium text-gray-700 uppercase tracking-wide truncate";

  // Reusable material selector
  const renderMaterialField = () => {
    if (isVertiSheer || isCurtain) return null; // handled separately
    if (isFreeText) {
      return (
        <div>
          <label className={labelClass}>Material</label>
          <input type="text" value={material} onChange={e => setMaterial(e.target.value)} className={inputClass} placeholder="Enter material" />
        </div>
      );
    }
    if (!availableMaterials) return null;
    return (
      <div>
        <label className={labelClass}>Material</label>
        <select value={material} onChange={e => setMaterial(e.target.value)} className={inputClass}>
          {availableMaterials.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  };

  // Reusable color selector
  const renderColorField = () => {
    if (isCurtain) return null; // handled in curtain section
    if (isFreeText) {
      return (
        <div>
          <label className={labelClass}>Colour</label>
          <input type="text" value={color} onChange={e => setColor(e.target.value)} className={inputClass} placeholder="Enter colour" />
        </div>
      );
    }
    const colors = availableColors;
    if (!colors) return null;
    return (
      <div>
        <label className={labelClass}>Colour</label>
        <select value={color} onChange={e => setColor(e.target.value)} className={inputClass} disabled={colors.length === 0}>
          {colors.length === 0
            ? <option value="">— select material first —</option>
            : colors.map(o => <option key={o} value={o}>{o}</option>)
          }
        </select>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-brand-100 overflow-hidden mb-6">
      <div className="bg-brand-50 px-6 py-4 border-b border-brand-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-brand-800 flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Add New Blind
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Blind Type Selector */}
        <div className="mb-6">
          <label className={labelClass}>Blind Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as BlindType)}
            className={`${inputClass} font-semibold text-brand-900 bg-blue-50 border-blue-200`}
          >
            {Object.values(BlindType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Basic Details */}
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h4 className="text-sm font-bold text-gray-900 mb-4">Basic Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Room</label>
              <input required type="text" value={room} onChange={e => setRoom(e.target.value)} className={inputClass} placeholder="e.g. Living Room" />
            </div>

            {/* Curtain: show Type + Fabric + Colour in basic details */}
            {isCurtain && (
              <>
                <div>
                  <label className={labelClass}>Curtain Type</label>
                  <select value={curtainType} onChange={e => setCurtainType(e.target.value as CurtainType)} className={inputClass}>
                    {Object.values(CurtainType).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Fabric</label>
                  <select value={fabric} onChange={e => setFabric(e.target.value)} className={inputClass}>
                    {availableFabrics.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Colour</label>
                  <select value={color} onChange={e => setColor(e.target.value)} className={inputClass} disabled={availableCurtainColors.length === 0}>
                    {availableCurtainColors.length === 0
                      ? <option value="">— select fabric first —</option>
                      : availableCurtainColors.map(o => <option key={o} value={o}>{o}</option>)
                    }
                  </select>
                </div>
              </>
            )}

            {/* All other types: material + colour */}
            {!isCurtain && renderMaterialField()}
            {!isCurtain && renderColorField()}
          </div>
        </div>

        {/* Roller & Double Roller Specific */}
        {isRollerType && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4">{type} Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className={labelClass}>Roll Direction</label>
                <select value={rollDirection} onChange={e => setRollDirection(e.target.value as RollDirection)} className={inputClass}>
                  {ROLLER_OPTIONS.rollDirection.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Chain Type</label>
                <select value={chainType} onChange={e => setChainType(e.target.value as ChainType)} className={inputClass}>
                  {ROLLER_OPTIONS.chainType.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Chain Length</label>
                <input type="number" value={chainLength} onChange={e => setChainLength(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Bottom Rail</label>
                <select value={bottomRail} onChange={e => setBottomRail(e.target.value as BottomRail)} className={inputClass}>
                  {ROLLER_OPTIONS.bottomRail.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Motor</label>
                <select value={motor} onChange={e => setMotor(e.target.value as MotorOption)} className={inputClass}>
                  {ROLLER_OPTIONS.motor.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Control Side</label>
                <select value={controlSide} onChange={e => setControlSide(e.target.value as ControlSide)} className={inputClass}>
                  {ROLLER_OPTIONS.controlSide.filter(c => c !== ControlSide.None).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Bracket Color</label>
                <select value={bracketColor} onChange={e => setBracketColor(e.target.value as BracketColor)} className={inputClass}>
                  {ROLLER_OPTIONS.bracketColor.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fitting</label>
                <select value={fitting} onChange={e => setFitting(e.target.value as Fitting)} className={inputClass}>
                  {ROLLER_OPTIONS.fitting.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Vertical Specific */}
        {isVerticalType && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Vertical Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className={labelClass}>Slat Size</label>
                <select value={slatSize} onChange={e => setSlatSize(e.target.value as SlatSize)} className={inputClass}>
                  {VERTICAL_OPTIONS.slatSize.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Track Color</label>
                <select value={trackColor} onChange={e => setTrackColor(e.target.value as TrackColor)} className={inputClass}>
                  {VERTICAL_OPTIONS.trackColor.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Bottom Type</label>
                <select value={bottomType} onChange={e => setBottomType(e.target.value as BottomType)} className={inputClass}>
                  {VERTICAL_OPTIONS.bottomType.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Track Type</label>
                <select value={trackType} onChange={e => setTrackType(e.target.value as TrackType)} className={inputClass}>
                  {VERTICAL_OPTIONS.trackType.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Control Type</label>
                <select value={controlType} onChange={e => setControlType(e.target.value as ControlType)} className={inputClass}>
                  {VERTICAL_OPTIONS.controlType.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Bunch</label>
                <select value={bunch} onChange={e => setBunch(e.target.value as Bunch)} className={inputClass}>
                  {VERTICAL_OPTIONS.bunch.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Control Side</label>
                <select
                  value={controlSide}
                  onChange={e => setControlSide(e.target.value as ControlSide)}
                  className={`${inputClass} ${controlType === ControlType.Wand ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                  disabled={controlType === ControlType.Wand}
                >
                  {VERTICAL_OPTIONS.controlSide.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fitting</label>
                <select value={fitting} onChange={e => setFitting(e.target.value as Fitting)} className={inputClass}>
                  {VERTICAL_OPTIONS.fitting.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Venetian Timber Specific */}
        {isVenetianTimber && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Venetian Timber Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className={labelClass}>Slat Size</label>
                <input type="text" value={timberSlatSize} onChange={e => setTimberSlatSize(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Valance</label>
                <input type="text" value={valance} onChange={e => setValance(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Bottom Rail</label>
                <input type="text" value={timberBottomRail} onChange={e => setTimberBottomRail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Return</label>
                <select value={blindReturn} onChange={e => setBlindReturn(e.target.value as TimberReturn)} className={inputClass}>
                  {TIMBER_OPTIONS.blindReturn.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Control Type</label>
                <input type="text" value={timberControlType} onChange={e => setTimberControlType(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Control Side</label>
                <select value={controlSide} onChange={e => setControlSide(e.target.value as ControlSide)} className={inputClass}>
                  {TIMBER_OPTIONS.controlSide.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Venetian Aluminium Specific */}
        {isVenetianAluminium && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Venetian Aluminium Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className={labelClass}>Slat Size</label>
                <input type="text" value={aluminiumSlatSize} onChange={e => setAluminiumSlatSize(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Control Side</label>
                <select value={controlSide} onChange={e => setControlSide(e.target.value as ControlSide)} className={inputClass}>
                  {ALUMINIUM_OPTIONS.controlSide.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Curtain Specific */}
        {isCurtain && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Curtain Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className={labelClass}>Track Colour</label>
                <select value={trackColorCurtain} onChange={e => setTrackColorCurtain(e.target.value)} className={inputClass}>
                  {CURTAIN_OPTIONS.trackColor.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Heading Style</label>
                <select value={headingStyle} onChange={e => setHeadingStyle(e.target.value)} className={inputClass}>
                  {CURTAIN_OPTIONS.headingStyle.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Hem Style</label>
                <select value={hemStyle} onChange={e => setHemStyle(e.target.value)} className={inputClass}>
                  {CURTAIN_OPTIONS.hemStyle.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Control Type</label>
                <select value={curtainControlType} onChange={e => setCurtainControlType(e.target.value)} className={inputClass}>
                  {CURTAIN_OPTIONS.controlType.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {curtainControlType === CurtainControlType.Cord && (
                <div>
                  <label className={labelClass}>Control Side</label>
                  <select value={curtainControlSide} onChange={e => setCurtainControlSide(e.target.value as CurtainControlSide)} className={inputClass}>
                    {CURTAIN_OPTIONS.controlSide.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className={labelClass}>Bunch</label>
                <select value={curtainBunch} onChange={e => setCurtainBunch(e.target.value)} className={inputClass}>
                  {CURTAIN_OPTIONS.bunch.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>BFP</label>
                <input required type="number" step="0.01" value={bfp || ''} onChange={e => setBfp(parseFloat(e.target.value) || 0)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hook Number</label>
                <select value={hookNumber} onChange={e => setHookNumber(e.target.value as HookNumber)} className={inputClass}>
                  {CURTAIN_OPTIONS.hookNumber.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fitting</label>
                <select value={fitting} onChange={e => setFitting(e.target.value as Fitting)} className={inputClass}>
                  {CURTAIN_OPTIONS.fitting.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Dimensions & Cost */}
        <div className="border-t border-gray-100 pt-6 mt-2">
          <h4 className="text-sm font-bold text-gray-900 mb-4">Dimensions & Cost</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Width (mm)</label>
              <input required type="number" min="0" value={width || ''} onChange={e => setWidth(parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Drop (mm)</label>
              <input
                required
                type="number"
                min="0"
                value={drop || ''}
                onChange={e => setDrop(parseInt(e.target.value) || 0)}
                className={`${inputClass} ${isCurtain ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                readOnly={isCurtain}
                title={isCurtain ? "Calculated automatically from BFP and Hook Number" : ""}
              />
            </div>
            <div>
              <label className={labelClass}>Price ($)</label>
              <input required type="number" min="0" step="0.01" value={price || ''} onChange={e => setPrice(parseFloat(e.target.value) || 0)} className={`${inputClass} font-bold text-brand-700 bg-brand-50`} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className={labelClass}>Notes</label>
          <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} placeholder="Specific instructions for this blind..." />
        </div>

        <div className="mt-8 flex justify-end space-x-3 border-t border-gray-100 pt-5">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-5 py-1.5 bg-brand-600 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white hover:bg-brand-700 transition-all active:scale-95">
            Add to Quote
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlindItemForm;
