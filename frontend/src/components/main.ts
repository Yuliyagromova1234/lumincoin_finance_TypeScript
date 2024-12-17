import {Chart, ChartTypeRegistry, ChartConfiguration} from 'chart.js/auto';
import {Filter} from "./filter";
import {ChartsFilteredDataType} from "../types/charts-filtered-data.type";
import {OperationResponseType} from "../types/responsies/operation-response.type";
import {ChartsDataType} from "../types/charts-data.type";

export class Main {
    private wrapChartsElement: HTMLElement | null;
    private messageEmptyData: null | HTMLElement;
    private wrapCanvasIncomeElement: HTMLElement | null;
    private wrapCanvasExpenseElement: HTMLElement | null;
    private incomeData: ChartsFilteredDataType[] | null
    private expenseData: ChartsFilteredDataType[] | null

    constructor() {
        this.wrapChartsElement = null;
        this.messageEmptyData = null;
        this.incomeData = null;
        this.expenseData = null;
        this.wrapCanvasIncomeElement = null;
        this.wrapCanvasExpenseElement = null;
        this.init();
    }

    private init(): void {
        this.messageEmptyData = document.getElementById('messageEmptyData');
        this.wrapChartsElement = document.getElementById('wrap-charts');
        this.wrapCanvasIncomeElement = document.getElementById('wrap-chart-income');
        this.wrapCanvasExpenseElement = document.getElementById('wrap-chart-expense');
        new Filter(this.drawCharts.bind(this), null);
    }

    private filterData(data: OperationResponseType[], type: string): ChartsFilteredDataType[] {
        return data.filter(obj => obj.type === type).reduce((acc: ChartsFilteredDataType[], obj: OperationResponseType) => {
            if (acc.findIndex((el: ChartsFilteredDataType) => el.category === obj.category) !== -1) {
                acc.find((item: ChartsFilteredDataType) => item.category === obj.category)!.amount += obj.amount;
            } else {
                acc.push({
                    category: obj.category,
                    amount: obj.amount
                });
            }
            return acc
        }, new Array<ChartsFilteredDataType> );
    }

    private drawCharts(data: OperationResponseType[]): void {
        if (data && data.length > 0) {
            this.incomeData = this.filterData(data, 'income');
            this.expenseData = this.filterData(data, 'expense');
            this.wrapCanvasIncomeElement && this.wrapCanvasIncomeElement.classList.remove('visually-hidden');
            this.wrapCanvasExpenseElement && this.wrapCanvasExpenseElement.classList.remove('visually-hidden');
            this.closeMessageEmptyData();
            this.drawChart('chart-income');
            this.drawChart('chart-expense');
        } else {
            this.wrapCanvasIncomeElement && this.wrapCanvasIncomeElement.classList.add('visually-hidden');
            this.wrapCanvasExpenseElement && this.wrapCanvasExpenseElement.classList.add('visually-hidden');
            this.showMessageEmptyData();
        }
    }

    private drawChart(idElement: string): void {
        const wrapChartElement: HTMLElement | null = idElement === 'chart-income' ? document.getElementById('block-chart-income') : document.getElementById('block-chart-expense');
        const canvasElement: HTMLElement = document.createElement('canvas');
        canvasElement.setAttribute('id', idElement === 'chart-income' ? "chart-income" : "chart-expense");
        if (wrapChartElement && canvasElement && wrapChartElement.firstChild) {
            wrapChartElement.replaceChild(canvasElement, wrapChartElement.firstChild);
        }


        let data: ChartsDataType | {};
        if (this.incomeData && this.expenseData) {
            data = {
                labels: idElement === 'chart-income' ? this.incomeData.map(obj => obj.category) : this.expenseData.map(obj => obj.category),
                datasets: [{
                    data: idElement === 'chart-income' ? this.incomeData.map(obj => obj.amount) : this.expenseData.map(obj => obj.amount)
                }]
            }
        } else {
            data = {}
        }
        const chartElement = document.getElementById(idElement) as HTMLCanvasElement;
        const optionIncomeChart: {
            type: keyof ChartTypeRegistry,
            data: ChartsDataType | {},
            options: {
                responsive: boolean,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        } = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        }
        new Chart(chartElement, optionIncomeChart as ChartConfiguration)
    }

    private showMessageEmptyData(): void {
        if (this.messageEmptyData) {
            this.messageEmptyData.remove();
        }
        this.messageEmptyData = document.createElement('div');
        this.messageEmptyData.className = 'fs-5 text-danger position-absolute bg-white p-2 ';
        this.messageEmptyData.setAttribute('id', 'messageEmptyData')
        this.messageEmptyData.innerText = 'На выбранный период нет данных';
        this.wrapChartsElement && this.wrapChartsElement.insertBefore(this.messageEmptyData, this.wrapChartsElement.firstChild as Node);
    }

    private closeMessageEmptyData(): void {
        if (this.messageEmptyData) {
            this.messageEmptyData.remove();
        }
    }
}