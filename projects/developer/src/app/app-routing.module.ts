import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/component';
import { JobsComponent } from './processing/jobs/component';
import { JobDetailsComponent } from './processing/jobs/details.component';
import { RecipesComponent } from './processing/recipes/component';
import { RecipeDetailsComponent } from './processing/recipes/details.component';
import { JobTypesComponent } from './configuration/job-types/component';
import { JobTypesCreateComponent } from './configuration/job-types/create.component';
import { RecipeTypesComponent } from './configuration/recipe-types/component';
import { SourcesComponent } from './data/sources/component';
import { SourceDetailsComponent } from './data/sources/details.component';
import { FailureRatesComponent } from './processing/failure-rates/component';
import { MetricsComponent } from './data/metrics/component';
import { RunningJobsComponent } from './processing/running-jobs/component';
import { BatchesComponent } from './processing/batches/component';
import { BatchesCreateComponent } from './processing/batches/create.component';

const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'processing/jobs', component: JobsComponent },
    { path: 'processing/jobs/:id', component: JobDetailsComponent },
    { path: 'processing/running-jobs', component: RunningJobsComponent },
    { path: 'processing/failure-rates', component: FailureRatesComponent },
    { path: 'processing/batches', component: BatchesComponent },
    { path: 'processing/batches/create', component: BatchesCreateComponent },
    { path: 'configuration/job-types', component: JobTypesComponent },
    { path: 'configuration/job-types/:id', component: JobTypesComponent },
    { path: 'configuration/job-types/edit/:id', component: JobTypesCreateComponent },
    { path: 'processing/recipes', component: RecipesComponent },
    { path: 'processing/recipes/:id', component: RecipeDetailsComponent },
    { path: 'configuration/recipe-types', component: RecipeTypesComponent },
    { path: 'configuration/recipe-types/:id', component: RecipeTypesComponent },
    { path: 'data/sources', component: SourcesComponent },
    { path: 'data/sources/:id', component: SourceDetailsComponent },
    { path: 'data/metrics', component: MetricsComponent }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}