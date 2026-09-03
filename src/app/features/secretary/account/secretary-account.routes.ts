import { Routes } from "@angular/router";
export const SECRETARY_ACCOUNT_ROUTES: Routes = [
  { path: "", loadComponent: () => import("./pages/secretary-account-page/secretary-account-page.component").then((m) => m.SecretaryAccountPageComponent) },
  { path: "transactions", redirectTo: "", pathMatch: "full" },
  { path: "transactions/:id", loadComponent: () => import("./pages/secretary-account-transaction-details-page/secretary-account-transaction-details-page.component").then((m) => m.SecretaryAccountTransactionDetailsPageComponent) },
  { path: "expense-categories", loadComponent: () => import("./pages/secretary-expense-categories-page/secretary-expense-categories-page.component").then((m) => m.SecretaryExpenseCategoriesPageComponent) },
  { path: "sales/new", loadComponent: () => import("../sales/pages/create-secretary-sale/create-secretary-sale.component").then((m) => m.CreateSecretarySaleComponent) },
  { path: "sales", loadComponent: () => import("../sales/pages/secretary-sales/secretary-sales.component").then((m) => m.SecretarySalesComponent) },
  { path: "wallet", loadComponent: () => import("../sales/pages/secretary-wallet/secretary-wallet.component").then((m) => m.SecretaryWalletComponent) },
];
