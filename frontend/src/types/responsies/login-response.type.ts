import {UserInfoType} from "../user-info.type";


export type LoginResponseType = {
    tokens: {
        accessToken: string,
        refreshToken: string,
    },
    user: UserInfoType
}