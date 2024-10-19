import React, { useState } from 'react';
import { verifyMfa } from '../extensions/api';
import { setToken } from '../extensions/auth';
import { useLocation, useNavigate } from 'react-router-dom';

const MFAVerificationPage = () => {
    const location = useLocation();
    const { session, username } = location.state || {};
    const [mfaCode, setMfaCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleVerifyMfa = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await verifyMfa({ session, code: mfaCode, username });
            console.log('MFA verification result:', result);

            if (result.message === 'MFA verified') {
                const idToken = result.AuthenticationResult.IdToken;
                const accessToken = result.AuthenticationResult.AccessToken;
                const userGroup = result.AuthenticationResult.userGroups[0];
                setToken(idToken, userGroup);
                navigate('/');
                window.location.reload();
            }
        } catch (error) {
            console.error('MFA verification error:', error);
            setError('MFA verification failed. Please check your code and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mfa-verification-container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Two-Factor Authentication</h2>
                            <form onSubmit={handleVerifyMfa}>
                                <div className="mb-3">
                                    <label htmlFor="mfaCode" className="form-label">Authenticator Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="mfaCode"
                                        placeholder="Enter your MFA code"
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value)}
                                        required
                                        autoComplete="off"
                                    />
                                </div>
                                {error && (
                                    <div className="alert alert-danger text-center">
                                        {error}
                                    </div>
                                )}
                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Verifying...' : 'Verify MFA'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MFAVerificationPage;
