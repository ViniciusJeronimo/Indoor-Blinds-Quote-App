
import React, { useState, useEffect } from 'react';
import { 
  BlindType, BlindItem, RollDirection, BottomRail, ChainType, MotorOption, ControlSide, 
  BracketColor, Fitting, SlatSize, TrackColor, BottomType, ControlType, Bunch, TrackType,
  TimberSlatSize, TimberReturn, AluminiumSlatSize, CurtainType, CurtainFabric, 
  TrackColorCurtain, HeadingStyle, HemStyle, CurtainControlType, CurtainControlSide, HookNumber
} from '../types';
import { 
  ROLLER_OPTIONS, VERTICAL_OPTIONS, MATERIAL_OPTIONS, COLOR_OPTIONS, 
  TIMBER_OPTIONS, ALUMINIUM_OPTIONS, CURTAIN_OPTIONS 
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
  const [chainLength, setChainLength] = useState<number>(1000); // Standard default 1000
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
  const [fabric, setFabric] = useState<string>(CurtainFabric.Aruba);
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
  const isDropdownType = isRollerType || isVerticalType;

  // Reset Defaults when Type Changes
  useEffect(() => {
    if (isRollerType) {
       setChainLength(1000);
    }
    if (isVenetianTimber) {
       setTimberSlatSize(TimberSlatSize.Size50);
    }
    if (isVenetianAluminium) {
       setAluminiumSlatSize(AluminiumSlatSize.Size25);
    }
    if (isDropdownType) {
       if (!MATERIAL_OPTIONS.includes(material)) setMaterial(MATERIAL_OPTIONS[0]);
       if (!COLOR_OPTIONS.includes(color)) setColor(COLOR_OPTIONS[0]);
    }
  }, [type, isRollerType, isDropdownType]);

  // Condition: If Vertical, Track type changes, enforce Control Type
  useEffect(() => {
    if (type === BlindType.Vertical) {
        if (trackType === TrackType.V28) {
            setControlType(ControlType.Cord);
        } else if (trackType === TrackType.SafeTrack) {
            setControlType(ControlType.Wand);
        }
    }
  }, [trackType, type]);

  // Condition: If Vertical, Control Type is Wand, enforce Control Side to None
  useEffect(() => {
    if (type === BlindType.Vertical && controlType === ControlType.Wand) {
        setControlSide(ControlSide.None);
    }
  }, [controlType, type]);

  // Effect for calculation of drop for Curtains
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
      material,
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
        rollDirection,
        bottomRail,
        chainType,
        chainLength,
        motor,
        controlSide,
        bracketColor,
        fitting
      };
    } else if (type === BlindType.Vertical) {
      newItem = {
        ...baseData,
        type: BlindType.Vertical,
        slatSize,
        trackColor,
        bottomType,
        trackType,
        controlType,
        bunch,
        controlSide,
        fitting
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
      // Generic fallback
      newItem = {
        ...baseData,
        type: type as any
      };
    }

    onAdd(newItem);
    
    // Reset core fields for next item
    setRoom('');
    setMaterial('');
    setColor('');
    setWidth(0);
    setDrop(0);
    setPrice(0);
    setNotes('');
  };

  const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm border p-2 bg-white text-gray-900";
  const labelClass = "block text-xs font-medium text-gray-700 uppercase tracking-wide truncate";

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
                {Object.values(BlindType).map(t => (
                    <option key={t} value={t}>{t}</option>
                ))}
             </select>
        </div>

        {/* Basic Details Section */}
        <div className="border-b border-gray-100 pb-6 mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Basic Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className={labelClass}>Room</label>
                    <input required type="text" value={room} onChange={e => setRoom(e.target.value)} className={inputClass} placeholder="e.g. Living Room" />
                </div>
                {!isCurtain && (
                    <div>
                        <label className={labelClass}>{isVenetianTimber ? 'Type (Timber)' : 'Material'}</label>
                        {isDropdownType ? (
                            <select required value={material} onChange={e => setMaterial(e.target.value)} className={inputClass}>
                                {MATERIAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        ) : (
                            <input required type="text" value={material} onChange={e => setMaterial(e.target.value)} className={inputClass} placeholder={isVenetianTimber ? "e.g. Real Wood" : "e.g. Blockout"} />
                        )}
                    </div>
                )}
                {!isCurtain && (
                    <div>
                        <label className={labelClass}>{isCurtain ? 'Colour' : 'Color'}</label>
                        {isDropdownType ? (
                            <select required value={color} onChange={e => setColor(e.target.value)} className={inputClass}>
                                {COLOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        ) : (
                            <input required type="text" value={color} onChange={e => setColor(e.target.value)} className={inputClass} />
                        )}
                    </div>
                )}
                {isCurtain && (
                    <div>
                        <label className={labelClass}>Type</label>
                        <select value={curtainType} onChange={e => setCurtainType(e.target.value as CurtainType)} className={inputClass}>
                            {CURTAIN_OPTIONS.curtainType.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                )}
            </div>
        </div>

        {/* Venetian Timber Specific Configuration */}
        {isVenetianTimber && (
            <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Venetian Timber Configuration</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                        <label className={labelClass}>Slat Size</label>
                        <input 
                            type="text" 
                            value={timberSlatSize} 
                            onChange={e => setTimberSlatSize(e.target.value)} 
                            className={inputClass} 
                        />
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

        {/* Venetian Aluminium Specific Configuration */}
        {isVenetianAluminium && (
            <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Venetian Aluminium Configuration</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                        <label className={labelClass}>Slat Size</label>
                        <input 
                            type="text" 
                            value={aluminiumSlatSize} 
                            onChange={e => setAluminiumSlatSize(e.target.value)} 
                            className={inputClass} 
                        />
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

        {/* Curtain Specific Configuration */}
        {isCurtain && (
            <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Curtain Configuration</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div>
                        <label className={labelClass}>Fabric</label>
                        <select value={fabric} onChange={e => setFabric(e.target.value)} className={inputClass}>
                            {CURTAIN_OPTIONS.fabric.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Colour</label>
                        <input type="text" value={color} onChange={e => setColor(e.target.value)} className={inputClass} />
                    </div>
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

        {/* Roller & Double Roller Specific Configuration */}
        {isRollerType && (
            <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4">{type} Configuration</h4>
                {/* Tighter grid for smaller boxes: 3 per row on medium, 6 on large */}
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
                        <input 
                          type="number" 
                          value={chainLength} 
                          onChange={e => setChainLength(Number(e.target.value))} 
                          className={inputClass} 
                        />
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

        {/* Vertical Specific Configuration */}
        {type === BlindType.Vertical && (
             <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Vertical Configuration</h4>
                {/* Tighter grid for smaller boxes */}
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
                            className={`${inputClass} ${controlType === ControlType.Wand ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
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

        {/* Measurements & Price - Common */}
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
                        className={`${inputClass} ${isCurtain ? 'bg-gray-50 font-medium cursor-not-allowed' : ''}`} 
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
            <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors">
                Cancel
            </button>
            <button type="submit" className="px-5 py-1.5 bg-brand-600 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all active:scale-95">
                Add to Quote
            </button>
        </div>
      </form>
    </div>
  );
};

export default BlindItemForm;
