import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, source = "landing" } = body;

        // Validate email
        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "Valid email is required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Insert into waitlist table
        const { data, error } = await supabase
            .from("waitlist")
            .insert({
                email: email.toLowerCase().trim(),
                source,
            })
            .select("id")
            .single();

        if (error) {
            // Handle duplicate email
            if (error.code === "23505") {
                return NextResponse.json(
                    { error: "You're already on the waitlist!" },
                    { status: 409 }
                );
            }

            console.error("Waitlist insert error:", error);
            return NextResponse.json(
                { error: "Failed to join waitlist" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Successfully joined the waitlist!",
            id: data.id,
        });

    } catch (error) {
        console.error("Waitlist API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
