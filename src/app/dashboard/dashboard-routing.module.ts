import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardWrapperComponent } from './comps/dashboard-wrapper/dashboard-wrapper.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardWrapperComponent,
    children: [
      {
        path: 'blog',
        loadChildren: () => import('../blog/blog.module').then((m) => m.BlogModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
