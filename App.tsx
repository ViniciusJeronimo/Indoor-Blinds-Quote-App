
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Quote, Customer, BlindItem, BlindType, SystemUser } from './types';
import BlindItemForm from './components/BlindItemForm';
import QuoteSummary from './components/QuoteSummary';
import BlindDetailModal from './components/BlindDetailModal';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { saveQuote, loadQuotes, parseQuoteRecord } from './services/quoteStorageService';
import { SavedQuoteRecord } from './types';
import { generateQuoteEmail } from './services/geminiService';
import { generateCustomerCopyPDF, generateCompanyCopyPDF, getPDFBase64 } from './services/pdfService';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, runTransaction } from 'firebase/firestore';
import { User, Plus, Trash2, FileJson, CheckCircle, FileText, Mail, Building, Settings as SettingsIcon, LogOut, Shield, Save } from 'lucide-react';

const App: React.FC = () => {
  // Application State
  const [customer, setCustomer] = useState<Customer>({
    customerNumber: 0, // Placeholder
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  
  const [blinds, setBlinds] = useState<BlindItem[]>([]);
  
  // Costs State
  const [calculatedFittingPrice, setCalculatedFittingPrice] = useState<number>(0);
  const [fittingIncluded, setFittingIncluded] = useState<boolean>(false);
  const [takedowns, setTakedowns] = useState<number>(0); // Quantity
  const [takedownsIncluded, setTakedownsIncluded] = useState<boolean>(false);
  
  // Discount State (Percentage only)
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0); // Calculated dollar amount

  const [selectedBlind, setSelectedBlind] = useState<BlindItem | null>(null);
  const [isAddingBlind, setIsAddingBlind] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [emailSendingStatus, setEmailSendingStatus] = useState<{[key: string]: 'idle' | 'sending' | 'done' | 'error'}>({
    company: 'idle',
    customer: 'idle'
  });

  // Salesperson & Company configuration
  const [receptionEmail, setReceptionEmail] = useState<string>('');
  const [salespersonEmail, setSalespersonEmail] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);

  // Auth & Profile State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<SystemUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'contact' | 'items' | 'summary'>('contact');
  const [isCounterLoading, setIsCounterLoading] = useState(false);
  
  const [savedQuotes, setSavedQuotes] = useState<SavedQuoteRecord[]>([]);
  const [showQuoteHistory, setShowQuoteHistory] = useState(false);
  const [isSaveStatusVisible, setIsSaveStatusVisible] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Helper to format customer number as 6 digits
  const formatCustomerNumber = (num: number) => {
    if (num === 0) return 'Generating...';
    return num.toString().padStart(6, '0');
  };

  // Sequential Numbering Logic
  const getNextCustomerNumber = async () => {
    if (isCounterLoading) return;
    setIsCounterLoading(true);
    
    const counterRef = doc(db, 'counters', 'customerNumber');
    
    try {
      const nextNum = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let newValue = 1; // Start from 1 if not set
        
        if (counterDoc.exists()) {
            newValue = counterDoc.data().lastValue + 1;
        }
        
        transaction.set(counterRef, { lastValue: newValue });
        return newValue;
      });

      setCustomer(prev => ({ ...prev, customerNumber: nextNum }));
      return nextNum;
    } catch (error) {
      console.error("Error generating sequential number:", error);
      // Fallback to timestamp if transaction fails
      const fallback = Math.floor(Date.now() / 100000);
      setCustomer(prev => ({ ...prev, customerNumber: fallback }));
      return fallback;
    } finally {
      setIsCounterLoading(false);
    }
  };

  const resetQuote = async () => {
      setBlinds([]);
      setCustomer({
          customerNumber: 0,
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          notes: ''
      });
      setTakedowns(0);
      setDiscountInput(0);
      setFittingIncluded(false);
      setTakedownsIncluded(false);
      setActiveTab('contact');
      setShowResetConfirm(false);
      
      // Ensure we get a fresh number
      await getNextCustomerNumber();
  };

  const handleResetClick = () => {
    const hasContent = blinds.length > 0 || customer.firstName || customer.lastName || customer.email || customer.address;
    if (hasContent) {
        setShowResetConfirm(true);
    } else {
        resetQuote();
    }
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchUserProfile(u);
        // If it's a new session/fresh app load with no number yet
        if (customer.customerNumber === 0) {
            getNextCustomerNumber();
        }
      } else {
        setProfile(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (u: FirebaseUser) => {
    try {
        // First try to get by UID
        let userDoc = await getDoc(doc(db, 'users', u.uid));
        
        // If not found by UID, try to find by email (for newly added users who haven't logged in yet)
        if (!userDoc.exists()) {
            const q = query(collection(db, 'users'), where('email', '==', u.email));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const existingDoc = snapshot.docs[0];
                // Link the UID to this document
                await setDoc(doc(db, 'users', u.uid), {
                    ...existingDoc.data(),
                    uid: u.uid,
                    displayName: u.displayName || existingDoc.data().displayName
                });
                // Delete the old email-only doc if it was different (minor cleanup)
                if (existingDoc.id !== u.uid) {
                    // We'll leave it or clean up later. For now just refetch.
                }
                userDoc = await getDoc(doc(db, 'users', u.uid));
            }
        }

        // Bootstrap Admin
        if (!userDoc.exists() && u.email === 'viniciusjosilva@gmail.com') {
            const adminData = {
                uid: u.uid,
                email: u.email!,
                displayName: u.displayName || 'Admin',
                role: 'admin' as const,
                createdAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', u.uid), adminData);
            userDoc = await getDoc(doc(db, 'users', u.uid));
        }

        if (userDoc.exists()) {
            const profileData = userDoc.data() as SystemUser;
            setProfile(profileData);
            setReceptionEmail(profileData.receptionEmail || localStorage.getItem('receptionEmail') || '');
            setSalespersonEmail(profileData.salespersonPersonalEmail || localStorage.getItem('salespersonEmail') || '');
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  // Save settings back to profile when changed
  const saveEmailSettings = async () => {
      if (!user || !profile) return;
      try {
          await setDoc(doc(db, 'users', user.uid), {
              receptionEmail,
              salespersonPersonalEmail: salespersonEmail
          }, { merge: true });
          setProfile({ ...profile, receptionEmail, salespersonPersonalEmail: salespersonEmail });
          alert("Email preferences saved to your profile.");
      } catch (error) {
          console.error("Error saving preferences:", error);
          alert("Failed to save preferences to database.");
      }
  };

  // Derived State
  const itemsSubtotal = blinds.reduce((acc, blind) => acc + blind.price, 0);
  
  // Auto-calculate fitting price based on blind types
  useEffect(() => {
    const totalFitting = blinds.reduce((sum, blind) => {
      let fee = 10; // Default (Roller, Vertical, etc.)
      
      if (blind.type === BlindType.Panel) {
        fee = 20;
      } else if (blind.type === BlindType.VertiSheer || blind.type === BlindType.Curtain) {
        fee = 30;
      } else if (blind.type === BlindType.Shutter) {
        fee = 100;
      }
      
      return sum + fee;
    }, 0);
    setCalculatedFittingPrice(totalFitting);
  }, [blinds]);

  // Calculate discount whenever input or subtotal changes (Percentage Only)
  useEffect(() => {
    // Discounting the subtotal
    setDiscount((itemsSubtotal * discountInput) / 100);
  }, [discountInput, itemsSubtotal]);

  // Final fitting price used in calculation (0 if included)
  const effectiveFittingPrice = fittingIncluded ? 0 : calculatedFittingPrice;

  // Takedown cost: $10 per unit, or 0 if included
  const takedownCost = takedownsIncluded ? 0 : (takedowns * 10);

  // Total: Items + Fitting (if not included) + Takedowns - Discount (Rounded up to 0 decimals)
  const total = Math.ceil(Math.max(0, itemsSubtotal + effectiveFittingPrice + takedownCost - discount));

  const handleAddBlind = (blind: BlindItem) => {
    setBlinds([...blinds, blind]);
    setIsAddingBlind(false);
  };

  const handleRemoveBlind = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    setBlinds(blinds.filter(b => b.id !== id));
  };

  const createQuoteObject = (): Quote => ({
    id: crypto.randomUUID(),
    customer,
    blinds,
    fittingPrice: effectiveFittingPrice,
    fittingIncluded,
    takedowns,
    takedownsIncluded,
    discount,
    createdAt: new Date()
  });

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const quote = createQuoteObject();
    const { firestoreOk, localOk } = await saveQuote(quote, user.uid, user.email ?? '', total);
    setIsSaving(false);
    if (firestoreOk) {
      setSaveMessage('✓ Saved to cloud & device');
    } else if (localOk) {
      setSaveMessage('✓ Saved to device (offline — will sync when online)');
    } else {
      setSaveMessage('✗ Save failed — please try again');
    }
    setIsSaveStatusVisible(true);
    setTimeout(() => setIsSaveStatusVisible(false), 4000);
  };

  const handleLoadHistory = async () => {
    if (!user) return;
    const quotes = await loadQuotes(user.uid);
    setSavedQuotes(quotes);
    setShowQuoteHistory(true);
  };

  const handleRestoreQuote = (record: SavedQuoteRecord) => {
    const q = parseQuoteRecord(record);
    if (!q) return;
    setCustomer(q.customer);
    setBlinds(q.blinds);
    setFittingIncluded(q.fittingIncluded ?? false);
    setTakedowns(q.takedowns ?? 0);
    setTakedownsIncluded(q.takedownsIncluded ?? false);
    setDiscountInput(0);
    setShowQuoteHistory(false);
    setActiveTab('items');
  };
    
    // Simulate Drive Save
    await saveQuoteToDrive(quote);
    setIsSaving(false);
    alert('Quote saved to "ABC Clients" folder!');
  };

  const handleDownload = () => {
     const quote = createQuoteObject();
    downloadQuoteAsJson(quote);
  };

  const handleGenerateEmail = async () => {
    setEmailStatus('generating');
    const quote = createQuoteObject();
    const emailBody = await generateQuoteEmail(quote);
    setGeneratedEmail(emailBody);
    setEmailStatus(emailBody.startsWith('Error') ? 'error' : 'done');
  };

  const handleCustomerCopy = () => {
    const quote = createQuoteObject();
    generateCustomerCopyPDF(quote);
  };

  const handleCompanyCopy = () => {
    const quote = createQuoteObject();
    generateCompanyCopyPDF(quote);
  };

  const handleEmailQuote = async (recipientType: 'company' | 'customer', overrideEmail?: string) => {
    const quote = createQuoteObject();
    let targetEmail = '';
    
    if (overrideEmail) {
      targetEmail = overrideEmail;
    } else {
      targetEmail = recipientType === 'company' 
        ? receptionEmail
        : quote.customer.email;
    }

    if (!targetEmail) {
      // Don't alert if it's an optional override that's missing
      if (!overrideEmail) alert(`Please provide a ${recipientType} email address.`);
      return;
    }

    setEmailSendingStatus(prev => ({ ...prev, [recipientType === 'customer' ? 'customer' : 'company']: 'sending' }));

    try {
      const pdfBase64 = getPDFBase64(quote, recipientType);
      
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote,
          pdfBase64,
          recipientType,
          targetEmail
        })
      });

      if (!response.ok) throw new Error('Failed to send email');

      setEmailSendingStatus(prev => ({ ...prev, [recipientType === 'customer' ? 'customer' : 'company']: 'done' }));
      console.log(`Email sent successfully to ${targetEmail}`);
    } catch (error) {
      console.error("Email Error:", error);
      setEmailSendingStatus(prev => ({ ...prev, [recipientType === 'customer' ? 'customer' : 'company']: 'error' }));
    } finally {
      setTimeout(() => {
        setEmailSendingStatus(prev => ({ ...prev, [recipientType === 'customer' ? 'customer' : 'company']: 'idle' }));
      }, 3000);
    }
  };

  const handleQuoteReady = async () => {
    if (blinds.length === 0) return;
    
    if (!receptionEmail) {
        alert("Please set the Reception Email in settings first.");
        setShowSettings(true);
        return;
    }

    const confirmMsg = `This will send:
1. Internal Copy to Reception (${receptionEmail})
${salespersonEmail ? `2. Internal Copy to your Email (${salespersonEmail})\n` : ''}${customer.email ? `3. Customer Copy (no dims) to ${customer.email}` : '3. NO customer email found (print manually)'}

Proceed?`;

    if (!window.confirm(confirmMsg)) return;

    // 1. Email reception
    await handleEmailQuote('company', receptionEmail);

    // 2. Email salesperson
    if (salespersonEmail) {
        await handleEmailQuote('company', salespersonEmail);
    }

    // 3. Email customer if they have an email
    if (customer.email) {
      await handleEmailQuote('customer');
    }

    alert("Quote Ready process completed.");
  };

  const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm border p-2 bg-white text-gray-900";
  const smallInputClass = "block w-full rounded border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm border px-2 py-1 bg-white text-gray-900";

  if (isAuthLoading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Authenticating...</p>
            </div>
        </div>
    );
  }

  if (!user) {
      return <Login />;
  }

  if (!profile && user.email !== 'viniciusjosilva@gmail.com') {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
              <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center">
                  <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                  <p className="text-gray-600 mb-6">Your account (<b>{user.email}</b>) is not authorized to use this system. Please contact the administrator to grant access.</p>
                  <button onClick={handleLogout} className="w-full bg-gray-100 text-gray-700 font-bold py-2 rounded-md hover:bg-gray-200 transition-colors">Sign Out</button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-md">
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
</div>
<h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quote Pro</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 hidden sm:block">
               {profile?.role === 'admin' ? 'Administrator' : 'Sales Representative'}
            </div>
            {profile?.role === 'admin' && (
                <button 
                    onClick={() => setIsAdminPanelOpen(true)}
                    className="p-2 rounded-full text-brand-600 hover:bg-brand-50 transition-colors"
                    title="Admin Panel"
                >
                    <Shield className="w-5 h-5" />
                </button>
            )}
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResetClick}
                className="flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-brand-100 transition-all hover:shadow-brand-200"
                title="Start New Quote"
            >
                <Plus className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">New Quote</span>
            </motion.button>
            <button
    onClick={handleLoadHistory}
    className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
    title="Quote History"
