import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Category from "@/models/category";

export async function DELETE(_req, {params}) {
    const {id} = params;
    try {
        await connectToDB();
        const result = await Category.findByIdAndDelete(id);
        if (!result) {
        return res.json({success: false, error: "Category not found"}, {status: 404});
        }
        return res.json({success: true, msg: "Category deleted"}, {status: 200});
    } catch (error) {
        console.log(error.message);
        return res.json({error: "Server Error"}, {status: 500});
    }
}