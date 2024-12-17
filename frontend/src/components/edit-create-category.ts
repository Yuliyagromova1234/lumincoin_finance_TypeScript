import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {QueryParamsType} from "../types/query-params.type";
import {PageType} from "../types/page.type";
import {CategoriesAllResponseType} from "../types/responsies/categories-all-response.type";
import {DefaultResponseType} from "../types/responsies/default-response.type";

export class EditCreateCategory {

    private routeParams: QueryParamsType;
    private canselButtonElement: HTMLElement | null;
    private editButtonElement: HTMLElement | null;
    private titleElement: HTMLElement | null;
    private inputElement: HTMLInputElement | null;
    readonly page: PageType;

    constructor(page: PageType) {
        this.routeParams = UrlManager.getQueryParams();
        this.canselButtonElement = null;
        this.editButtonElement = null;
        this.inputElement = null;
        this.titleElement = null;
        this.page = page;

        this.init();
    }

    private async init(): Promise<void> {
        const that: EditCreateCategory = this;
        this.inputElement = document.getElementById('input') as HTMLInputElement;
        this.titleElement = document.getElementById('category-title') as HTMLElement;
        if (this.routeParams.id) {
            this.titleElement.innerText = this.page === PageType.income ? 'Редактирование категории доходов' : 'Редактирование категории расходов';
        } else {
            this.titleElement.innerText = this.page === PageType.income ? 'Создание категории доходов' : 'Создание категории расходов';
        }

        this.canselButtonElement = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
        this.editButtonElement = document.getElementsByClassName('btn-success')[0] as HTMLElement;
        if (this.routeParams.id) {
            this.editButtonElement.innerText = 'Редактировать';
        } else {
            this.editButtonElement.innerText = 'Создать';
        }
        this.canselButtonElement.addEventListener('click', () => {
            window.location.href = '#/' + that.page
        });
        this.editButtonElement.addEventListener('click', () => {
            that.saveCategory()
        })
        this.inputElement.addEventListener('change', function () {
            if (that.editButtonElement) {
                if (this.value) {
                    that.editButtonElement.removeAttribute('disabled');
                } else {
                    that.editButtonElement.setAttribute('disabled', 'disabled');
                }
            }
        })

        if (this.routeParams.id) {
            try {
                const result: DefaultResponseType | CategoriesAllResponseType= await CustomHttp.request(config.host + `/categories/${this.page}/` + this.routeParams.id);
                if (result) {
                    if ((result as DefaultResponseType).error) {
                        throw new Error((result as DefaultResponseType).message);
                    }
                    this.inputElement.value = (result as CategoriesAllResponseType).title;
                }
            } catch (e) {
                console.log(e)
            }
        }
    }

    private async saveCategory(): Promise<void> {
        let queryString:string , method: string;

        if (this.routeParams.id) {
            queryString = config.host + `/categories/${this.page}/` + this.routeParams.id;
            method = 'PUT';
        } else {
            queryString = config.host +`/categories/${this.page}`;
            method = 'POST'
        }
        try {
            const result: DefaultResponseType |  CategoriesAllResponseType = await CustomHttp.request(queryString, method, {
                title: this.inputElement && this.inputElement.value[0].toUpperCase() + this.inputElement.value.slice(1).toLowerCase()
            })
            if (result) {
                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                }
                location.href = '#/' + this.page;
            }
        } catch (e) {
            console.log(e)
        }
    }
}