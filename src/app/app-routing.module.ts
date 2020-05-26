import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import { CreatePageComponent } from './create-page/create-page.component';
import { EditPageComponent } from './edit-page/edit-page.component';
import { OptionsPageComponent } from './options-page/options-page.component';
import { PreviewPageComponent } from './preview-page/preview-page.component';


const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'create', component: CreatePageComponent },
  { path: 'options', component: OptionsPageComponent },
  { path: 'site/:id/edit', component: EditPageComponent },
  { path: 'preview', component: PreviewPageComponent },
]

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
