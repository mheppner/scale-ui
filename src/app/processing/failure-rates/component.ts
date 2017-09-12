import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';
import * as moment from 'moment';

import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { JobType } from '../../configuration/job-types/api.model';
import { FailureRatesDatatableService } from './datatable.service';
import { FailureRatesDatatable } from './datatable.model';
import { MetricsApiService } from '../../data/metrics/api.service';

@Component({
    selector: 'app-failure-rates',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class FailureRatesComponent implements OnInit {
    datatableOptions: FailureRatesDatatable;
    jobTypes: JobType[];
    jobTypeOptions: SelectItem[];
    selectedJobType: JobType;
    performanceData: any[];
    sortConfig: any;

    constructor(
        private failureRatesDatatableService: FailureRatesDatatableService,
        private jobTypesApiService: JobTypesApiService,
        private metricsApiService: MetricsApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.selectedJobType = null;
    }

    private formatData(data, numDays) {
        const dataArr = [];
        _.forEach(data, function (result) {
            const filteredResult = _.filter(result, (d) => {
                const date = moment.utc(d.date, 'YYYY-MM-DD');
                if (moment.utc().diff(moment.utc(date), 'd') <= numDays) {
                    return d;
                }
            });
            dataArr.push(filteredResult);
        });
        return dataArr;
    };
    private formatColumn(cData, id) {
        const systemErrors = cData[0],
            algorithmErrors = cData[1],
            dataErrors = cData[2],
            totalCount = cData[3];

        const obj = {
            system: _.sum(_.map(_.filter(systemErrors, { id: id }), 'value')),
            algorithm: _.sum(_.map(_.filter(algorithmErrors, { id: id }), 'value')),
            data: _.sum(_.map(_.filter(dataErrors, { id: id }), 'value')),
            total: _.sum(_.map(_.filter(totalCount, { id: id }), 'value')),
            errorTotal: null,
            failRate: null,
            failRatePercent: null
        };
        obj.errorTotal = obj.system + obj.algorithm + obj.data;
        obj.failRate = obj.total > 0 ? obj.errorTotal / obj.total : 0;
        obj.failRatePercent = (obj.failRate * 100).toFixed(0) + '%';

        return obj;
    };
    private updateData() {
        const metricsParams = {
            page: null,
            page_size: null,
            started: this.datatableOptions.started,
            ended: this.datatableOptions.ended,
            choice_id: this.selectedJobType ? [this.selectedJobType.id] : _.map(this.jobTypes, 'id'),
            column: ['error_system_count', 'error_algorithm_count', 'error_data_count', 'total_count'],
            group: null,
            dataType: 'job-types'
        };
        this.metricsApiService.getPlotData(metricsParams).then(metricsData => {
            if (metricsData.results.length > 0) {
                const data30Days = _.map(metricsData.results, 'values'),
                    data48Hours = this.formatData(data30Days, 2),
                    data24Hours = this.formatData(data48Hours, 1),
                    tempData = [];

                _.forEach(this.jobTypes, (jobType) => {
                    tempData.push({
                        job_type: jobType,
                        twentyfour_hours: this.formatColumn(data24Hours, jobType.id),
                        fortyeight_hours: this.formatColumn(data48Hours, jobType.id),
                        thirty_days: this.formatColumn(data30Days, jobType.id)
                    });
                });
                this.performanceData = tempData;
            }
        }).catch((error) => {
            console.log(error);
        });
    }
    private updateOptions(skipUpdate?) {
        this.failureRatesDatatableService.setFailureRatesDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/failure-rates'], {
            queryParams: this.datatableOptions
        });

        if (!skipUpdate) {
            this.updateData();
        }
    }
    private getJobTypes() {
        this.jobTypesApiService.getJobTypes().then(data => {
            this.jobTypes = data.results as JobType[];
            const selectItems = [];
            _.forEach(this.jobTypes, (jobType) => {
                selectItems.push({
                    label: jobType.title + ' ' + jobType.version,
                    value: jobType
                });
                if (this.datatableOptions.name === jobType.name) {
                    this.selectedJobType = jobType;
                }
            });
            this.jobTypeOptions = _.orderBy(selectItems, ['label'], ['asc']);
            this.jobTypeOptions.unshift({
                label: 'All',
                value: null
            });
            this.updateOptions();
        });
    }

    getColor(data) {
        return data.total > 0 ? parseFloat((data.errorTotal / data.total).toFixed(2)) >= 0.5 ? '#fff' : '#000' : '#000';
    }
    getBackground(data, type) {
        const rgb = type === 'system' ? '103, 0, 13' : type === 'algorithm' ? '203, 24, 29' : '241, 105, 19';
        return data.total > 0 ?
            'rgba(' + rgb + ', ' + parseFloat((data.errorTotal / data.total).toFixed(2)) + ')' :
            'rgba(' + rgb + ', ' + ' 0)';
    }
    sortBy(field) {
        let sortField = this.datatableOptions.sortField.split('.');
        this.sortConfig[sortField[0]][sortField[1]].icon = 'hidden';
        sortField = field.split('.');
        this.sortConfig[sortField[0]][sortField[1]].direction = this.sortConfig[sortField[0]][sortField[1]].direction === 'desc' ?
            'asc' :
            'desc';
        this.sortConfig[sortField[0]][sortField[1]].icon = this.sortConfig[sortField[0]][sortField[1]].direction === 'desc' ?
            'fa-caret-down' :
            'fa-caret-up';
        this.performanceData = _.orderBy(this.performanceData, [field], [this.sortConfig[sortField[0]][sortField[1]].direction]);
        this.datatableOptions = Object.assign(this.datatableOptions, {
            sortField: field,
            sortOrder: this.sortConfig[sortField[0]][sortField[1]].direction === 'desc' ? -1 : 1
        });
        this.updateOptions(true);
    };
    onChange(e) {
        this.selectedJobType = e.value;
        this.datatableOptions = Object.assign(this.datatableOptions, {
            name: this.selectedJobType ? this.selectedJobType.name : null,
            version: this.selectedJobType ? this.selectedJobType.version : null
        });
        this.updateOptions();
    }
    ngOnInit() {
        if (this.route.snapshot &&
            Object.keys(this.route.snapshot.queryParams).length > 0) {

            const params = this.route.snapshot.queryParams;
            this.datatableOptions = {
                sortField: params.sortField,
                sortOrder: parseInt(params.sortOrder, 10),
                started: params.started,
                ended: params.ended,
                name: params.name,
                version: params.version,
                category: params.category
            };
        } else {
            this.datatableOptions = this.failureRatesDatatableService.getFailureRatesDatatableOptions();
        }
        this.sortConfig = {
            twentyfour_hours: {
                system: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                },
                algorithm: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                },
                data: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                },
                total: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                },
                failRate: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                }
            },
            fortyeight_hours: {
                system: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                },
                algorithm: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                },
                data: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                },
                total: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                },
                failRate: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                }
            },
            thirty_days: {
                system: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                },
                algorithm: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                },
                data: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                },
                total: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                },
                failRate: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                }
            },
            job_type: {
                title: {
                    direction: this.datatableOptions.sortOrder || 'desc',
                    icon: 'hidden'
                }
            }
        };
        const sortField = this.datatableOptions.sortField.split('.');
        this.sortConfig[sortField[0]][sortField[1]].direction = this.datatableOptions.sortOrder === -1 ? 'desc' : 'asc';
        this.sortConfig[sortField[0]][sortField[1]].icon = this.sortConfig[sortField[0]][sortField[1]].direction === 'desc' ?
            'fa-caret-down' :
            'fa-caret-up';
        this.getJobTypes();
    }
}