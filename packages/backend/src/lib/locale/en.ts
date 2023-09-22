const translations = {
    'error.400.incorrectOldPassword': 'Your old password is not correct.',
    'error.400.invalidAuthMethod': 'Invalid authorization method.',
    'error.400.invalidClient': 'Invalid client "{0}".',
    'error.400.invalidTenant': 'Invalid tenant "{0}".',
    'error.400.missingAuthHeader': 'Missing authorization header.',
    'error.400.missingDescription': 'Please provide a description.',
    'error.400.missingMail': 'Please provide your mail address.',
    'error.400.missingUsernamePassword': 'Please provide username and password.',
    'error.400.invalidRefreshToken': 'You provided an invalid refresh token',
    'error.401.invalidUsernamePassword': 'Invalid username or password',
    'error.401.pendingVerification': 'Pending verification',
    'error.403.cannotChangeUsersPermission': 'You are not allowed to change the users permission.',
    'error.403.maxClientsPerTenant': 'Maximum clients per tenant reached.',
    'error.403.missingScopes': 'You are missing the following scopes to do that: {0}.',
    'error.404.invalidApiRoute': 'The route {1} was not found in Api-Version {0}.',
    'error.404.invalidApiVersion': '"{0}" is not a valid api version.',
    'error.404.missingUpdate': 'Version "{0}" is missing or has no content.',
    'error.404.noConfigurationFound': 'Configuration with id "{0}" was not found.',
    'error.404.noTaskFound': 'The task with id "{0}" was not found.',
    'error.404.noTenantFound': 'The tenant with id "{0}" was not found.',
    'error.404.noUserFound': 'The user with id "{0}" was not found.',
    'error.500.issueCannotBeCreated': 'The issue cannot be created.',
    'error.prisma.duplicateKey': 'The value of the field "{0}" already exists.',
    'error.prisma.invalidId': 'The id "{0}" is not valid.',
    'error.prisma.invalidInput': 'The input "{0}" is not valid.',
    'error.prisma.timeout': 'A connection to the database has been timed out.',
    'notification.differentHostname': 'A client from a different hostname has been connected with the same id. Original Hostname: {0}, New Hostname: {1}',
    'notification.serverRestart': 'The server was restarted.',
} as const;

export default translations;
export type ValidKeys = keyof typeof translations;