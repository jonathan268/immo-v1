export interface UploadedImage {
  image_url: string;
  public_id: string;
  order: number;
}

export interface ReorderImagesDto {
  images: {
    id: string;
    order: number;
  }[];
}