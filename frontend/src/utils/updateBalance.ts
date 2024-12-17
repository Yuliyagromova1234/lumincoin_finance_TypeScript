import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {BalanceResponseType} from "../types/responsies/balance-response.type";

export class UpdateBalance {
    public static async getBalance(): Promise<number | undefined> {
        try {
            const result: BalanceResponseType = await CustomHttp.request(config.host + '/balance');
            if (result) {
                return result.balance
            }
        } catch (e) {
            console.log(e);
            return;
        }
    }
}
