const translations = {
    'admin.admin': 'Admin',
    'admin.metrics.avgDuration': 'Average Duration',
    'admin.metrics.executions': 'Executions',
    'admin.metrics.load': 'Load',
    'admin.metrics.maxDuration': 'Maximum Duration',
    'admin.metrics.query': 'Query',
    'admin.metrics.requestPath': 'Request Path',
    'admin.metrics.searchPlaceholder': 'Search...',
    'admin.statistics.clientCount': 'Client Count',
    'admin.statistics.configurationCount': 'Configuration Count',
    'admin.statistics.fileCount': 'File Count',
    'admin.statistics.fileSize': 'Total File Size',
    'admin.statistics.groupCount': 'Group Count',
    'admin.statistics.notificationCount': 'Notification Count',
    'admin.statistics.taskCount': 'Task Count',
    'admin.statistics.tenantCount': 'Tenant Count',
    'admin.statistics.userCount': 'User Count',
    'admin.tabs.metrics': 'Metrics',
    'admin.tabs.requests': 'Requests',
    'admin.tabs.statistics': 'Statistics',
    'advancedTable.searchPlaceholder': 'Search...',
    'button.cancel': 'Cancel',
    'button.changePassword': 'Change Password',
    'button.clear': 'Clear',
    'button.delete': 'Delete',
    'button.reload': 'Reload',
    'button.submit': 'Submit',
    'clients.clients': 'Clients',
    'dashboard.tenantStatistics': 'Active Clients / Total Clients / Max Clients',
    'dashboard.dailyActiveClients': 'Daily Active Clients',
    'dashboard.activeClients': 'Active Clients',
    'dashboard.totalClients': 'Total Clients',
    'dashboard.osDistribution': 'OS Distribution',
    'clients.downloadClient': 'Download Client',
    'clients.maxConcurrentClients': 'Max count of concurrent clients: {0}',
    'clients.newClient': 'Download Settings',
    'configurations.configurations': 'Configurations',
    'configurations.newConfiguration': 'New Configuration',
    'createShortcutTask.arguments': 'Arguments',
    'createShortcutTask.iconLocation': 'Icon Location',
    'createShortcutTask.linkDirectory': 'Link Directory',
    'createShortcutTask.linkName': 'Link Name',
    'createShortcutTask.override': 'Override Existing',
    'createShortcutTask.targetPath': 'Target Path',
    'createShortcutTask.workingDir': 'Working Directory',
    'deleteTask.ignoreIfMissing': 'Ignore If Missing',
    'deleteTask.path': 'Path',
    'deleteTask.recursive': 'Recursive',
    'downloadFileTask.destination': 'Destination',
    'downloadFileTask.ignoreIfExists': 'Ignore If Exists',
    'downloadFileTask.override': 'Override',
    'downloadFileTask.remoteUrl': 'Remote Url',
    'dropdown.defaultPlaceholder': 'Please select an option',
    'editClient.editClient': 'Edit Client',
    'editClient.feature.installedApps.searchPlaceholder': 'Search for an app',
    'editClient.feature.installedApps': 'Installed Apps',
    'editClient.feature.localDrive': 'Local Drives',
    'editClient.logs': 'Logs',
    'editClient.nav.dashboard': 'Dashboard',
    'editClient.nav.driveMonitor': 'Drive Monitor',
    'editClient.nav.features': 'Features',
    'editClient.nav.general': 'General',
    'editClient.nav.installedApps': 'Installed Apps',
    'editClient.nav.logs': 'Logs',
    'editClient.property': 'Property',
    'editClient.taskList': '(Configuration {0}): {1}',
    'editClient.updateSuccessful': 'The Client was updated successfully',
    'editClient.value': 'Value',
    'editConfiguration.editConfiguration': 'Edit Configuration',
    'editConfiguration.newTask': 'New Task',
    'editConfiguration.updateSuccessful': 'The configuration was updated successfully',
    'editGroup.editGroup': 'Edit Group',
    'editGroup.updateSuccessful': 'The group was updated successfully.',
    'editProfile.changePassword': 'Change Password',
    'editProfile.editProfile': 'Edit Profile',
    'editProfile.passwordChangeSuccess': 'Your Password was updated successfully',
    'editProfile.updateSuccessful': 'Your Profile was updated successfully',
    'editTask.editTask': 'Edit Task',
    'editTask.updateSuccessful': 'The task was updated successfully.',
    'editTenant.editTenant': 'Edit Tenant',
    'editTenant.featureFlags': 'Feature Flags',
    'editTenant.updateSuccessful': 'The tenant was updated successfully.',
    'editUser.editUser': 'Edit User',
    'editUser.updateSuccessful': 'The configuration was updated successfully.',
    'executeFileTask.arguments': 'Arguments',
    'executeFileTask.file': 'File',
    'executeFileTask.hideWindow': 'Hide Window',
    'executeFileTask.startIfProcessIsRunning': 'Start If Process Is Running',
    'field.active': 'Active',
    'field.approvedByUser': 'Approved By',
    'field.appVersion': 'App Version',
    'field.clientCount': 'No. of Clients',
    'field.clients': 'Clients',
    'field.configurationCount': 'No. of Configurations',
    'field.configurations': 'Configurations',
    'field.confirmPassword': 'Confirm Password',
    'field.content': 'Content',
    'field.createdAt': 'Created At',
    'field.currentClients': 'No. of Clients (Active/Total)',
    'field.currentPassword': 'Current Password',
    'field.defaultGroup': 'Default Group',
    'field.eMail': 'E-Mail',
    'field.fileSize': 'File Size',
    'field.groupCount': 'No. of Groups',
    'field.groups': 'Groups',
    'field.hostname': 'Hostname',
    'field.installDate': 'Install Date',
    'field.lastPing': 'Last Ping',
    'field.lastUpdate': 'Last Update',
    'field.level': 'Level',
    'field.maxClients': 'Max No. of Clients',
    'field.message': 'Message',
    'field.name': 'Name',
    'field.newPassword': 'New Password',
    'field.osVersion': 'OS Version',
    'field.output': 'Output',
    'field.password': 'Password',
    'field.permissionCount': 'No. of Permissions',
    'field.permissions': 'Permissions',
    'field.publisher': 'Publisher',
    'field.read': 'Read',
    'field.runOnce': 'Run Once',
    'field.severity': 'Severity',
    'field.taskCount': 'No. of Tasks',
    'field.tasks': 'Tasks',
    'field.tenant': 'Tenant',
    'field.timestamp': 'Timestamp',
    'field.type': 'Type',
    'field.userCount': 'No. of Users',
    'field.username': 'Username',
    'field.verified': 'Verified',
    'field.version': 'Version',
    'files.choose': 'Choose File',
    'files.dropFilesHere': 'Drop files here',
    'files.files': 'Files',
    'groups.groups': 'Groups',
    'groups.newGroup': 'New Group',
    'home.title': 'Nucleus Remote Server',
    'icon.choose': 'Choose icon',
    'issue.createIssue': 'Report an Issue',
    'issue.issueCreated': 'The problem was reported successfully. Issue Id: #{0}',
    'login.forgotPassword': 'Forgot Password',
    'login.login': 'Login',
    'navbar.admin': 'Admin',
    'navbar.client': 'Clients',
    'navbar.configuration': 'Configurations',
    'navbar.file': 'File',
    'navbar.group': 'Groups',
    'navbar.home': 'Home',
    'navbar.login': 'Login',
    'navbar.logout': 'Logout',
    'navbar.notifications': 'Notifications',
    'navbar.profile': 'Profile',
    'navbar.reportIssue': 'Report an Issue',
    'navbar.tenant': 'Tenants',
    'navbar.tenantUser': 'Tenant Users',
    'navbar.user': 'Users',
    'newConfiguration.newConfiguration': 'Create New Configuration',
    'newGroup.newGroup': 'Create New Group',
    'newTask.createNewTask': 'Create New Task',
    'newTenant.createNewTenant': 'Create New Tenant',
    'newUser.createNewUser': 'Create New User',
    'newUser.selectTenant': 'Please Select Tenant',
    'newUser.usernameNotAvailable': 'The username "{0}" is not available.',
    'notifications.newNotification': 'New notifications are available.',
    'notifications.notifications': 'Notifications',
    'notifications.severityCritical': 'Critical',
    'notifications.severityHigh': 'High',
    'notifications.severityLow': 'Low',
    'notifications.severityMedium': 'Medium',
    'permission.client': 'Client',
    'permission.configuration': 'Configuration',
    'permission.create': 'Create',
    'permission.delete': 'Delete',
    'permission.file': 'File',
    'permission.group': 'Group',
    'permission.read': 'Read',
    'permission.special': 'Special',
    'permission.task': 'Task',
    'permission.tenant-user': 'Tenant User',
    'permission.tenant': 'Tenant',
    'permission.update': 'Update',
    'permission.user': 'User',
    'request.errorResponse': 'The response you received is erroneous: {0}',
    'request.valueUndefined': 'The response you received is undefined.',
    'resetPassword.resetLinkSend': 'The Reset link was send to the specified E-Mail address.',
    'resetPassword.resetPassword': 'Reset Password',
    'resetPassword.sendResetLink': 'Send Reset Link',
    'specialFolder.Desktop': 'Desktop',
    'specialFolder.MyDocument': 'My Documents',
    'specialFolder.MyMusic': 'My Music',
    'specialFolder.MyPictures': 'My Pictures',
    'specialFolder.MyVideos': 'My Videos',
    'specialFolder.StartMenu': 'Start Menu',
    'specialFolder.Startup': 'Startup',
    'task.outputType.All': 'All',
    'task.outputType.OnlyError': 'Only Error',
    'task.outputType.Special': 'Special',
    'tasks.createShortcut': 'Create Shortcut',
    'tasks.deleteFile': 'Delete File',
    'tasks.downloadFile': 'Download File',
    'tasks.executeFile': 'Execute File',
    'tenants.newTenant': 'New Tenant',
    'tenants.tenants': 'Tenants',
    'timechart.title.date': 'Date: ',
    'users.newUser': 'New User',
    'users.users': 'Users',
    'verify.createPassword': 'Create Password',
} as const;

export default translations;
export type ValidKeys = keyof typeof translations;