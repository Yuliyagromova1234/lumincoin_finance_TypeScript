import config from "../../config/config";
import {RefreshResponseType} from "../types/responsies/refresh-response.type";
import {DefaultResponseType} from "../types/responsies/default-response.type";
import {UserInfoType} from "../types/user-info.type";

export class Auth {
    static accessTokenKey: string = 'accessToken';
    static refreshTokenKey: string = 'refreshToken';
    static userInfoKey: string = 'userInfo';

    public static async processAuthorizeResponse(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        const loginPage: HTMLElement | null =  document.getElementById('has-user-error');
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({refreshToken: refreshToken})
            })
            if (response && response.status === 200) {
                const result: DefaultResponseType | RefreshResponseType = await response.json();
                if ((result as RefreshResponseType) && !(result as DefaultResponseType).error) {
                    this.setTokens((result as RefreshResponseType).tokens.accessToken, (result as RefreshResponseType).tokens.refreshToken);
                    return true;
                }
            }
        }

        if (location.hash === '#/login') {
            (loginPage as HTMLInputElement).style.display = 'block';
        } else  {
            this.removeTokens();
            location.href = '#/login';
        }
        return false;

    }

    public static async logout(): Promise<boolean | undefined> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/logout', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({refreshToken: refreshToken})
            })
            if (response && response.status === 200) {
                const result: DefaultResponseType | null = await response.json();
                if (result && !result.error) {
                    this.removeTokens();
                    localStorage.removeItem(this.userInfoKey);
                    return true
                }
            }
        }
    }
    public static setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
    public static removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    public static setUserInfo(info: UserInfoType): void {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

    public static getUserInfo(): UserInfoType | null {
        const userInfo = localStorage.getItem(this.userInfoKey);
        if (userInfo) {
            return JSON.parse(userInfo);
        }
        return null;
    }
}