import React, { useState } from 'react';
import Modal from 'react-modal';
import { verifyEmail, verifyUser, deleteUser, makeAdmin, demoteAdmin } from '../extensions/api';


const UserProfileModal = ({ user, onClose }) => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleVerifyEmail = async () => {
        try {
            await verifyEmail(user.username);
            setSuccess('Email verified successfully.');
        } catch (error) {
            console.error('Failed to verify email:', error);
            setError('Failed to verify email.');
        }
    };

    const handleVerifyUser = async () => {
        try {
            await verifyUser(user.username);
            setSuccess('User verified successfully.');
        } catch (error) {
            console.error('Failed to verify user:', error);
            setError('Failed to verify user.');
        }
    };

    const handleDeleteUser = async () => {
        try {
            await deleteUser(user.username);
            setSuccess('User deleted successfully.');
            onClose();  // Close modal after deletion
        } catch (error) {
            console.error('Failed to delete user:', error);
            setError('Failed to delete user.');
        }
    };

    const handleMakeAdmin = async () => {
        try {
            await makeAdmin(user.username);
            setSuccess('User promoted to admin.');
        } catch (error) {
            console.error('Failed to promote user to admin:', error);
            setError('Failed to promote user to admin.');
        }
    };
    const handleDemoteAdmin = async () => {
        try {
            await demoteAdmin(user.username);
            setSuccess('Admin Demoted to User.');
        } catch (error) {
            console.error('Failed to demote admin to user:', error);
            setError('Failed to demote admin to user.');
        }
    };
    return (
        <Modal
            isOpen={!!user}
            onRequestClose={onClose}
            contentLabel="User Profile Modal"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <h3>Manage User: {user.username}</h3>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
            <p><strong>User Verified:</strong> {user.userVerified === 'CONFIRMED' ? 'Yes' : 'No'}</p>

            <button onClick={handleVerifyEmail}>Verify Email</button>
            <button onClick={handleVerifyUser}>Verify User</button>
            <button onClick={handleMakeAdmin}>Make Admin</button>
            <button onClick={handleDemoteAdmin}>Demote to User</button>
            <button onClick={handleDeleteUser}>Delete User</button>
            <button onClick={onClose}>Close</button>
        </Modal>
    );
};

export default UserProfileModal;
