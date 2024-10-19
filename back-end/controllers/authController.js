// const AWS = require('aws-sdk');


const qrcode = require('qrcode');

const { getParameterValue, getCognitoParameterValue } = require('./parameterManager');

const Cognito = require("@aws-sdk/client-cognito-identity-provider");
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const cognitoClient = new Cognito.CognitoIdentityProviderClient( "ap-southeast-2");



// Signup process
exports.signUp = async (req, res) => {
    const { username, password, email } = req.body;
    const { ClientId, UserPoolId } = await getCognitoParameterValue();

    const signUpCommand = new Cognito.SignUpCommand({
        ClientId: ClientId,
        Username: username,
        Password: password,
        UserAttributes: [{ Name: "email", Value: email }],
    });


    try {
        const signUpResult = await cognitoClient.send(signUpCommand);

        // // Auto-confirm the user in Cognito (without email verification as the email always has reached the limitation...)
        const confirmCommand = new Cognito.AdminConfirmSignUpCommand({
            UserPoolId: UserPoolId,
            Username: username,
        });
        const confirmResult = await cognitoClient.send(confirmCommand);

        // cognito user groups
        const addUserToGroupCommand = new Cognito.AdminAddUserToGroupCommand({
            UserPoolId: UserPoolId,
            Username: username,
            GroupName: 'user', // for now it just sets to user group
        });
        await cognitoClient.send(addUserToGroupCommand);

        res.json({ message: 'Signup and auto-confirmation was successful', result: signUpResult });
    } catch (error) {
        console.error("Signup or confirmation error:", error);
        res.status(400).json({ error: error.message });
    }
};




// Login function
exports.login = async (req, res) => {
    const { username, password } = req.body;

    const { ClientId, UserPoolId } = await getCognitoParameterValue();

    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: ClientId,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
        }
    };

    try {
        const data = await cognitoClient.send(new Cognito.InitiateAuthCommand(params));

        // Handle MFA setup or MFA challenges
        if (data.ChallengeName === 'MFA_SETUP') {
            // Return session and username to the frontend for MFA setup
            return res.json({
                message: 'MFA_SETUP',
                session: data.Session,
                username,
            });
        } else if (data.ChallengeName === 'SOFTWARE_TOKEN_MFA') {
            return res.json({
                message: 'MFA_REQUIRED',
                session: data.Session,
                username,
            });
        } else if (data.AuthenticationResult) {

            const idToken = data.AuthenticationResult.IdToken;
            const accessToken = data.AuthenticationResult.AccessToken;
            const refreshToken = data.AuthenticationResult.RefreshToken;

            const getUserGroupsCommand = new Cognito.AdminListGroupsForUserCommand({
                UserPoolId: UserPoolId,
                Username: username,
            });

            const groupData = await cognitoClient.send(getUserGroupsCommand);
            const userGroups = groupData.Groups.map(group => group.GroupName);

            return res.json({
                message: 'Login successful',
                idToken,
                accessToken,
                userGroups,
            });
        } else {
            throw new Error("Authentication failed. No tokens returned.");
        }
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message, details: error });
    }
};

// Setup MFA for user
exports.setupMFA = async (req, res) => {
    const { session, username } = req.body;


    try {

        const associateMfaCommand = new Cognito.AssociateSoftwareTokenCommand({
            Session: session
        });

        const associateData = await cognitoClient.send(associateMfaCommand);

        const secretCode = associateData.SecretCode;

        if (!secretCode) {
            console.error("Failed to generate MFA secret code.");
            return res.status(400).json({ error: "MFA secret code could not be generated." });
        }

        const appName = "Transcoding App";
        const otpauthUrl = `otpauth://totp/${appName}:${username}?secret=${secretCode}&issuer=${appName}`;

        const qrCode = await qrcode.toDataURL(otpauthUrl);  // Generate QR code


        res.json({
            message: 'MFA setup initiated',
            secretCode,
            otpauthUrl,
            qrCode,
            session: associateData.Session,

        });

    } catch (error) {
        console.error("Error during MFA setup:", error);  // Debugging error
        res.status(400).json({ error: error.message });
    }
};

exports.verifyMFASetup = async (req, res) => {
    const { session, code } = req.body;

    if (!code || !session) {
        return res.status(400).json({ error: 'MFA code and session are required' });
    }

    try {
        const verifyMfaCommand = new Cognito.VerifySoftwareTokenCommand({
            Session: session,
            UserCode: code,
        });

        const data = await cognitoClient.send(verifyMfaCommand);

        if (data.Status === 'SUCCESS') {
            return res.json({ message: 'MFA setup verified successfully' });
        } else {
            return res.status(400).json({ error: 'MFA verification failed during setup' });
        }
    } catch (error) {
        console.error("Error during MFA setup verification:", error);
        res.status(400).json({ error: error.message });
    }
};

