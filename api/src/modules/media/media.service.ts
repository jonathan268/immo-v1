import { prisma } from "../../utils/prisma";
import { AppError } from "../../middlewares/error.middleware";
import cloudinary from "../../config/cloudinary";
import { ReorderImagesDto, UploadedImage } from "./media.types";

const MAX_IMAGES_PER_PROPERTY = 10;
const CLOUDINARY_FOLDER = "immo-platform/properties";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 1280, height: 960, crop: "limit" }, // resize max
            { quality: "auto:good" },                    // compression auto
            { fetch_format: "auto" },                    // format optimal (webp si supporté)
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(new AppError("Failed to upload image to Cloudinary", 500));
            return;
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      )
      .end(buffer);
  });
};

const extractPublicId = (imageUrl: string): string => {
  // Extraire le public_id depuis l'URL Cloudinary
  // ex: https://res.cloudinary.com/cloud/image/upload/v123/folder/filename.jpg
  const parts = imageUrl.split("/");
  const filename = parts[parts.length - 1].split(".")[0];
  const folder = parts[parts.length - 2];
  return `${folder}/${filename}`;
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const uploadImagesService = async (
  propertyId: string,
  ownerId: string,
  files: Express.Multer.File[]
): Promise<UploadedImage[]> => {
  if (!files || files.length === 0) {
    throw new AppError("No images provided", 400);
  }

  // Vérifier que la propriété existe et appartient à l'owner
  const property = await prisma.property.findUnique({
    where: { id: propertyId, is_deleted: false },
    select: { owner_id: true },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.owner_id !== ownerId) {
    throw new AppError(
      "You are not allowed to upload images for this property",
      403
    );
  }

  // Uploader toutes les images en parallèle sur Cloudinary
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file.buffer, `${CLOUDINARY_FOLDER}/${propertyId}`)
  );

  const uploadedResults = await Promise.all(uploadPromises);

  // Sauvegarder en base avec l'ordre correct — dans une transaction pour éviter
  // les races conditions sur le compteur d'images
  const createdImages = await prisma.$transaction(async (tx) => {
    const currentCount = await tx.propertyImage.count({
      where: { property_id: propertyId },
    });

    if (currentCount + files.length > MAX_IMAGES_PER_PROPERTY) {
      throw new AppError(
        `Cannot upload ${files.length} image(s). Property already has ${currentCount} image(s). Maximum allowed is ${MAX_IMAGES_PER_PROPERTY}`,
        400
      );
    }

    const imagesData = uploadedResults.map((result, index) => ({
      property_id: propertyId,
      image_url: result.secure_url,
      order: currentCount + index,
    }));

    await tx.propertyImage.createMany({
      data: imagesData,
    });

    return tx.propertyImage.findMany({
      where: { property_id: propertyId },
      orderBy: { order: "asc" },
    });
  });

  return createdImages.map((img) => ({
    image_url: img.image_url,
    public_id: extractPublicId(img.image_url),
    order: img.order,
  }));
};

export const deleteImageService = async (
  propertyId: string,
  imageId: string,
  ownerId: string
): Promise<void> => {
  // Vérifier que la propriété appartient à l'owner
  const property = await prisma.property.findUnique({
    where: { id: propertyId, is_deleted: false },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.owner_id !== ownerId) {
    throw new AppError(
      "You are not allowed to delete images for this property",
      403
    );
  }

  // Vérifier que l'image existe et appartient à la propriété
  const image = await prisma.propertyImage.findUnique({
    where: { id: imageId },
  });

  if (!image || image.property_id !== propertyId) {
    throw new AppError("Image not found", 404);
  }

  // Supprimer de Cloudinary
  const publicId = extractPublicId(image.image_url);
  await cloudinary.uploader.destroy(publicId);

  // Supprimer de la base
  await prisma.propertyImage.delete({
    where: { id: imageId },
  });

  // Réordonner les images restantes dans une transaction
  const remainingImages = await prisma.propertyImage.findMany({
    where: { property_id: propertyId },
    orderBy: { order: "asc" },
  });

  await prisma.$transaction(
    remainingImages.map((img, index) =>
      prisma.propertyImage.update({
        where: { id: img.id },
        data: { order: index },
      })
    )
  );
};

export const reorderImagesService = async (
  propertyId: string,
  ownerId: string,
  dto: ReorderImagesDto
): Promise<void> => {
  // Vérifier que la propriété appartient à l'owner
  const property = await prisma.property.findUnique({
    where: { id: propertyId, is_deleted: false },
    include: { images: true },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.owner_id !== ownerId) {
    throw new AppError(
      "You are not allowed to reorder images for this property",
      403
    );
  }

  // Vérifier que tous les IDs fournis appartiennent à la propriété
  const propertyImageIds = property.images.map((img) => img.id);
  const invalidIds = dto.images.filter(
    (img) => !propertyImageIds.includes(img.id)
  );

  if (invalidIds.length > 0) {
    throw new AppError("Some image IDs do not belong to this property", 400);
  }

  // Mettre à jour les ordres en parallèle
  const reorderPromises = dto.images.map((img) =>
    prisma.propertyImage.update({
      where: { id: img.id },
      data: { order: img.order },
    })
  );

  await Promise.all(reorderPromises);
};

export const getPropertyImagesService = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, is_deleted: false },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const images = await prisma.propertyImage.findMany({
    where: { property_id: propertyId },
    orderBy: { order: "asc" },
  });

  return images;
};