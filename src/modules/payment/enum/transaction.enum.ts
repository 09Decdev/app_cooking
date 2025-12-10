export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
}

export enum TransactionItemType {
    PAYMENT_TICKET = 'PAYMENT_TICKET',
    PAYMENT_COMMUNITY = 'PAYMENT_COMMUNITY',
    SUBSCRIPTION = 'SUBSCRIPTION',
    TOP_UP = 'TOP_UP',
    PAYMENT_ORDER = 'PAYMENT_ORDER',
}

export enum TransactionCurrency {
    VND = 'VND',
    USD = 'USD',
}

export enum PaymentExpiry {
    DEFAULT = 1440,
    TICKET = 10,
    COMMUNITY = 10,
}

export enum VnpayResponseCode {
    SUCCESS = '00',
    ORDER_NOT_FOUND = '01',
    INVALID_AMOUNT = '03',
    CHECKSUM_FAILED = '97',
    TRANSACTION_NOT_FOUND = '91',
    PENDING_OR_INVALID = '99',
}

export enum VnpayTransactionStatus {
    SUCCESS = '00',
    PENDING = '01',
    FAILED = '02',
}

export enum IpnRspCode {
    SUCCESS = '00',
    ORDER_NOT_FOUND = '01',
    CHECKSUM_FAILED = '97',
}