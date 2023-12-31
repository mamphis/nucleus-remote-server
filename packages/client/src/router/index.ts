import { hasPermission } from '@/lib/permission';
import userStore from '@/stores/user';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
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
import EditGroupView from '@/views/Groups/EditGroupView.vue';
import NewGroupView from '@/views/Groups/NewGroupView.vue';
import GroupsView from '@/views/Groups/GroupsView.vue';
import EditConfigurationView from '@/views/Configurations/EditConfigurationView.vue';
import NewConfigurationView from '@/views/Configurations/NewConfigurationView.vue';
import ConfigurationsView from '@/views/Configurations/ConfigurationsView.vue';
import ClientsView from '@/views/Clients/ClientsView.vue'
import NewTaskView from '@/views/Tasks/NewTaskView.vue';
import EditTaskView from '@/views/Tasks/EditTaskView.vue';
import EditClientView from '@/views/Clients/EditClientView.vue';
import EditProfileView from '@/views/EditProfileView.vue';
import IssueView from '@/views/IssueView.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import NotificationView from '@/views/NotificationView.vue';

import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
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
            path: '/users',
            name: 'Users',
            component: UsersView,
            meta: {
                authorized: true,
                permissions: [':user']
            }
        },
        {
            path: '/new-user',
            name: 'NewUser',
            component: NewUserView,
            meta: {
                authorized: true,
                permissions: ['create:user']
            }
        },
        {
            path: '/users/:userId',
            name: 'EditUser',
            component: EditUserView,
            meta: {
                authorized: true,
                permissions: ['read:user']
            }
        },
        {
            path: '/verify/:onetimePassword',
            name: 'Verify',
            component: VerifyView,
        },
        {
            path: '/tenants',
            name: 'Tenants',
            component: TenantsView,
            meta: {
                authorized: true,
                permissions: [':tenant']
            }
        },
        {
            path: '/new-tenant',
            name: 'NewTenant',
            component: NewTenantView,
            meta: {
                authorized: true,
                permissions: ['create:tenant']
            }
        },
        {
            path: '/tenants/:tenantId',
            name: 'EditTenant',
            component: EditTenantView,
            meta: {
                authorized: true,
                permissions: ['read:tenant']
            }
        },
        {
            path: '/tenant-users',
            name: 'TenantUsers',
            component: TenantUsersView,
            meta: {
                authorized: true,
                permissions: [':tenant-user']
            }
        },
        {
            path: '/new-tenant-user',
            name: 'NewTenantUser',
            component: NewTenantUserView,
            meta: {
                authorized: true,
                permissions: ['create:tenant-user']
            }
        },
        {
            path: '/tenant-users/:userId',
            name: 'EditTenantUser',
            component: EditTenantUserView,
            meta: {
                authorized: true,
                permissions: ['read:tenant-user']
            }
        },
        {
            path: '/groups',
            name: 'Groups',
            component: GroupsView,
            meta: {
                authorized: true,
                permissions: [':group']
            }
        },
        {
            path: '/new-group',
            name: 'NewGroup',
            component: NewGroupView,
            meta: {
                authorized: true,
                permissions: ['create:group']
            }
        },
        {
            path: '/groups/:groupId',
            name: 'EditGroup',
            component: EditGroupView,
            meta: {
                authorized: true,
                permissions: ['read:group']
            }
        },
        {
            path: '/configurations',
            name: 'Configurations',
            component: ConfigurationsView,
            meta: {
                authorized: true,
                permissions: [':configuration']
            }
        },
        {
            path: '/new-configuration',
            name: 'NewConfiguration',
            component: NewConfigurationView,
            meta: {
                authorized: true,
                permissions: ['create:configuration']
            }
        },
        {
            path: '/configurations/:configurationId',
            name: 'EditConfiguration',
            component: EditConfigurationView,
            meta: {
                authorized: true,
                permissions: ['read:configuration']
            }
        },
        {
            path: '/clients',
            name: 'Clients',
            component: ClientsView,
            meta: {
                authorized: true,
                permissions: ['read:client']
            }
        },
        {
            path: '/clients/:clientId',
            name: 'EditClient',
            component: EditClientView,
            meta: {
                authorized: true,
                permissions: ['read:client', 'read:task']
            }
        },
        {
            path: '/new-task/:configurationId',
            name: 'NewTask',
            component: NewTaskView,
            meta: {
                authorized: true,
                permissions: ['create:task'],
            }
        },
        {
            path: '/tasks/:taskId',
            name: 'EditTask',
            component: EditTaskView,
            meta: {
                authorized: true,
                permissions: ['read:task'],
            }
        },
    ]
});

router.beforeEach((to, from, next) => {
    const { user } = userStore();

    if (!to.meta.authorized) {
        // No Auth required. Feel free to go
        return next();
    }

    if (to.meta.authorized && !user) {
        // Auth required but user is not logged in. -> go to last Route
        return next(from);
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
