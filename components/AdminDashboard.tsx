import React, { useState, useEffect } from 'react';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    orderBy,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { SystemUser, UserRole } from '../types';
import { UserPlus, Save, Trash2, Shield, User as UserIcon, Mail, Building, X } from 'lucide-react';

interface Props {
    onClose: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onClose }) => {
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state for new user
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('salesperson');
    const [newUserDisplayName, setNewUserDisplayName] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const usersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as any));
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserEmail) return;

        setIsSaving(true);
        try {
            // We use the email as the temporary ID if UID is not known yet
            // Actually, adding with a random ID is fine, we match by email on login
            await addDoc(collection(db, 'users'), {
                email: newUserEmail,
                role: newUserRole,
                displayName: newUserDisplayName || newUserEmail.split('@')[0],
                createdAt: serverTimestamp()
            });
            setNewUserEmail('');
            setNewUserDisplayName('');
            fetchUsers();
        } catch (error) {
            console.error("Error adding user:", error);
            alert("Failed to add user. Check permissions.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateUser = async (userId: string, updates: Partial<SystemUser>) => {
        try {
            await updateDoc(doc(db, 'users', userId), updates);
            fetchUsers();
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteDoc(doc(db, 'users', userId));
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-brand-600 px-6 py-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center text-white">
                        <Shield className="w-6 h-6 mr-3" />
                        <div>
                            <h2 className="text-xl font-bold">User Management</h2>
                            <p className="text-xs text-brand-100 font-medium">System Administration</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-brand-100 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-8 flex-1">
                    
                    {/* Add New User */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center">
                            <UserPlus className="w-4 h-4 mr-2" /> Add Authorized Salesperson
                        </h3>
                        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email</label>
                                <input 
                                    required
                                    type="email" 
                                    value={newUserEmail} 
                                    onChange={e => setNewUserEmail(e.target.value)} 
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm border p-2 text-gray-900 bg-white"
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Display Name (Optional)</label>
                                <input 
                                    type="text" 
                                    value={newUserDisplayName} 
                                    onChange={e => setNewUserDisplayName(e.target.value)} 
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm border p-2 text-gray-900 bg-white"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Role</label>
                                <select 
                                    value={newUserRole} 
                                    onChange={e => setNewUserRole(e.target.value as UserRole)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm border p-2 text-gray-900 bg-white"
                                >
                                    <option value="salesperson">Salesperson</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full bg-brand-600 text-white font-bold py-2 border border-transparent rounded-md shadow-sm hover:bg-brand-700 focus:outline-none flex justify-center items-center"
                            >
                                {isSaving ? 'Processing...' : <><Plus className="w-4 h-4 mr-2" /> Add User</>}
                            </button>
                        </form>
                    </div>

                    {/* Users List */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center">
                            <UserIcon className="w-4 h-4 mr-2" /> Existing Users
                        </h3>
                        {isLoading ? (
                            <div className="text-center py-10 text-gray-400 font-medium italic">Loading users...</div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 font-medium italic">No users found.</div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Default Emails</th>
                                            <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map(user => (
                                            <tr key={(user as any).id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs uppercase">
                                                            {user.displayName.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900">{user.displayName}</div>
                                                            <div className="text-xs text-gray-500 flex items-center">
                                                                <Mail className="w-3 h-3 mr-1" /> {user.email}
                                                            </div>
                                                            {user.uid && <div className="text-[9px] text-green-600 font-bold uppercase mt-1">Verified (Auth Linked)</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select 
                                                        value={user.role} 
                                                        onChange={(e) => handleUpdateUser((user as any).id, { role: e.target.value as UserRole })}
                                                        className="text-xs border-gray-300 rounded focus:ring-brand-500 focus:border-brand-500 p-1 font-medium bg-white"
                                                    >
                                                        <option value="salesperson">Salesperson</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <div className="flex flex-col">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Reception Email</label>
                                                            <input 
                                                                type="email"
                                                                placeholder="Not set"
                                                                value={user.receptionEmail || ''}
                                                                onChange={(e) => handleUpdateUser((user as any).id, { receptionEmail: e.target.value })}
                                                                className="text-xs border-gray-200 rounded p-1 bg-white focus:border-brand-500 w-full"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Salesperson Email</label>
                                                            <input 
                                                                type="email"
                                                                placeholder="Not set"
                                                                value={user.salespersonPersonalEmail || ''}
                                                                onChange={(e) => handleUpdateUser((user as any).id, { salespersonPersonalEmail: e.target.value })}
                                                                className="text-xs border-gray-200 rounded p-1 bg-white focus:border-brand-500 w-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <button 
                                                        onClick={() => handleDeleteUser((user as any).id)}
                                                        className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Plus icon helper
const Plus = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

export default AdminDashboard;
