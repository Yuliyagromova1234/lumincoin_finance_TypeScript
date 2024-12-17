import {CreateModal} from "./createModal";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {PageType} from "../types/page.type";
import {CategoriesAllResponseType} from "../types/responsies/categories-all-response.type";

export class Categories {
    private categoriesContainerElement: HTMLElement | null;
    private categoriesTitleElement: HTMLElement | null;
    private addButtonElement: HTMLElement | null;
    readonly idDeletingCategory: number | null;
    readonly page: PageType;
    private queryString: string | null

    constructor(page: PageType) {
        this.categoriesContainerElement = null;
        this.addButtonElement = null;
        this.idDeletingCategory = null;
        this.page = page;
        this.categoriesTitleElement = null;
        this.queryString = null;
        this.init();
    }

    private async init(): Promise<void> {
        const that = this;
        this.categoriesContainerElement = document.getElementById('categories');
        this.categoriesTitleElement = document.getElementById('categories-title');
        if (this.categoriesTitleElement) {
            this.categoriesTitleElement.innerText = this.page === 'income' ? 'Доходы' : 'Расходы';
        }

        if (this.page) {
            this.queryString = config.host + '/categories/' + this.page;
        }
        try {
            if (this.queryString) {
                const results: CategoriesAllResponseType[] = await CustomHttp.request(this.queryString)
                if (results && results.length > 0) {
                    this.updateDataCategory(results);

                } else {
                    console.log('нет ни одной категории')
                }
            }

        } catch (e) {
            console.log(e)
        }

        this.addButtonElement = document.getElementById('add-category');
        if (this.addButtonElement) {
            this.addButtonElement.addEventListener('click', () => {
                location.href = '#/create-' + that.page;
            })
        }

        new CreateModal(this.page, this.idDeletingCategory!, this.updateDataCategory.bind(this));
    }

    public updateDataCategory(categories?: CategoriesAllResponseType[]): void {
        Array.from(document.querySelectorAll('div[class~="category_card"]')).forEach(node => {
            node.remove()
        });

        categories && categories.forEach(category => {
            this.drawCategory(category)
        })
    }

    private drawCategory(category: CategoriesAllResponseType): void {

        const that: Categories = this;
        const categoryCardElement: HTMLElement | null  = document.createElement('div');
        categoryCardElement.className = 'border p-3 col col-xxl-3 category_card';
        const categoryCardTitle: HTMLElement | null = document.createElement('h3');
        categoryCardTitle.innerText = category.title;
        categoryCardElement.appendChild(categoryCardTitle);

        const categoryCardActions: HTMLElement | null = document.createElement('div');
        categoryCardActions.className = 'd-flex flex-nowrap gap-2';

        const categoryCardActionsEditButton: HTMLElement | null = document.createElement('button');
        categoryCardActionsEditButton.className = 'btn btn-primary';
        categoryCardActionsEditButton.innerText = 'Редактировать';
        categoryCardActionsEditButton.addEventListener('click', function () {
            window.location.href = '#/edit-' + that.page + `?id=${category.id}`;
        })
        categoryCardActions.appendChild(categoryCardActionsEditButton);

        const categoryCardActionsDeleteButton: HTMLElement | null = document.createElement('button');
        categoryCardActionsDeleteButton.className = 'btn btn-danger';
        categoryCardActionsDeleteButton.setAttribute('data-bs-toggle', 'modal');
        categoryCardActionsDeleteButton.setAttribute('data-bs-target', '#staticBackdrop');
        categoryCardActionsDeleteButton.innerText = 'Удалить';
        categoryCardActionsDeleteButton.addEventListener('click', function () {
            new CreateModal(that.page, category.id, that.updateCategories.bind(that));
        })
        categoryCardActions.appendChild(categoryCardActionsDeleteButton);
        categoryCardElement.appendChild(categoryCardActions);
        if (this.categoriesContainerElement) {
            this.categoriesContainerElement.insertBefore(categoryCardElement, this.categoriesContainerElement.firstChild);
        }
    }

    private async updateCategories(): Promise<void> {
        try {
            const results: CategoriesAllResponseType[] = await CustomHttp.request(config.host + '/categories/' + this.page)
            if (results && results.length > 0) {
                this.updateDataCategory(results)

            } else {
                console.log('нет ни одной категории дохода')
            }

        } catch (e) {
            console.log(e)
        }
    }

}