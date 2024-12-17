
export type RouteType = {
    route: string,
    title: string,
    template: string,
    content?: string,
    load: () => void
}