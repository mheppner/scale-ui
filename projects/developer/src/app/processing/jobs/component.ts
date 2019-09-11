import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { DataService } from '../../common/services/data.service';
import { JobsApiService } from './api.service';
import { Job } from './api.model';
import { JobsDatatable } from './datatable.model';
import { JobsDatatableService } from './datatable.service';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { JobExecution } from './execution.model';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

@Component({
    selector: 'dev-jobs',
    templateUrl: './component.html',
    styleUrls: ['./component.scss'],
    providers: []
})

export class JobsComponent implements OnInit, OnDestroy {
    @Input() jobs: any;
    @Input() datatableOptions: JobsDatatable;
    @Output() datatableChange: EventEmitter<JobsDatatable> = new EventEmitter<JobsDatatable>();
    datatableLoading: boolean;
    columns = [
        { field: 'job_type', header: 'Job Type' },
        { field: 'recipe', header: 'Recipe' },
        { field: 'created', header: 'Created (Z)' },
        { field: 'last_modified', header: 'Last Modified (Z)' },
        { field: 'node.hostname', header: 'Node' },
        { field: 'duration', header: 'Duration', sortableColumnDisabled: true },
        { field: 'status', header: 'Status' },
        { field: 'error.category', header: 'Error Category' },
        { field: 'error.title', header: 'Error' },
        { field: 'id', header: 'Log', sortableColumnDisabled: true }
    ];
    dateFormat = environment.dateFormat;
    jobTypes: any;
    jobTypeOptions: SelectItem[];
    selectedJob: Job[] = [];
    selectedJobType: any = [];
    selectedJobExe: JobExecution;
    selectedRows: any;
    logDisplay: boolean;
    statusValues: SelectItem[] = [{
        label: 'Canceled',
        value: 'CANCELED'
    }, {
        label: 'Completed',
        value: 'COMPLETED'
    }, {
        label: 'Failed',
        value: 'FAILED'
    }, {
        label: 'Pending',
        value: 'PENDING'
    }, {
        label: 'Queued',
        value: 'QUEUED'
    }, {
        label: 'Running',
        value: 'RUNNING'
    }];
    selectedStatus: any = [];
    errorCategoryValues: SelectItem[] = [{
        label: 'System',
        value: 'SYSTEM'
    }, {
        label: 'Algorithm',
        value: 'ALGORITHM'
    }, {
        label: 'Data',
        value: 'DATA'
    }];
    selectedErrorCategory: any = [];
    count: number;
    started: string;
    ended: string;
    isInitialized = false;
    subscription: any;
    isMobile: boolean;

    cancelAllJobsDialogVisible = false;
    cancelSelectedJobsDialogVisible = false;
    jobsToCancel: any = [];
    requeueAllJobsDialogVisible = false;
    requeueSelectedJobsDialogVisible = false;
    jobsToRequeue: any = [];

    constructor(
        private dataService: DataService,
        private jobsDatatableService: JobsDatatableService,
        private jobsApiService: JobsApiService,
        private jobTypesApiService: JobTypesApiService,
        private router: Router,
        private route: ActivatedRoute,
        public breakpointObserver: BreakpointObserver,
        private messageService: MessageService
    ) {}

    /**
     * Filtered jobs from the selected ones matching a cancallable status.
     */
    get selectedCancelledJobs(): Job[] {
        return this.selectedJob.filter(j => j.status === 'RUNNING' || j.status === 'QUEUED');
    }

    /**
     * Filtered jobs from the selected ones matching a requeuable status.
     */
    get selectedRequeuedJobs(): Job[] {
        return this.selectedJob.filter(j => j.status === 'CANCELED' || j.status === 'FAILED');
    }

