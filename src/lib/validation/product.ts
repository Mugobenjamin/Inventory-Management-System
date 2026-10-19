import { z } from 'zod'

export const attributeSchema = z.record(z.string(), z.any())

export const variantCreateSchema = z.object({
  productId: z.number().int().positive(),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  unit: z.string().min(1),
  attributes: attributeSchema.optional(),
  cost: z.string().regex(/^-?\d+(\.\d+)?$/).transform((s) => s),
  price: z.string().regex(/^-?\d+(\.\d+)?$/).transform((s) => s),
})

export const variantUpdateSchema = z.object({
  sku: z.string().min(1).optional(),
  barcode: z.string().optional(),
  unit: z.string().optional(),
  attributes: attributeSchema.optional(),
  cost: z.string().regex(/^-?\d+(\.\d+)?$/).optional(),
  price: z.string().regex(/^-?\d+(\.\d+)?$/).optional(),
})

export const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  brandId: z.number().int().positive().optional(),
  status: z.string().optional(),
})

export const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  brandId: z.number().int().positive().optional(),
  status: z.string().optional(),
})
