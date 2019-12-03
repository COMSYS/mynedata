import {Observable} from 'rxjs';

export interface SidebarLinksMetaData {
    links: SidebarLinkData[];
}

export interface SidebarLinkData {
    name: string;
    'localization-identifier': string;
    routerLink: string;
    icon: string;
    role: SidebarLinkDataRole;
    badgeValue$?: Observable<number | string>;
}

export enum SidebarLinkDataRole {
    USER,
    PROCESSOR,
    BOTH
}

export const sidebarLinksConfig: SidebarLinkData[] = [
    {
        name: 'dashboard',
        'localization-identifier': 'dashboard-link-text-sidenav',
        routerLink: 'dashboard',
        icon: 'user-zone/icon-dashboard.png',
        role: SidebarLinkDataRole.BOTH
    },
    {
        name: 'privacy-settings',
        'localization-identifier': 'privacy-settings-link-text-sidenav',
        routerLink: 'privacy-settings',
        icon: 'user-zone/icon-privacy-settings.svg',
        role: SidebarLinkDataRole.USER
    },
    {
        name: 'data-management',
        'localization-identifier': 'data-management-link-text-sidenav',
        routerLink: 'data-management',
        icon: 'user-zone/icon-data-management.png',
        role: SidebarLinkDataRole.USER
    },
    {
        name: 'requests',
        'localization-identifier': 'requests-link-text-sidenav',
        routerLink: 'requests',
        icon: 'user-zone/icon-requests.svg',
        role: SidebarLinkDataRole.BOTH
    },
    {
        name: 'charts',
        'localization-identifier': 'charts-link-text-sidenav',
        routerLink: 'charts',
        icon: 'user-zone/icon-charts.png',
        role: SidebarLinkDataRole.USER
    },
    {
        name: 'score',
        'localization-identifier': 'score-link-text-sidenav',
        routerLink: 'score',
        icon: 'user-zone/icon-score.svg',
        role: SidebarLinkDataRole.USER
    },
    {
        name: 'general-settings',
        'localization-identifier': 'general-settings-link-text-sidenav',
        routerLink: 'general-settings',
        icon: 'user-zone/icon-general-settings.png',
        role: SidebarLinkDataRole.BOTH
    }
];
