import { GoogleGenAI } from "@google/genai";
import { Quote } from '../types';

// NOTE: In a real app, never expose keys on the client side.
// This is structured to use the environment variable as per instructions.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateQuoteEmail = async (quote: Quote): Promise<string> => {
  if (!apiKey) {
    return "Error: API Key is missing. Please configure process.env.API_KEY.";
  }

  try {
    const itemsCost = quote.blinds.reduce((sum, b) => sum + b.price, 0);
    const fittingCost = quote.fittingIncluded ? 0 : (quote.fittingPrice || 0);
    const takedownsCost = quote.takedownsIncluded ? 0 : (quote.takedowns || 0) * 10;
    const discount = quote.discount || 0;
    
    const totalCost = itemsCost + fittingCost + takedownsCost - discount;
    
    const blindSummary = quote.blinds.map(b => `- ${b.type} (${b.room}): $${b.price}`).join('\n');

    const prompt = `
      You are a professional sales representative for an indoor blinds company.
      Write a polite, professional, and persuasive email to a customer with the following details:
      
      Customer Name: ${quote.customer.firstName} ${quote.customer.lastName}
      Quote ID: ${quote.customer.customerNumber}
      Total Items: ${quote.blinds.length}
      Total Cost: $${totalCost.toFixed(2)}
      
      Cost Breakdown:
      - Items: $${itemsCost.toFixed(2)}
      - Fitting: $${fittingCost.toFixed(2)} ${quote.fittingIncluded ? '(Included)' : ''}
      - Takedowns: $${takedownsCost.toFixed(2)} ${quote.takedownsIncluded ? '(Included)' : ''}
      - Discount: -$${discount.toFixed(2)}
      
      Items included:
      ${blindSummary}
      
      Notes from visit: ${quote.customer.notes}
      
      The email should thank them for the opportunity, summarize the quote briefly, and invite them to proceed. 
      Keep it under 200 words. Return ONLY the body of the email.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate email.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't generate the email at this time.";
  }
};