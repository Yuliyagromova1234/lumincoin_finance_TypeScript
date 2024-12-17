import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {AddOptions} from "../utils/add-options";
import {QueryParamsType} from "../types/query-params.type";
import {DefaultResponseType} from "../types/responsies/default-response.type";
import {CategoriesAllResponseType} from "../types/responsies/categories-all-response.type";
import {ActionsCategoriesType} from "../types/actions-categories.type";
import {OperationResponseType} from "../types/responsies/operation-response.type";
import {OperationDataType} from "../types/operation-data.type";

export class CreateEditIncomeAndExpenses {
    private canselButtonElement: HTMLElement | null;
    private saveButtonElement: HTMLElement | null;
    private selectTypeElement: HTMLSelectElement | null;
    private selectCategoryElement: HTMLSelectElement | null;
    private buttonSaveOperation: HTMLElement | null;
    private titleElement: HTMLElement | null;
    private inputAmountElement: HTMLInputElement | null;
    private inputDateElement: HTMLInputElement | null;
    private inputCommentElement: HTMLInputElement | null;
    private  routeParams: QueryParamsType;
    private categories: CategoriesAllResponseType[] | null;
    private formFields: HTMLCollectionOf<HTMLElement> | null
    readonly action: ActionsCategoriesType;
    private validForm: boolean | null
    constructor(action: ActionsCategoriesType) {
        this.canselButtonElement = null;
        this.saveButtonElement = null;
        this.routeParams = UrlManager.getQueryParams();
        this.selectTypeElement = null;
        this.selectCategoryElement = null;
        this.categories = null;
        this.inputAmountElement = null;
        this.inputDateElement = null;
        this.inputCommentElement = null;
        this.formFields = null;
        this.action = action;
        this.titleElement = null;
        this.buttonSaveOperation = null;
        this.init()
        this.validForm = null;
    }

    private async init(): Promise<void> {
        const that: CreateEditIncomeAndExpenses  = this;
        this.buttonSaveOperation = document.getElementById('button-save-operation');
        if (this.buttonSaveOperation) {
            this.buttonSaveOperation.innerText = this.action === ActionsCategoriesType.edit ? 'Сохранить' : 'Создать';
        }

        this.titleElement = document.getElementById('title-operation');
        if (this.titleElement) {
            this.titleElement.innerText = this.action === ActionsCategoriesType.edit ? 'Редактирование дохода/расхода' : 'Создание дохода/расхода';
        }

        this.formFields = document.getElementsByClassName('form-control') as HTMLCollectionOf<HTMLElement>;
        [].forEach.call(this.formFields, function (field: HTMLElement) {
            (field as HTMLElement).addEventListener('change', () => {
                that.validateFields(Array.from(that.formFields as HTMLCollectionOf<Element>))
            })
        });
        this.selectTypeElement = document.getElementById('type') as HTMLSelectElement;
        if (this.selectTypeElement) {
            this.selectTypeElement.addEventListener('change', function () {
                that.getCategory((this as HTMLSelectElement).value);
            })
        }

        this.selectCategoryElement = document.getElementById('category') as HTMLSelectElement;
        this.inputAmountElement = document.getElementById('amount') as HTMLInputElement;
        this.inputDateElement = document.getElementById('date') as HTMLInputElement;
        this.inputCommentElement = document.getElementById('comment')as HTMLInputElement;

        if (this.action === ActionsCategoriesType.edit) {
            if (this.routeParams.id) {
                try {
                    const result: DefaultResponseType | OperationResponseType = await CustomHttp.request(config.host + '/operations/' + this.routeParams.id);
                    if (result) {
                        if ((result as DefaultResponseType).error) {
                            throw new Error((result as DefaultResponseType).message);
                        }
                        await this.getCategory((result as OperationResponseType).type)
                        this.updateDataForm(result as OperationResponseType)
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        }

        this.canselButtonElement = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
        this.canselButtonElement.addEventListener('click', () => {
            location.href = '#/income-and-expenses' + '?period=true';
        })
        this.saveButtonElement = document.getElementsByClassName('btn-success')[0] as HTMLElement;
        this.saveButtonElement.addEventListener('click', () => {
            that.saveOperation()
        })
    }

    private async saveOperation(): Promise<void> {
        const method:string = this.action === ActionsCategoriesType.edit ? 'PUT' : 'POST';
        const queryString:string = this.action === ActionsCategoriesType.edit ?
            `${config.host}/operations/${this.routeParams.id}` : `${config.host}/operations`;
        const data: OperationDataType = {
            type: (this.selectTypeElement as HTMLSelectElement).value,
            amount: +(this.inputAmountElement as HTMLInputElement).value,
            date: (this.inputDateElement as HTMLInputElement).value,
            comment: (this.inputCommentElement as HTMLInputElement).value,
            category_id: +(this.selectCategoryElement as HTMLSelectElement).value
        }
        if (data.type && data.amount && data.date && data.category_id && data.comment) {
            try {
                const result: DefaultResponseType | OperationResponseType = await CustomHttp.request(queryString, method, data)
                if (result) {
                    if ((result as DefaultResponseType).error) {
                        throw new Error((result as DefaultResponseType).message);
                    }
                    location.href = '#/income-and-expenses' + '?period=true';
                } else {
                    throw new Error('Операция не обновлена или не создана');
                }
            } catch (e) {
                console.log(e)
            }
        }
    }

    private updateDataForm (result:OperationResponseType): void {
        if (this.selectTypeElement && this.inputAmountElement && this.inputDateElement && this.inputCommentElement) {
            this.selectTypeElement.value = result.type;
            this.inputAmountElement.value = result.amount.toString();
            this.inputDateElement.value = result.date;
            this.inputCommentElement.value = result.comment;
        }
        if (this.selectCategoryElement && this.categories) {
            this.selectCategoryElement.value = this.categories.filter( el => el.title === result.category )[0].id.toString();
        }

    }

    private async getCategory(type: string): Promise<void> {
        try {
            const results: DefaultResponseType | CategoriesAllResponseType[] = await CustomHttp.request(config.host + `/categories/${type}`);
            if (results) {
                if ((results as DefaultResponseType).error) {
                    throw new Error((results as DefaultResponseType).message);
                }
                this.categories = results as CategoriesAllResponseType[];
                AddOptions.addOptions(results as CategoriesAllResponseType[], 'category')
            } else {
                throw new Error('Нет категорий');
            }

        } catch (e) {
            console.log(e)
        }
    }

    private validateFields(fields: Array<Element>): void {
        fields.forEach((field: Element) => {
            if ((field as HTMLInputElement).value) {
                this.validForm = true;
            } else {
                this.validForm = false;
            }
        });
        if (this.saveButtonElement) {
            if (this.validForm) {
                this.saveButtonElement.removeAttribute('disabled')
            } else {
                this.saveButtonElement.setAttribute('disabled', 'disabled')
            }
        }
    }

}