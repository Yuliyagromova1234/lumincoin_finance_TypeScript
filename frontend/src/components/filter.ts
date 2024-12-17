import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {OperationResponseType} from "../types/responsies/operation-response.type";

export class Filter {
    readonly filterTemplate: string = '../templates/filter.html';
    readonly today: string;
    private filterContentElement: HTMLElement | null;
    private dataFromInputElement: HTMLInputElement | null;
    private dataToInputElement: HTMLInputElement | null;
    private filterButtonElements: HTMLCollectionOf<HTMLElement> | null;
    private btnIntervalElement: HTMLElement | null;
    private activeFilterButton: string | null;
    private callback: (results: OperationResponseType[]) => void;
    readonly queryPeriodString: string | null | undefined;
    private queryString: string | null;

    constructor(callback: (results: OperationResponseType[]) => void, queryPeriodString: string | null | undefined) {
        this.today = new Date().toISOString().slice(0, 10);
        this.filterContentElement = null;
        //this.data = null;
        this.dataFromInputElement = null;
        this.dataToInputElement = null;
        this.filterButtonElements = null;
        this.btnIntervalElement = null;
        this.activeFilterButton = null;
        this.callback = callback;
        this.queryPeriodString = queryPeriodString;
        this.queryString = null;
        this.init();
    }

    private async init(): Promise<void> {
        sessionStorage.removeItem('queryPeriodString');
        if (this.queryPeriodString) {
            if (this.queryPeriodString === `period=interval&dateFrom=${this.today}&dateTo=${this.today}`) {
                this.activeFilterButton = 'today'
            } else {
                this.activeFilterButton = this.queryPeriodString.split('=')[1].split('&')[0];
            }
        } else {
            this.activeFilterButton = 'today'
        }
        this.filterContentElement = document.getElementById('filter-content');
        if (this.filterContentElement) {
            this.filterContentElement.innerHTML = await fetch(this.filterTemplate).then(response => response.text());
        }
        this.dataFromInputElement = document.getElementById('dateFrom') as HTMLInputElement;
        this.dataToInputElement = document.getElementById('dateTo') as HTMLInputElement;
        this.filterButtonElements = document.getElementsByClassName('btn-outline-secondary') as HTMLCollectionOf<HTMLElement>;
        this.btnIntervalElement = document.getElementById('interval');
        //this.btnTodayElement = document.getElementById('today');

        const that = this;
        if (this.queryPeriodString && this.activeFilterButton === 'interval') {

            const dateFrom: string = this.queryPeriodString.match(/(dateFrom=([\d-]+))/)![2]
            const dateTo: string = this.queryPeriodString.match(/(dateTo=([\d-]+))/)![2]


            this.dataFromInputElement.value = dateFrom.split('-').reverse().join('.');
            this.dataToInputElement.value = dateTo.split('-').reverse().join('.');
        }
        this.dataFromInputElement.addEventListener('change', () => {
            that.changeInputsData();
        });
        this.dataToInputElement.addEventListener('change', () => {
            that.changeInputsData();
        });

        [].forEach.call(that.filterButtonElements, function (button: HTMLElement) {
            if (button.id === that.activeFilterButton) {
                button.classList.add('active_button_period');
            } else {
                button.classList.remove('active_button_period');
            }
            button.addEventListener('click', function () {
                that.activeFilterButton = button.id;
                that.getData(`period=${button.id}`);
                [].forEach.call(that.filterButtonElements, function (button: HTMLElement) {
                    if (button.id === that.activeFilterButton) {
                        button.classList.add('active_button_period');
                    } else {
                        button.classList.remove('active_button_period');
                    }
                })
            })
        })
        if (this.queryPeriodString) {
            await this.getData(this.queryPeriodString);
        } else {
            await this.getData('period=today');
        }
    }

    private async getData(periodString: string, callback = this.callback): Promise<void> {

        if (periodString === 'period=interval') {
            if (this.dataFromInputElement && this.dataToInputElement){
                if (this.dataFromInputElement.value && this.dataToInputElement.value) {
                    this.queryString = `/operations?period=interval&dateFrom=${this.dataFromInputElement.value}&dateTo=${this.dataToInputElement.value}`;
                } else {
                    this.queryString = '/operations?period=all';
                }
            }

        } else if (periodString === 'period=today') {
            this.queryString = `/operations?period=interval&dateFrom=${this.today}&dateTo=${this.today}`;
        } else {
            this.queryString = '/operations?' + periodString;
        }
        sessionStorage.setItem('queryPeriodString', this.queryString!.split('?')[1]);
        try {
            const results: OperationResponseType[] = await CustomHttp.request(config.host + this.queryString);
            if (results) {
                if (callback) {
                    callback(results);
                }

            } else {
                throw new Error('На данный период данных нет');
            }
        } catch (e) {
            console.log(e)
        }
    }

    private changeInputsData(): void {
        if(this.dataFromInputElement && this.dataToInputElement && this.btnIntervalElement) {
            if (this.dataFromInputElement.value && this.dataToInputElement.value) {
                this.btnIntervalElement.removeAttribute('disabled')
            } else {
                this.btnIntervalElement.setAttribute('disabled', 'disabled')
            }
        }
    }
}