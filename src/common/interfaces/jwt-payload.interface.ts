export interface JwtPayload {
  userId: string;
  role: string;
  companyId?: string | null;
}
