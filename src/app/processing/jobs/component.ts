import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';

import { JobsApiService } from './api.service';
import { Job } from './api.model';
import { JobsDatatable } from './datatable.model';
import { JobsDatatableService } from './datatable.service';
import { JobTypesApiService } from '../job-types/api.service';
import { JobType } from '../job-types/api.model';

@Component({
    selector: 'app-jobs',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class JobsComponent implements OnInit {
    datatableOptions: JobsDatatable;
    jobs: Job[];
    jobTypes: JobType[];
    jobTypeOptions: SelectItem[];
    selectedJobType: string;
    statusValues: ['Running', 'Completed'];
    first: number;
    count: number;
    isInitialized: boolean;

    constructor(
        private jobsDatatableService: JobsDatatableService,
        private jobsApiService: JobsApiService,
        private jobTypesApiService: JobTypesApiService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.isInitialized = false;
    }

    private updateData() {
        this.jobsApiService.getJobs(this.datatableOptions).then(data => {
            this.count = data.count;
            this.jobs = data.results as Job[];
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions);
        this.jobsDatatableService.setJobsDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/jobs'], {
            queryParams: this.datatableOptions
        });

        this.updateData();
    }
    private getJobTypes() {
        this.jobTypesApiService.getJobTypes().then(data => {
            this.count = data.count;
            this.jobTypes = data.results as JobType[];
            const self = this;
            const selectItems = [];
            _.forEach(this.jobTypes, function (jobType) {
                selectItems.push({
                    label: jobType.title + ' ' + jobType.version,
                    value: jobType.name
                });
                if (self.datatableOptions.job_type_name === jobType.name) {
                    self.selectedJobType = jobType.name;
                }
            });
            this.jobTypeOptions = _.orderBy(selectItems, ['label'], ['asc']);
            this.jobTypeOptions.unshift({
                label: 'All',
                value: ''
            });
            this.updateOptions();
        });
    }

    paginate(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: e.first,
            rows: parseInt(e.rows, 10)
        });
        this.updateOptions();
    }
    onLazyLoad(e: LazyLoadEvent) {
        // let ngOnInit handle loading data to ensure query params are respected
        if (this.isInitialized) {
            this.datatableOptions = Object.assign(this.datatableOptions, {
                first: 0,
                sortField: e.sortField,
                sortOrder: e.sortOrder
                // job_type_name: e.filters['job_type.name']['value']
            });
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onChange(e) {
        e.originalEvent.preventDefault();
        this.datatableOptions = Object.assign(this.datatableOptions, {
            job_type_name: e.value
        });
        this.updateOptions();
    }
    ngOnInit() {
        if (this.activatedRoute.snapshot &&
            Object.keys(this.activatedRoute.snapshot.queryParams).length > 0) {

            const params = this.activatedRoute.snapshot.queryParams;
            this.datatableOptions = {
                first: parseInt(params.first, 10),
                rows: parseInt(params.rows, 10),
                sortField: params.sortField,
                sortOrder: parseInt(params.sortOrder, 10),
                started: params.started,
                ended: params.ended,
                status: params.status,
                job_id: params.job_id,
                job_type_id: params.job_type_id,
                job_type_name: params.job_type_name,
                job_type_category: params.job_type_category,
                batch_id: params.batch_id,
                error_category: params.error_category,
                include_superseded: params.include_superseded
            };
        } else {
            this.datatableOptions = this.jobsDatatableService.getJobsDatatableOptions();
        }
        this.getJobTypes();
    }
}
