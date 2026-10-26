export var PaymentMethod; (function (PaymentMethod) {
  const Cash = 1; PaymentMethod[PaymentMethod["Cash"] = Cash] = "Cash";
  const Pos = 2; PaymentMethod[PaymentMethod["Pos"] = Pos] = "Pos";
  const CardToCard = 3; PaymentMethod[PaymentMethod["CardToCard"] = CardToCard] = "CardToCard";
  const BankTransfer = 4; PaymentMethod[PaymentMethod["BankTransfer"] = BankTransfer] = "BankTransfer";
  const Other = 5; PaymentMethod[PaymentMethod["Other"] = Other] = "Other";
})(PaymentMethod || (PaymentMethod = {}));
