import { HttpHeaders, HttpParams, } from "@angular/common/http";



import { environment } from "../../../../../environments/environment";














@Injectable({ providedIn: "root" })
export class SecretaryAccountService {
    __init() {this.baseUrl = `${environment.apiBaseUrl}/secretary/account`}
    __init2() {this.expenseCategoriesUrl = `${environment.apiBaseUrl}/secretary/expense-categories`}

  constructor(
      http,
      auth,
  ) {;this.http = http;this.auth = auth;SecretaryAccountService.prototype.__init.call(this);SecretaryAccountService.prototype.__init2.call(this);}

  createTransaction(request) {
    return this.http.post(
      `${this.baseUrl}/financial-transactions`,
      request,
      { headers: this.authHeaders() },
    );
  }

  getTransactions(request) {
    return this.http.get(
      `${this.baseUrl}/financial-transactions`,
      { headers: this.authHeaders(), params: this.toParams(request) },
    );
  }

  getSummary(fromDate, toDate) {
    let params = new HttpParams();
    if (fromDate) params = params.set("fromDate", fromDate);
    if (toDate) params = params.set("toDate", toDate);
    return this.http.get(
      `${this.baseUrl}/financial-transactions/summary`,
      { headers: this.authHeaders(), params },
    );
  }

  getExpenseCategories() {
    return this.http.get(
      `${this.baseUrl}/expense-categories`,
      { headers: this.authHeaders() },
    );
  }

  getManagedExpenseCategories() {
    return this.http.get(
      this.expenseCategoriesUrl,
      { headers: this.authHeaders() },
    );
  }

  getManagedExpenseCategory(id) {
    return this.http.get(
      `${this.expenseCategoriesUrl}/${id}`,
      { headers: this.authHeaders() },
    );
  }

  createExpenseCategory(request) {
    return this.http.post(
      this.expenseCategoriesUrl,
      request,
      { headers: this.authHeaders() },
    );
  }

  updateExpenseCategory(id, request) {
    return this.http.put(
      `${this.expenseCategoriesUrl}/${id}`,
      request,
      { headers: this.authHeaders() },
    );
  }

  deleteExpenseCategory(id) {
    return this.http.delete(`${this.expenseCategoriesUrl}/${id}`, {
      headers: this.authHeaders(),
    });
  }

  getTransaction(id) {
    return this.http.get(
      `${this.baseUrl}/financial-transactions/${id}`,
      { headers: this.authHeaders() },
    );
  }

  updateTransaction(id, request) {
    return this.http.put(
      `${this.baseUrl}/financial-transactions/${id}`,
      request,
      { headers: this.authHeaders() },
    );
  }

  deleteTransaction(id) {
    return this.http.delete(
      `${this.baseUrl}/financial-transactions/${id}`,
      { headers: this.authHeaders() },
    );
  }

  getTransactionReceipt(id) {
    return this.http.get(`${this.baseUrl}/financial-transactions/${id}/receipt`, {
      headers: this.authHeaders().set("Accept", "text/html"),
      observe: "response",
      responseType: "blob",
    });
  }

   toParams(request) {
    let params = new HttpParams()
      .set("page", request.page)
      .set("pageSize", request.pageSize);
    const optionalValues = {
      type: request.type,
      fromDate: request.fromDate,
      toDate: request.toDate,
      search: request.search,
      expenseCategoryId: request.expenseCategoryId,
    };
    Object.entries(optionalValues).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params = params.set(key, value);
    });
    return params;
  }

   authHeaders() {
    const token = this.auth.authToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
