export interface Site {
    id?: string,
    title: string,
    siteDescription: string,
    body: string,
    createDate: Date,
    updateDate: Date,
}

export interface SitesResponse {
    sites: Site[],
    sitesLen: number,
    pageIndex: number,
}