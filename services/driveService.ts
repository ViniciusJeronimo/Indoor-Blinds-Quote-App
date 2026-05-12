import { Quote } from '../types';

/**
 * Simulates saving a file to a specific Google Drive folder.
 * In a production environment, this would use the Google Drive API v3.
 */
export const saveQuoteToDrive = async (quote: Quote): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log(`[Drive Service] Searching for folder 'ABC Clients'...`);
  console.log(`[Drive Service] Saving Quote #${quote.customer.customerNumber} for ${quote.customer.lastName}...`);
  console.log(`[Drive Service] Content:`, JSON.stringify(quote, null, 2));

  // Success simulation
  return true;
};

/**
 * Helper to download the quote locally as a fallback
 */
export const downloadQuoteAsJson = (quote: Quote) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quote, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `quote_${quote.customer.customerNumber}_${quote.customer.lastName}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};