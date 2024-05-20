import * as z from "zod";
import type {Elements} from "@vue-flow/core"

export const PositionEnumSchema = z.enum([
	"bottom",
	"top",
]);
export type PositionEnum = z.infer<typeof PositionEnumSchema>;

export const ComputedPositionSchema = z.object({
	"x": z.number().optional(),
	"y": z.number().optional(),
	"z": z.number().optional(),
});
export type ComputedPosition = z.infer<typeof ComputedPositionSchema>;

export const DataSchema = z.object({});
export type Data = z.infer<typeof DataSchema>;

export const DimensionsSchema = z.object({
	"width": z.number().optional(),
	"height": z.number().optional(),
});
export type Dimensions = z.infer<typeof DimensionsSchema>;

export const SourceSchema = z.object({
	"id": z.string().optional(),
	"position": PositionEnumSchema.optional(),
	"x": z.number().optional(),
	"y": z.number().optional(),
	"width": z.number().optional(),
	"height": z.number().optional(),
});
export type Source = z.infer<typeof SourceSchema>;

export const PositionClassSchema = z.object({
	"x": z.number().optional(),
	"y": z.number().optional(),
});
export type PositionClass = z.infer<typeof PositionClassSchema>;

export const HandleBoundsSchema = z.object({
	"source": z.array(SourceSchema).optional(),
	"target": z.array(SourceSchema).optional(),
});
export type HandleBounds = z.infer<typeof HandleBoundsSchema>;

export const NodeSchema = z.object({
	"id": z.string().optional(),
	"type": z.string().optional(),
	"dimensions": DimensionsSchema.optional(),
	"handleBounds": HandleBoundsSchema.optional(),
	"computedPosition": ComputedPositionSchema.optional(),
	"selected": z.boolean().optional(),
	"dragging": z.boolean().optional(),
	"resizing": z.boolean().optional(),
	"initialized": z.boolean().optional(),
	"isParent": z.boolean().optional(),
	"position": PositionClassSchema.optional(),
	"data": DataSchema.optional(),
	"events": DataSchema.optional(),
	"label": z.string().optional(),
});
export type Node = z.infer<typeof NodeSchema>;

export const BuilderResultElementSchema = z.object({
	"id": z.string().optional(),
	"type": z.string().optional(),
	"dimensions": DimensionsSchema.optional(),
	"handleBounds": HandleBoundsSchema.optional(),
	"computedPosition": ComputedPositionSchema.optional(),
	"selected": z.boolean().optional(),
	"dragging": z.boolean().optional(),
	"resizing": z.boolean().optional(),
	"initialized": z.boolean().optional(),
	"isParent": z.boolean().optional(),
	"position": PositionClassSchema.optional(),
	"data": DataSchema.optional(),
	"events": DataSchema.optional(),
	"label": z.string().optional(),
	"source": z.string().optional(),
	"target": z.string().optional(),
	"sourceHandle": z.string().optional(),
	"targetHandle": z.string().optional(),
	"sourceNode": NodeSchema.optional(),
	"targetNode": NodeSchema.optional(),
	"sourceX": z.number().optional(),
	"sourceY": z.number().optional(),
	"targetX": z.number().optional(),
	"targetY": z.number().optional(),
});
export type BuilderResultElement = Element & z.infer<typeof BuilderResultElementSchema>;

export const BuilderResult = z.array(BuilderResultElementSchema);
export type BuilderResult = Elements & z.infer<typeof BuilderResult>;

export function validateBuilderResult(data: unknown): data is BuilderResult {
	return BuilderResult.safeParse(data).success;
}
