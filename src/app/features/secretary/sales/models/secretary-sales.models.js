 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }export var SecretarySaleStatus; (function (SecretarySaleStatus) {
  const PendingAdminApproval = 1; SecretarySaleStatus[SecretarySaleStatus["PendingAdminApproval"] = PendingAdminApproval] = "PendingAdminApproval";
  const Approved = 2; SecretarySaleStatus[SecretarySaleStatus["Approved"] = Approved] = "Approved";
  const Rejected = 3; SecretarySaleStatus[SecretarySaleStatus["Rejected"] = Rejected] = "Rejected";
})(SecretarySaleStatus || (SecretarySaleStatus = {}));

export var SecretaryWalletTransactionType; (function (SecretaryWalletTransactionType) {
  const SaleReward = 1; SecretaryWalletTransactionType[SecretaryWalletTransactionType["SaleReward"] = SaleReward] = "SaleReward";
  const Withdrawal = 2; SecretaryWalletTransactionType[SecretaryWalletTransactionType["Withdrawal"] = Withdrawal] = "Withdrawal";
  const ManualCredit = 3; SecretaryWalletTransactionType[SecretaryWalletTransactionType["ManualCredit"] = ManualCredit] = "ManualCredit";
  const ManualDebit = 4; SecretaryWalletTransactionType[SecretaryWalletTransactionType["ManualDebit"] = ManualDebit] = "ManualDebit";
})(SecretaryWalletTransactionType || (SecretaryWalletTransactionType = {}));

































































export const saleStatusLabel = (status) => _nullishCoalesce(({
  [SecretarySaleStatus.PendingAdminApproval]: "در انتظار تأیید",
  [SecretarySaleStatus.Approved]: "تأیید شده",
  [SecretarySaleStatus.Rejected]: "رد شده",
})[status], () => ( "نامشخص"));

export const toman = (amount) => `${new Intl.NumberFormat("fa-IR").format(amount)} تومان`;