    private updateData() {
        this.datatableLoading = true;
        this.unsubscribe();
        this.subscription = this.jobsApiService.getJobs(this.datatableOptions, true).subscribe(data => {
            this.datatableLoading = false;
            this.count = data.count;
            _.forEach(data.results, result => {
                const job = _.find(this.selectedRows, { data: { id: result.id } });
                result.selected =  !!job;
            });
            this.jobs = Job.transformer(data.results);
        }, err => {
            this.datatableLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving jobs', detail: err.statusText});
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });

        this.jobsDatatableService.setJobsDatatableOptions(this.datatableOptions);
        this.router.navigate(['/processing/jobs'], {
            queryParams: this.datatableOptions as Params,
            replaceUrl: true
        });
    }
    private getJobTypes() {
        this.selectedJobType = [];
        this.jobTypesApiService.getJobTypes().subscribe(data => {
            this.jobTypes = data.results;
            const selectItems = [];
            _.forEach(this.jobTypes, jobType => {
                selectItems.push({
                    label: jobType.title + ' ' + jobType.version,
                    value: jobType
                });
                if (
                    _.indexOf(this.datatableOptions.job_type_name, jobType.name) >= 0 &&
                    _.indexOf(this.datatableOptions.job_type_version, jobType.version) >= 0
                ) {
                    this.selectedJobType.push(jobType);
                }
            });
            this.jobTypeOptions = _.orderBy(selectItems, 'label', 'asc');
            this.selectedJobType = _.orderBy(this.selectedJobType, ['name', 'version'], ['asc', 'asc']);
            this.updateData();
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error retrieving job types', detail: err.statusText});
        });
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
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
            if (e.sortField !== this.datatableOptions.sortField || e.sortOrder !== this.datatableOptions.sortOrder) {
                this.datatableOptions = Object.assign(this.datatableOptions, {
                    first: 0,
                    sortField: e.sortField,
                    sortOrder: e.sortOrder
                });
            }
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onJobTypeChange(e) {
        const name = _.map(e.value, 'name');
        const version = _.map(e.value, 'version');
        this.datatableOptions.job_type_name = name.length > 0 ? name : null;
        this.datatableOptions.job_type_version = version.length > 0 ? version : null;
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0
        });
        this.updateOptions();
    }
    onStatusChange(e) {
        this.datatableOptions.status = e.value.length > 0 ? e.value : null;
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0
        });
        this.updateOptions();
    }
    onErrorCategoryChange(e) {
        this.datatableOptions.error_category = e.value.length > 0 ? e.value : null;
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0
        });
        this.updateOptions();
    }
    /**
     * Event for when the row is clicked to launch job in a new window.
     * @param e       click event
     * @param rowData row data for this job
     */
    onRowClick(e: any, rowData: any): void {
        // entire row was selected, navigate user to that job
        if (!_.find(this.selectedRows, { data: { id: rowData.id } })) {
            this.dataService.setSelectedJobRows(rowData);
        }
        if (e.ctrlKey || e.metaKey || e.which === 2) {
            window.open(`/processing/jobs/${rowData.id}`);
        } else {
            this.router.navigate([`/processing/jobs/${rowData.id}`]);
        }
    }
    onDateFilterApply(data: any) {
        this.jobs = null;
        this.started = data.started;
        this.ended = data.ended;
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            started: moment.utc(this.started, environment.dateFormat).toISOString(),
            ended: moment.utc(this.ended, environment.dateFormat).toISOString()
        });
        this.updateOptions();
    }
    onDateRangeSelected(data: any) {
        this.jobs = null;
        this.started = moment.utc().subtract(data.range, data.unit).toISOString();
        this.ended = moment.utc().toISOString();
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            started: this.started,
            ended: this.ended,
            duration: moment.duration(data.range, data.unit).toISOString()
        });
        this.updateOptions();
    }
    /**
     * Calls the API to requeue jobs specified. If nothing is provided, the jobsToRequeue is used.
     * @param jobsParams optional params to send to the API directly, defaulting to ids in jobsToRequeue
     */
    requeueJobs(jobsParams?: any): void {
        this.messageService.add({severity: 'success', summary: 'Job requeue has been requested'});
        if (!jobsParams) {
            jobsParams = {
                job_ids: this.jobsToRequeue.map(j => j.id)
            };
        }
        this.jobsApiService.requeueJobs(jobsParams)
            .subscribe(() => {
                this.updateData();
            }, err => {
                this.messageService.add({severity: 'error', summary: 'Error requeuing jobs', detail: err.statusText});
            });
    }
    /**
     * Calls the API to cancel jobs specified. If nothing is provided, the jobsToCancel is used.
     * @param  jobsParams optional params to send to the API directly, defaulting to ids in jobsToCancel
     */
    cancelJobs(jobsParams?: any): void {
        this.messageService.add({severity: 'success', summary: 'Job cancellation has been requested'});
        if (!jobsParams) {
            jobsParams = {
                job_ids: this.jobsToCancel.map(j => j.id)
            };
        }
        this.jobsApiService.cancelJobs(jobsParams)
            .subscribe(() => {
                this.updateData();
            }, err => {
                this.messageService.add({severity: 'error', summary: 'Error canceling jobs', detail: err.statusText});
            });
    }
    showExeLog(id) {
        this.jobsApiService.getJob(id)
            .subscribe(data => {
                this.selectedJobExe = data.execution;
                this.logDisplay = true;
            }, err => {
                this.messageService.add({severity: 'error', summary: 'Error retrieving job details', detail: err.statusText});
            });
    }
    hideExeLog() {
        this.selectedJobExe = null;
    }
    onFilterClick(e) {
        e.stopPropagation();
    }
    /**
     * Launches the requeue all jobs confirmation window, by first querying all cancelled and failed jobs.
     */
    requeueAllConfirm() {
        // query for canceled and failed jobs with current params to report an accurate requeue count
        const requeueParams = _.clone(this.datatableOptions);
        requeueParams.status = ['CANCELED', 'FAILED'];
        this.jobsApiService.getJobs(requeueParams)
            .subscribe(data => {
                this.jobsToRequeue = data.results;
                if (data.results.length) {
                    this.requeueAllJobsDialogVisible = true;
                } else {
                    this.messageService.add({severity: 'info', summary: 'No jobs available to requeue',
                                             detail: 'There are no cancelled or failed jobs available.'});
                }
            }, err => {
                this.messageService.add({severity: 'error', summary: 'Error retrieving jobs', detail: err.statusText});
                this.jobsToRequeue = [];
            });
    }
    requeueSelectedConfirm() {
        this.requeueSelectedJobsDialogVisible = true;
        this.jobsToRequeue = this.selectedRequeuedJobs;
    }
    /**
     * Launches the cancel all jobs confirmation window, by first querying all running and queued jobs.
     */
    cancelAllConfirm(): void {
        // query for running and queued jobs with current params to report an accurate cancel count
        // TODO this result is paged and will used the default page size limit, may want to increase this in the query
        const cancelParams = _.clone(this.datatableOptions);
        cancelParams.status = ['RUNNING', 'QUEUED'];
        this.jobsApiService.getJobs(cancelParams)
            .subscribe(data => {
                this.jobsToCancel = data.results;
                if (data.results.length) {
                    this.cancelAllJobsDialogVisible = true;
                } else {
                    this.messageService.add({severity: 'info', summary: 'No jobs available to cancel',
                                             detail: 'There are no running or queued jobs available.'});
                }
            }, err => {
                this.messageService.add({severity: 'error', summary: 'Error retrieving jobs', detail: err.statusText});
                this.jobsToCancel = [];
            });
    }
    cancelSelectedConfirm() {
        this.cancelSelectedJobsDialogVisible = true;
        this.jobsToCancel = this.selectedCancelledJobs;
    }
    onSelectedJobTypeClick(jobType) {
        _.remove(this.selectedJobType, jobType);
        this.onJobTypeChange({ value: this.selectedJobType });
    }
    ngOnInit() {
        this.selectedRows = this.dataService.getSelectedJobRows();

        this.breakpointObserver.observe(['(min-width: 1275px)']).subscribe((state: BreakpointState) => {
            this.isMobile = !state.matches;
        });

        if (!this.datatableOptions) {
            this.datatableOptions = this.jobsDatatableService.getJobsDatatableOptions();
        }
        this.jobs = [];
        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                // TODO: check for duration here and adjust start/end accordingly
                this.datatableOptions = {
                    first: params.first ? parseInt(params.first, 10) : 0,
                    rows: params.rows ? parseInt(params.rows, 10) : 10,
                    sortField: params.sortField ? params.sortField : 'last_modified',
                    sortOrder: params.sortOrder ? parseInt(params.sortOrder, 10) : -1,
                    started: params.started ? params.started : moment.utc().subtract(1, 'd').startOf('d').toISOString(),
                    ended: params.ended ? params.ended : moment.utc().endOf('d').toISOString(),
                    duration: params.duration ? params.duration : null,
                    status: params.status ?
                        Array.isArray(params.status) ?
                            params.status :
                            [params.status]
                        : null,
                    job_id: params.job_id ? parseInt(params.job_id, 10) : null,
                    job_type_name: params.job_type_name ?
                        Array.isArray(params.job_type_name) ?
                            params.job_type_name :
                            [params.job_type_name]
                        : null,
                    job_type_version: params.job_type_version ?
                        Array.isArray(params.job_type_version) ?
                            params.job_type_version :
                            [params.job_type_version]
                        : null,
                    job_type_category: params.job_type_category || null,
                    batch_id: params.batch_id ? parseInt(params.batch_id, 10) : null,
                    error_category: params.error_category ?
                        Array.isArray(params.error_category) ?
                            params.error_category :
                            [params.error_category]
                        : null,
                    include_superseded: params.include_superseded || null
                };
            }
            this.selectedStatus = this.datatableOptions.status ?
                Array.isArray(this.datatableOptions.status) ?
                    this.datatableOptions.status :
                    [this.datatableOptions.status]
                : null;
            this.selectedErrorCategory = this.datatableOptions.error_category ?
                Array.isArray(this.datatableOptions.error_category) ?
                    this.datatableOptions.error_category :
                    [this.datatableOptions.error_category]
                : null;
            this.started = moment.utc(this.datatableOptions.started).format(environment.dateFormat);
            this.ended = moment.utc(this.datatableOptions.ended).format(environment.dateFormat);
            this.getJobTypes();
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }
}
