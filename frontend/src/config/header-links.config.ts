export interface HeaderLinksMetaData {
    path: string;
    links: HeaderLinkData[];
}

export interface HeaderLinkData {
    name: string;
    'localization-identifier': string;
    routerLink: string;
}

export const headerLinksConfig: HeaderLinksMetaData[] = [
    {
        path: '/.*',
        links: [
            {
                name: 'about',
                'localization-identifier': 'about-link-header',
                routerLink: '/about',
            },
            {
                name: 'register',
                'localization-identifier': 'register-link-header',
                routerLink: '/register',
            },
            {
                name: 'login',
                'localization-identifier': 'login-link-header',
                routerLink: '/login',
            }
        ]
    }
];
