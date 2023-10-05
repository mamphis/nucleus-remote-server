const translations = {
    'error.400.incorrectOldPassword': 'Ihr altes Passwort ist nicht korrekt.',
    'error.400.invalidAuthMethod': 'Ungültige Autorisierungsmethode.',
    'error.400.invalidClient': 'Ungültiger Client "{0}".',
    'error.400.invalidTenant': 'Ungültiger Mandant "{0}".',
    'error.400.missingAuthHeader': 'Fehlender Autorisierungsheader.',
    'error.400.missingDescription': 'Bitte geben Sie eine Beschreibung an.',
    'error.400.missingMail': 'Bitte geben Sie Ihre E-Mail-Adresse an.',
    'error.400.missingUsernamePassword': 'Bitte geben Sie Benutzername und Passwort an.',
    'error.400.invalidTenantIdFormat' : 'Ungültiges Id Format: {0}.',
    'error.401.invalidUsernamePassword': 'Ungültiger Benutzername oder Passwort',
    'error.401.pendingVerification': 'Ausstehende Überprüfung',
    'error.403.cannotChangeUsersPermission': 'Sie dürfen die Berechtigungen der Benutzer nicht ändern.',
    'error.403.forbidden': 'Verboten',
    'error.403.maxClientsPerTenant': 'Maximale Anzahl von Clients pro Mandant erreicht.',
    'error.403.missingScopes': 'Ihnen fehlen die folgenden Berechtigungen, um dies zu tun: {0}.',
    'error.404.invalidApiRoute': 'Die Route {1} wurde in der API-Version {0} nicht gefunden.',
    'error.404.invalidApiVersion': '"{0}" ist keine gültige API-Version.',
    'error.404.missingUpdate': 'Version "{0}" fehlt oder enthält keinen Inhalt.',
    'error.404.noConfigurationFound': 'Konfiguration mit der ID "{0}" wurde nicht gefunden.',
    'error.404.noTaskFound': 'Die Aufgabe mit der ID "{0}" wurde nicht gefunden.',
    'error.404.noTenantFound': 'Der Mandant mit der ID "{0}" wurde nicht gefunden.',
    'error.404.noUserFound': 'Der Benutzer mit der ID "{0}" wurde nicht gefunden.',
    'error.500.issueCannotBeCreated': 'Das Problem kann nicht erstellt werden.',
    'error.prisma.duplicateKey': 'Der Wert des Feldes "{0}" existiert bereits.',
    'error.prisma.invalidId': 'Die ID "{0}" ist nicht gültig.',
    'error.prisma.invalidInput': 'Die Eingabe "{0}" ist nicht gültig.',
    'error.prisma.timeout': 'Die Verbindung zur Datenbank wurde beendet, da sie zeitlich überschritten wurde.',
    'features.installed-apps': 'Anzeige der Installierten Anwendungen des Clients.',
    'notification.differentHostname': 'Ein Client mit einem anderen Hostnamen wurde mit der gleichen ID verbunden. Ursprünglicher Hostname: {0}, neuer Hostname: {1}',
    'notification.maxClientReached': 'Das Client-Limit ist erreicht. Der neue Client wird hinzugefügt, aber deaktiviert.',
    'notification.serverRestart': 'Der Server wurde neu gestartet.',
} as const;

export default translations;