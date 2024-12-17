import {Sidebar} from "./components/sidebar";
import {Main} from "./components/main";
import {IncomeAndExpenses} from "./components/income-and-expenses";
import {Form} from "./components/form";
import {Auth} from "./services/auth";
import {Categories} from "./components/categories";
import {CreateEditIncomeAndExpenses} from "./components/create-edit-income-and-expenses";
import {EditCreateCategory} from "./components/edit-create-category";
import {RouteType} from "./types/route.type";
import {ActionsCategoriesType} from "./types/actions-categories.type";
import {PageType} from "./types/page.type";
import {UrlRouteType} from "./types/url-route.type";

export class Router {
    readonly layoutElement: HTMLElement | null;
    private mainContentElement: HTMLElement | null;
    readonly titleElement: HTMLElement | null;
    private routes: RouteType[];

    constructor() {

        this.layoutElement = document.getElementById('content');
        this.mainContentElement = null;
        this.titleElement = document.getElementById('title');

        this.routes = [
            {
                route: '#/',
                title: 'Главная',
                template: 'templates/layout.html',
                content: 'templates/main.html',
                load: () => {
                    new Main()
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/registration.html',
                load: () => {
                    new Form(PageType.signup);
                }
            },
            {
                route: '#/login',
                title: 'Авторизация',
                template: 'templates/login.html',
                load: () => {
                    new Form(PageType.login);
                }
            },
            {
                route: '#/expense',
                title: 'Расходы',
                template: 'templates/layout.html',
                content: 'templates/categories.html',
                load: () => {
                    new Categories(PageType.expense);
                }
            },
            {
                route: '#/income',
                title: 'Доходы',
                template: 'templates/layout.html',
                content: 'templates/categories.html',
                load: () => {
                    new Categories(PageType.income);
                }
            },
            {
                route: '#/create-expense',
                title: 'Создать категорию расходов',
                template: 'templates/layout.html',
                content: 'templates/edit-create-category.html',
                load: () => {
                    new EditCreateCategory(PageType.expense);
                }
            },
            {
                route: '#/edit-expense',
                title: 'Редактировать категорию расходов',
                template: 'templates/layout.html',
                content: 'templates/edit-create-category.html',
                load: () => {
                    new EditCreateCategory(PageType.expense);
                }
            },
            {
                route: '#/create-income',
                title: 'Создать категорию дохода',
                template: 'templates/layout.html',
                content: 'templates/edit-create-category.html',
                load: () => {
                    new EditCreateCategory(PageType.income);
                }
            },
            {
                route: '#/edit-income',
                title: 'Редактировать категорию дохода',
                template: 'templates/layout.html',
                content: 'templates/edit-create-category.html',
                load: () => {
                    new EditCreateCategory(PageType.income);
                }
            },
            {
                route: '#/income-and-expenses',
                title: 'Доходы и расходы',
                template: 'templates/layout.html',
                content: 'templates/income-and-expenses.html',
                load: () => {
                    new IncomeAndExpenses();
                }
            },
            {
                route: '#/edit-income-and-expenses',
                title: 'Редактирование дохода/расхода',
                template: 'templates/layout.html',
                content: 'templates/create-edit-income-and-expenses.html',
                load: () => {
                    new CreateEditIncomeAndExpenses(ActionsCategoriesType.edit);
                }
            },
            {
                route: '#/create-income-and-expenses',
                title: 'Создание дохода/расхода',
                template: 'templates/layout.html',
                content: 'templates/create-edit-income-and-expenses.html',
                load: () => {
                    new CreateEditIncomeAndExpenses(ActionsCategoriesType.create);
                }
            },
        ]
    }

    public async openRoute(): Promise<void> {

        document.body.style.overflow = 'auto'
        const urlRoute: UrlRouteType = window.location.hash.split('?')[0] as UrlRouteType;
        if (urlRoute === UrlRouteType.logout) {
            await Auth.logout();
            window.location.href = '#/login';
            return;
        }

        const newRoute = this.routes.find(item => {
            return item.route === urlRoute;
        })

        if (!newRoute ) {
            window.location.href = '#/login';
            return
        }
        if (this.layoutElement) {
            this.layoutElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        }

        if (urlRoute !== UrlRouteType.login && urlRoute !== UrlRouteType.signup ) {
            const accessTokenKey: string | null = localStorage.getItem(Auth.accessTokenKey);
            if (!accessTokenKey) {
                window.location.href = '#/login';
                return;
            } else {
                new Sidebar(urlRoute)
            }
        }

        if (newRoute.content) {
            this.mainContentElement = document.getElementById('main-content');
            if (this.mainContentElement) {
                this.mainContentElement.innerHTML = await fetch(newRoute.content).then(response => response.text());
            }
        }
        if(this.titleElement) {
            this.titleElement.innerText = newRoute.title;
        }

        newRoute.load();
    }
}