import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Shield, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please ensure you are using a valid Google account.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-brand-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">BlindsQuote Pro</h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">Internal Sales & Management System</p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600 italic">
               <Lock className="w-4 h-4 mr-2" /> Authorized personnel only
            </div>
          </div>

          <div>
            <button
              onClick={handleLogin}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all shadow-md active:scale-95"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                className="w-5 h-5 mr-3" 
                alt="Google"
              />
              Sign in with Google
            </button>
          </div>
          
          <div className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Secure Enterprise Access
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
