import { AuthResponse, PolicyDocument } from "aws-lambda";

enum Effect {
  ALLOW = "Allow",
  DENY = "Deny",
}

function authorize(authorizationToken: string): [boolean, string] {
  const [, base64Authorization] = authorizationToken.split(" ");

  const decoded = Buffer.from(base64Authorization, "base64").toString("ascii");

  const [username, password] = decoded.split(":");

  if (process.env[username] && process.env[username] === password) {
    return [true, username];
  }

  return [false, null];
}

function generatePolicy(
  principalId: string = "",
  effect: Effect,
  resource: string
): AuthResponse {
  const authResponse: AuthResponse = <AuthResponse>{};

  authResponse.principalId = principalId;

  if (effect && resource) {
    const policyDocument: PolicyDocument = <PolicyDocument>{};

    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];

    const statementOne: any = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;

    policyDocument.Statement[0] = statementOne;

    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
}

const basicAuthorizer = async (event) => {
  console.log('this is your event:',event)
  const authorizationToken = event["authorizationToken"];

  const [isAuthorized, user] = authorize(authorizationToken);

  console.log(`authorize result:${isAuthorized}, ${user}`)
  const policy = generatePolicy(
    user,
    isAuthorized ? Effect.ALLOW : Effect.DENY,
    event.methodArn
  );

  console.log("Generated policy: ", JSON.stringify(policy));

  return policy;
};

export const main = basicAuthorizer;