export interface UserProfileRequiredField {
    [key: string]: boolean;
}

// following can be defined which fields are mandatory for an end-user
export const requiredFieldsUsers: { [key: string]: boolean } = {
    'username': true,
    'password': true,
    'birthday': true,
    'email': true,
    'country': true
};

// following can be defined which fields are mandatory for an end-user registering anonymously
export const requiredFieldsAnonUsers: { [key: string]: boolean } = {
    'username': true,
    'password': true
};

export enum Gender {
    MALE,
    FEMALE
}
