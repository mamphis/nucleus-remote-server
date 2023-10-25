import { hasPermission } from '@/lib/permission';
import userStore from '@/stores/user';
import AdminView from '@/views/Admin/AdminView.vue';
import ClientsView from '@/views/Clients/ClientsView.vue';
import EditClientView from '@/views/Clients/EditClientView.vue';
import ConfigurationsView from '@/views/Configurations/ConfigurationsView.vue';
import EditConfigurationView from '@/views/Configurations/EditConfigurationView.vue';
import NewConfigurationView from '@/views/Configurations/NewConfigurationView.vue';
import EditProfileView from '@/views/EditProfileView.vue';
import FileListView from '@/views/Files/FileListView.vue';
import EditGroupView from '@/views/Groups/EditGroupView.vue';
import GroupsView from '@/views/Groups/GroupsView.vue';
import NewGroupView from '@/views/Groups/NewGroupView.vue';
import HomeView from '@/views/HomeView.vue';
import IssueView from '@/views/IssueView.vue';
import LoginView from '@/views/LoginView.vue';
import NotificationView from '@/views/NotificationView.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import EditTaskView from '@/views/Tasks/EditTaskView.vue';
import NewTaskView from '@/views/Tasks/NewTaskView.vue';
import EditTenantUserView from '@/views/TenantUsers/EditTenantUserView.vue';
import NewTenantUserView from '@/views/TenantUsers/NewTenantUserView.vue';
import TenantUsersView from '@/views/TenantUsers/TenantUsersView.vue';
import EditTenantView from '@/views/Tenants/EditTenantView.vue';
import NewTenantView from '@/views/Tenants/NewTenantView.vue';
import TenantsView from '@/views/Tenants/TenantsView.vue';
import EditUserView from '@/views/Users/EditUserView.vue';
import NewUserView from '@/views/Users/NewUserView.vue';
import UsersView from '@/views/Users/UsersView.vue';
import VerifyView from '@/views/VerifyView.vue';

