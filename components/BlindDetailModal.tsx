import React from 'react';
import { 
    BlindItem, BlindType, RollerBlindData, VerticalBlindData, 
    VenetianTimberData, VenetianAluminiumData, CurtainData 
} from '../types';
import { X, Ruler, Palette, Settings, DollarSign } from 'lucide-react';

interface Props {
  blind: BlindItem;
  onClose: () => void;
}

const BlindDetailModal: React.FC<Props> = ({ blind, onClose }) => {
  // Helper to render a field row
  const DetailRow = ({ label, value }: { label: string, value: any }) => (
    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-sm transition-colors">
      <span className="text-gray-500 font-medium text-sm">{label}</span>
      <span className="text-gray-900 font-semibold text-sm text-right">{value || '-'}</span>
    </div>
  );

  const renderRollerSpecifics = (b: RollerBlindData) => (
    <div className="space-y-1">
      <DetailRow label="Roll Direction" value={b.rollDirection} />
      <DetailRow label="Bottom Rail" value={b.bottomRail} />
      <DetailRow label="Chain Type" value={b.chainType} />
      <DetailRow label="Chain Length" value={`${b.chainLength}mm`} />
      <DetailRow label="Motor" value={b.motor} />
      <DetailRow label="Control Side" value={b.controlSide} />
      <DetailRow label="Bracket Color" value={b.bracketColor} />
      <DetailRow label="Fitting" value={b.fitting} />
    </div>
  );

  const renderVerticalSpecifics = (b: VerticalBlindData) => (
    <div className="space-y-1">
      <DetailRow label="Slat Size" value={b.slatSize} />
      <DetailRow label="Track Color" value={b.trackColor} />
      <DetailRow label="Bottom Type" value={b.bottomType} />
      <DetailRow label="Track Type" value={b.trackType} />
      <DetailRow label="Control Type" value={b.controlType} />
      <DetailRow label="Bunch" value={b.bunch} />
      <DetailRow label="Control Side" value={b.controlSide} />
      <DetailRow label="Fitting" value={b.fitting} />
    </div>
  );

  const renderTimberSpecifics = (b: VenetianTimberData) => (
      <div className="space-y-1">
          <DetailRow label="Slat Size" value={b.slatSize} />
          <DetailRow label="Valance" value={b.valance} />
          <DetailRow label="Bottom Rail" value={b.bottomRail} />
          <DetailRow label="Return" value={b.blindReturn} />
          <DetailRow label="Control Type" value={b.controlType} />
          <DetailRow label="Control Side" value={b.controlSide} />
      </div>
  );

  const renderAluminiumSpecifics = (b: VenetianAluminiumData) => (
      <div className="space-y-1">
          <DetailRow label="Slat Size" value={b.slatSize} />
          <DetailRow label="Control Side" value={b.controlSide} />
      </div>
  );

  const renderCurtainSpecifics = (b: CurtainData) => (
      <div className="space-y-1">
          <DetailRow label="Curtain Type" value={b.curtainType} />
          <DetailRow label="Fabric" value={b.fabric} />
          <DetailRow label="Track Colour" value={b.trackColor} />
          <DetailRow label="Heading Style" value={b.headingStyle} />
          <DetailRow label="Hem Style" value={b.hemStyle} />
          <DetailRow label="Control Type" value={b.controlType} />
          {b.controlSide && <DetailRow label="Control Side" value={b.controlSide} />}
          <DetailRow label="Bunch" value={b.bunch} />
          <DetailRow label="Hook Number" value={b.hookNumber} />
          <DetailRow label="BFP" value={b.bfp} />
      </div>
  );

  const isRollerType = blind.type === BlindType.Roller || blind.type === BlindType.DoubleRoller;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
            aria-hidden="true" 
            onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          {/* Header */}
          <div className="bg-brand-600 px-4 py-3 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-white" id="modal-title">
              Blind Details
            </h3>
            <button
              onClick={onClose}
              className="bg-brand-600 rounded-md text-brand-200 hover:text-white focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[70vh] overflow-y-auto">
            
            {/* Header Info */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{blind.room}</h2>
                    <p className="text-sm text-gray-500 font-medium">{blind.type}</p>
                </div>
                <div className="bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                    <span className="text-lg font-bold text-brand-700">${blind.price.toFixed(2)}</span>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
                
                {/* Dimensions & Material */}
                <div>
                    <h4 className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        <Ruler className="w-4 h-4 mr-1" /> Dimensions & Material
                    </h4>
                    <div className="bg-white border border-gray-200 rounded-md px-3">
                        <DetailRow label="Width" value={`${blind.width}mm`} />
                        <DetailRow label="Drop" value={`${blind.drop}mm`} />
                        <DetailRow label="Material" value={blind.material} />
                        <DetailRow label="Color" value={blind.color} />
                    </div>
                </div>

                {/* Specifics */}
                <div>
                    <h4 className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        <Settings className="w-4 h-4 mr-1" /> Configuration
                    </h4>
                    <div className="bg-white border border-gray-200 rounded-md px-3">
                        {isRollerType && renderRollerSpecifics(blind as RollerBlindData)}
                        {blind.type === BlindType.Vertical && renderVerticalSpecifics(blind as VerticalBlindData)}
                        {blind.type === BlindType.VenetianTimber && renderTimberSpecifics(blind as VenetianTimberData)}
                        {blind.type === BlindType.VenetianAluminium && renderAluminiumSpecifics(blind as VenetianAluminiumData)}
                        {blind.type === BlindType.Curtain && renderCurtainSpecifics(blind as CurtainData)}
                        {/* Fallback for other types not yet fully implemented detail-wise */}
                        {!isRollerType && 
                         blind.type !== BlindType.Vertical && 
                         blind.type !== BlindType.VenetianTimber && 
                         blind.type !== BlindType.VenetianAluminium && 
                         blind.type !== BlindType.Curtain && (
                            <div className="py-4 text-center text-sm text-gray-500 italic">
                                Standard configuration details.
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes */}
                {blind.notes && (
                    <div>
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</h4>
                         <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm border border-yellow-200">
                             {blind.notes}
                         </div>
                    </div>
                )}

            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlindDetailModal;