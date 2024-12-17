import {CategoriesAllResponseType} from "../types/responsies/categories-all-response.type";

export class AddOptions {

    public static addOptions(options: CategoriesAllResponseType[], idElement: string): void {
        const selectElement: HTMLElement | null = document.getElementById(idElement);
        if (selectElement && selectElement && selectElement.lastChild) {
            while (selectElement.childNodes.length > 3) {
                selectElement.removeChild(selectElement.lastChild);
            }
        }

        options.forEach((option: CategoriesAllResponseType) => {
            const optionElement: HTMLElement | null = document.createElement('option');
            optionElement.setAttribute('value', `${option.id}`);
            optionElement.innerText = `${option.title}`;
            if (selectElement) {
                selectElement.appendChild(optionElement);
            }
        })
    }
}