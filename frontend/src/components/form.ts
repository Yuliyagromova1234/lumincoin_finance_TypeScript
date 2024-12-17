import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import config from "../../config/config";
import {FormFieldsType} from "../types/form-fields.type";
import {DefaultResponseType} from "../types/responsies/default-response.type";
import {UserInfoType} from "../types/user-info.type";
import {LoginResponseType} from "../types/responsies/login-response.type";
import {PageType} from "../types/page.type";


export class Form {
    readonly password: HTMLInputElement | null;
    readonly repeatPassword: HTMLInputElement | null;
    readonly agreeElement: HTMLInputElement | null;
    readonly processElement: HTMLElement | null;
    readonly page: PageType;
    isAgree: boolean | null;
    private confirmFlag: boolean | null;
    private fields: FormFieldsType [] = [];
    private passwordValue: string | null;
    private repeatPasswordValue: string | null;


    constructor(page: PageType) {
        this.processElement = null;
        this.agreeElement = null;
        this.isAgree = null;
        this.confirmFlag = null;
        this.page = page;
        this.processElement = document.getElementById('process') as HTMLElement;
        this.agreeElement = document.getElementById('agree') as HTMLInputElement;
        this.password = document.getElementById('password') as HTMLInputElement;
        this.repeatPassword = document.getElementById('repeat-password') as HTMLInputElement;
        this.passwordValue = null;
        this.repeatPasswordValue = null;


        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/';
            return;
        }
        if (this.repeatPassword) {
            this.confirmedPasswords();
        }


        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
                valid: false,

            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,

            },
        ];

        if (this.page === PageType.signup) {
            this.fields.unshift(
                {
                    name: 'fullName',
                    id: 'fullName',
                    element: null,
                    regex: /^[А-ЯЁ][а-яё]*([-][А-ЯЁ][а-яё]*)?\s[А-ЯЁ][а-яё]*\s[А-ЯЁ][а-яё]*$/,
                    valid: false,

                });
        }

        const that: Form = this;
        this.fields.forEach(item => {
            item.element = document.getElementById(item.id) as HTMLInputElement;
            item.element.onchange = function () {
                that.validateField.call(that, item, <HTMLInputElement>this);
            }
        })

        if (this.processElement) {
            this.processElement.onclick = function () {
                that.processForm();
            }
        }


    }

    private validateField(field: FormFieldsType, element: HTMLInputElement): void {
        if (element.parentNode) {
            if (!element.value || !element.value.match(field.regex)) {
                element.classList.add('is-invalid');
                field.valid = false;
            } else {
                (element.parentNode as HTMLElement).removeAttribute('style');
                element.classList.remove('is-invalid');
                element.classList.add('is-valid');
                field.valid = true;
            }
        }
        this.validateForm();
    }

    private validateForm(): boolean {
        const validForm: boolean = this.fields.every(item => item.valid);
        const isValid: any = this.repeatPassword ? validForm && this.confirmFlag : validForm;
        if (this.processElement) {
            if (isValid) {
                this.processElement.classList.remove('disabled');
            } else {
                this.processElement.classList.add('disabled');
            }
        }
        return isValid;
    }

    private confirmedPasswords(): void {
        (this.repeatPassword as HTMLInputElement).addEventListener('input', (event) => {
            this.passwordValue = (this.password as HTMLInputElement).value;
            this.repeatPasswordValue = (event.target as HTMLInputElement).value;
            if ((this.repeatPasswordValue) && (this.passwordValue === this.repeatPasswordValue)) {
                (this.repeatPassword as HTMLElement).classList.remove('is-invalid');
                (this.repeatPassword as HTMLElement).classList.add('is-valid');
                this.confirmFlag = true;
            } else {
                (this.repeatPassword as HTMLElement).classList.remove('is-valid');
                (this.repeatPassword as HTMLElement).classList.add('is-invalid');
                this.confirmFlag = false;
            }

            this.validateForm();
        });
    }


    private async processForm(): Promise<void> {
        if (this.validateForm()) {

            const email: string | undefined = this.fields.find(item => item.name === 'email')?.element?.value;
            const password: string | undefined = this.fields.find(item => item.name === 'password')?.element?.value;
            const er: HTMLElement | null = document.getElementById('has-user-error');

            if (this.page === PageType.signup) {

                try {
                    const result: DefaultResponseType | UserInfoType = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: this.fields.find(item => item.name === 'fullName')?.element?.value.split(' ')[1],
                        lastName: this.fields.find(item => item.name === 'fullName')?.element?.value.split(' ')[0],
                        email: email,
                        password: password,
                        passwordRepeat: this.repeatPassword?.value,
                    });

                    if (result) {
                        if ((result as DefaultResponseType).error) {
                            (er as HTMLInputElement).style.display = 'block';
                            throw new Error((result as DefaultResponseType).message);

                        }
                        location.href = '#/login';
                    }
                } catch (e) {
                    console.log(e);
                    return;
                }
            } else if (this.page === PageType.login) {
                if (this.agreeElement) {
                    this.isAgree = this.agreeElement.checked;
                }
                try {
                    const result: DefaultResponseType | LoginResponseType = await CustomHttp.request(config.host + '/login', 'POST', {
                        email: email,
                        password: password,
                        rememberMe: this.isAgree,
                    });

                    if (result) {
                        if ((result as DefaultResponseType).error || !(result as LoginResponseType).tokens.accessToken || !(result as LoginResponseType).tokens.refreshToken || !(result as LoginResponseType).user.name || !(result as LoginResponseType).user.lastName || !(result as LoginResponseType).user.id) {
                            (er as HTMLInputElement).style.display = 'block';
                            throw new Error((result as DefaultResponseType).message);
                        }
                        Auth.setTokens((result as LoginResponseType).tokens.accessToken, (result as LoginResponseType).tokens.refreshToken);
                        Auth.setUserInfo({
                            name: (result as LoginResponseType).user.name,
                            lastName: (result as LoginResponseType).user.lastName,
                            userId: (result as LoginResponseType).user.id!,
                            email: email as string,
                        });
                        location.href = '#/';
                    }
                } catch (e) {
                    console.log(e);

                }
            }
        }
    }
}