>
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
</button>
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-brand-100 text-brand-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                title="Settings"
            >
                <SettingsIcon className="w-5 h-5" />
            </button>
            <button 
                onClick={handleLogout}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors"
                title="Sign Out"
            >
                <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <button 
                onClick={() => setActiveTab('contact')}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${activeTab === 'contact' ? 'bg-brand-600 text-white shadow-md scale-[1.02]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <User className="w-4 h-4 mr-2" /> Contact Details
            </button>
            <button 
                onClick={() => setActiveTab('items')}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${activeTab === 'items' ? 'bg-brand-600 text-white shadow-md scale-[1.02]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <Plus className="w-4 h-4 mr-2" /> Items
            </button>
            <button 
                onClick={() => setActiveTab('summary')}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${activeTab === 'summary' ? 'bg-brand-600 text-white shadow-md scale-[1.02]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <FileText className="w-4 h-4 mr-2" /> Quote Summary
            </button>
        </div>

        {/* Settings Section */}
        {showSettings && (
            <section className="bg-brand-50 rounded-lg shadow-sm border border-brand-100 overflow-hidden animate-in slide-in-from-top duration-300">
                <div className="bg-brand-600 px-6 py-3 border-b border-brand-700 flex justify-between items-center">
                    <div className="flex items-center text-white">
                        <SettingsIcon className="w-5 h-5 mr-2" />
                        <h2 className="text-sm font-bold uppercase tracking-wider">Email Configuration</h2>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-bold text-brand-700 uppercase mb-1">Reception Email (Default Recipient)</label>
                        <input 
                            type="email" 
                            value={receptionEmail} 
                            onChange={e => setReceptionEmail(e.target.value)} 
                            className={`${inputClass} border-brand-200 focus:border-brand-500 focus:ring-brand-500`}
                            placeholder="office@company.com"
                        />
                        <p className="mt-1 text-[10px] text-brand-600 italic">Receives the Company Copy with dimensions.</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-brand-700 uppercase mb-1">Your Email (Salesperson Copy)</label>
                        <input 
                            type="email" 
                            value={salespersonEmail} 
                            onChange={e => setSalespersonEmail(e.target.value)} 
                            className={`${inputClass} border-brand-200 focus:border-brand-500 focus:ring-brand-500`}
                            placeholder="you@company.com"
                        />
                        <p className="mt-1 text-[10px] text-brand-600 italic">Receives a duplicate Company Copy for your records.</p>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button 
                            onClick={saveEmailSettings}
                            className="inline-flex items-center px-3 py-1.5 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm hover:bg-brand-700 transition-all active:scale-95"
                        >
                            <Save className="w-3.5 h-3.5 mr-1.5" /> Save to Profile
                        </button>
                    </div>
                </div>
            </section>
        )}
        
        {/* Customer Section */}
        {activeTab === 'contact' && (
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center">
                <User className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase">First Name</label>
                    <input type="text" value={customer.firstName} onChange={e => setCustomer({...customer, firstName: e.target.value})} className={inputClass} />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase flex justify-between">
                        <span>Customer Number</span>
                        {isCounterLoading && <span className="animate-pulse text-brand-600">Assigning...</span>}
                    </label>
                    <div className={`${inputClass} bg-gray-50 font-bold border-brand-100 cursor-not-allowed flex items-center`}>
                        {formatCustomerNumber(customer.customerNumber)}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase">Last Name</label>
                    <input type="text" value={customer.lastName} onChange={e => setCustomer({...customer, lastName: e.target.value})} className={inputClass} />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase">Email Address</label>
                    <input type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className={inputClass} placeholder="customer@example.com" />
                </div>
                <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 uppercase">Address</label>
                    <input type="text" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className={inputClass} />
                </div>
                <div className="lg:col-span-3">
                    <label className="block text-xs font-medium text-gray-700 uppercase">Notes</label>
                    <textarea rows={2} value={customer.notes} onChange={e => setCustomer({...customer, notes: e.target.value})} className={inputClass} />
                </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                    onClick={() => setActiveTab('items')}
                    className="inline-flex items-center px-4 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-brand-700 transition-all active:scale-95"
                >
                    Next: Add Items <Plus className="ml-1.5 w-3.5 h-3.5" />
                </button>
            </div>
            </section>
        )}

        {/* Blinds Section */}
        {activeTab === 'items' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <section className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Items Configuration</h2>
                        {!isAddingBlind && (
                            <button 
                                onClick={() => setIsAddingBlind(true)} 
                                className="inline-flex items-center px-3 py-1.5 border border-slate-200 rounded-xl shadow-sm text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all active:scale-95"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add New Blind
                            </button>
                        )}
                    </div>

                    {/* Add Form */}
                    {isAddingBlind && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <BlindItemForm onAdd={handleAddBlind} onCancel={() => setIsAddingBlind(false)} />
                        </div>
                    )}

                    {/* List */}
                    {blinds.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
                            {blinds.map((blind, index) => (
                                <div 
                                    key={blind.id} 
                                    onClick={() => setSelectedBlind(blind)}
                                    className="p-4 flex items-center justify-between hover:bg-brand-50 cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${blind.type === BlindType.Roller ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">{blind.room} <span className="font-normal text-gray-500">- {blind.type}</span></h4>
                                            <p className="text-xs text-gray-500">{blind.width}mm x {blind.drop}mm • {blind.material} ({blind.color})</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <div className="text-right">
                                            <span className="block text-sm font-bold text-gray-900">${blind.price.toFixed(2)}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => handleRemoveBlind(blind.id, e)} 
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                            title="Remove Item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !isAddingBlind && (
                            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                <Plus className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No items added</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by creating a new blind configuration.</p>
                            </div>
                        )
                    )}
                </section>

                {/* Quote Totals Section - COMPACT & SINGLE LINE */}
                {blinds.length > 0 && (
                    <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 flex flex-wrap items-center justify-end gap-4 text-sm">
                            
                            {/* Subtotal */}
                            <div className="flex items-center space-x-2 border-r border-gray-300 pr-4">
                                <span className="text-gray-500 font-medium uppercase">Subtotal</span>
                                <span className="text-lg font-bold text-gray-800">${itemsSubtotal.toFixed(2)}</span>
                            </div>

                            {/* Fitting */}
                            <div className="flex items-center space-x-2 border-r border-gray-300 pr-4">
                                <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium uppercase mb-0.5">Fitting</span>
                                <div className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        checked={fittingIncluded} 
                                        onChange={e => setFittingIncluded(e.target.checked)} 
                                        id="fit-inc"
                                        className="h-3 w-3 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="fit-inc" className="text-xs text-gray-600 mr-1 cursor-pointer">Inc.</label>
                                </div>
                                </div>
                                <div className={`w-20 ${fittingIncluded ? 'opacity-50 line-through' : ''}`}>
                                    <input 
                                        disabled
                                        type="text" 
                                        value={`$${calculatedFittingPrice.toFixed(2)}`} 
                                        className={`${smallInputClass} text-right bg-gray-100 font-medium text-gray-600 cursor-not-allowed`} 
                                    />
                                </div>
                            </div>

                            {/* Takedowns */}
                            <div className="flex items-center space-x-2 border-r border-gray-300 pr-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 font-medium uppercase mb-0.5">Takedowns</span>
                                    <div className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        checked={takedownsIncluded} 
                                        onChange={e => setTakedownsIncluded(e.target.checked)} 
                                        id="take-inc"
                                        className="h-3 w-3 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="take-inc" className="text-xs text-gray-600 mr-1 cursor-pointer">Inc.</label>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={takedowns || ''} 
                                        onChange={e => setTakedowns(parseInt(e.target.value) || 0)} 
                                        className={`${smallInputClass} text-center font-medium w-16 ${takedownsIncluded ? 'opacity-50' : ''}`} 
                                        placeholder="Qty"
                                    />
                                    <span className={`text-xs ml-1 font-medium whitespace-nowrap ${takedownsIncluded ? 'text-gray-300 line-through' : 'text-gray-400'}`}>x $10</span>
                                </div>
                            </div>

                            {/* Discount */}
                            <div className="flex items-center space-x-2 pr-2">
                                <div className="flex flex-col">
                                    <span className="text-xs text-red-500 font-medium uppercase mb-0.5">Discount</span>
                                    <span className="text-[10px] text-gray-400 font-medium text-right">Percentage</span>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        type="number" 
                                        min="0" 
                                        max="100"
                                        step="1"
                                        value={discountInput || ''} 
                                        onChange={e => setDiscountInput(parseFloat(e.target.value) || 0)} 
                                        className={`${smallInputClass} text-center font-bold w-16 text-red-600 border-red-200`} 
                                        placeholder="0"
                                    />
                                    <span className="ml-1 text-sm font-bold text-gray-400">%</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="pl-2">
                                <div className="bg-brand-600 text-white px-4 py-2 rounded shadow-sm">
                                    <span className="block text-[10px] font-medium uppercase opacity-80 leading-none mb-1">Total</span>
                                    <span className="block text-xl font-bold leading-none">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
                
                <div className="flex justify-end">
                    <button 
                        onClick={() => setActiveTab('summary')}
                        className="inline-flex items-center px-8 py-3 bg-brand-600 text-white font-bold rounded-lg shadow-lg hover:bg-brand-700 transition-all hover:scale-105"
                    >
                        Review Quote Summary <CheckCircle className="ml-2 w-5 h-5" />
                    </button>
                </div>
            </div>
        )}

        {/* Summary Section */}
        {activeTab === 'summary' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <QuoteSummary quote={createQuoteObject()} />
            </div>
        )}

        {/* Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{blinds.length} items</span> in quote
                </div>
                <div className="flex space-x-4 w-full md:w-auto">
                    {/* Quote Ready Button */}
                    <button 
                        onClick={handleQuoteReady}
                        disabled={blinds.length === 0 || emailSendingStatus.company === 'sending' || emailSendingStatus.customer === 'sending'}
                        className="flex-1 md:flex-none inline-flex justify-center items-center px-4 py-1.5 border border-transparent text-sm font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors"
                    >
                         {emailSendingStatus.company === 'sending' || emailSendingStatus.customer === 'sending' 
                            ? 'Processing...' 
                            : <><CheckCircle className="w-5 h-5 mr-2" /> Quote Ready</>}
                    </button>

                    <div className="h-10 w-px bg-gray-200 mx-2 hidden md:block"></div>

                    {/* Company Copy Button */}
                    <button 
                        onClick={handleCompanyCopy}
                        disabled={blinds.length === 0}
                        className="flex-1 md:flex-none inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                        title="Internal copy with dimensions"
                    >
                         <Building className="w-4 h-4 mr-2 text-brand-600" /> Company Copy
                    </button>

                    {/* Customer Copy Button */}
                    <button 
                        onClick={handleCustomerCopy}
                        disabled={blinds.length === 0}
                        className="flex-1 md:flex-none inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                        title="Customer copy without dimensions"
                    >
                         <FileText className="w-4 h-4 mr-2 text-brand-600" /> Customer Copy
                    </button>
                    
                    <button 
                        onClick={handleSave}
                        disabled={blinds.length === 0 || isSaving}
                        className="flex-1 md:flex-none inline-flex justify-center items-center px-4 py-1.5 border border-transparent text-sm font-bold rounded-lg text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-sm transition-colors"
                    >
                         {isSaving ? 'Saving...' : <><CheckCircle className="w-5 h-5 mr-2" /> Save Quote</>}
                    </button>
                </div>
            </div>
            {generatedEmail && (
                 <div className="max-w-7xl mx-auto mt-4 p-4 bg-gray-100 rounded border border-gray-300 relative">
                     <button onClick={() => setGeneratedEmail('')} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"><Trash2 className="w-4 h-4"/></button>
                     <h4 className="font-bold text-sm text-gray-700 mb-2">AI Generated Email:</h4>
                     <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">{generatedEmail}</pre>
                 </div>
            )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedBlind && (
        <BlindDetailModal blind={selectedBlind} onClose={() => setSelectedBlind(null)} />
      )}

      {/* Admin Panel */}
      {isAdminPanelOpen && (
        <AdminDashboard onClose={() => setIsAdminPanelOpen(false)} />
      {/* Save status toast */}
      {isSaveStatusVisible && (
        <div className="fixed bottom-24 right-4 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-4">
          {saveMessage}
        </div>
      )}

      {/* Quote History Modal */}
      {showQuoteHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="bg-brand-600 px-6 py-4 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-white">Saved Quotes</h2>
              <button onClick={() => setShowQuoteHistory(false)} className="text-brand-100 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
              {savedQuotes.length === 0 ? (
                <div className="py-12 text-center text-gray-400 italic">No saved quotes found.</div>
              ) : savedQuotes.map(record => (
                <div key={record.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{record.customerName || 'Unnamed'}</p>
                    <p className="text-xs text-gray-500">
                      #{String(record.customerNumber).padStart(6, '0')} · {record.blindCount} items · ${record.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {typeof record.createdAt === 'string'
                        ? new Date(record.createdAt).toLocaleDateString()
                        : 'Unknown date'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRestoreQuote(record)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-800 px-3 py-1.5 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors"
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform -rotate-3 overflow-hidden relative">
                <div className="absolute inset-0 bg-white/10" />
                <Plus className="w-10 h-10 relative z-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Start Fresh?</h3>
              <p className="text-gray-600 mb-8 leading-relaxed font-medium">
                Ready for a new client? We'll clear the current items and generate a new sequential number for you.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={resetQuote}
                  className="py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
