import {Tooltip} from 'bootstrap';
import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {UpdateBalance} from "../utils/updateBalance";
import {UrlRouteType} from "../types/url-route.type";
import {BalanceResponseType} from "../types/responsies/balance-response.type";
import {UserInfoType} from "../types/user-info.type";

export class Sidebar {
    private sidebarTemplate: string = '../templates/sidebar.html';
    readonly contentsWrapElement: HTMLElement | null;
    private accordionButtonElement: HTMLElement | null;
    private flushCollapseOneElement: HTMLElement | null;
    private headerBtnMenuButtonElement: HTMLElement | null;
    private menuMobileElement: HTMLElement | null;
    private parentBalanceElement: HTMLElement | null;
    private balanceElement: HTMLElement | null;
    private wrapBalanceElement: HTMLElement | null;
    private fullNameElement: HTMLElement | null;
    private saveBalanceButtonElement: HTMLElement | null;
    private editBalanceInput: HTMLInputElement | null;
    private editBalanceInputElement: HTMLInputElement | null;
    private canselBalanceButtonElement: HTMLElement | null;
    private navLinksElements: HTMLCollectionOf<Element> | null;
    readonly urlRoute: UrlRouteType;
    private balance: number | null;

    constructor(urlRoute: UrlRouteType) {
        this.contentsWrapElement = document.getElementById('contents-wrap');
        this.urlRoute = urlRoute;
        this.accordionButtonElement = null;
        this.flushCollapseOneElement = null;
        this.navLinksElements = null;
        this.headerBtnMenuButtonElement = null;
        this.menuMobileElement = null;
        this.parentBalanceElement = null;
        this.balance = null;
        this.balanceElement = null;
        this.editBalanceInput = null;
        this.wrapBalanceElement = null;
        this.fullNameElement = null;
        this.editBalanceInputElement = null;
        this.saveBalanceButtonElement = null;
        this.canselBalanceButtonElement = null;

        this.init()
    }

    private async init(): Promise<void> {
        const accessTokenKey: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (!accessTokenKey) {
            window.location.href = '#/login';
            return
        }
        try {
            const result: BalanceResponseType = await CustomHttp.request(config.host + '/balance');
            if (result) {
                this.balance = result.balance;
                await this.drawSidebar();
            }
        } catch (e) {
            console.log(e)
            return
        }
    }

    async drawSidebar() {
        const that: Sidebar = this;
        const userInfo: UserInfoType | null = Auth.getUserInfo()
        const sidebar: HTMLElement | null = document.createElement('div');
        sidebar.className = "col-sm-4 col-md-3 col-xxl-2 d-flex flex-column flex-shrink-0 p-0 bg-white justify-content-between border-end sidebar_wrap";
        sidebar.setAttribute('id', 'sidebar_wrap');
        sidebar.innerHTML = await fetch(this.sidebarTemplate).then(response => response.text());
        this.contentsWrapElement && this.contentsWrapElement.insertBefore(sidebar, this.contentsWrapElement.firstChild)

        this.accordionButtonElement = document.getElementById('accordion-button');
        this.flushCollapseOneElement = document.getElementById('flush-collapseOne');

        this.headerBtnMenuButtonElement = document.getElementById('header__menu-btn');
        this.menuMobileElement = document.getElementById('sidebar_wrap');
        this.balanceElement = document.getElementById('balance');
        if (this.balanceElement) {
            this.balanceElement.innerText = `${this.balance}$`;
            this.balanceElement.addEventListener('click', function () {
                that.editBalance();
            })
        }

        this.fullNameElement = document.getElementById('full-name');
        if (this.fullNameElement && userInfo) {
            this.fullNameElement.innerText = `${userInfo.name} ${userInfo.lastName}`;
        }
        if (this.headerBtnMenuButtonElement) {
            this.headerBtnMenuButtonElement.addEventListener('click', () => {
                that.headerBtnMenuButtonElement && that.headerBtnMenuButtonElement.classList.toggle('active');
                that.menuMobileElement && that.menuMobileElement.classList.toggle('active');
                if (that.menuMobileElement && that.menuMobileElement.classList.contains('active')) {
                    document.body.style.overflow = 'hidden'
                } else {
                    document.body.style.overflow = 'auto'
                }
            })
        }

        if (this.urlRoute === UrlRouteType.expense
            || this.urlRoute === UrlRouteType.income
            || this.urlRoute === UrlRouteType.createExpense
            || this.urlRoute === UrlRouteType.createIncome
            || this.urlRoute === UrlRouteType.editExpense
            || this.urlRoute === UrlRouteType.editIncome
        ) {
            this.accordionButtonElement && this.accordionButtonElement.classList.remove('collapsed');
            this.flushCollapseOneElement && this.flushCollapseOneElement.classList.add('show');
        } else {
            this.accordionButtonElement && this.accordionButtonElement.classList.add('collapsed');
            this.flushCollapseOneElement && this.flushCollapseOneElement.classList.remove('show');
        }

        this.navLinksElements = document.getElementsByClassName('nav-link');

        [].forEach.call(that.navLinksElements, function (link: HTMLElement) {

            if (link.getAttribute('href') === that.urlRoute) {
                if (link.getAttribute('meta-name') === 'main') {
                    link.classList.remove('link-dark');
                }
                link.classList.add('active');
            } else {
                if (link.getAttribute('meta-name') === 'main') {
                    link.classList.add('link-dark');
                }
                link.classList.remove('active');
            }

            if ((that.urlRoute === UrlRouteType.createExpense && link.getAttribute('href') === '#/expense')
                || (that.urlRoute === UrlRouteType.editExpense && link.getAttribute('href') === '#/expense')
                || (that.urlRoute === UrlRouteType.expense && link.getAttribute('href') === '#/expense')) {
                link.classList.add('active');
            }
            if ((that.urlRoute === UrlRouteType.createIncome && link.getAttribute('href') === '#/income')
                || (that.urlRoute === UrlRouteType.editIncome && link.getAttribute('href') === '#/income')
                || (that.urlRoute === UrlRouteType.income && link.getAttribute('href') === '#/income')) {
                link.classList.add('active');
            }
            if ((that.urlRoute === UrlRouteType.incomeAndExpenses && link.getAttribute('href') === '#/income-and-expenses')
                || (that.urlRoute === UrlRouteType.createIncomeAndExpenses && link.getAttribute('href') === '#/income-and-expenses')
                || (that.urlRoute === UrlRouteType.editIncomeAndExpenses && link.getAttribute('href') === '#/income-and-expenses')) {
                link.classList.add('active');
                link.classList.remove('link-dark')
            }
        });
        [...document.querySelectorAll('[data-bs-toggle="tooltip"]')]
            .forEach(el => new Tooltip(el));
    }

