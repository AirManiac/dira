export interface Link {
  id: string;

  slug: string;
  destination: string;

  active: boolean;

  createdAt: number;
  updatedAt: number;
}