import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    linkActiveClass: 'is-active',
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
        },
        {
            path: '/logout',
            name: 'logout',
            redirect(to) {
                const { logout } = userStore();
                logout();
                return '/';
            },
        },
        {
            path: '/profile',
            name: 'Profile',
            component: EditProfileView,
        },
        {
            path: '/reset-password',
            name: 'ResetPassword',
            component: ResetPassword,
        },
        {
            path: '/issue',
            name: 'Issue',
            component: IssueView,
        },
        {
            path: '/notifications',
            name: 'Notifications',
            component: NotificationView,
            meta: {
                authorized: true,
            }
        },
        {
            path: '/verify/:onetimePassword',
            name: 'Verify',
            component: VerifyView,
        },
        {
            path: '/users',
            children: [
                {
                    path: '',
                    name: 'Users',
                    component: UsersView,
                    meta: {
                        authorized: true,
                        permissions: [':user']
                    }
                },
                {
                    path: 'new',
                    name: 'NewUser',
                    component: NewUserView,
                    meta: {
                        authorized: true,
                        permissions: ['create:user']
                    }
                },
                {
                    path: ':userId',
                    name: 'EditUser',
                    component: EditUserView,
                    meta: {
                        authorized: true,
                        permissions: ['read:user']
                    }
                },
            ],
        },
        {
            path: '/tenants',
            children: [
                {
                    path: '',
                    name: 'Tenants',
                    component: TenantsView,
                    meta: {
                        authorized: true,
                        permissions: [':tenant']
                    }
                },
                {
                    path: 'new',
                    name: 'NewTenant',
                    component: NewTenantView,
                    meta: {
                        authorized: true,
                        permissions: ['create:tenant']
                    }
                },
                {
                    path: ':tenantId',
                    name: 'EditTenant',
                    component: EditTenantView,
                    meta: {
                        authorized: true,
                        permissions: ['read:tenant']
                    }
                },
            ],
        },
        {
            path: '/tenant-users',
            children: [
                {
                    path: '',
                    name: 'TenantUsers',
                    component: TenantUsersView,
                    meta: {
                        authorized: true,
                        permissions: [':tenant-user']
                    }
                },
                {
                    path: 'new',
                    name: 'NewTenantUser',
                    component: NewTenantUserView,
                    meta: {
                        authorized: true,
                        permissions: ['create:tenant-user']
                    }
                },
                {
                    path: ':userId',
                    name: 'EditTenantUser',
                    component: EditTenantUserView,
                    meta: {
                        authorized: true,
                        permissions: ['read:tenant-user']
                    }
                },
            ],
        },
        {
            path: '/groups',
            children: [
                {
                    path: '',
                    name: 'Groups',
                    component: GroupsView,
                    meta: {
                        authorized: true,
                        permissions: [':group']
                    }
                },
                {
                    path: 'new',
                    name: 'NewGroup',
                    component: NewGroupView,
                    meta: {
                        authorized: true,
                        permissions: ['create:group']
                    }
                },
                {
                    path: ':groupId',
                    name: 'EditGroup',
                    component: EditGroupView,
                    meta: {
                        authorized: true,
                        permissions: ['read:group']
                    }
                },
            ],
        },
        {
            path: '/configurations',
            children: [
                {
                    path: '',
                    name: 'Configurations',
                    component: ConfigurationsView,
                    meta: {
                        authorized: true,
                        permissions: [':configuration']
                    }
                },
                {
                    path: 'new',
                    name: 'NewConfiguration',
                    component: NewConfigurationView,
                    meta: {
                        authorized: true,
                        permissions: ['create:configuration']
                    }
                },
                {
                    path: ':configurationId',
                    name: 'EditConfiguration',
                    component: EditConfigurationView,
                    meta: {
                        authorized: true,
                        permissions: ['read:configuration']
                    }
                },
            ],
        },
        {
            path: '/clients',
            children: [
                {
                    path: '',
                    name: 'Clients',
                    component: ClientsView,
                    meta: {
                        authorized: true,
                        permissions: ['read:client']
                    }
                },
                {
                    path: ':clientId',
                    name: 'EditClient',
                    component: EditClientView,
                    meta: {
                        authorized: true,
                        permissions: ['read:client', 'read:task']
                    }
                },
            ],
        },
        {
            path: '/tasks',
            children: [
                {
                    path: 'new/:configurationId',
                    name: 'NewTask',
                    component: NewTaskView,
                    meta: {
                        authorized: true,
                        permissions: ['create:task'],
                    }
                },
                {
                    path: ':taskId',
                    name: 'EditTask',
                    component: EditTaskView,
                    meta: {
                        authorized: true,
                        permissions: ['read:task'],
                    },
                },
            ]
        },
        {
            path: '/admin',
            name: 'Admin',
            component: AdminView,
            meta: {
                authorized: true,
                permissions: ['special:admin']
            }
        },
        {
            path: '/files',
            children: [
                {
                    path: '',
                    name: 'Files',
                    component: FileListView,
                    meta: {
                        authorized: true,
                        permissions: ['read:file']
                    }
                },
            ]
        },
    ]
});

router.beforeEach((to, from, next) => {
    const { user, logout } = userStore();

    if (!to.meta.authorized) {
        // No Auth required. Feel free to go
        return next();
    }

    if (to.meta.authorized && !user) {
        // Auth required but user is not logged in.
        // Check if from needed authorization
        if (!from.meta.authorized) {
            return next(from);
        }
        // log user out and go to home page
        logout();
        return next('/');
    }


    // User is present and route must be authorized. Check if permissions fit
    if (!to.meta.permissions) {
        return next();
    }

    // check if the user has all the permissions required for this route
    if (hasPermission(user, ...to.meta.permissions as string[])) {
        return next();
    }

    next(from);
});

export default router
