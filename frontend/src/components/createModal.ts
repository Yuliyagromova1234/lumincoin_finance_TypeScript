import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {PageType} from "../types/page.type";
import {DefaultResponseType} from "../types/responsies/default-response.type";

export class CreateModal {
    readonly page: PageType;
    private modalElement: HTMLElement | null;
    private idDeleting: number;
    private callback: () => void;
    constructor(page: PageType , idDeleting: number, callback: () => void) {

        this.page = page;
        this.modalElement = null;
        this.idDeleting = idDeleting;
        this.callback = callback;
        this.init()
    }

    private init(): void {
        this.modalElement = document.getElementById('staticBackdrop');
        if (this.modalElement) this.modalElement.replaceChildren();
        this.addModal(this.page)
    }
    private addModal (page:PageType): void {

        const that: CreateModal = this;
        if (page === PageType.income || page === PageType.expense || page === PageType.incomeAndExpenses) {

            const modalDialogElement: HTMLElement | null = document.createElement('div');
            modalDialogElement.className = "modal-dialog modal-dialog-centered";

            const modalContentElement: HTMLElement | null = document.createElement('div');
            modalContentElement.className = "modal-content p-2";

            const modalBodyElement: HTMLElement | null = document.createElement('div');
            modalBodyElement.className = "modal-body align-content-center";

            const modalTitleElement: HTMLElement | null = document.createElement('div');
            modalTitleElement.className = "fs-4 text-center mb-4";
            if (page === PageType.income) {
                modalTitleElement.innerText = 'Вы действительно хотите удалить категорию? Связанные доходы будут удалены навсегда.';
            } else if (page === PageType.expense) {
                modalTitleElement.innerText = 'Вы действительно хотите удалить категорию?';
            } else {
                modalTitleElement.innerText = 'Вы действительно хотите удалить операцию?';
            }

            const wrapButtonElement: HTMLElement | null = document.createElement('div');
            wrapButtonElement.className = "d-flex align-items-center justify-content-around";

            const successButtonElement: HTMLElement | null = document.createElement('button');
            successButtonElement.className = "btn btn-success";
            successButtonElement.setAttribute('type', 'button');
            successButtonElement.setAttribute('data-bs-dismiss', 'modal');
            successButtonElement.innerText = 'Да, удалить';
            successButtonElement.addEventListener('click', async function () {
                let queryString: string;
                if (page === PageType.income) {
                    queryString = config.host + '/categories/income/';
                } else if (page === PageType.expense) {
                    queryString = config.host + '/categories/expense/';
                } else {
                    queryString = config.host + '/operations/';
                }
               try {
                   const results: DefaultResponseType = await CustomHttp.request(queryString + that.idDeleting, 'DELETE');
                   if (results) {
                       if (results.error) {
                           throw new Error(results.message);
                       }
                       that.callback()
                   } else {
                       throw new Error('Элемент не удален');
                   }
                } catch (e) {
                    console.log(e)
                }
            })

            const canselButtonElement: HTMLElement | null = document.createElement('button');
            canselButtonElement.className = "btn btn-danger";
            canselButtonElement.setAttribute('type', 'button');
            canselButtonElement.setAttribute('data-bs-dismiss', 'modal');
            canselButtonElement.innerText = 'Не удалять';

            wrapButtonElement.appendChild(successButtonElement);
            wrapButtonElement.appendChild(canselButtonElement);

            modalBodyElement.appendChild(modalTitleElement);
            modalBodyElement.appendChild(wrapButtonElement);

            modalContentElement.appendChild(modalBodyElement);

            modalDialogElement.appendChild(modalContentElement);
            if (this.modalElement) this.modalElement.appendChild(modalDialogElement);

        } else {
            return
        }
    }
}