export interface DataProcessorProfileRequiredField {
    [key: string]: boolean;
}

export const requiredFieldsDataProcessors: { [key: string]: boolean } = {
    'username': true,
    'password': true
};
