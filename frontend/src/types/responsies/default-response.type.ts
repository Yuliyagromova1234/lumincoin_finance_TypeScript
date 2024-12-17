export type DefaultResponseType = {
    error: boolean,
    message: string,
    validation?: ErrorDetails | ErrorDetails[]
}

export type ErrorDetails = {
    key: any,
    message: string
}