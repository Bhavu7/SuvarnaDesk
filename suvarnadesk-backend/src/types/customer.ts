// types/customer.ts
export interface Customer {
    _id: string;
    name: string;
    email?: string;
    phone: string;
    address?: string;
    huid?: string;
    gstNumber?: string;
    totalPurchases: number;
    totalAmountSpent: number;
    lastPurchaseDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CustomerResponse {
    success: boolean;
    data: Customer | Customer[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
    message?: string;
}

export interface CustomerStats {
    totalCustomers: number;
    newCustomersThisMonth: number;
    monthlyGrowth: Array<{
        _id: { year: number; month: number };
        count: number;
        totalSpent: number;
    }>;
    topCustomers: Customer[];
}