export interface ErrorDetail {
  path?: string;
  message: string;
}

export interface PrismaErrorResult {
  statusCode: number;
  message: string;
  errors: ErrorDetail[];
}
