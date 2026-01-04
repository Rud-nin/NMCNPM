export const formatMoney = (money) => {
  if (money == null || isNaN(money)) return "0 VNĐ";

  return new Intl.NumberFormat("vi-VN").format(money) + " VNĐ";
};