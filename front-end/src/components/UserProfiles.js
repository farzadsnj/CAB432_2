import React, { useEffect, useState } from 'react';
import { getUsers } from '../extensions/api.js';
import UserProfileModal from './UserProfileModal';

const UserProfiles = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await getUsers();
                setUsers(data.users);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch user profiles:', err);
                setError('Failed to load user profiles.');
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
    };

    return (
        <div>
            <h2>User Profiles</h2>
            {error && <p className="error">{error}</p>}
            {loading ? <p>Loading...</p> : (
                <table className="user-profiles-table">
                    <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Email Verified</th>
                        <th>User Verified</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.username}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.emailVerified ? 'Yes' : 'No'}</td>
                            <td>{user.userStatus === 'CONFIRMED' ? 'Yes' : 'No'}</td>
                            <td>
                                <button onClick={() => handleUserSelect(user)}>Manage</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
            {selectedUser && (
                <UserProfileModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

export default UserProfiles;
