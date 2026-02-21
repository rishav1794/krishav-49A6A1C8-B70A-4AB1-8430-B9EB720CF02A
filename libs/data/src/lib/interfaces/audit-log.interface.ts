export interface IAuditLog {
    id: number;
    action: string;
    resource: string;
    userId: number;
    userEmail: string;
    organizationId: number;
    details?: string;
    createdAt: Date;
}