export interface Site {
    id: number,
    title: string,
    siteDescription?: string,
    body: string,
    createDate: Date,
    updateDate?: Date,
}

export interface SitesResponse {
    sites: Site[],
    sitesLen: number,
    pageIndex: number,
}

export const DEFAULT_PAGE_SIZE = 5;
