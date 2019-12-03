/** configuration file for the dashboard view **/

export interface DashboardConfig {
    widgets: DashboardWidgetConfig[];
}

export interface DashboardWidgetConfig {
    name: string;
    active: boolean;
    order?: number;
}

export const dashboardConfig: DashboardConfig = {
    widgets: [
        {
            name: 'connected-data-sources',
            active: true,
            order: 1
        },
        {
            name: 'my-privacy-settings',
            active: true,
            order: 2
        },
        {
            name: 'requests-and-notifications',
            active: true,
            order: 3
        },
        {
            name: 'my-shared-data',
            active: false
        },
        {
            name: 'my-sales',
            active: false
        },
        {
            name: 'my-charts',
            active: true,
            order: 6
        },
        {
            name: 'my-score',
            active: true,
            order: 5
        },
        {
            name: 'new-service',
            active: true,
            order: 4
        }
    ]
};
