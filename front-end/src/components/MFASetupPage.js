import React, { useState, useEffect } from 'react';
import { setupMfa, verifyMfaSetup } from '../extensions/api';
import { useLocation, useNavigate } from 'react-router-dom';

const MFASetupPage = () => {
    const location = useLocation();
    const { session, username } = location.state || {};
    const [mfaCode, setMfaCode] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [error, setError] = useState('');
    const [mfaSession, setMfaSession] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (session && username) {
            console.log('MFA Setup initiated');
            const initiateMfaSetup = async () => {
                setLoading(true);
                try {
                    const result = await setupMfa({ session, username });
                    console.log('MFA setup result:', result);

                    setQrCode(result.qrCode);
                    setMfaSession(result.session);
                } catch (error) {
                    console.error('Failed to initiate MFA setup:', error);
                    setError('Failed to initiate MFA setup. Please refresh the page.');
                } finally {
                    setLoading(false);
                }
            };
            initiateMfaSetup();
        } else {
            setError('Missing session or username.');
        }
    }, [session, username]);

    const handleMfaSetup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');  // Reset error

        try {
            const result = await verifyMfaSetup({ session: mfaSession, code: mfaCode });
            console.log('MFA Setup verification result:', result);

            if (result.message) {
                navigate('/login');
            }
        } catch (error) {
            console.error('MFA setup failed:', error);
            setError('MFA setup failed, please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mfa-setup-container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-sm p-4">
                        <h3 className="text-center mb-4">Setup Multi-Factor Authentication</h3>
                        {error && <div className="alert alert-danger text-center">{error}</div>}

                        {loading ? (
                            <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {qrCode && (
                                    <div className="text-center mb-3">
                                        <img src={qrCode} alt="QR Code for MFA Setup" className="img-fluid" />
                                    </div>
                                )}
                                <p className="text-center">
                                    Scan the QR code with your authenticator app, then enter the code below.
                                </p>
                                <form onSubmit={handleMfaSetup}>
                                    <div className="mb-3">
                                        <label htmlFor="mfaCode" className="form-label">Authenticator Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="mfaCode"
                                            placeholder="Enter the code from your app"
                                            value={mfaCode}
                                            onChange={(e) => setMfaCode(e.target.value)}
                                            required
                                        />
                                    </div>
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MFASetupPage;
