import { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/browse',
    name: 'Browse',
    component: () => import('@/components/Browse.vue'),
    meta: {
      hideFooter: true,
      isFullScreen: true,
      title: 'Browse Monigoring Sites',
      metaTags: [
        {
          name: 'keywords',
          content: 'HydroServer, Site Types, Map, Sites, Data',
        },
      ],
    },
  },
  {
    path: '/sites',
    name: 'Sites',
    component: () => import('@/components/Site/Sites.vue'),
    meta: {
      hasAuthGuard: true,
      title: 'My Sites',
      metaTags: [
        {
          name: 'keywords',
          content: 'HydroServer, My Sites',
        },
      ],
    },
  },
  {
    path: '/sites/:id',
    name: 'SiteDetails',
    component: () => import('@/components/Site/SiteDetails.vue'),
    meta: {
      title: 'Site',
      metaTags: [
        {
          name: 'keywords',
          content: 'HydroServer, Site',
        },
      ],
    },
  },
  {
    path: '/visualization/:id/:datastreamId',
    name: 'FocusContextPlot',
    component: () => import('@/components/Datastream/FocusContextPlot.vue'),
  },
  {
    path: '/sites/:id/datastreams/form/:datastreamId?',
    name: 'DatastreamForm',
    component: () => import('@/components/Datastream/DatastreamForm.vue'),
    meta: { hasThingOwnershipGuard: true },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/components/Contact.vue'),
    meta: {
      title: 'Contact Us',
      metaTags: [
        {
          name: 'keywords',
          content: 'HydroServer, Contact Us, GitHub, Email',
        },
      ],
    },
  },
  {
    path: '/data-sources',
    name: 'DataSources',
    component: () => import('@/components/DataSource/DataSourceDashboard.vue'),
    meta: { hasAuthGuard: true },
  },
  {
    path: '/data-sources/:id',
    name: 'DataSource',
    component: () => import('@/components/DataSource/DataSourceDetail.vue'),
  },
  {
    path: '/data-loaders',
    name: 'DataLoaders',
    component: () => import('@/components/DataSource/DataLoaderDashboard.vue'),
    meta: { hasAuthGuard: true },
  },
  {
    path: '/hydroloader/download',
    name: 'HydroLoader',
    component: () => import('@/components/DataSource/HydroLoaderDownload.vue'),
  },
  {
    path: '/sites/:id/datastreams/:datastreamId/datasource',
    name: 'DataSourceForm',
    component: () => import('@/components/DataSource/DataSourceForm.vue'),
    meta: { hasThingOwnershipGuard: true },
  },
  {
    path: '/sign-up',
    name: 'SignUp',
    component: () => import('@/components/account/Signup.vue'),
    meta: {
      hasLoggedOutGuard: true,
      title: 'Sign Up',
      metaTags: [
        {
          name: 'keywords',
          content: 'Sign Up, Account, User',
        },
      ],
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/account/Login.vue'),
    meta: {
      title: 'Login',
      hasLoggedOutGuard: true,
    },
  },
  {
    path: '/password_reset',
    name: 'PasswordResetRequest',
    component: () =>
      import('@/components/account/PasswordRecovery/PasswordResetRequest.vue'),
    meta: {
      title: 'Reset Password',
    },
  },
  {
    path: '/password_reset/:uid/:token',
    name: 'PasswordReset',
    component: () =>
      import('@/components/account/PasswordRecovery/PasswordReset.vue'),
    meta: {
      title: 'Reset Password',
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/components/account/Profile.vue'),
    meta: { hasAuthGuard: true, title: 'Profile' },
  },
  {
    path: '/complete-profile',
    name: 'CompleteProfile',
    component: () => import('@/components/account/CompleteProfile.vue'),
    meta: { hasUnverifiedAuthGuard: true, title: 'Complete Profile' },
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: () => import('@/components/account/VerifyEmail.vue'),
    meta: { hasUnverifiedAuthGuard: true, title: 'Verify Email' },
  },
  {
    path: '/activate',
    name: 'ActivateAccount',
    component: () => import('@/components/account/ActivateAccount.vue'),
    meta: { hasUnverifiedAuthGuard: true, title: 'Verify Email' },
  },
  {
    path: '/callback',
    name: 'Callback',
    meta: { hideFooter: true, hideNavBar: true },
    component: () => import('@/components/account/LoginCallback.vue'),
  },
  {
    path: '/metadata',
    name: 'Metadata',
    component: () => import('@/pages/Metadata.vue'),
    meta: { hasAuthGuard: true },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/components/Home.vue'),
    meta: { title: 'Home' },
  },
  {
    path: '/:catchAll(.*)*',
    name: 'PageNotFound',
    component: () => import('@/components/base/PageNotFound.vue'),
    meta: { title: 'Page Not Found' },
  },
]