    private async editBalance(): Promise<void> {
        const that: Sidebar = this;
        this.wrapBalanceElement = document.getElementById('wrapBalance');
        this.parentBalanceElement = document.getElementById('parentBalance');
        this.editBalanceInputElement = document.createElement('input');
        this.editBalanceInputElement.className = 'form-control';
        this.editBalanceInputElement.setAttribute('type', 'number');
        this.editBalanceInputElement.setAttribute('name', 'editBalanceInput');
        this.editBalanceInputElement.setAttribute('id', 'editBalanceInput');
        this.editBalanceInputElement.setAttribute('patern', 'editBalanceInput');

        this.editBalanceInputElement.value = (await UpdateBalance.getBalance())!.toString();

        this.saveBalanceButtonElement = document.createElement('button');
        this.saveBalanceButtonElement.className = 'btn';
        this.saveBalanceButtonElement.setAttribute('id', 'saveBalance');
        const saveImageElement: HTMLElement = document.createElement('img');
        saveImageElement.setAttribute('src', 'images/check2.svg');
        saveImageElement.setAttribute('alt', 'подтвердить');
        this.saveBalanceButtonElement.appendChild(saveImageElement);

        this.canselBalanceButtonElement = document.createElement('button');
        this.canselBalanceButtonElement.className = 'btn';
        this.canselBalanceButtonElement.setAttribute('id', 'canselEditBalance');
        const canselImageElement = document.createElement('img');
        canselImageElement.setAttribute('src', 'images/x.svg');
        canselImageElement.setAttribute('alt', 'отменить');
        this.canselBalanceButtonElement.appendChild(canselImageElement);
        this.parentBalanceElement!.style.display = 'none';
        if (this.wrapBalanceElement) {
            this.wrapBalanceElement.appendChild(this.editBalanceInputElement);
            this.wrapBalanceElement.appendChild(this.saveBalanceButtonElement);
            this.wrapBalanceElement.appendChild(this.canselBalanceButtonElement);
        }
        this.canselBalanceButtonElement.addEventListener('click', () => that.canselSaveBalance());
        this.saveBalanceButtonElement.addEventListener('click', () => that.saveBalance());
    }

    private canselSaveBalance(): void {
        this.parentBalanceElement && this.parentBalanceElement.removeAttribute('style')
        this.editBalanceInputElement && this.editBalanceInputElement.remove();
        this.saveBalanceButtonElement && this.saveBalanceButtonElement.remove();
        this.canselBalanceButtonElement && this.canselBalanceButtonElement.remove();
    }

    private async saveBalance(): Promise<void> {
        this.editBalanceInput = document.getElementById('editBalanceInput') as HTMLInputElement;
        try {
            const response: BalanceResponseType = await CustomHttp.request(config.host + '/balance', 'PUT', {
                newBalance: this.editBalanceInput.value
            });
            if (response && response.balance) {
                this.balance = response.balance;
                this.canselSaveBalance();
                this.balanceElement!.innerText = `${this.balance}$`;
            }
        } catch (e: any) {
            throw new Error(e);
        }
    }
}