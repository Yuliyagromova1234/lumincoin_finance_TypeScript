import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/common.css';
import {Modal} from 'bootstrap';
import {Router} from "./router";

class App {
    private router: Router
    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded', this.handleRoutChanging.bind(this));
        window.addEventListener('popstate', this.handleRoutChanging.bind(this));
    }

    private handleRoutChanging(): void {
        this.router.openRoute();
    }
}

(new App());


