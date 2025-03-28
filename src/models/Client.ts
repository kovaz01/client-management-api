import { z } from 'zod';

export interface IClient {
  _id?: string;
  whatsappGroupName: string;
  bid: number;
  uid: number;
  mtcGroupID: number;
  reporterName: string;
  reporterPhone: string;
  compId: string;
  userName: string;
  password: string;
  appGuid: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ClientValidationSchema = z.object({
  whatsappGroupName: z.string().optional(),
  bid: z.number(),
  uid: z.number(),
  mtcGroupID: z.number(),
  reporterName: z.string(),
  reporterPhone: z.string().regex(/^\+972[0-9]{8,9}$/, 'Phone must be in Israeli format (+972XXXXXXXXX)'),
  compId: z.string(),
  userName: z.string(),
  password: z.string(),
  appGuid: z.string()
}); 