// parameterManager.js

const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const region = "ap-southeast-2";

const ssmClient = new SSMClient({ region });
const secretsManagerClient = new SecretsManagerClient({ region });

const ApiparameterName = "/n10937668/transcodingapp-A2/api_url";
const APISecretName = "n10937668/a2transcodingapp/pexel";
const cognitoParameterName = "/n10937668/transcodingapp-A2/cognito";

// Fetch API parameter value from SSM
async function getAPIParameterValue() {
    try {
        const response = await ssmClient.send(
            new GetParameterCommand({
                Name: ApiparameterName,
            })
        );
        return response.Parameter.Value;
    } catch (error) {
        console.error("Error fetching parameter:", error);
        throw new Error("Unable to fetch parameter value");
    }
}

// Fetch Cognito parameters (ID and UserPool ID)
async function getCognitoParameterValue() {
    try {
        const response = await ssmClient.send(
            new GetParameterCommand({
                Name: cognitoParameterName,
            })
        );
        return JSON.parse(response.Parameter.Value);
    } catch (error) {
        console.error("Error fetching Cognito parameters:", error);
        throw new Error("Unable to fetch Cognito parameters");
    }
}

// Fetch secrets from Secrets Manager
async function getAPIKEY() {
    try {
        const response = await secretsManagerClient.send(
            new GetSecretValueCommand({
                SecretId: APISecretName,
            })
        );
        return JSON.parse(response.SecretString);
    } catch (error) {
        console.error("Error fetching secret:", error);
        throw new Error("Unable to fetch secret value");
    }
}

module.exports = {
    getAPIParameterValue,
    getCognitoParameterValue,
    getAPIKEY,
};



