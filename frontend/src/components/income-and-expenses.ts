import {CreateModal} from "./createModal";
import {Filter} from "./filter";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {UpdateBalance} from "../utils/updateBalance";
import {PageType} from "../types/page.type";
import {OperationResponseType} from "../types/responsies/operation-response.type";

export class IncomeAndExpenses {
    private tableElement: null | HTMLElement;
    private createButtonElements: NodeListOf<HTMLElement> | null;
    readonly idDeletingOperation: number | null;
    private periodString: string | null;
    constructor() {
        this.tableElement = null;
        this.createButtonElements = null;
        this.idDeletingOperation = null;
        //this.data = null;
        this.periodString = null;
        this.init()
    }

    private init(): void {
        this.periodString = sessionStorage.getItem('queryPeriodString');
        this.tableElement = document.getElementById('table');

        this.createButtonElements = document.getElementsByName('create-button')
        this.createButtonElements.forEach(button => {
            button.addEventListener('click', () => location.href = '#/create-income-and-expenses')
        })
        if (this.periodString) {
            new Filter(this.drawRows.bind(this), this.periodString);
        } else {
            new Filter(this.drawRows.bind(this), null);
        }
        new CreateModal(PageType.incomeAndExpenses, this.idDeletingOperation!, this.updateTable.bind(this));
    }

    private async updateTable(): Promise<void> {
        try {
            const results: OperationResponseType[] = await CustomHttp.request(config.host + '/operations?' + this.periodString);
            if (results) {
                this.drawRows(results)
                const balance: number | undefined = await UpdateBalance.getBalance();
                if (balance) {
                    const balanceElement: HTMLElement | null = document.getElementById('balance');
                    if (balanceElement) balanceElement.innerText = `${balance}$`;
                }
            } else {
                throw new Error('На данный период данных нет');
            }
        } catch (e) {
            console.log(e)
        }
    }
    private drawRows(data:OperationResponseType[]):void {
        if (this.tableElement) this.tableElement.replaceChildren();
        if (data && data.length > 0) {
            data.forEach((operation: OperationResponseType, index: number) => {
                this.createTrElement(operation, index)
            })
        }
    }

    private createTrElement(operation: OperationResponseType, index: number): void {
        const that: IncomeAndExpenses = this;
        const trElement: HTMLElement | null = document.createElement('tr');
        const thElement: HTMLElement | null = document.createElement('th');
        thElement.setAttribute('scope','row');
        thElement.innerText = (index + 1).toString();
        trElement.appendChild(thElement);

        const tdElementType: HTMLElement | null = document.createElement('td');
        tdElementType.className = operation.type === 'income' ? 'text-success' : 'text-danger';
        tdElementType.innerText = operation.type === 'income' ? 'доход' : 'расход';
        trElement.appendChild(tdElementType);

        const tdElementCategory: HTMLElement | null = document.createElement('td');
        if (operation.category) {
            tdElementCategory.innerText = operation.category.toLowerCase();
        }
        trElement.appendChild(tdElementCategory);

        const tdElementAmount: HTMLElement | null = document.createElement('td');
        tdElementAmount.innerText = `${operation.amount}$`
        trElement.appendChild(tdElementAmount);

        const tdElementDate: HTMLElement | null = document.createElement('td');
        tdElementDate.innerText = operation.date.split('-').reverse().join('.');
        trElement.appendChild(tdElementDate);

        const tdElementComment: HTMLElement | null = document.createElement('td');
        tdElementComment.innerText = operation.comment;
        trElement.appendChild(tdElementComment);

        const tdActionsElement: HTMLElement | null = document.createElement('td');
        const wrapActionsElement: HTMLElement | null = document.createElement('div');
        wrapActionsElement.className = 'd-flex align-items-center';
        const buttonDeleteElement: HTMLElement | null = document.createElement('button');
        buttonDeleteElement.className = 'btn  btn_icon me-2';
        buttonDeleteElement.setAttribute('type', 'button');
        buttonDeleteElement.setAttribute('data-bs-toggle', 'modal');
        buttonDeleteElement.setAttribute('data-bs-target', '#staticBackdrop');
        buttonDeleteElement.setAttribute('id', `delete-${operation.id}`);
        const imageDeleteElement: HTMLElement | null = document.createElement('img');
        imageDeleteElement.setAttribute('src', 'images/delete.svg');
        imageDeleteElement.setAttribute('alt', 'корзина');
        buttonDeleteElement.appendChild(imageDeleteElement);
        wrapActionsElement.appendChild(buttonDeleteElement);
        const buttonEditElement: HTMLElement | null = document.createElement('button');
        buttonEditElement.className = 'btn btn_icon';
        buttonEditElement.setAttribute('type', 'button');
        buttonEditElement.setAttribute('id', `edit-${operation.id}`);
        const imageEditElement: HTMLElement | null = document.createElement('img');
        imageEditElement.setAttribute('src', 'images/edit.svg');
        imageEditElement.setAttribute('alt', 'карандаш');
        buttonEditElement.appendChild(imageEditElement);
        wrapActionsElement.appendChild(buttonEditElement);
        tdActionsElement.appendChild(wrapActionsElement);
        trElement.appendChild(tdActionsElement);

        buttonDeleteElement.addEventListener('click', function () {
            new CreateModal(PageType.incomeAndExpenses, operation.id, that.updateTable.bind(that));
        })

       buttonEditElement.addEventListener('click', function () {
           location.href = '#/edit-income-and-expenses?id=' + operation.id;
       });
        if (this.tableElement) this.tableElement.appendChild(trElement);
    }
}