export interface IPurchases {
  amount: number;
  payment: number;
  arrear: boolean;
  created_at: string;
  credit_id: string;
  description: string;
  interest: number;
  is_order: boolean;
  is_recharge: boolean;
  mysql_item_id: number;
  name: string;
  number_fee: number;
  paid_out: boolean;
  updated_at: string;
  state: string;
}
