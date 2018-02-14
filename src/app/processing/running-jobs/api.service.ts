import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';

import { ApiResults } from '../../api-results.model';
import { RunningJobsDatatable } from './datatable.model';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';

@Injectable()
export class RunningJobsApiService {
    constructor(
        private http: Http
    ) { }
    getRunningJobs(params: RunningJobsDatatable, poll?: Boolean): any {
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        const queryParams = {
            page: page,
            page_size: params.rows
        };
        if (poll) {
            const getData = () => {
                return this.http.get(`${environment.apiPrefix}/job-types/running/`, { params: queryParams })
                    .switchMap((data) => Observable.timer(5000)
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data.json())))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get(`${environment.apiPrefix}/running-jobs/`, { params: queryParams })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