exports.verifyMFA = async (req, res) => {
    const { code, session, username } = req.body;

    if (!code || !session) {
        return res.status(400).json({ error: 'MFA code and session are required' });
    }
    try {
        const { ClientId, UserPoolId } = await getCognitoParameterValue();

        const params = {
            ClientId: ClientId,
            ChallengeName: 'SOFTWARE_TOKEN_MFA',
            Session: session,
            ChallengeResponses: {
                USERNAME: username,
                SOFTWARE_TOKEN_MFA_CODE: code,
            },
        };

        // send for verification of challenge
        const command = new Cognito.RespondToAuthChallengeCommand(params);
        const respondToAuthChallengeCommand = await cognitoClient.send(command);



        // Check if MFA was successful and send back the tokens
        if (respondToAuthChallengeCommand.AuthenticationResult) {
            const idToken = respondToAuthChallengeCommand.AuthenticationResult.IdToken;
            const accessToken = respondToAuthChallengeCommand.AuthenticationResult.AccessToken;

            // Fetch the user's groups from Cognito
            const getUserGroupsCommand = new Cognito.AdminListGroupsForUserCommand({
                UserPoolId: UserPoolId,
                Username: username,
            });



            const groupData = await cognitoClient.send(getUserGroupsCommand);
            const userGroups = groupData.Groups.map(group => group.GroupName); // this will extract the group data and not other data returned

            // Return the tokens and user groups to the frontend
            return res.json({
                message: 'MFA verified',
                AuthenticationResult: {
                    IdToken: idToken,
                    AccessToken: accessToken,
                    userGroups: userGroups,
                },
            });
        } else {
            return res.status(400).json({ error: 'MFA verification failed' });
        }
    } catch (error) {
        console.error('Error during MFA verification:', error);
        res.status(400).json({ error: error.message });
    }
};



// Token verification
exports.verifyToken = async (req, res, next) => {
    const token = req.headers['x-access-token']; // Expect token in headers
    if (!token) return res.status(403).json({ message: 'No token provided' });

    const { UserPoolId, ClientId } = await getCognitoParameterValue();

    const verifier = CognitoJwtVerifier.create({
        userPoolId: UserPoolId,
        tokenUse: "id",
        clientId: ClientId,
    });

    try {
        const payload = await verifier.verify(token);
        req.userId = payload.sub;
        next();
    } catch (err) {
        console.error("Token verification failed:", err);
        return res.status(401).json({ message: 'Token verification failed', error: err.message });
    }
};






// Userprofile section


// Get all user profiles (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const { UserPoolId } = await getCognitoParameterValue();

        const params = {
            UserPoolId: UserPoolId,
        };

        const data = await cognitoClient.send(new Cognito.ListUsersCommand(params));
        const users = data.Users.map(user => {
            const emailAttr = user.Attributes.find(attr => attr.Name === 'email');
            const emailVerifiedAttr = user.Attributes.find(attr => attr.Name === 'email_verified');
            const userStatus = user.UserStatus || 'Unknown'; // Cognito statuses: UNCONFIRMED, CONFIRMED, ARCHIVED, etc.

            return {
                username: user.Username,
                email: emailAttr ? emailAttr.Value : 'N/A',
                emailVerified: emailVerifiedAttr ? emailVerifiedAttr.Value === 'true' : false,
                userStatus,
            };
        });

        res.json({ users });
    } catch (error) {
        console.error('Error fetching user profiles:', error);
        res.status(500).json({ error: 'Failed to fetch user profiles.' });
    }
};


// Verify email or user account
exports.verifyUser = async (req, res) => {
    const { username, verifyEmail, verifyUser } = req.body;

    try {
        const { UserPoolId } = await getCognitoParameterValue();

        const params = {
            UserPoolId: UserPoolId,
            Username: username,
            UserAttributes: [],
        };

        if (verifyEmail) {
            params.UserAttributes.push({ Name: 'email_verified', Value: 'true' });
        }
        if (verifyUser) {
            await cognitoClient.send(new Cognito.AdminConfirmSignUpCommand(params));
        }

        await cognitoClient.send(new Cognito.AdminUpdateUserAttributesCommand(params));

        res.json({ message: 'User verified successfully.' });
    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ error: 'Failed to verify user.' });
    }
};

// Delete a user account (Admin only)
exports.deleteUser = async (req, res) => {
    const { username } = req.body;

    try {
        const { UserPoolId } = await getCognitoParameterValue();

        const params = {
            UserPoolId: UserPoolId,
            Username: username,
        };

        await cognitoClient.send(new Cognito.AdminDeleteUserCommand(params));

        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user.' });
    }
};

// Make a user an admin (Admin only)
exports.makeAdmin = async (req, res) => {
    const { username } = req.body;

    try {
        const { UserPoolId } = await getCognitoParameterValue();

        const params = {
            UserPoolId: UserPoolId,
            Username: username,
            GroupName: 'user',
        };

        await cognitoClient.send(new Cognito.AdminAddUserToGroupCommand(params));

        res.json({ message: 'User promoted to admin.' });
    } catch (error) {
        console.error('Error promoting user to admin:', error);
        res.status(500).json({ error: 'Failed to promote user to admin.' });
    }
};

exports.demoteAdmin = async (req, res) => {
    const { username } = req.body;

    try {
        const { UserPoolId } = await getCognitoParameterValue();

        const params = {
            UserPoolId: UserPoolId,
            Username: username,
            GroupName: 'admin',
        };

        await cognitoClient.send(new Cognito.AdminRemoveUserFromGroupCommand(params));
        res.json({ message: 'Admin demoted to user.' });
    } catch (error) {
        console.error('Error demoting admin to user:', error);
        res.status(500).json({ error: 'Failed to demote admin to user.' });
    }
};


