import { Routes } from "@angular/router";
export const SECRETARY_ACCOUNT_ROUTES: Routes = [
  { path: "", loadComponent: () => import("./pages/secretary-account-page/secretary-account-page.component").then((m) => m.SecretaryAccountPageComponent) },
  { path: "transactions", redirectTo: "", pathMatch: "full" },
  { path: "transactions/:id", loadComponent: () => import("./pages/secretary-account-transaction-details-page/secretary-account-transaction-details-page.component").then((m) => m.SecretaryAccountTransactionDetailsPageComponent) },
  { path: "expense-categories", loadComponent: () => import("./pages/secretary-expense-categories-page/secretary-expense-categories-page.component").then((m) => m.SecretaryExpenseCategoriesPageComponent) },
];
