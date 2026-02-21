export interface IOrganization {
    id: number;
    name: string;
    parentOrganizationId?: number;
    createdAt: Date;
}
