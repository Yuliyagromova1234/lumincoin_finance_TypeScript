export type FormFieldsType = {
    name: string,
    id: string,
    element: HTMLInputElement | null,
    regex: RegExp,
    valid: boolean
}