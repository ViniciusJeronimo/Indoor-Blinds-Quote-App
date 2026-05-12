import React from 'react';
import { Quote } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Props {
  quote: Quote;
}

const COLORS = ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#38bdf8', '#7dd3fc'];

const QuoteSummary: React.FC<Props> = ({ quote }) => {
  const totalItems = quote.blinds.length;
  const itemsSubtotal = quote.blinds.reduce((sum, item) => sum + item.price, 0);
  const fitting = quote.fittingIncluded ? 0 : (quote.fittingPrice || 0);
  const takedownsCount = quote.takedowns || 0;
  const takedownsCost = quote.takedownsIncluded ? 0 : (takedownsCount * 10);
  const discount = quote.discount || 0;
  
  // Calculate Total (Rounded up to 0 decimals)
  const total = Math.ceil(Math.max(0, itemsSubtotal + fitting + takedownsCost - discount));

  if (totalItems === 0) return (
    <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500 italic">No items added to the quote yet.</p>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-2 h-8 bg-brand-600 mr-3 rounded-full"></div>
          Quote Summary
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Key Metrics */}
        <div className="bg-brand-50 p-6 rounded-xl border border-brand-100 shadow-sm">
            <p className="text-xs text-brand-700 uppercase font-bold tracking-widest mb-1">Total</p>
            <p className="text-4xl font-black text-brand-900">${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            
            <div className="mt-6 pt-6 border-t border-brand-200 text-sm text-brand-800 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Items Subtotal:</span>
                    <span className="font-bold">${itemsSubtotal.toFixed(2)}</span>
                </div>
                
                {quote.fittingIncluded ? (
                    <div className="flex justify-between items-center text-green-700">
                        <span className="font-medium">Fitting Fee:</span>
                        <span className="text-xs font-bold bg-green-100 px-2 py-1 rounded uppercase">Included</span>
                    </div>
                ) : (
                    fitting > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-600">Fitting Fee:</span>
                            <span className="font-bold text-gray-900">+${fitting.toFixed(2)}</span>
                        </div>
                    )
                )}
                
                {quote.takedownsIncluded ? (
                    <div className="flex justify-between items-center text-green-700">
                        <span className="font-medium">Takedowns:</span>
                        <span className="text-xs font-bold bg-green-100 px-2 py-1 rounded uppercase">Included</span>
                    </div>
                ) : (
                    takedownsCost > 0 && (
                        <div className="flex justify-between items-center text-gray-600">
                            <span className="font-medium">Takedowns:</span>
                            <span className="font-bold text-gray-900">+${takedownsCost.toFixed(2)}</span>
                        </div>
                    )
                )}

                {discount > 0 && (
                        <div className="flex justify-between items-center text-red-600 bg-red-50 p-2 rounded -mx-2">
                        <span className="font-bold uppercase text-xs">Total Discount applied:</span>
                        <span className="font-black">-${discount.toFixed(2)}</span>
                    </div>
                ) || null}
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Total Configurations</p>
                <p className="text-4xl font-black text-gray-800">{totalItems}</p>
                <p className="text-sm text-gray-500 mt-2">Custom blind items in this quote</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Customer</p>
                    <p className="text-lg font-bold text-gray-800">
                        {quote.customer.firstName} {quote.customer.lastName}
                    </p>
                    <p className="text-xs font-mono text-brand-600 font-bold">
                        #{quote.customer.customerNumber.toString().padStart(6, '0')}
                    </p>
                </div>
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center border border-gray-200 text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteSummary;