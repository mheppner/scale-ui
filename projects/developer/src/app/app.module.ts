// Angular Modules
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { UtcDatepickerModule } from 'angular-utc-datepicker';
import { SeedImagesModule } from 'seed-images';

// Prime NG
import {
    AccordionModule, AutoCompleteModule, ButtonModule, CalendarModule, ChartModule, CheckboxModule, ChipsModule, DataListModule,
    DialogModule, DropdownModule, GrowlModule, InputSwitchModule, InputTextModule, InputTextareaModule, ListboxModule, MessagesModule,
    MultiSelectModule, OverlayPanelModule, PaginatorModule, PanelModule, ScrollPanelModule, SidebarModule, SpinnerModule, StepsModule,
    TabViewModule, ToggleButtonModule, TooltipModule, TreeTableModule
} from 'primeng/primeng';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { MessageService } from 'primeng/components/common/messageservice';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ColorService } from './common/services/color.service';
import { NavbarComponent } from './navbar/navbar.component';
import { SubnavComponent } from './navbar/subnav/subnav.component';
import { JobsComponent } from './processing/jobs/component';
import { JobsApiService } from './processing/jobs/api.service';
import { JobsDatatableService } from './processing/jobs/datatable.service';
import { JobDetailsComponent } from './processing/jobs/details.component';
import { LogoComponent } from './logo/logo.component';
import { DashboardComponent } from './dashboard/component';
import { DashboardJobsService } from './dashboard/jobs.service';
import { RecipesComponent } from './processing/recipes/component';
import { RecipesApiService } from './processing/recipes/api.service';
import { RecipesDatatableService } from './processing/recipes/datatable.service';
import { JobTypesComponent } from './configuration/job-types/component';
import { JobTypesApiService } from './configuration/job-types/api.service';
import { JobTypesCreateComponent } from './configuration/job-types/create.component';
import { RecipeTypesComponent } from './configuration/recipe-types/component';
import { RecipeTypesApiService } from './configuration/recipe-types/api.service';
import { RecipeDetailsComponent } from './processing/recipes/details.component';
import { StatusComponent } from './navbar/status/component';
import { HealthbarComponent } from './navbar/status/healthbar/healthbar.component';
import { FooterComponent } from './footer/footer.component';
import { JobTypeItemComponent } from './dashboard/job-type-item/component';
import { WorkspacesComponent } from './configuration/workspaces/component';
import { WorkspacesApiService } from './configuration/workspaces/api.service';
import { JobHistoryComponent } from './dashboard/job-history/component';
import { SourcesComponent } from './data/sources/component';
import { SourcesApiService } from './data/sources/api.service';
import { SourcesDatatableService } from './data/sources/datatable.service';
import { SourceDetailsComponent } from './data/sources/details.component';
import { DataService } from './common/services/data.service';
import { ProcessingFormComponent } from './navbar/subnav/processing-form/component';
import { FailureRatesComponent } from './processing/failure-rates/component';
import { FailureRatesDatatableService } from './processing/failure-rates/datatable.service';
import { MetricsComponent } from './data/metrics/component';
import { MetricsApiService } from './data/metrics/api.service';
import { ChartService } from './data/metrics/chart.service';
import { RunningJobsComponent } from './processing/running-jobs/component';
import { RunningJobsDatatableService } from './processing/running-jobs/datatable.service';
import { LogViewerComponent } from './common/components/log-viewer/component';
import { LogViewerApiService } from './common/components/log-viewer/api.service';
import { RecipeGraphComponent } from './common/components/recipe-graph/component';
import { JobActivityComponent } from './dashboard/job-activity/component';
import { DataFeedComponent } from './dashboard/data-feed/component';
import { IngestComponent } from './data/ingest/component';
import { IngestApiService } from './data/ingest/api.service';
import { IngestDatatableService } from './data/ingest/datatable.service';
import { LoadingIndicatorComponent } from './common/components/loading-indicator/component';
import { StatusApiService } from './navbar/status/api.service';
import { ProductsApiService } from './common/services/products/api.service';
import { ScansApiService } from './common/services/scans/api.service';
import { BatchesComponent } from './processing/batches/component';
import { BatchesApiService } from './processing/batches/api.service';
import { BatchesDatatableService } from './processing/batches/datatable.service';
import { BatchesEditComponent } from './processing/batches/edit.component';
import { BatchDetailsComponent } from './processing/batches/details.component';
import { StrikesApiService } from './common/services/strikes/api.service';
import { ToastModule } from 'primeng/toast';


@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        JobsComponent,
        LogoComponent,
        DashboardComponent,
        SubnavComponent,
        RecipesComponent,
        JobTypesComponent,
        RecipeTypesComponent,
        StatusComponent,
        HealthbarComponent,
        JobDetailsComponent,
        RecipeDetailsComponent,
        JobTypesCreateComponent,
        FooterComponent,
        JobTypeItemComponent,
        WorkspacesComponent,
        JobHistoryComponent,
        SourcesComponent,
        SourceDetailsComponent,
        ProcessingFormComponent,
        FailureRatesComponent,
        MetricsComponent,
        RunningJobsComponent,
        LogViewerComponent,
        RecipeGraphComponent,
        JobActivityComponent,
        DataFeedComponent,
        IngestComponent,
        LoadingIndicatorComponent,
        BatchesComponent,
        BatchesEditComponent,
        BatchDetailsComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        CodemirrorModule,
        NgxGraphModule,
        UtcDatepickerModule,
        SeedImagesModule,
        // Prime NG
        AutoCompleteModule,
        CalendarModule,
        CardModule,
        ChartModule,
        ConfirmDialogModule,
        DataListModule,
        DialogModule,
        DropdownModule,
        PaginatorModule,
        InputTextModule,
        InputTextareaModule,
        PanelModule,
        ButtonModule,
        SpinnerModule,
        ListboxModule,
        InputSwitchModule,
        StepsModule,
        MessagesModule,
        CheckboxModule,
        ChipsModule,
        AccordionModule,
        TooltipModule,
        MultiSelectModule,
        TreeTableModule,
        SidebarModule,
        ToggleButtonModule,
        ScrollPanelModule,
        OverlayPanelModule,
        TabViewModule,
        GrowlModule,
        TableModule,
        MenuModule,
        ProgressBarModule,
        ToastModule
    ],
    exports: [
        DropdownModule,
        PaginatorModule
    ],
    providers: [
        MessageService,
        JobsApiService,
        JobsDatatableService,
        JobTypesApiService,
        RecipesApiService,
        RecipesDatatableService,
        ColorService,
        DashboardJobsService,
        RecipeTypesApiService,
        WorkspacesApiService,
        SourcesApiService,
        SourcesDatatableService,
        DataService,
        FailureRatesDatatableService,
        MetricsApiService,
        ChartService,
        RunningJobsDatatableService,
        LogViewerApiService,
        IngestApiService,
        IngestDatatableService,
        StatusApiService,
        ConfirmationService,
        ProductsApiService,
        ScansApiService,
        BatchesApiService,
        BatchesDatatableService,
        StrikesApiService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
