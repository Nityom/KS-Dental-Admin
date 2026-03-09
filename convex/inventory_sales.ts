import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const record = mutation({
    args: {
        inventory_id: v.optional(v.string()),
        inventory_name: v.string(),
        quantity: v.number(),
        rate: v.number(),
        total_amount: v.number(),
        notes: v.optional(v.string()),
        sale_date: v.string(),
    },
    handler: async (ctx, args) => {
        // Insert sale record
        const saleId = await ctx.db.insert("inventory_sales", args);

        // If inventory_id is provided, reduce stock
        if (args.inventory_id) {
            try {
                const inventory = await ctx.db.get(args.inventory_id as any);
                if (inventory) {
                    const newQuantity = Math.max(0, (inventory as any).quantity - args.quantity);
                    await ctx.db.patch(args.inventory_id as any, { quantity: newQuantity });
                }
            } catch {
                // Inventory item may not exist
            }
        }

        return saleId;
    },
});

export const listByDate = query({
    args: {
        sale_date: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("inventory_sales")
            .withIndex("by_sale_date", (q) => q.eq("sale_date", args.sale_date))
            .collect();
    },
});

export const listByDateRange = query({
    args: {
        start_date: v.string(),
        end_date: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("inventory_sales")
            .withIndex("by_sale_date", (q) => q.gte("sale_date", args.start_date))
            .filter((q) => q.lte(q.field("sale_date"), args.end_date))
            .collect();
    },
});
